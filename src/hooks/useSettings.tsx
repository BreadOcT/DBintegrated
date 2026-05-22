import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'IDR' | 'USD' | 'EUR';
type Language = 'id' | 'en';
type Theme = 'light' | 'dark';

interface SettingsContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  id: {
    // Categories
    'Bahan Baku': 'Bahan Baku',
    'Operasional': 'Operasional',
    'Transportasi': 'Transportasi',
    'Gaji Pegawai': 'Gaji Pegawai',
    'Pemasaran': 'Pemasaran',
    'Penjualan Produk': 'Penjualan Produk',
    'Jasa': 'Jasa',
    'Lainnya': 'Lainnya',

    // Dashboard
    'dashboard.welcome': 'Selamat datang, {name}',
    'dashboard.profit': 'Keuntungan Bersih',
    'dashboard.income': 'Pemasukan',
    'dashboard.expense': 'Pengeluaran',
    'dashboard.totalBalance': 'Total Saldo Saat Ini',
    'dashboard.thisMonth': 'Bulan Ini',
    'dashboard.thisWeek': 'Minggu Ini',
    'dashboard.report': 'Laporan',
    'dashboard.input': 'Input',
    'dashboard.history': 'Riwayat',
    'dashboard.scan': 'Scan',
    'dashboard.monthlyBudgetTarget': 'Target Anggaran Bulanan',
    'dashboard.limitTarget': 'Target Batas',
    'dashboard.minTarget': 'Target Minimal',
    'dashboard.clickForDetails': 'Klik untuk detail bulan ini',
    'dashboard.recentTransactions': 'Transaksi Terkini',
    'dashboard.viewAll': 'Lihat Semua',
    'dashboard.noRecentTransactions': 'Belum ada transaksi terkini.',
    'dashboard.editBudget': 'Edit Batas Anggaran',
    'dashboard.incomeTargetLabel': 'Target Pemasukan (Rp)',
    'dashboard.expenseLimitLabel': 'Batas Pengeluaran (Rp)',
    'dashboard.saveChanges': 'Simpan Perubahan',
    'dashboard.transactionDetails': 'Detail Transaksi',
    'dashboard.noMonthlyIncome': 'Belum ada pemasukan bulan ini.',
    'dashboard.noMonthlyExpense': 'Belum ada pengeluaran bulan ini.',
    'dashboard.viewFullHistory': 'Lihat Riwayat Lengkap',
    'dashboard.selectBudgetMonth': 'Pilih Bulan Anggaran',

    // History
    'history.title': 'Riwayat Transaksi',
    'history.export': 'Ekspor',
    'history.all': 'Semua',
    'history.searchFilter': 'Cari / Filter Berdasarkan',
    'history.noTransactions': 'Belum ada transaksi untuk filter ini.',
    'history.hideDetails': 'Sembunyikan Rincian',
    'history.details': 'Rincian',
    'history.deleteTitle': 'Hapus Transaksi?',
    'history.deleteConfirm': 'Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus permanen dari riwayat Anda.',
    'history.cancel': 'Batal',
    'history.delete': 'Hapus',
    'history.searchAndFilter': 'Cari & Filter',
    'history.selectCategory': 'Pilih Kategori',
    'history.allCategories': 'Semua Kategori',
    'history.dateRange': 'Rentang Tanggal',
    'history.applyFilter': 'Terapkan Filter',
    'history.reset': 'Reset',

    // Report
    'report.title': 'Statistik',
    'report.cashFlowTrend': 'Tren Arus Kas',
    'report.weekly': 'Mingguan',
    'report.monthly': 'Bulanan',
    'report.income': 'Pendapatan',
    'report.expense': 'Pengeluaran',
    'report.categoryDistribution': 'Distribusi Kategori ({timeFilter})',
    'report.noTransactionData': 'Tidak ada data transaksi',
    'report.noData': 'Belum ada data',
    'report.expenseHistory': 'Riwayat Pengeluaran',
    'report.noExpense': 'Belum ada pengeluaran',
    'report.incomeHistory': 'Riwayat Pendapatan',
    'report.noIncome': 'Belum ada pendapatan',
    'report.viewFullHistory': 'Lihat riwayat lengkap',

