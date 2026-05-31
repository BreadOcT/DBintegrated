import express from "express";
import path from "path";
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

// Handle uncaught exceptions and unhandled promise rejections to prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

const getEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'admin.keuangankhb@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS || ''
    }
  });
};

const getEmailSender = () => {
  return `"Catatan Keuangan KHB" <${process.env.EMAIL_USER || 'admin.keuangankhb@gmail.com'}>`;
};

// Setup MySQL Connection Pool
let dbPool: mysql.Pool | null = null;
if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
  try {
    dbPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306, // <-- WAJIB ADA: Untuk membaca port Aiven
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },        // <-- WAJIB ADA: Aiven menolak koneksi tanpa SSL
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log("MySQL connection pool created successfully!");

    // Test connection on startup to print database errors in Vercel logs
    dbPool.getConnection()
      .then(conn => {
        console.log("MySQL Database connection test successful!");
        conn.release();
      })
      .catch(err => {
        console.error("MySQL Database connection test FAILED on startup:", err);
      });

    // Auto-migrate tables (only run locally to avoid Vercel serverless timeouts)
    if (!process.env.VERCEL) {
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
    }
  } catch (error) {
    console.error("Failed to create MySQL pool:", error);
  }
} else {
  console.log("No MySQL connection configured. Running in local/mock mode.");
}

