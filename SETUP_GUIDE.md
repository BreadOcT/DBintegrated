# 🚀 Quick Setup Guide - 2FA Implementation

## 1️⃣ Install Dependencies

Jalankan di terminal:

```bash
npm install
```

Ini akan menginstall paket baru:
- `otplib` - Untuk TOTP generation
- `qrcode` - Untuk QR Code generation

## 2️⃣ Database Migration

Database akan otomatis membuat tabel `two_factor_auth` saat server startup. Pastikan MySQL terkoneksi dengan baik.

**Tabel yang dibuat:**
```sql
CREATE TABLE two_factor_auth (
    user_id CHAR(36) PRIMARY KEY,
    method VARCHAR(50) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    backup_codes TEXT NOT NULL,
    enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## 3️⃣ Verifikasi Files

✅ Komponen baru dibuat:
```
src/components/TwoFactorAuth.tsx
```

✅ File diupdate:
```
src/components/Profile.tsx       (+ import & integration)
server.ts                         (+ endpoints & imports)
package.json                      (+ dependencies)
```

✅ Dokumentasi:
```
2FA_IMPLEMENTATION.md            (Dokumentasi lengkap)
2FA_FLOW_DIAGRAM.txt            (Visual flow)
SETUP_GUIDE.md                  (Ini)
```

## 4️⃣ Testing Lokal

### Start Server
```bash
npm run dev
```

Server akan jalan di `http://localhost:3000`

### Test 2FA Flow

1. **Login / Register** ke aplikasi
2. Buka **Profile** page
3. Di bagian "Keamanan", klik **"Aktifkan 2FA"**
4. Ikuti wizard:
   - Pilih metode (Google Authenticator)
   - Scan QR Code dengan Google Authenticator app
   - Masukkan kode 6 digit dari app
   - Download backup codes
5. Klik **"Kelola"** untuk management panel
6. Klik **"Nonaktifkan 2FA"** untuk test disable flow

### Environment Variables (Opsional)

Jika menggunakan email OTP, pastikan `.env` sudah setup:
```bash
EMAIL_APP_PASSWORD=your_gmail_app_password
```

## 5️⃣ Feature Walkthrough

### 🔒 Setup Wizard
```
Menu (Penjelasan) 
  ↓
Pilih Metode (Authenticator/Email/SMS)
  ↓
Generate QR Code / OTP
  ↓
Verifikasi dengan Kode 6 Digit
  ↓
Terima & Download Backup Codes
  ↓
Selesai - 2FA Aktif ✓
```

### 📋 Management Panel
- Lihat metode 2FA aktif
- Lihat kapan diaktifkan
- Download ulang backup codes
- Nonaktifkan (dengan password verification)

### 🆘 Emergency Access
- Gunakan backup codes jika akses 2FA hilang
- Setiap code hanya bisa 1x pakai
- Download ulang tersedia di management panel

## 6️⃣ API Endpoints untuk Testing

Gunakan Postman atau curl untuk test:

### Generate QR Code
```bash
curl -X POST http://localhost:3000/api/auth/2fa/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"authenticator"}'
```

### Verify & Enable 2FA
```bash
curl -X POST http://localhost:3000/api/auth/2fa/verify-setup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456","method":"authenticator"}'
```

### Disable 2FA
```bash
curl -X POST http://localhost:3000/api/auth/2fa/disable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"user_password"}'
```

## 7️⃣ Google Authenticator Setup

Untuk testing dengan Google Authenticator:

1. **Download Google Authenticator** dari app store
2. Di modal 2FA, ada **QR Code** untuk di-scan
3. Atau gunakan **Manual Key** jika scan gagal
4. Input 6 digit kode dari app ke modal
5. Done!

### Manual Key Format
```
JBSWY3DPEBLW64TG    (base32 encoded)
```

Copy-paste ke Authenticator jika QR Code tidak bisa di-scan.

## 8️⃣ File Changes Summary

### New Files
```
src/components/TwoFactorAuth.tsx        (Main component)
2FA_IMPLEMENTATION.md                   (Documentation)
2FA_FLOW_DIAGRAM.txt                   (Visual guide)
```

### Modified Files
```
src/components/Profile.tsx
  ├─ Added: import TwoFactorAuth
  ├─ Added: handleToggle2FA() method
  ├─ Modified: activeModal state (added '2fa')
  ├─ Modified: 2FA button onClick handler
  └─ Added: TwoFactorAuth component at end

server.ts
  ├─ Added: import QRCode, authenticator
  ├─ Added: 2FA table migration
  ├─ Added: 4 new API endpoints
  │  ├─ POST /api/auth/2fa/generate
  │  ├─ POST /api/auth/2fa/verify-setup
  │  ├─ POST /api/auth/2fa/disable
  │  └─ POST /api/auth/2fa/status
  └─ All with proper error handling

package.json
  └─ Added: "otplib": "^12.0.1"
  └─ Added: "qrcode": "^1.5.3"
```

## 9️⃣ Troubleshooting

### ❌ "Package not found" error
**Solution:** Jalankan `npm install` dan pastikan internet connection stabil

### ❌ "Module not found: qrcode"
**Solution:** 
```bash
npm install qrcode otplib
```

### ❌ QR Code tidak muncul di modal
**Solution:** 
- Check browser console untuk error
- Pastikan QRCode library sudah diimport dengan benar
- Try refresh page

### ❌ Database table tidak terbuat
**Solution:**
- Check database connection di `.env`
- Look at server logs untuk error message
- Manually create table jika perlu:
```sql
CREATE TABLE IF NOT EXISTS two_factor_auth (
    user_id CHAR(36) PRIMARY KEY,
    method VARCHAR(50) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    backup_codes TEXT NOT NULL,
    enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### ❌ Email OTP tidak terkirim
**Solution:**
- Pastikan `.env` punya `EMAIL_APP_PASSWORD`
- Gunakan [Gmail App Password](https://support.google.com/accounts/answer/185833), bukan regular password
- Check email spam folder

### ❌ 2FA button tidak muncul di Profile
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart npm dev server
- Check console untuk import errors

## 🔟 Production Checklist

Sebelum go to production:

- [ ] Test semua flows (activate, manage, disable)
- [ ] Test dengan different methods (authenticator, email)
- [ ] Test backup codes download
- [ ] Test password verification untuk disable
- [ ] Test error handling & edge cases
- [ ] Setup proper logging di server
- [ ] Add rate limiting untuk OTP attempts
- [ ] Setup SSL/TLS untuk production
- [ ] Backup database sebelum migration
- [ ] Monitor error logs di production
- [ ] Setup automated backup untuk backup codes
- [ ] Document recovery process

## 📞 Support Resources

1. **otplib docs:** https://yeojz.github.io/otplib/
2. **qrcode docs:** https://davidshimjs.github.io/qrcodejs/
3. **TOTP RFC:** https://tools.ietf.org/html/rfc6238
4. **2FA Best Practices:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

## ✅ Done!

Sistem 2FA sudah ready! Untuk update atau troubleshooting, refer ke:
- `2FA_IMPLEMENTATION.md` - Dokumentasi teknis
- `2FA_FLOW_DIAGRAM.txt` - Visual flow
- Source code dengan comments di file

**Selamat, aplikasi Anda sekarang lebih aman!** 🎉