    // Profile
    'profile.title': 'Profil Saya',
    'profile.subtitle': 'Kelola informasi akun dan preferensi Anda.',
    'profile.editProfile': 'Edit Profil',
    'profile.security': 'Keamanan',
    'profile.password': 'Kata Sandi',
    'profile.lastChanged': 'Terakhir diubah baru-baru ini',
    'profile.change': 'Ubah',
    'profile.twoFactor': 'Autentikasi 2 Faktor',
    'profile.active': 'Sudah aktif',
    'profile.inactive': 'Tidak aktif',
    'profile.manage': 'Kelola',
    'profile.enable': 'Aktifkan',
    'profile.connectedDevices': 'Perangkat Terhubung',
    'profile.loadingDevices': 'Memuat perangkat...',
    'profile.activeDevices': 'perangkat aktif',
    'profile.notifications': 'Notifikasi',
    'profile.weeklyReport': 'Laporan Mingguan',
    'profile.weeklyReportDesc': 'Terima rekapan keuangan via email',
    'profile.billReminder': 'Pengingat Tagihan',
    'profile.billReminderDesc': 'Notifikasi H-3 jatuh tempo',
    'profile.promoOffer': 'Promo & Penawaran',
    'profile.promoOfferDesc': 'Info fitur baru dan diskon',
    'profile.logout': 'Keluar dari Akun',
    'profile.changePhoto': 'Ubah Foto',
    'profile.fullName': 'Nama Lengkap',
    'profile.phoneNumber': 'Nomor Telepon',
    'profile.saveChanges': 'Simpan Perubahan',
    'profile.oldPassword': 'Kata Sandi Lama',
    'profile.newPassword': 'Kata Sandi Baru',
    'profile.confirmPassword': 'Konfirmasi Kata Sandi Baru',
    'profile.updatePassword': 'Perbarui Kata Sandi',
    'profile.enterOldPassword': 'Masukkan kata sandi lama',
    'profile.enterNewPassword': 'Masukkan kata sandi baru',
    'profile.repeatNewPassword': 'Ulangi kata sandi baru',
    'profile.noOtherDevices': 'Tidak ada perangkat lain terdeteksi.',
    'profile.thisSession': 'Sesi Ini',
    'profile.logoutDevice': 'Keluarkan',

    // Settings
    'settings.title': 'Pengaturan',
    'settings.appPreferences': 'Preferensi Aplikasi',
    'settings.displayTheme': 'Tema Tampilan',
    'settings.darkMode': 'Mode Gelap',
    'settings.lightMode': 'Mode Terang',
    'settings.currency': 'Mata Uang',
    'settings.language': 'Bahasa',
    'settings.dataManagement': 'Manajemen Data',
    'settings.exportData': 'Ekspor Data',
    'settings.exportDataDesc': 'Kirim data ke email (.csv/.pdf)',
    'settings.deleteAllData': 'Hapus Semua Data',
    'settings.deleteAllDataDesc': 'Tindakan ini tidak bisa dibatalkan',
    'settings.export': 'Ekspor',
    'settings.delete': 'Hapus',
    'settings.aboutApp': 'Tentang Aplikasi',
    'settings.aboutAppDesc': 'Komunitas Halal Bandung',
    'settings.version': 'Versi',
    'settings.terms': 'Syarat & Ketentuan',
    'settings.privacy': 'Kebijakan Privasi',
    'settings.selectCurrency': 'Pilih Mata Uang',
    'settings.rupiah': 'Rupiah (IDR)',
    'settings.usDollar': 'US Dollar (USD)',
    'settings.euro': 'Euro (EUR)',
    'settings.languageRegional': 'Bahasa & Regional',
    'settings.exportDesc': 'Pilih format laporan transaksi untuk dikirim ke email Anda:',
    'settings.exportProcessing': 'Memproses ekspor data ke format...',
    'settings.exportSuccess': 'Data berhasil diekspor! Periksa kotak masuk email Anda.',
    'settings.exportFail': 'Gagal mengekspor data. Silakan coba lagi.',
    'settings.networkError': 'Terjadi kesalahan jaringan.',
    'settings.deleteSuccess': 'Semua data berhasil dihapus (Simulasi).',
    'settings.deleteTitle': 'Hapus Semua Data?',
    'settings.deleteConfirm': 'Semua riwayat transaksi dan data Anda akan dihapus secara permanen.',
    'settings.cancel': 'Batal',
    'settings.yesDelete': 'Ya, Hapus Data',
    'settings.iUnderstand': 'Saya Mengerti',
    'settings.close': 'Tutup',

