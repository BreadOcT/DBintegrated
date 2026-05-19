import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        // Add phone and photo columns if they don't exist (for existing tables)
        try { await dbPool.execute(`ALTER TABLE users ADD COLUMN phone VARCHAR(50)`); } catch (e) {}
        try { await dbPool.execute(`ALTER TABLE users ADD COLUMN photo LONGTEXT`); } catch (e) {}
        
        await dbPool.execute(`
          CREATE TABLE IF NOT EXISTS transactions (
            id CHAR(36) PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            description VARCHAR(255) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            type ENUM('income', 'expense') NOT NULL,
            category VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            store_name VARCHAR(255),
            raw_text LONGTEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        
        try { await dbPool.execute(`ALTER TABLE transactions ADD COLUMN raw_text LONGTEXT`); } catch (e) {}
        
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

  app.use(express.json());

  // Middleware to check auth
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
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (dbPool) {
        // Check if email already exists
        const [rows]: any = await dbPool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
          return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password and insert
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result]: any = await dbPool.execute(
          'INSERT INTO users (id, email, password, name, phone) VALUES (?, ?, ?, ?, ?)',
          [crypto.randomUUID(), email, hashedPassword, name, phone || null]
        );
        res.status(201).json({ message: "Registration successful" });
      } else {
        res.status(501).json({ error: "Database not configured. Cannot register." });
      }
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

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
        res.json({ 
          token, 
          user: { id: user.id, name: user.name, email: user.email, phone: user.phone } 
        });
      } else {
        // Mock Login for UI testing when DB is not connected
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

  app.post("/api/auth/forgot-password", async (req: any, res: any) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email diperlukan" });
      }

      if (dbPool) {
        const [rows]: any = await dbPool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
          return res.status(404).json({ error: "Email tidak ditemukan dalam sistem" });
        }

        const user = rows[0];
        // Generate temporary reset token (e.g. JWT valid for 15 minutes)
        const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
        
        // Setup Nodemailer transporter
        // Konfigurasi ini menggunakan APP PASSWORD dari Google Workspace / Gmail
        // Pastikan Anda sudah membuat App Password di pengaturan keamanan Gmail admin.keuangankhb@gmail.com
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'admin.keuangankhb@gmail.com',
            pass: process.env.EMAIL_APP_PASSWORD || 'PASSWORD_APLIKASI_GMAIL_ANDA' 
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

        // Send email
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
      if (!token || !password) {
        return res.status(400).json({ error: "Token dan kata sandi baru diperlukan" });
      }

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
        const [rows]: any = await dbPool.execute('SELECT id, name, email, phone, photo FROM users WHERE id = ?', [req.user.id]);
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
         const { name, phone, photo } = req.body;
         // Try checking if photo column exists, if not this might fail gracefully or we should ensure DB has it
         await dbPool.execute('UPDATE users SET name = ?, phone = ?, photo = ? WHERE id = ?', [name, phone || null, photo || null, req.user.id]);
         res.json({ message: "Profile updated successfully" });
       } catch (error) {
         console.error("Profile update error:", error);
         res.status(500).json({ error: "Failed to update profile. Ensure 'photo' column exists in 'users' table." });
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
         // Create table if not exists right here as a fallback
         try {
            await dbPool.execute(`
              CREATE TABLE IF NOT EXISTS monthly_budgets (
                  user_id VARCHAR(36) NOT NULL,
                  month INT NOT NULL,
                  year INT NOT NULL,
                  income_target DECIMAL(15, 2) DEFAULT 0,
                  expense_target DECIMAL(15, 2) DEFAULT 0,
                  PRIMARY KEY (user_id, month, year)
              )
            `);
            const { year } = req.query;
            let query = 'SELECT * FROM monthly_budgets WHERE user_id = ?';
            let params: any[] = [req.user.id];
            if (year) { query += ' AND year = ?'; params.push(parseInt(year)); }
            const [rows] = await dbPool.execute(query, params);
            res.json(rows);
         } catch(e) {
            console.error("Budgets Fetch Error:", e);
            res.status(500).json({ error: "Failed to fetch budgets" });
         }
      }
    } else {
      res.json([]);
    }
  });

  app.put("/api/budgets", authenticateToken, async (req: any, res: any) => {
    if (dbPool) {
      try {
        const { month, year, income_target, expense_target } = req.body;
        // Upsert logic
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
        const [rows] = await dbPool.execute('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [req.user.id]);
        res.json(rows);
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
        const { id, type, category, amount, date, description, rawText, storeName } = req.body;
        const newId = id || crypto.randomUUID();
        await dbPool.execute(
          'INSERT INTO transactions (id, user_id, type, category, amount, date, description, raw_text, store_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [newId, req.user.id, type, category, amount, date, description || null, rawText || null, storeName || null]
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
        const { type, category, amount, date, description, rawText, storeName } = req.body;
        const [result]: any = await dbPool.execute(
          'UPDATE transactions SET type=?, category=?, amount=?, date=?, description=?, raw_text=?, store_name=? WHERE id=? AND user_id=?',
          [type, category, amount, date, description || null, rawText || null, storeName || null, req.params.id, req.user.id]
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
