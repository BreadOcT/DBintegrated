import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { authenticator } from "otplib";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import dns from "dns";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

// Setup MySQL Connection Pool
let dbPool: mysql.Pool | null = null;
if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
  try {
    dbPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log("MySQL connection pool created successfully!");

    // Auto-migrate tables
    (async () => {
      try {
        await dbPool.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id CHAR(36) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            photo LONGTEXT,
            weekly_report BOOLEAN DEFAULT TRUE,
            bill_reminder BOOLEAN DEFAULT TRUE,
            promo_offer BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        // Add columns if they don't exist (for existing tables)
        try { await dbPool.execute(`ALTER TABLE users ADD COLUMN phone VARCHAR(50)`); } catch (e) { }
        try { await dbPool.execute(`ALTER TABLE users ADD COLUMN photo LONGTEXT`); } catch (e) { }
        try { await dbPool.execute(`ALTER TABLE users ADD COLUMN weekly_report BOOLEAN DEFAULT TRUE`); } catch (e) { }
        try { await dbPool.execute(`ALTER TABLE users ADD COLUMN bill_reminder BOOLEAN DEFAULT TRUE`); } catch (e) { }
        try { await dbPool.execute(`ALTER TABLE users ADD COLUMN promo_offer BOOLEAN DEFAULT FALSE`); } catch (e) { }

        await dbPool.execute(`
          CREATE TABLE IF NOT EXISTS transactions (
            id CHAR(36) PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            description VARCHAR(255),
            amount DECIMAL(15, 2) NOT NULL,
            type ENUM('income', 'expense') NOT NULL,
            category VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            store_name VARCHAR(255),
            raw_text LONGTEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        try { await dbPool.execute(`ALTER TABLE transactions ADD COLUMN raw_text LONGTEXT`); } catch (e) { }
        try { await dbPool.execute(`ALTER TABLE transactions ADD COLUMN items LONGTEXT`); } catch (e) { }

        await dbPool.execute(`
          CREATE TABLE IF NOT EXISTS monthly_budgets (
              user_id CHAR(36) NOT NULL,
              month INT NOT NULL,
              year INT NOT NULL,
              income_target DECIMAL(15, 2) DEFAULT 0,
              expense_target DECIMAL(15, 2) DEFAULT 0,
              PRIMARY KEY (user_id, month, year),
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        await dbPool.execute(`
          CREATE TABLE IF NOT EXISTS two_factor_auth (
              user_id CHAR(36) PRIMARY KEY,
              method VARCHAR(50) NOT NULL,
              secret VARCHAR(255) NOT NULL,
              backup_codes TEXT NOT NULL,
              enabled BOOLEAN DEFAULT false,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        await dbPool.execute(`
          CREATE TABLE IF NOT EXISTS user_devices (
            id CHAR(36) PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            device_name VARCHAR(255) NOT NULL,
            location VARCHAR(255) DEFAULT 'Unknown',
            last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            token_hash VARCHAR(255) UNIQUE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
      } catch (error) {
        console.error("Database migration error:", error);
      }
    })();
  } catch (error) {
    console.error("Failed to create MySQL pool:", error);
  }
} else {
  console.log("No MySQL connection configured. Running in local/mock mode.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Middleware Auth
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: dbPool ? "connected" : "mock" });
  });

  // Auth Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      if (dbPool) {
        const [rows]: any = await dbPool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

        // Deteksi & Simpan Perangkat
        try {
          const userAgent = req.headers['user-agent'] || 'Unknown Device';
          let deviceName = 'Browser / PC';

          if (/windows/i.test(userAgent)) deviceName = 'Windows PC';
          else if (/macintosh|mac os x/i.test(userAgent)) deviceName = 'MacBook / Mac';
          else if (/iphone/i.test(userAgent)) deviceName = 'iPhone';
          else if (/android/i.test(userAgent)) deviceName = 'Android Device';
          else if (/linux/i.test(userAgent)) deviceName = 'Linux PC';

          const tokenHash = crypto.createHash ? crypto.createHash('sha256').update(token).digest('hex') : token.substring(token.length - 20);
          await dbPool.execute(
            'INSERT INTO user_devices (id, user_id, device_name, location, token_hash) VALUES (?, ?, ?, ?, ?)',
            [crypto.randomUUID(), user.id, deviceName, 'Bandung, Indonesia', tokenHash]
          );
        } catch (devErr) {
          console.error("Gagal mencatat perangkat:", devErr);
        }

        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            photo: user.photo,
            weekly_report: user.weekly_report,
            bill_reminder: user.bill_reminder,
            promo_offer: user.promo_offer
          }
        });
      } else {
        if (email === "demo@example.com" && password === "demo") {
          const token = jwt.sign({ id: "demo-id", email: "demo@example.com", name: "Demo User" }, JWT_SECRET, { expiresIn: '7d' });
          res.json({ token, user: { id: "demo-id", name: "Demo User", email: "demo@example.com" } });
        } else {
          res.status(401).json({ error: "Database not configured. Use demo@example.com / demo" });
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  async function checkEmailActive(email: string): Promise<{ active: boolean; reason?: string }> {
    // 1. Basic Regex syntax check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { active: false, reason: "Format email tidak valid" };
    }

    const parts = email.split('@');
    const username = parts[0].toLowerCase();
    const domain = parts[parts.length - 1]?.toLowerCase();
    if (!domain) {
      return { active: false, reason: "Domain email tidak ditemukan" };
    }

    // Block obvious joke / fake / temporary usernames
    const fakeUsernames = [
      'iseng', 'bodong', 'palsu', 'coba', 'test', 'testing',
      'dummy', 'fake', 'asdf', 'qwerty', 'junk', 'spam', 'temp',
      'admin', 'administrator', 'root', 'user', 'guest', 'mail',
      'halo', 'hello', 'testing123', 'test123'
    ];

    // Substrings that are extremely likely to indicate a fake/joke email
    const fakeSubstrings = ['iseng', 'bodong', 'palsu', 'dummy', 'qwerty', 'asdf', 'zxcv', 'junkmail', 'tempmail', 'trashmail'];

    const isExactFake = fakeUsernames.includes(username);
    const containsFake = fakeSubstrings.some(sub => username.includes(sub));
    const isTestOrCobaPattern = 
      /^(test|coba)/i.test(username) || 
      /(test|coba)$/i.test(username) ||
      /(test|coba)[-_.\d]/i.test(username) ||
      /[-_.\d](test|coba)/i.test(username);
    const hasRepeatedChars = /(\w)\1{3,}/.test(username);

    if (isExactFake || containsFake || isTestOrCobaPattern || hasRepeatedChars) {
      return { active: false, reason: "Silakan gunakan nama email aktif yang sungguhan, bukan email percobaan/iseng." };
    }

    // 2. Typos in common domains
    const typos: Record<string, string> = {
      'gamil.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'yhoo.com': 'yahoo.com',
      'hotamil.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'outlok.com': 'outlook.com'
    };
    if (domain in typos) {
      return { active: false, reason: `Email tampaknya salah ketik. Apakah maksud Anda menggunakan domain ${typos[domain]}?` };
    }

    // 3. Known temporary/disposable/fake email domains
    const disposableDomains = [
      'tempmail', 'mailinator', '10minutemail', 'yopmail', 'guerrillamail',
      'dispostable', 'getairmail', 'throwawaymail', 'temp-mail', 'trashmail',
      'sharklasers', 'guerillamail', 'guerrillamailblock', 'pokemail',
      'burnermail', 'proxydimid', 'maildrop', 'fakeinbox', 'tempmail.com',
      'generator.email', 'tempail.com', 'tmail.ws', 'moakt.cc', 'dismail.de',
      'iseng.com', 'bodong.com', 'palsu.com', 'coba.com', 'test.com', 'example.com',
      'example.org', 'testmail.com', 'dummy.com', 'mailnesia.com', 'mailcatch.com'
    ];

    // Check if the domain itself contains any joke/fake email substrings
    const fakeDomainSubstrings = ['iseng', 'bodong', 'palsu', 'coba', 'dummy', 'testmail', 'tempmail', 'mailinator'];
    const domainContainsFake = fakeDomainSubstrings.some(sub => domain.includes(sub));

    if (domainContainsFake || disposableDomains.some(dis => domain.includes(dis))) {
      return { active: false, reason: "Penggunaan email sekali pakai (disposable/temp mail) atau email palsu tidak diizinkan. Silakan gunakan email aktif Anda." };
    }

    // 4. Determine internet connectivity first to distinguish offline sandbox vs. online system
    const isOnline = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 2000);
      dns.resolve('dns.google', 'A', (err, records) => {
        clearTimeout(timeout);
        if (err) {
          resolve(false);
        } else {
          resolve(records && records.length > 0);
        }
      });
    });

    if (!isOnline) {
      console.log(`System offline or isolated. Bypassing DNS MX check for domain: ${domain}`);
      return { active: true };
    }

    // 5. DNS MX record check with timeout fallback when online
    return new Promise((resolve) => {
      // Timeout 4.5 seconds for domain resolution
      const timeout = setTimeout(() => {
        console.log(`Email verification timed out for domain: ${domain}. Fallback to true.`);
        resolve({ active: true });
      }, 4500);

      dns.resolveMx(domain, (err, mxRecords) => {
        if (err) {
          // If we are online, check if the error is ENOTFOUND or ENODATA or ESERVFAIL (domain doesn't exist/dead)
          if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'ESERVFAIL') {
            // Fallback to A record check to be absolutely sure the domain is dead
            dns.resolve(domain, 'A', (errA, aRecords) => {
              clearTimeout(timeout);
              if (errA || !aRecords || aRecords.length === 0) {
                return resolve({ active: false, reason: "Domain email tidak aktif atau tidak terdaftar. Silakan gunakan email aktif yang valid." });
              }
              resolve({ active: true });
            });
          } else {
            // Other network issues -> allow fallback
            clearTimeout(timeout);
            resolve({ active: true });
          }
        } else if (!mxRecords || mxRecords.length === 0) {
          dns.resolve(domain, 'A', (errA, aRecords) => {
            clearTimeout(timeout);
            if (errA || !aRecords || aRecords.length === 0) {
              resolve({ active: false, reason: "Domain email tidak aktif atau tidak terdaftar. Silakan gunakan email aktif yang valid." });
            } else {
              resolve({ active: true });
            }
          });
        } else {
          clearTimeout(timeout);
          resolve({ active: true });
        }
      });
    });
  }

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing email, password, or name" });
      }

      // Check if email is active/valid
      const emailCheck = await checkEmailActive(email);
      if (!emailCheck.active) {
        return res.status(400).json({ error: emailCheck.reason });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserId = crypto.randomUUID();

      if (dbPool) {
        // Check if user already exists
        const [existing]: any = await dbPool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
          return res.status(400).json({ error: "Email sudah terdaftar" });
        }

        // Insert new user
        await dbPool.execute(
          'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
          [newUserId, email, hashedPassword, name]
        );

        const token = jwt.sign({ id: newUserId, email, name }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
          token,
          user: { id: newUserId, name, email }
        });
      } else {
        // Mock register for UI testing when DB is not connected
        const token = jwt.sign({ id: newUserId, email, name }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
          token,
          user: { id: newUserId, name, email }
        });
      }
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/devices", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const [rows] = await dbPool.execute(
          'SELECT id, device_name, location, last_active FROM user_devices WHERE user_id = ? ORDER BY last_active DESC',
          [req.user.id]
        );
        res.json(rows);
      } catch (error) {
        console.error("Fetch devices error:", error);
        res.status(500).json({ error: "Gagal mengambil data perangkat" });
      }
    } else {
      res.json([
        { id: "mock-1", device_name: "Windows PC (Mock)", location: "Bandung, Indonesia", last_active: new Date() }
      ]);
    }
  });

  app.delete("/api/auth/devices/:id", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        await dbPool.execute('DELETE FROM user_devices WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Perangkat berhasil dikeluarkan" });
      } catch (error) {
        console.error("Delete device error:", error);
        res.status(500).json({ error: "Gagal mengeluarkan perangkat" });
      }
    } else {
      res.json({ message: "Perangkat mock berhasil dikeluarkan" });
    }
  });

  app.post("/api/auth/forgot-password", async (req: any, res: any) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email diperlukan" });

      if (dbPool) {
        const [rows]: any = await dbPool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ error: "Email tidak ditemukan dalam sistem" });

        const user = rows[0];
        const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'admin.keuangankhb@gmail.com',
            pass: process.env.EMAIL_APP_PASSWORD || ''
          }
        });

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        const mailOptions = {
          from: '"Catatan Keuangan KHB" <admin.keuangankhb@gmail.com>',
          to: email,
          subject: 'Reset Kata Sandi Anda - Catatan Keuangan KHB',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #22da47;">Reset Kata Sandi</h2>
              <p>Halo ${user.name},</p>
              <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Klik tombol di bawah ini untuk mereset kata sandi Anda:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #22da47; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Kata Sandi</a>
              </div>
              <p>Atau Anda dapat menyalin tautan berikut ke browser Anda:</p>
              <p style="word-break: break-all; color: #555;"><a href="${resetLink}">${resetLink}</a></p>
              <p style="color: #888; font-size: 12px; margin-top: 30px;">Tautan ini hanya berlaku selama 15 menit. Jika Anda tidak merasa meminta reset kata sandi, abaikan saja pesan ini.</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Tautan reset telah dikirim ke email Anda" });
      } else {
        res.status(501).json({ error: "Database belum dikonfigurasi" });
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      res.status(500).json({ error: "Gagal mengirim email. Pastikan password aplikasi email sudah disetting di server (.env)." });
    }
  });

  app.post("/api/auth/reset-password", async (req: any, res: any) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ error: "Token dan kata sandi baru diperlukan" });

      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);

        if (dbPool) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await dbPool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
          res.json({ message: "Kata sandi berhasil direset" });
        } else {
          res.status(501).json({ error: "Database belum dikonfigurasi" });
        }
      } catch (err) {
        return res.status(400).json({ error: "Token tidak valid atau telah kedaluwarsa" });
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      res.status(500).json({ error: "Gagal mereset kata sandi" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      const [rows]: any = await dbPool.execute('SELECT id, name, email, phone, photo, weekly_report, bill_reminder, promo_offer FROM users WHERE id = ?', [req.user.id]);
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } else {
      res.json(req.user);
    }
  });

  app.put("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const { name, phone, photo, weekly_report, bill_reminder, promo_offer } = req.body;

        const updates: string[] = [];
        const params: any[] = [];

        if (name !== undefined) { updates.push("name = ?"); params.push(name); }
        if (phone !== undefined) { updates.push("phone = ?"); params.push(phone || null); }
        if (photo !== undefined) { updates.push("photo = ?"); params.push(photo || null); }
        if (weekly_report !== undefined) { updates.push("weekly_report = ?"); params.push(weekly_report); }
        if (bill_reminder !== undefined) { updates.push("bill_reminder = ?"); params.push(bill_reminder); }
        if (promo_offer !== undefined) { updates.push("promo_offer = ?"); params.push(promo_offer); }

        if (updates.length > 0) {
          params.push(req.user.id);
          await dbPool.execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
        }

        res.json({ message: "Profile updated successfully" });
      } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ error: "Failed to update profile." });
      }
    } else {
      res.status(501).json({ error: "Database not configured." });
    }
  });

  app.put("/api/auth/password", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const { oldPassword, newPassword } = req.body;
        const [rows]: any = await dbPool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: "User not found" });

        const user = rows[0];
        const validPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validPassword) {
          return res.status(400).json({ error: "Pastikan password lama anda tepat" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await dbPool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ message: "Password updated successfully" });
      } catch (error) {
        console.error("Password update error:", error);
        res.status(500).json({ error: "Failed to update password" });
      }
    } else {
      res.status(501).json({ error: "Database not configured." });
    }
  });

  app.put("/api/auth/notifications", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const { weekly_report, bill_reminder, promo_offer } = req.body;
        await dbPool.execute(
          'UPDATE users SET weekly_report = ?, bill_reminder = ?, promo_offer = ? WHERE id = ?',
          [weekly_report, bill_reminder, promo_offer, req.user.id]
        );
        res.json({ message: "Pengaturan notifikasi berhasil disimpan" });
      } catch (error) {
        console.error("Gagal simpan notifikasi:", error);
        res.status(500).json({ error: "Gagal mengupdate pengaturan notifikasi" });
      }
    } else {
      res.status(501).json({ error: "Database belum dikonfigurasi" });
    }
  });

  // 2FA Routes
  app.post("/api/auth/2fa/generate", authenticateToken, async (req: any, res: any) => {
    try {
      const { method } = req.body;

      if (method === 'authenticator') {
        const secret = authenticator.generateSecret();
        const otpauth_url = authenticator.keyuri(req.user.email, 'Catatan Keuangan KHB', secret);
        const qrCode = await QRCode.toDataURL(otpauth_url);

        res.json({
          qrCode,
          secret,
          message: "Scan QR Code dengan aplikasi Authenticator"
        });
      } else if (method === 'email' || method === 'sms') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        if (method === 'email') {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'admin.keuangankhb@gmail.com',
              pass: process.env.EMAIL_APP_PASSWORD || ''
            }
          });

          await transporter.sendMail({
            from: '"Catatan Keuangan KHB" <admin.keuangankhb@gmail.com>',
            to: req.user.email,
            subject: 'Kode Verifikasi 2FA - Catatan Keuangan KHB',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #22da47;">Verifikasi 2 Faktor</h2>
                <p>Halo ${req.user.name},</p>
                <p>Kode verifikasi Anda adalah:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #22da47;">${otp}</div>
                </div>
                <p style="color: #888; font-size: 12px; margin-top: 30px;">Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.</p>
              </div>
            `
          });
        }

        res.json({ message: "Kode verifikasi telah dikirim", method });
      }
    } catch (error) {
      console.error("2FA Generate Error:", error);
      res.status(500).json({ error: "Gagal generate kode 2FA" });
    }
  });

  app.post("/api/auth/2fa/verify-setup", authenticateToken, async (req: any, res: any) => {
    try {
      const { code, method, secret } = req.body;

      if (!code || !method) {
        return res.status(400).json({ error: "Kode dan metode diperlukan" });
      }

      const backupCodes = Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
      const backupCodesStr = backupCodes.join(',');

      if (method === 'authenticator') {
        if (!secret) return res.status(400).json({ error: "Secret diperlukan untuk verifikasi" });

        const isValid = authenticator.check(code, secret);
        if (!isValid) return res.status(400).json({ error: "Kode OTP tidak valid" });

        if (dbPool) {
          await dbPool.execute(
            `INSERT INTO two_factor_auth (user_id, method, secret, backup_codes, enabled) 
             VALUES (?, ?, ?, ?, true)
             ON DUPLICATE KEY UPDATE method = VALUES(method), secret = VALUES(secret), backup_codes = VALUES(backup_codes), enabled = true`,
            [req.user.id, method, secret, backupCodesStr]
          );
        }
        return res.json({ message: "2FA Authenticator berhasil diaktifkan", backupCodes });

      } else if (method === 'email' || method === 'sms') {
        if (dbPool) {
          await dbPool.execute(
            `INSERT INTO two_factor_auth (user_id, method, secret, backup_codes, enabled) 
             VALUES (?, ?, ?, ?, true)
             ON DUPLICATE KEY UPDATE method = VALUES(method), enabled = true`,
            [req.user.id, method, 'email_dynamic_otp', backupCodesStr]
          );
        }
        return res.json({ message: `2FA ${method.toUpperCase()} berhasil diaktifkan`, backupCodes });
      } else {
        return res.status(400).json({ error: "Metode 2FA tidak didukung" });
      }
    } catch (error) {
      console.error("2FA Verify Error:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Gagal memverifikasi kode" });
      }
    }
  });

  app.post("/api/auth/2fa/disable", authenticateToken, async (req: any, res: any) => {
    try {
      const { password } = req.body;
      if (!password) return res.status(400).json({ error: "Kata sandi diperlukan" });

      if (dbPool) {
        const [rows]: any = await dbPool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: "User tidak ditemukan" });

        const validPassword = await bcrypt.compare(password, rows[0].password);
        if (!validPassword) return res.status(400).json({ error: "Kata sandi salah" });

        await dbPool.execute('UPDATE two_factor_auth SET enabled = false WHERE user_id = ?', [req.user.id]);
        res.json({ message: "2FA berhasil dinonaktifkan" });
      }
    } catch (error) {
      console.error("2FA Disable Error:", error);
      res.status(500).json({ error: "Gagal menonaktifkan 2FA" });
    }
  });

  app.post("/api/auth/2fa/status", authenticateToken, async (req: any, res: any) => {
    try {
      const { enabled } = req.body;
      if (dbPool) {
        await dbPool.execute('UPDATE two_factor_auth SET enabled = ? WHERE user_id = ?', [enabled, req.user.id]);
        res.json({ message: "Status 2FA diperbarui" });
      }
    } catch (error) {
      res.status(500).json({ error: "Gagal memperbarui status 2FA" });
    }
  });

  // Budgets Routes
  app.get("/api/budgets", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const { year } = req.query;
        let query = 'SELECT * FROM monthly_budgets WHERE user_id = ?';
        let params: any[] = [req.user.id];

        if (year) {
          query += ' AND year = ?';
          params.push(parseInt(year));
        }

        const [rows] = await dbPool.execute(query, params);
        res.json(rows);
      } catch (error) {
        console.error("Budgets Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch budgets" });
      }
    } else {
      res.json([]);
    }
  });

  app.put("/api/budgets", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const { month, year, income_target, expense_target } = req.body;
        const [rows]: any = await dbPool.execute(
          'SELECT * FROM monthly_budgets WHERE user_id = ? AND month = ? AND year = ?',
          [req.user.id, month, year]
        );
        if (rows.length > 0) {
          await dbPool.execute(
            'UPDATE monthly_budgets SET income_target = ?, expense_target = ? WHERE user_id = ? AND month = ? AND year = ?',
            [income_target, expense_target, req.user.id, month, year]
          );
        } else {
          await dbPool.execute(
            'INSERT INTO monthly_budgets (user_id, month, year, income_target, expense_target) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, month, year, income_target, expense_target]
          );
        }
        res.json({ message: "Budget updated" });
      } catch (error) {
        console.error("Budget Update Error:", error);
        res.status(500).json({ error: "Failed to update budget" });
      }
    } else {
      res.status(501).json({ error: "Database not configured." });
    }
  });

  // Transactions Routes
  app.get("/api/transactions", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const [rows]: any = await dbPool.execute('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [req.user.id]);
        const mappedRows = rows.map((r: any) => {
          let itemsParsed = [];
          if (r.items) {
            try {
              itemsParsed = typeof r.items === 'string' ? JSON.parse(r.items) : r.items;
            } catch (e) {
              itemsParsed = [];
            }
          }
          return {
            id: r.id,
            type: r.type,
            category: r.category,
            amount: Number(r.amount),
            date: r.date,
            description: r.description,
            rawText: r.raw_text,
            storeName: r.store_name,
            items: itemsParsed
          };
        });
        res.json(mappedRows);
      } catch (error) {
        console.error("Transactions Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
      }
    } else {
      res.json([]);
    }
  });

  app.post("/api/transactions", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const { id, type, category, amount, date, description, rawText, storeName, items } = req.body;
        const newId = id || crypto.randomUUID();
        const itemsStr = items ? JSON.stringify(items) : null;
        await dbPool.execute(
          'INSERT INTO transactions (id, user_id, type, category, amount, date, description, raw_text, store_name, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [newId, req.user.id, type, category, amount, date, description || null, rawText || null, storeName || null, itemsStr]
        );
        res.status(201).json({ message: "Transaction created", id: newId });
      } catch (error) {
        console.error("Transaction Create Error:", error);
        res.status(500).json({ error: "Failed to create transaction" });
      }
    } else {
      res.status(501).json({ error: "Database not configured." });
    }
  });

  app.put("/api/transactions/:id", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const { type, category, amount, date, description, rawText, storeName, items } = req.body;
        const itemsStr = items ? JSON.stringify(items) : null;
        const [result]: any = await dbPool.execute(
          'UPDATE transactions SET type=?, category=?, amount=?, date=?, description=?, raw_text=?, store_name=?, items=? WHERE id=? AND user_id=?',
          [type, category, amount, date, description || null, rawText || null, storeName || null, itemsStr, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Transaction not found or unauthorized" });
        }
        res.json({ message: "Transaction updated" });
      } catch (error) {
        console.error("Transaction Update Error:", error);
        res.status(500).json({ error: "Failed to update transaction" });
      }
    } else {
      res.status(501).json({ error: "Database not configured." });
    }
  });

  app.delete("/api/transactions/:id", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const [result]: any = await dbPool.execute(
          'DELETE FROM transactions WHERE id=? AND user_id=?',
          [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Transaction not found or unauthorized" });
        }
        res.json({ message: "Transaction deleted" });
      } catch (error) {
        console.error("Transaction Delete Error:", error);
        res.status(500).json({ error: "Failed to delete transaction" });
      }
    } else {
      res.status(501).json({ error: "Database not configured." });
    }
  });


  app.post("/api/transactions/export", authenticateToken, async (req: any, res: any) => {
    try {
      const { format, email } = req.body;
      if (!dbPool) return res.status(501).json({ error: "Database tidak tersedia" });

      // Mengambil data transaksi diurutkan dari yang terbaru
      const [rows]: any = await dbPool.execute(
        'SELECT description, amount, type, category, date FROM transactions WHERE user_id = ? ORDER BY date DESC',
        [req.user.id]
      );

      if (rows.length === 0) return res.status(404).json({ error: "Tidak ada data transaksi" });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'admin.keuangankhb@gmail.com',
          pass: process.env.EMAIL_APP_PASSWORD || ''
        }
      });

      let attachmentContent: any;

      // KONDISI 1: JIKA FORMAT CSV
      if (format === 'csv') {
        attachmentContent = "Deskripsi,Jumlah,Tipe,Kategori,Tanggal\n" +
          rows.map((r: any) => {
            const dateStr = r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0];
            return `"${r.description || ''}",${r.amount},${r.type},${r.category},"${dateStr}"`;
          }).join("\n");
      }
      // KONDISI 2: JIKA FORMAT PDF
      else if (format === 'pdf') {
        // Inisialisasi dokumen menggunakan import ES Module dari atas
        const doc = new PDFDocument({ margin: 40 });
        const buffers: Buffer[] = [];

        // Bungkus proses stream ke dalam Promise agar data PDF selesai di-generate seutuhnya
        await new Promise<void>((resolve, reject) => {
          doc.on('data', (chunk: Buffer) => buffers.push(chunk));
          doc.on('end', () => resolve());
          doc.on('error', (err: any) => reject(err));

          // Judul Laporan
          doc.fontSize(18).font('Helvetica-Bold').text('LAPORAN TRANSAKSI KEUANGAN', { align: 'center' });
          doc.fontSize(11).font('Helvetica').text('Komunitas Halal Bandung (KHB)', { align: 'center' });
          doc.moveDown(2);

          // Header Tabel PDF
          const startY = doc.y;
          doc.fontSize(10).font('Helvetica-Bold');
          doc.text('No', 40, startY, { width: 30 });
          doc.text('Tanggal', 70, startY, { width: 75 });
          doc.text('Kategori', 145, startY, { width: 85 });
          doc.text('Tipe', 230, startY, { width: 75 });
          doc.text('Jumlah (Rp)', 305, startY, { width: 85 });
          doc.text('Deskripsi', 390, startY, { width: 165 });

          doc.moveDown(0.3);
          doc.text('------------------------------------------------------------------------------------------------------------------------');
          doc.moveDown(0.5);

          // Isi Data Tabel PDF
          doc.font('Helvetica');
          rows.forEach((r: any, i: number) => {
            const currentY = doc.y;

            // Penanganan Format Tanggal yang Aman
            let formattedDate = '-';
            if (r.date) {
              formattedDate = r.date instanceof Date
                ? r.date.toISOString().split('T')[0]
                : String(r.date).split('T')[0];
            }

            const formattedAmount = Number(r.amount || 0).toLocaleString('id-ID');
            const displayType = r.type === 'income' ? 'Pemasukan' : 'Pengeluaran';

            doc.text(`${i + 1}`, 40, currentY, { width: 30 });
            doc.text(formattedDate, 70, currentY, { width: 75 });
            doc.text(r.category || '-', 145, currentY, { width: 85 });
            doc.text(displayType, 230, currentY, { width: 75 });
            doc.text(formattedAmount, 305, currentY, { width: 85 });
            doc.text(r.description || '-', 390, currentY, { width: 165 });

            doc.moveDown(0.8);
          });

          // Akhiri aliran pembuatan dokumen
          doc.end();
        });

        // Satukan seluruh potongan chunk menjadi satu buffer tunggal
        attachmentContent = Buffer.concat(buffers);
      } else {
        return res.status(400).json({ error: "Format tidak didukung" });
      }

      // Kirim Email dengan attachment yang sesuai
      await transporter.sendMail({
        from: '"Catatan Keuangan KHB" <admin.keuangankhb@gmail.com>',
        to: email,
        subject: `Laporan Transaksi - ${format.toUpperCase()}`,
        text: "Halo, Terlampir adalah laporan rekapan transaksi keuangan Anda sesuai dengan format yang diminta.",
        attachments: [{ filename: `laporan.${format}`, content: attachmentContent }]
      });

      res.json({ message: "Ekspor berhasil!" });
    } catch (error) {
      console.error("Export Error:", error);
      res.status(500).json({ error: "Gagal memproses ekspor data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();