    // TransactionForm
    'trxForm.reviewTitle': 'Tinjau Hasil Scan AI',
    'trxForm.editTitle': 'Edit Transaksi',
    'trxForm.addTitle': 'Catat Transaksi',
    'trxForm.reviewDesc': 'AI telah mengekstrak data dari foto. Silakan periksa dan perbaiki jika ada kesalahan.',
    'trxForm.expenseAmount': 'Nominal Pengeluaran',
    'trxForm.incomeAmount': 'Nominal Pemasukan',
    'trxForm.autoFilled': '🔒 Diisi otomatis dari total rincian item',
    'trxForm.date': 'Tanggal',
    'trxForm.category': 'Kategori',
    'trxForm.description': 'Keterangan',
    'trxForm.descriptionPlaceholder': 'Cth: Makan siang, Transportasi',
    'trxForm.storeName': 'Nama Toko (Opsional)',
    'trxForm.storeNamePlaceholder': 'Cth: Indomaret, Solaria',
    'trxForm.itemDetails': 'Rincian Item (Opsional)',
    'trxForm.add': 'Tambah',
    'trxForm.item': 'Item',
    'trxForm.itemName': 'Nama Barang',
    'trxForm.itemNamePlaceholder': 'Cth: Kertas HVS',
    'trxForm.qty': 'Qty',
    'trxForm.totalRp': 'Total (Rp)',
    'trxForm.cancel': 'Batal',
    'trxForm.save': 'Simpan',
    'trxForm.saveAiScan': 'Simpan Scan AI',
    'trxForm.saveChanges': 'Simpan Perubahan',
    'trxForm.record': 'Catat Transaksi',

    // Layout
    'layout.home': 'Beranda',
    'layout.history': 'Riwayat',
    'layout.scan': 'Scan',
    'layout.input': 'Input',
    'layout.report': 'Laporan',
    'layout.verifiedMember': 'Verified Member',
    'layout.microEnterprise': 'Usaha Mikro',
    'layout.welcome': 'Selamat datang,',
    'layout.logout': 'Keluar',

    // Notifications
    'notifications.title': 'Notifikasi',
    'notifications.subtitle': 'Pembaruan terbaru dan peringatan tentang aktivitas Anda.',
    'notifications.markAllRead': 'Tandai Semua Dibaca',
    'notifications.empty': 'Tidak ada notifikasi',
    'notifications.emptyDesc': 'Anda sudah membaca semua pemberitahuan.',

    // Scanner
    'scanner.title': 'Scan Nota / Struk',
    'scanner.subtitle': 'Biarkan AI kami yang mencatat. Gunakan kamera atau pilih foto nota dari galeri Anda secara otomatis.',
    'scanner.readingReceipt': 'Membaca Nota',
    'scanner.readingReceiptProgress': 'Sedang memindai gambar menggunakan OCR...',
    'scanner.aiAnalyzing': 'AI Sedang Menganalisis',
    'scanner.aiAnalyzingProgress': 'AI sedang menganalisis isi teks acak dari OCR: "{snippet}"',
    'scanner.analyzedTitle': 'Struk Sudah Dianalisis',
    'scanner.analyzedMsg': 'Struk sudah dianalisis! Total pengeluaran {formattedAmount} di {storeName}.',
    'scanner.scanFailed': 'Scan Gagal',
    'scanner.scanFailedMsg': 'Gagal memproses gambar struk. Pastikan server OCR Python aktif.',
    'scanner.ocrServerError': 'Gagal memproses gambar. Pastikan server OCR Python menyala di port 8000.',
    'scanner.readingReceiptHeader': 'Membaca Nota...',
    'scanner.readingReceiptDesc': 'Beri kami beberapa detik. AI sedang mengekstrak total harga, nama toko, dan item dari gambar Anda.',
    'scanner.useCamera': 'Gunakan Kamera',
    'scanner.useCameraDesc': 'Memotret fisik nota atau struk secara langsung.',
    'scanner.selectGallery': 'Pilih dari Galeri',
    'scanner.selectGalleryDesc': 'Unggah tangkapan layar e-receipt atau foto struk.',
    'scanner.cancelBack': 'Batalkan & Kembali',
    'scanner.camera': 'Kamera',