// All routes and middleware are registered directly on the top-level app

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



  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email dan kata sandi diperlukan" });
      }

      if (dbPool) {
        const [rows]: any = await dbPool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
          return res.status(401).json({ error: "Email atau kata sandi salah" });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Email atau kata sandi salah" });
        }

        // Cek apakah 2FA aktif
        const [twoFaRows]: any = await dbPool.execute('SELECT * FROM two_factor_auth WHERE user_id = ? AND enabled = true', [user.id]);

        if (twoFaRows.length > 0) {
          const twoFa = twoFaRows[0];
          const method = twoFa.method;

          // Jika metode adalah email/sms, kirim kode OTP
          if (method === 'email' || method === 'sms') {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            if (method === 'email') {
              const transporter = getEmailTransporter();

              await transporter.sendMail({
                from: getEmailSender(),
                to: user.email,
                subject: 'Kode OTP Login 2FA - Catatan Keuangan KHB',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #22da47;">Login Verifikasi 2 Faktor</h2>
                    <p>Halo ${user.name},</p>
                    <p>Kami mendeteksi aktivitas masuk ke akun Anda. Masukkan kode OTP di bawah ini untuk menyelesaikan proses login:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1b4332; border: 1px dashed #22da47; display: inline-block; min-width: 150px;">${otp}</div>
                    </div>
                    <p style="color: #666; font-size: 13px;">Kode verifikasi ini hanya berlaku selama 5 menit. Jangan pernah membagikan kode verifikasi ini kepada siapapun.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <p style="color: #999; font-size: 11px; text-align: center;">Komunitas Halal Bandung &copy; 2026</p>
                  </div>
                `
              });
            }

            const tempToken = jwt.sign(
              { userId: user.id, email: user.email, otp, purpose: '2fa_login' },
              JWT_SECRET,
              { expiresIn: '5m' }
            );

            return res.json({
              twoFactorRequired: true,
              method,
              tempToken
            });
          } else if (method === 'authenticator') {
            const tempToken = jwt.sign(
              { userId: user.id, email: user.email, purpose: '2fa_login' },
              JWT_SECRET,
              { expiresIn: '5m' }
            );

            return res.json({
              twoFactorRequired: true,
              method,
              tempToken
            });
          }
        }

        // Jika 2FA tidak aktif, login normal
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

  app.post("/api/auth/2fa/verify-login", async (req: any, res: any) => {
    try {
      const { tempToken, code } = req.body;
      if (!tempToken || !code) {
        return res.status(400).json({ error: "Kode verifikasi dan token sementara diperlukan" });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(tempToken, JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ error: "Sesi verifikasi telah kedaluwarsa atau tidak valid" });
      }

      if (decoded.purpose !== '2fa_login') {
        return res.status(400).json({ error: "Token tidak sah" });
      }

      if (!dbPool) {
        return res.status(501).json({ error: "Database tidak tersedia" });
      }

      const userId = decoded.userId;

      // Ambil data user
      const [userRows]: any = await dbPool.execute('SELECT * FROM users WHERE id = ?', [userId]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan" });
      }
      const user = userRows[0];

      // Ambil data 2FA
      const [twoFaRows]: any = await dbPool.execute('SELECT * FROM two_factor_auth WHERE user_id = ? AND enabled = true', [userId]);
      if (twoFaRows.length === 0) {
        return res.status(400).json({ error: "2FA tidak aktif untuk akun ini" });
      }
      const twoFa = twoFaRows[0];

      // Cek Backup Codes terlebih dahulu
      let backupCodes: string[] = [];
      if (twoFa.backup_codes) {
        backupCodes = twoFa.backup_codes.split(',');
      }

      const isBackupCode = backupCodes.includes(code.toUpperCase());
      let isValid = false;

      if (isBackupCode) {
        isValid = true;
        // Hapus backup code yang telah dipakai
        const updatedBackupCodes = backupCodes.filter(c => c !== code.toUpperCase()).join(',');
        await dbPool.execute('UPDATE two_factor_auth SET backup_codes = ? WHERE user_id = ?', [updatedBackupCodes, userId]);
      } else {
        if (twoFa.method === 'email' || twoFa.method === 'sms') {
          isValid = (decoded.otp === code);
        } else if (twoFa.method === 'authenticator') {
          isValid = authenticator.check(code, twoFa.secret);
        }
      }

      if (!isValid) {
        return res.status(400).json({ error: "Kode verifikasi tidak valid" });
      }

      // Login sukses, generate full JWT token
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
    } catch (error) {
      console.error("Verify Login Error:", error);
      res.status(500).json({ error: "Gagal memproses verifikasi login" });
    }
  });

  app.post("/api/auth/2fa/resend", async (req: any, res: any) => {
    try {
      const { tempToken } = req.body;
      if (!tempToken) {
        return res.status(400).json({ error: "Token sementara diperlukan" });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(tempToken, JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ error: "Sesi verifikasi telah kedaluwarsa atau tidak valid" });
      }

      if (decoded.purpose !== '2fa_login') {
        return res.status(400).json({ error: "Token tidak sah" });
      }

      if (!dbPool) {
        return res.status(501).json({ error: "Database tidak tersedia" });
      }

      const userId = decoded.userId;

      const [userRows]: any = await dbPool.execute('SELECT * FROM users WHERE id = ?', [userId]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan" });
      }
      const user = userRows[0];

      const [twoFaRows]: any = await dbPool.execute('SELECT * FROM two_factor_auth WHERE user_id = ? AND enabled = true', [userId]);
      if (twoFaRows.length === 0) {
        return res.status(400).json({ error: "2FA tidak aktif untuk akun ini" });
      }
      const twoFa = twoFaRows[0];

      if (twoFa.method !== 'email' && twoFa.method !== 'sms') {
        return res.status(400).json({ error: "Resend OTP tidak didukung untuk metode ini" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      if (twoFa.method === 'email') {
        const transporter = getEmailTransporter();

        await transporter.sendMail({
          from: getEmailSender(),
          to: user.email,
          subject: 'Kode OTP Baru 2FA - Catatan Keuangan KHB',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #22da47;">Kode OTP Baru Anda</h2>
              <p>Halo ${user.name},</p>
              <p>Berikut adalah kode verifikasi OTP baru Anda untuk login:</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1b4332; border: 1px dashed #22da47; display: inline-block; min-width: 150px;">${otp}</div>
              </div>
              <p style="color: #666; font-size: 13px;">Kode verifikasi ini hanya berlaku selama 5 menit. Jangan pernah membagikan kode verifikasi ini kepada siapapun.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
              <p style="color: #999; font-size: 11px; text-align: center;">Komunitas Halal Bandung &copy; 2026</p>
            </div>
          `
        });
      }

      const newTempToken = jwt.sign(
        { userId: user.id, email: user.email, otp, purpose: '2fa_login' },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      res.json({
        message: "Kode OTP baru telah dikirim",
        tempToken: newTempToken
      });
    } catch (error) {
      console.error("Resend OTP Error:", error);
      res.status(500).json({ error: "Gagal mengirim ulang kode verifikasi" });
    }
  });

  app.delete("/api/auth/clear-data", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        await dbPool.execute('DELETE FROM transactions WHERE user_id = ?', [req.user.id]);
        await dbPool.execute('DELETE FROM monthly_budgets WHERE user_id = ?', [req.user.id]);
        res.json({ message: "Semua data transaksi dan anggaran berhasil dihapus permanen" });
      } catch (error) {
        console.error("Clear data error:", error);
        res.status(500).json({ error: "Gagal menghapus semua data" });
      }
    } else {
      res.status(501).json({ error: "Database tidak terkonfigurasi" });
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

        const transporter = getEmailTransporter();

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        const mailOptions = {
          from: getEmailSender(),
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
      try {
        const [rows]: any = await dbPool.execute('SELECT id, name, email, phone, photo, weekly_report, bill_reminder, promo_offer FROM users WHERE id = ?', [req.user.id]);
        if (rows.length > 0) {
          const [twoFaRows]: any = await dbPool.execute('SELECT enabled FROM two_factor_auth WHERE user_id = ?', [req.user.id]);
          const two_factor_enabled = twoFaRows.length > 0 ? Boolean(twoFaRows[0].enabled) : false;
          res.json({
            ...rows[0],
            two_factor_enabled
          });
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ error: "Gagal mengambil data profil" });
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
          const transporter = getEmailTransporter();

          await transporter.sendMail({
            from: getEmailSender(),
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

      const transporter = getEmailTransporter();

      let attachmentContent: any;

      // KONDISI 1: JIKA FORMAT CSV
      if (format === 'csv') {
        const totalTransactions = rows.length;
        let totalIncome = 0;
        let totalExpense = 0;
        rows.forEach((r: any) => {
          const amt = Number(r.amount || 0);
          if (r.type === 'income') totalIncome += amt;
          else if (r.type === 'expense') totalExpense += amt;
        });
        const netBalance = totalIncome - totalExpense;

        const dateNowStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

        attachmentContent = "LAPORAN REKAPITULASI TRANSAKSI KEUANGAN\n" +
          "Komunitas Halal Bandung (KHB)\n" +
          `Email Pengguna: ${req.user.email}\n` +
          `Tanggal Ekspor: ${dateNowStr}\n\n` +
          "RINGKASAN KEUANGAN\n" +
          "Total Transaksi,Total Pemasukan,Total Pengeluaran,Saldo Bersih\n" +
          `"${totalTransactions}","Rp ${totalIncome.toLocaleString('id-ID')}","Rp ${totalExpense.toLocaleString('id-ID')}","Rp ${netBalance.toLocaleString('id-ID')}"\n\n` +
          "DAFTAR TRANSAKSI\n" +
          "No,Tanggal,Deskripsi,Kategori,Tipe Transaksi,Jumlah (IDR)\n" +
          rows.map((r: any, i: number) => {
            let formattedDate = '-';
            if (r.date) {
              formattedDate = r.date instanceof Date
                ? r.date.toISOString().split('T')[0]
                : String(r.date).split('T')[0];
            }
            const displayType = r.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
            const desc = (r.description || '').replace(/"/g, '""');
            const cat = (r.category || '').replace(/"/g, '""');
            return `${i + 1},"${formattedDate}","${desc}","${cat}","${displayType}",${r.amount}`;
          }).join("\n");
      }
      // KONDISI 2: JIKA FORMAT PDF
      else if (format === 'pdf') {
        // Inisialisasi dokumen dengan bufferPages: true untuk menghitung total halaman secara akurat
        const doc = new PDFDocument({ margin: 40, bufferPages: true });
        const buffers: Buffer[] = [];

        await new Promise<void>((resolve, reject) => {
          doc.on('data', (chunk: Buffer) => buffers.push(chunk));
          doc.on('end', () => resolve());
          doc.on('error', (err: any) => reject(err));

          // 1. HEADER BANNER (Hero Box)
          // Warna Hijau Alami KHB (#1b4332)
          doc.roundedRect(40, 30, 532, 80, 8).fill('#1b4332');

          doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('LAPORAN KEUANGAN KHB', 60, 48);
          doc.fontSize(10).font('Helvetica').fillColor('#a3e635').text('Komunitas Halal Bandung', 60, 74);

          const dateNowStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
          doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica');
          doc.text(`Pengguna: ${req.user.email}`, 380, 50, { align: 'right', width: 172 });
          doc.text(`Tanggal Ekspor: ${dateNowStr}`, 380, 66, { align: 'right', width: 172 });
          doc.text(`Total Transaksi: ${rows.length}`, 380, 82, { align: 'right', width: 172 });

          // 2. SUMMARY CARDS
          let totalIncome = 0;
          let totalExpense = 0;
          rows.forEach((r: any) => {
            const amt = Number(r.amount || 0);
            if (r.type === 'income') totalIncome += amt;
            else if (r.type === 'expense') totalExpense += amt;
          });
          const netBalance = totalIncome - totalExpense;

          // Card 1: Pemasukan (Hijau Lembut)
          doc.roundedRect(40, 126, 168, 54, 6).fill('#e8f5e9');
          doc.fillColor('#2e7d32').fontSize(7.5).font('Helvetica-Bold').text('TOTAL PEMASUKAN', 52, 136);
          doc.fillColor('#1b4332').fontSize(11).font('Helvetica-Bold').text('Rp ' + totalIncome.toLocaleString('id-ID'), 52, 152, { width: 144, ellipsis: true });

          // Card 2: Pengeluaran (Merah Lembut)
          doc.roundedRect(222, 126, 168, 54, 6).fill('#fdf2f2');
          doc.fillColor('#c53030').fontSize(7.5).font('Helvetica-Bold').text('TOTAL PENGELUARAN', 234, 136);
          doc.fillColor('#7a1a1a').fontSize(11).font('Helvetica-Bold').text('Rp ' + totalExpense.toLocaleString('id-ID'), 234, 152, { width: 144, ellipsis: true });

          // Card 3: Saldo Bersih (Biru Lembut)
          doc.roundedRect(404, 126, 168, 54, 6).fill('#eef2ff');
          doc.fillColor('#3730a3').fontSize(7.5).font('Helvetica-Bold').text('SALDO BERSIH', 416, 136);
          doc.fillColor('#1e1b4b').fontSize(11).font('Helvetica-Bold').text('Rp ' + netBalance.toLocaleString('id-ID'), 416, 152, { width: 144, ellipsis: true });

          // 3. TABLE OF TRANSACTIONS
          let currentY = 196;
          const rowHeight = 22;
          const pageHeightLimit = 700;

          // Render Table Header
          doc.roundedRect(40, currentY, 532, 22, 4).fill('#f4f6f0');
          doc.fillColor('#1b4332').fontSize(9).font('Helvetica-Bold');
          doc.text('No', 48, currentY + 6, { width: 25 });
          doc.text('Tanggal', 75, currentY + 6, { width: 65 });
          doc.text('Kategori', 145, currentY + 6, { width: 80 });
          doc.text('Tipe', 230, currentY + 6, { width: 70 });
          doc.text('Jumlah (Rp)', 305, currentY + 6, { width: 85, align: 'right' });
          doc.text('Deskripsi', 405, currentY + 6, { width: 155 });

          currentY += 28;

          // Render Rows
          rows.forEach((r: any, i: number) => {
            if (currentY + rowHeight > pageHeightLimit) {
              doc.addPage();
              currentY = 40;

              // Redraw Table Header on new page
              doc.roundedRect(40, currentY, 532, 22, 4).fill('#f4f6f0');
              doc.fillColor('#1b4332').fontSize(9).font('Helvetica-Bold');
              doc.text('No', 48, currentY + 6, { width: 25 });
              doc.text('Tanggal', 75, currentY + 6, { width: 65 });
              doc.text('Kategori', 145, currentY + 6, { width: 80 });
              doc.text('Tipe', 230, currentY + 6, { width: 70 });
              doc.text('Jumlah (Rp)', 305, currentY + 6, { width: 85, align: 'right' });
              doc.text('Deskripsi', 405, currentY + 6, { width: 155 });

              currentY += 28;
            }

            // Zebra striping
            if (i % 2 === 1) {
              doc.roundedRect(40, currentY, 532, rowHeight, 2).fill('#fbfcf9');
            }

            let formattedDate = '-';
            if (r.date) {
              formattedDate = r.date instanceof Date
                ? r.date.toISOString().split('T')[0]
                : String(r.date).split('T')[0];
            }

            const isIncome = r.type === 'income';
            const amountPrefix = isIncome ? '+' : '-';
            const formattedAmount = `${amountPrefix} Rp ${Number(r.amount || 0).toLocaleString('id-ID')}`;
            const displayType = isIncome ? 'Pemasukan' : 'Pengeluaran';
            const amountColor = isIncome ? '#2e7d32' : '#c53030';

            // Draw cells
            doc.fillColor('#111827').fontSize(8.5).font('Helvetica');
            doc.text(`${i + 1}`, 48, currentY + 6, { width: 25 });
            doc.text(formattedDate, 75, currentY + 6, { width: 65 });
            doc.text(r.category || '-', 145, currentY + 6, { width: 80, ellipsis: true });
            doc.text(displayType, 230, currentY + 6, { width: 70 });

            doc.fillColor(amountColor).font('Helvetica-Bold');
            doc.text(formattedAmount, 305, currentY + 6, { width: 85, align: 'right' });

            doc.fillColor('#111827').font('Helvetica');
            doc.text(r.description || '-', 405, currentY + 6, { width: 155, ellipsis: true });

            currentY += rowHeight;
          });

          // 4. FOOTERS & PAGE NUMBERS (Draw after buffering pages)
          const range = doc.bufferedPageRange();
          for (let j = 0; j < range.count; j++) {
            doc.switchToPage(j);

            // Subtle horizontal line above footer
            doc.rect(40, 740, 532, 0.5).fill('#e5e7eb');

            doc.fillColor('#6b7280').fontSize(7.5).font('Helvetica');
            doc.text(
              'Laporan ini diunduh secara resmi melalui aplikasi Catatan Keuangan KHB.',
              40,
              748,
              { align: 'left', width: 350 }
            );

            doc.text(
              `Halaman ${j + 1} dari ${range.count}`,
              400,
              748,
              { align: 'right', width: 172 }
            );
          }

          doc.end();
        });

        attachmentContent = Buffer.concat(buffers);
      } else {
        return res.status(400).json({ error: "Format tidak didukung" });
      }

      // Kirim Email dengan attachment yang sesuai
      await transporter.sendMail({
        from: getEmailSender(),
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

  // Vite middleware for development or fallback static serving in production
  if (process.env.NODE_ENV !== "production") {
    import("vite").then(({ createServer: createViteServer }) => {
      createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      }).then((vite) => {
        app.use(vite.middlewares);
        if (!process.env.VERCEL) {
          const PORT = Number(process.env.PORT) || 3000;
          app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running in development on http://localhost:${PORT}`);
          });
        }
      });
    });
  } else {
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req: any, res: any) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      const PORT = Number(process.env.PORT) || 3000;
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running in production on http://localhost:${PORT}`);
      });
    }
  }

export default app;