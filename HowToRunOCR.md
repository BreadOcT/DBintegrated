```python
markdown_content = """# Panduan Langkah Menjalankan Aplikasi (Setup & Run Guide)

Panduan ringkas ini hanya berisi instruksi setup terminal, unduhan yang diperlukan, dan tata cara menjalankan seluruh sistem (Python OCR, Database XAMPP, dan Node.js/Vite) tanpa menyertakan source code.

---

## 1. Unduhan & Komponen yang Diperlukan

Pastikan komponen-komponen berikut sudah terinstal di komputer Anda:
1. **Python 3.10.11 (64-bit)**
   * Link download resmi: [Python 3.10.11 (64-bit)](https://www.python.org/ftp/python/3.10.11/python-3.10.11-amd64.exe)
   * *Catatan Penting:* Saat instalasi, pastikan untuk mencentang pilihan **"Add Python 3.10 to PATH"**.
2. **XAMPP Control Panel** (Untuk mengelola database MySQL lokal).
3. **Node.js** (Untuk menjalankan aplikasi web utama).

---

## 2. Persiapan Database (XAMPP)

1. Buka aplikasi **XAMPP Control Panel**.
2. Pada baris **Apache** dan **MySQL**, klik tombol **Start** hingga indikator berubah menjadi warna hijau.
3. Buka browser Anda, lalu akses alamat: `http://localhost/phpmyadmin`
4. Buat database baru dengan mengklik **New** di menu sebelah kiri.
5. Masukkan nama database sesuai dengan konfigurasi file `.env` Anda (contoh bawaan: `halal_finance`), lalu klik **Create**.

---

## 3. Setup & Menjalankan Server Python OCR

Buka terminal **PowerShell/CMD baru**, arahkan ke direktori proyek Anda (`C:\\projects\\PKM\\integratedDB`), lalu jalankan perintah berikut secara berurutan:

### Langkah A: Instalasi Library Pendukung (Golden Match Version)

```

```text
File Cara_Run_Sistem.md berhasil dibuat.

```bash
# 1. Upgrade pip ke versi terbaru
py -3.10 -m pip install --upgrade pip

# 2. Instal library web server & pydantic
py -3.10 -m pip install fastapi uvicorn pydantic

# 3. Instal library pembaca gambar headless untuk Windows
py -3.10 -m pip install opencv-python-headless

# 4. Instal core AI engine Paddle dan modul OCR versi stabil
py -3.10 -m pip install paddlepaddle==2.6.2 paddleocr==2.8.1

```

### Langkah B: Menjalankan Server OCR

Setelah instalasi selesai tanpa teks error merah, jalankan perintah ini untuk mengaktifkan service pembaca gambar:

```bash
py -3.10 -m uvicorn ocr_server:app --host 0.0.0.0 --port 8000

```

*Biarkan terminal ini tetap terbuka dan berjalan di latar belakang (background).*

---

## 4. Setup & Menjalankan Aplikasi Web Utama (Node.js)

Buka terminal **PowerShell/CMD kedua (baru)**, arahkan ke direktori proyek Anda (`C:\\projects\\PKM\\integratedDB`), lalu jalankan perintah berikut:

### Langkah A: Sinkronisasi Dependencies Proyek & Tim

Perintah ini akan otomatis mendeteksi dan menginstal seluruh package yang kurang atau baru ditambahkan oleh tim Anda (seperti `nodemailer`, `qrcode`, beserta type definitions TypeScript-nya):

```bash
npm install

```

### Langkah B: Menjalankan Aplikasi Web

Setelah proses sinkronisasi selesai, jalankan perintah berikut untuk membuka web aplikasi:

```bash
npm run dev

```

---

## 5. Ringkasan Setiap Kali Ingin Memulai Pengembangan

Setiap kali Anda menyalakan komputer dan ingin melanjutkan proyek ini, ikuti alur cepat ini:

1. Jalankan **Apache & MySQL** di XAMPP Control Panel.
2. Buka Terminal 1 lalu ketik:
`py -3.10 -m uvicorn ocr_server:app --host 0.0.0.0 --port 8000`
3. Buka Terminal 2 lalu ketik:
`npm run dev`
4. Akses URL lokal aplikasi yang tertera di Terminal 2 (biasanya `http://localhost:5173` atau `http://localhost:3000`) melalui browser Anda.
"""