    // TwoFactorAuth
    'twoFactor.title': 'Autentikasi Dua Faktor',
    'twoFactor.increaseSecurity': 'Tingkatkan Keamanan Akun',
    'twoFactor.desc': 'Autentikasi 2 Faktor menambah lapisan keamanan dengan mengirimkan kode OTP ke email Anda saat login.',
    'twoFactor.failSendOtp': 'Gagal mengirim kode OTP ke email',
    'twoFactor.failVerifyCode': 'Gagal mengirim kode verifikasi',
    'twoFactor.enableEmailOtp': 'Aktifkan via Email OTP',
    'twoFactor.setupSec': 'Setup autentikasi keamanan untuk akun Anda',
    'twoFactor.otpSent': 'Kode verifikasi telah dikirim ke alamat email Anda.',
    'twoFactor.enter6Digit': 'Masukkan Kode 6 Digit:',
    'twoFactor.verifyEnable': 'Verifikasi & Aktifkan 2FA',
    'twoFactor.cancel': 'Batal',
    'twoFactor.successEnabled': '2FA Berhasil Diaktifkan!',
    'twoFactor.saveBackupCodes': 'Simpan kode backup ini untuk akses emergency',
    'twoFactor.backupWarning': '⚠️ Jika Anda kehilangan akses ke email, gunakan kode ini untuk login. Simpan di tempat aman!',
    'twoFactor.downloadBackup': 'Download Kode Backup',
    'twoFactor.done': 'Selesai',
    'twoFactor.active': '2FA Aktif',
    'twoFactor.protectedDesc': 'Akun Anda dilindungi dengan autentikasi dua faktor',
    'twoFactor.activeMethod': 'Metode Aktif: Email OTP',
    'twoFactor.statusProtected': 'Status: Terlindungi',
    'twoFactor.disable': 'Nonaktifkan 2FA',
    'twoFactor.disableDesc': 'Kurangi lapisan keamanan akun',
    'twoFactor.close': 'Tutup',
    'twoFactor.enterPasswordConfirm': 'Masukkan kata sandi untuk mengonfirmasi',
    'twoFactor.accountPassword': 'Kata Sandi Akun:',
    'twoFactor.enterYourPassword': 'Masukkan kata sandi Anda',
    'twoFactor.verifying': 'Memverifikasi...',
    'twoFactor.processing': 'Memproses...',
    'twoFactor.invalidCode': 'Kode tidak valid',
    'twoFactor.wrongPassword': 'Kata sandi salah',
    'twoFactor.errorOccurred': 'Terjadi kesalahan',
  },
  en: {
    // Categories
    'Bahan Baku': 'Raw Materials',
    'Operasional': 'Operational',
    'Transportasi': 'Transportation',
    'Gaji Pegawai': 'Employee Salaries',
    'Pemasaran': 'Marketing',
    'Penjualan Produk': 'Product Sales',
    'Jasa': 'Services',
    'Lainnya': 'Others',

    // Dashboard
    'dashboard.welcome': 'Welcome, {name}',
    'dashboard.profit': 'Net Profit',
    'dashboard.income': 'Income',
    'dashboard.expense': 'Expense',
    'dashboard.totalBalance': 'Total Current Balance',
    'dashboard.thisMonth': 'This Month',
    'dashboard.thisWeek': 'This Week',
    'dashboard.report': 'Report',
    'dashboard.input': 'Input',
    'dashboard.history': 'History',
    'dashboard.scan': 'Scan',
    'dashboard.monthlyBudgetTarget': 'Monthly Budget Target',
    'dashboard.limitTarget': 'Limit Target',
    'dashboard.minTarget': 'Minimum Target',
    'dashboard.clickForDetails': 'Click for details of this month',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.viewAll': 'View All',
    'dashboard.noRecentTransactions': 'No recent transactions.',
    'dashboard.editBudget': 'Edit Budget Target',
    'dashboard.incomeTargetLabel': 'Income Target (Rp)',
    'dashboard.expenseLimitLabel': 'Expense Limit (Rp)',
    'dashboard.saveChanges': 'Save Changes',
    'dashboard.transactionDetails': 'Transaction Details',
    'dashboard.noMonthlyIncome': 'No income this month.',
    'dashboard.noMonthlyExpense': 'No expense this month.',
    'dashboard.viewFullHistory': 'View Full History',
    'dashboard.selectBudgetMonth': 'Select Budget Month',

    // History
    'history.title': 'Transaction History',
    'history.export': 'Export',
    'history.all': 'All',
    'history.searchFilter': 'Search / Filter By',
    'history.noTransactions': 'No transactions for this filter.',
    'history.hideDetails': 'Hide Details',
    'history.details': 'Details',
    'history.deleteTitle': 'Delete Transaction?',
    'history.deleteConfirm': 'This action cannot be undone. The transaction will be permanently deleted from your history.',
    'history.cancel': 'Cancel',
    'history.delete': 'Delete',
    'history.searchAndFilter': 'Search & Filter',
    'history.selectCategory': 'Select Category',
    'history.allCategories': 'All Categories',
    'history.dateRange': 'Date Range',
    'history.applyFilter': 'Apply Filter',
    'history.reset': 'Reset',

    // Report
    'report.title': 'Statistics',
    'report.cashFlowTrend': 'Cash Flow Trend',
    'report.weekly': 'Weekly',
    'report.monthly': 'Monthly',
    'report.income': 'Revenue',
    'report.expense': 'Expense',
    'report.categoryDistribution': 'Category Distribution ({timeFilter})',
    'report.noTransactionData': 'No transaction data',
    'report.noData': 'No data available',
    'report.expenseHistory': 'Expense History',
    'report.noExpense': 'No expense recorded',
    'report.incomeHistory': 'Income History',
    'report.noIncome': 'No income recorded',
    'report.viewFullHistory': 'View full history',

    // Profile
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your account information and preferences.',
    'profile.editProfile': 'Edit Profile',
    'profile.security': 'Security',
    'profile.password': 'Password',
    'profile.lastChanged': 'Last changed recently',
    'profile.change': 'Change',
    'profile.twoFactor': 'Two-Factor Authentication',
    'profile.active': 'Active',
    'profile.inactive': 'Inactive',
    'profile.manage': 'Manage',
    'profile.enable': 'Enable',
    'profile.connectedDevices': 'Connected Devices',
    'profile.loadingDevices': 'Loading devices...',
    'profile.activeDevices': 'active devices',
    'profile.notifications': 'Notifications',
    'profile.weeklyReport': 'Weekly Report',
    'profile.weeklyReportDesc': 'Receive financial summaries via email',
    'profile.billReminder': 'Bill Reminder',
    'profile.billReminderDesc': 'Notifications 3 days before due date',
    'profile.promoOffer': 'Promo & Offers',
    'profile.promoOfferDesc': 'Information on new features and discounts',
    'profile.logout': 'Logout from Account',
    'profile.changePhoto': 'Change Photo',
    'profile.fullName': 'Full Name',
    'profile.phoneNumber': 'Phone Number',
    'profile.saveChanges': 'Save Changes',
    'profile.oldPassword': 'Old Password',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm New Password',
    'profile.updatePassword': 'Update Password',
    'profile.enterOldPassword': 'Enter old password',
    'profile.enterNewPassword': 'Enter new password',
    'profile.repeatNewPassword': 'Repeat new password',
    'profile.noOtherDevices': 'No other devices detected.',
    'profile.thisSession': 'This Session',
    'profile.logoutDevice': 'Logout',

    // Settings
    'settings.title': 'Settings',
    'settings.appPreferences': 'App Preferences',
    'settings.displayTheme': 'Theme Display',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    'settings.currency': 'Currency',
    'settings.language': 'Language',
    'settings.dataManagement': 'Data Management',
    'settings.exportData': 'Export Data',
    'settings.exportDataDesc': 'Send data to email (.csv/.pdf)',
    'settings.deleteAllData': 'Delete All Data',
    'settings.deleteAllDataDesc': 'This action cannot be undone',
    'settings.export': 'Export',
    'settings.delete': 'Delete',
    'settings.aboutApp': 'About Application',
    'settings.aboutAppDesc': 'Bandung Halal Community',
    'settings.version': 'Version',
    'settings.terms': 'Terms & Conditions',
    'settings.privacy': 'Privacy Policy',
    'settings.selectCurrency': 'Select Currency',
    'settings.rupiah': 'Rupiah (IDR)',
    'settings.usDollar': 'US Dollar (USD)',
    'settings.euro': 'Euro (EUR)',
    'settings.languageRegional': 'Language & Regional',
    'settings.exportDesc': 'Select transaction report format to send to your email:',
    'settings.exportProcessing': 'Processing data export to format...',
    'settings.exportSuccess': 'Data exported successfully! Check your email inbox.',
    'settings.exportFail': 'Failed to export data. Please try again.',
    'settings.networkError': 'A network error occurred.',
    'settings.deleteSuccess': 'All data successfully deleted (Simulation).',
    'settings.deleteTitle': 'Delete All Data?',
    'settings.deleteConfirm': 'All of your transaction history and data will be permanently deleted.',
    'settings.cancel': 'Cancel',
    'settings.yesDelete': 'Yes, Delete Data',
    'settings.iUnderstand': 'I Understand',
    'settings.close': 'Close',

    // TransactionForm
    'trxForm.reviewTitle': 'Review AI Scan Results',
    'trxForm.editTitle': 'Edit Transaction',
    'trxForm.addTitle': 'Record Transaction',
    'trxForm.reviewDesc': 'AI has extracted data from the photo. Please check and correct any errors.',
    'trxForm.expenseAmount': 'Expense Amount',
    'trxForm.incomeAmount': 'Income Amount',
    'trxForm.autoFilled': '🔒 Auto-filled from item details total',
    'trxForm.date': 'Date',
    'trxForm.category': 'Category',
    'trxForm.description': 'Description',
    'trxForm.descriptionPlaceholder': 'e.g. Lunch, Transportation',
    'trxForm.storeName': 'Store Name (Optional)',
    'trxForm.storeNamePlaceholder': 'e.g. Walmart, McDonald\'s',
    'trxForm.itemDetails': 'Item Details (Optional)',
    'trxForm.add': 'Add',
    'trxForm.item': 'Item',
    'trxForm.itemName': 'Item Name',
    'trxForm.itemNamePlaceholder': 'e.g. Paper A4',
    'trxForm.qty': 'Qty',
    'trxForm.totalRp': 'Total (Rp)',
    'trxForm.cancel': 'Cancel',
    'trxForm.save': 'Save',
    'trxForm.saveAiScan': 'Save AI Scan',
    'trxForm.saveChanges': 'Save Changes',
    'trxForm.record': 'Record Transaction',

    // Layout
    'layout.home': 'Home',
    'layout.history': 'History',
    'layout.scan': 'Scan',
    'layout.input': 'Input',
    'layout.report': 'Report',
    'layout.verifiedMember': 'Verified Member',
    'layout.microEnterprise': 'Micro Enterprise',
    'layout.welcome': 'Welcome,',
    'layout.logout': 'Logout',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.subtitle': 'Latest updates and alerts about your activity.',
    'notifications.markAllRead': 'Mark All as Read',
    'notifications.empty': 'No notifications',
    'notifications.emptyDesc': 'You have read all notifications.',

    // Scanner
    'scanner.title': 'Scan Receipt',
    'scanner.subtitle': 'Let our AI record it. Use the camera or select a receipt photo from your gallery automatically.',
    'scanner.readingReceipt': 'Reading Receipt',
    'scanner.readingReceiptProgress': 'Scanning image using OCR...',
    'scanner.aiAnalyzing': 'AI Analyzing',
    'scanner.aiAnalyzingProgress': 'AI is analyzing raw text from OCR: "{snippet}"',
    'scanner.analyzedTitle': 'Receipt Analyzed',
    'scanner.analyzedMsg': 'Receipt analyzed! Total expense {formattedAmount} at {storeName}.',
    'scanner.scanFailed': 'Scan Failed',
    'scanner.scanFailedMsg': 'Failed to process receipt image. Make sure Python OCR server is active.',
    'scanner.ocrServerError': 'Failed to process image. Make sure Python OCR server is running on port 8000.',
    'scanner.readingReceiptHeader': 'Reading Receipt...',
    'scanner.readingReceiptDesc': 'Give us a few seconds. AI is extracting total price, store name, and items from your image.',
    'scanner.useCamera': 'Use Camera',
    'scanner.useCameraDesc': 'Take a physical photo of a receipt directly.',
    'scanner.selectGallery': 'Select from Gallery',
    'scanner.selectGalleryDesc': 'Upload a screenshot of e-receipt or receipt photo.',
    'scanner.cancelBack': 'Cancel & Go Back',
    'scanner.camera': 'Camera',

    // TwoFactorAuth
    'twoFactor.title': 'Two-Factor Authentication',
    'twoFactor.increaseSecurity': 'Increase Account Security',
    'twoFactor.desc': 'Two-Factor Authentication adds a layer of security by sending an OTP to your email when logging in.',
    'twoFactor.failSendOtp': 'Failed to send OTP to email',
    'twoFactor.failVerifyCode': 'Failed to send verification code',
    'twoFactor.enableEmailOtp': 'Enable via Email OTP',
    'twoFactor.setupSec': 'Set up security authentication for your account',
    'twoFactor.otpSent': 'Verification code has been sent to your email address.',
    'twoFactor.enter6Digit': 'Enter 6-Digit Code:',
    'twoFactor.verifyEnable': 'Verify & Enable 2FA',
    'twoFactor.cancel': 'Cancel',
    'twoFactor.successEnabled': '2FA Successfully Enabled!',
    'twoFactor.saveBackupCodes': 'Save these backup codes for emergency access',
    'twoFactor.backupWarning': '⚠️ If you lose access to email, use these codes to log in. Save them in a safe place!',
    'twoFactor.downloadBackup': 'Download Backup Codes',
    'twoFactor.done': 'Done',
    'twoFactor.active': '2FA Active',
    'twoFactor.protectedDesc': 'Your account is protected with two-factor authentication',
    'twoFactor.activeMethod': 'Active Method: Email OTP',
    'twoFactor.statusProtected': 'Status: Protected',
    'twoFactor.disable': 'Disable 2FA',
    'twoFactor.disableDesc': 'Reduce account security layer',
    'twoFactor.close': 'Close',
    'twoFactor.enterPasswordConfirm': 'Enter password to confirm',
    'twoFactor.accountPassword': 'Account Password:',
    'twoFactor.enterYourPassword': 'Enter your password',
    'twoFactor.verifying': 'Verifying...',
    'twoFactor.processing': 'Processing...',
    'twoFactor.invalidCode': 'Invalid code',
    'twoFactor.wrongPassword': 'Incorrect password',
    'twoFactor.errorOccurred': 'An error occurred',
  }
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('app_currency') as Currency) || 'IDR';
  });
  
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'id';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('app_currency', c);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem('app_language', l);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Synchronize dark class on mount and theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Synchronize across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        setThemeState(e.newValue as Theme);
      } else if (e.key === 'app_language' && e.newValue) {
        setLanguageState(e.newValue as Language);
      } else if (e.key === 'app_currency' && e.newValue) {
        setCurrencyState(e.newValue as Currency);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatCurrency = (amount: number) => {
    switch (currency) {
      case 'USD':
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount / 15000); // Dummy conversion rate
      case 'EUR':
        return new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount / 16000); // Dummy conversion rate
      case 'IDR':
      default:
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
    }
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, language, setLanguage, formatCurrency, t, theme, setTheme, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
