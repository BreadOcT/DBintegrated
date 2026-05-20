import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, DollarSign, Globe, Download, Trash2, Shield, Info, Smartphone, ChevronRight } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';

export function Settings() {
  const { currency, setCurrency, language, setLanguage, t } = useSettings();
  const { token, user } = useAuth();

  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  const [activeModal, setActiveModal] = useState<'none' | 'currency' | 'language' | 'delete' | 'export' | 'terms' | 'privacy'>('none');
  const [toastMsg, setToastMsg] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // 1. Sinkronisasi class HTML saat komponen pertama kali dimuat
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // 2. Listener untuk mendeteksi perubahan tema dari tab/jendela lain
  useEffect(() => {
    const handleThemeChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setTheme((e.newValue as "light" | "dark") || "light");
      }
    };
    window.addEventListener('storage', handleThemeChange);
    return () => window.removeEventListener('storage', handleThemeChange);
  }, []);

  const handleToggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLanguageChange = (lang: 'id' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    setActiveModal('none');
    showToast(lang === 'id' ? 'Bahasa diubah ke Indonesia' : 'Language changed to English');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  // 3. Efek untuk membersihkan timeout toast agar tidak terjadi kebocoran memori (memory leak)
  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(''), 3000);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setActiveModal('none');
    showToast(`Memproses ekspor data ke format ${format.toUpperCase()}...`);
    setIsExporting(true);

    try {
      const res = await fetch('/api/transactions/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ format, email: user?.email })
      });

      if (res.ok) {
        showToast(`Data berhasil diekspor! Periksa kotak masuk email Anda.`);
      } else {
        showToast(`Gagal mengekspor data. Silakan coba lagi.`);
      }
    } catch (err) {
      console.error("Export error:", err);
      showToast('Terjadi kesalahan jaringan.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    setActiveModal('none');
    showToast('Semua data berhasil dihapus (Simulasi).');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 mb-24 relative">
      {/* Local Toast */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-xl z-50 animate-fade-in-up">
          {toastMsg}
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-clay/10 text-clay rounded-2xl">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">{t('settings.title') || 'Pengaturan'}</h2>
          <p className="text-text-muted mt-1 text-sm font-medium">Atur preferensi aplikasi Anda di sini.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tampilan & Preferensi */}
        <section className="bg-bg-card border border-sand rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-sand bg-bg-base/30">
            <h3 className="font-extrabold text-text-main flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-clay" /> Preferensi Aplikasi
            </h3>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between p-4 hover:bg-sand/30 rounded-2xl transition-colors cursor-pointer" onClick={handleToggleTheme}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-text-main">
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-text-main">Tema Tampilan</p>
                  <p className="text-xs text-text-muted mt-0.5">{theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-sand dark:bg-bg-base rounded-full relative transition-colors shadow-inner">
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-clay shadow transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>

            <div onClick={() => setActiveModal('currency')} className="flex items-center justify-between p-4 hover:bg-sand/30 rounded-2xl transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-text-main">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-main">{t('settings.currency') || 'Mata Uang'}</p>
                  <p className="text-xs text-text-muted mt-0.5">{currency}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-main transition-colors" />
            </div>

            <div onClick={() => setActiveModal('language')} className="flex items-center justify-between p-4 hover:bg-sand/30 rounded-2xl transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-text-main">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-main">{t('settings.language') || 'Bahasa'}</p>
                  <p className="text-xs text-text-muted mt-0.5">{language === 'id' ? '🇮🇩 Bahasa Indonesia' : '🇺🇸 English'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-main transition-colors" />
            </div>
          </div>
        </section>

        {/* Manajemen Data */}
        <section className="bg-bg-card border border-sand rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-sand bg-bg-base/30">
            <h3 className="font-extrabold text-text-main flex items-center gap-2">
              <Shield className="w-5 h-5 text-nature-green" /> Manajemen Data
            </h3>
          </div>
          <div className="p-2">
            <div onClick={() => !isExporting && setActiveModal('export')} className={`flex items-center justify-between p-4 hover:bg-sand/30 rounded-2xl transition-colors cursor-pointer group ${isExporting ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-nature-green/10 text-nature-green flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-nature-green">Ekspor Data</p>
                  <p className="text-xs text-text-muted mt-0.5">Kirim data ke email (.csv/.pdf)</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-nature-green text-white text-xs font-bold rounded-full pointer-events-none">
                {isExporting ? 'Memproses...' : 'Ekspor'}
              </button>
            </div>

            <div onClick={() => setActiveModal('delete')} className="flex items-center justify-between p-4 hover:bg-red-50/50 dark:hover:bg-red-500/10 rounded-2xl transition-colors cursor-pointer group mt-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-red-500">Hapus Semua Data</p>
                  <p className="text-xs text-red-400 mt-0.5">Tindakan ini tidak bisa dibatalkan</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full pointer-events-none">Hapus</button>
            </div>
          </div>
        </section>

        {/* Info Aplikasi */}
        <section className="bg-bg-card border border-sand rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-sand bg-bg-base/30">
            <h3 className="font-extrabold text-text-main flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-500" /> Tentang Aplikasi
            </h3>
          </div>
          <div className="p-2">
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-clay flex items-center justify-center shadow-lg mb-4 text-white font-black text-2xl">
                KHB
              </div>
              <p className="font-bold text-text-main">Komunitas Halal Bandung</p>
              <p className="text-xs text-text-muted mt-1">Versi 1.0.0</p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2">
              <button onClick={() => setActiveModal('terms')} className="flex justify-center p-3 rounded-xl bg-sand/30 hover:bg-sand/50 transition-colors text-sm font-bold text-text-main w-full">
                Syarat & Ketentuan
              </button>
              <button onClick={() => setActiveModal('privacy')} className="flex justify-center p-3 rounded-xl bg-sand/30 hover:bg-sand/50 transition-colors text-sm font-bold text-text-main w-full">
                Kebijakan Privasi
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* --- MODALS --- */}
      <Modal isOpen={activeModal === 'currency'} onClose={() => setActiveModal('none')} title="Pilih Mata Uang">
        <div className="space-y-2">
          {(['IDR', 'USD', 'EUR'] as const).map((curr) => (
            <button 
              key={curr}
              onClick={() => { setCurrency(curr); setActiveModal('none'); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${currency === curr ? 'bg-clay/10 text-clay border border-clay/20' : 'bg-bg-base text-text-main hover:bg-sand/50'}`}
            >
              <span>{curr === 'IDR' ? 'Rupiah (IDR)' : curr === 'USD' ? 'US Dollar (USD)' : 'Euro (EUR)'}</span>
              {currency === curr && <span className="text-clay">✓</span>}
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'language'} onClose={() => setActiveModal('none')} title="Bahasa & Regional">
        <div className="space-y-2">
          {(['id', 'en'] as const).map((lang) => (
            <button 
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${language === lang ? 'bg-clay/10 text-clay border border-clay/20' : 'bg-bg-base text-text-main hover:bg-sand/50'}`}
            >
              <span>{lang === 'id' ? '🇮🇩 Bahasa Indonesia' : '🇺🇸 English'}</span>
              {language === lang && <span className="text-clay">✓</span>}
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'export'} onClose={() => setActiveModal('none')} title="Ekspor Data">
        <div className="text-center py-4">
          <Download className="w-12 h-12 text-nature-green mx-auto mb-4" />
          <p className="text-text-main font-medium mb-6">Pilih format laporan transaksi untuk dikirim ke email Anda: <br/> <span className="font-bold text-sm text-clay">{user?.email}</span></p>
          <div className="flex gap-4 max-w-xs mx-auto">
            <button onClick={() => handleExport('csv')} className="flex-1 bg-nature-green hover:bg-green-600 text-white font-bold py-2 rounded-xl transition-colors">.CSV</button>
            <button onClick={() => handleExport('pdf')} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl transition-colors">.PDF</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'delete'} onClose={() => setActiveModal('none')} title="Hapus Semua Data?">
        <div className="text-center py-4">
          <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-main font-medium mb-2">Tindakan ini tidak dapat dibatalkan.</p>
          <p className="text-text-muted text-sm mb-6">Semua riwayat transaksi dan data Anda akan dihapus secara permanen.</p>
          <div className="flex gap-4">
            <button onClick={() => setActiveModal('none')} className="flex-1 bg-sand/50 hover:bg-sand text-text-main font-bold py-3 rounded-xl transition-colors">Batal</button>
            <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors">Ya, Hapus Data</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'terms'} onClose={() => setActiveModal('none')} title="Syarat & Ketentuan">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 text-sm text-text-main">
          <h4 className="font-bold text-clay">1. Penerimaan Syarat</h4>
          <p className="text-text-muted mb-4">Dengan mengakses dan menggunakan aplikasi Catatan Keuangan KHB, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini.</p>
          <h4 className="font-bold text-clay">2. Penggunaan Layanan</h4>
          <p className="text-text-muted mb-4">Aplikasi ini disediakan untuk membantu pengelolaan pencatatan keuangan internal maupun UMKM. Anda dilarang menggunakan aplikasi ini untuk tujuan ilegal atau tidak sah.</p>
          <h4 className="font-bold text-clay">3. Keamanan Akun</h4>
          <p className="text-text-muted mb-4">Anda bertanggung jawab menjaga kerahasiaan kata sandi dan akun Anda. Setiap aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya.</p>
        </div>
        <button onClick={() => setActiveModal('none')} className="w-full mt-4 bg-clay text-white font-bold py-3 rounded-xl hover:bg-clay/90 transition-colors">
          Saya Mengerti
        </button>
      </Modal>

      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal('none')} title="Kebijakan Privasi">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 text-sm text-text-main">
          <h4 className="font-bold text-clay">1. Pengumpulan Data</h4>
          <p className="text-text-muted mb-4">Kami mengumpulkan informasi pendaftaran (seperti nama, email) dan data transaksional yang Anda masukkan untuk keperluan pencatatan dan pelaporan keuangan Anda.</p>
          <h4 className="font-bold text-clay">2. Penggunaan Data</h4>
          <p className="text-text-muted mb-4">Data Anda tidak akan dijual kepada pihak ketiga. Kami menggunakan data hanya untuk memproses laporan keuangan Anda dan mengirimkan notifikasi (seperti OTP atau pengingat tagihan).</p>
          <h4 className="font-bold text-clay">3. Keamanan</h4>
          <p className="text-text-muted mb-4">Kami mengimplementasikan langkah keamanan standar industri (termasuk Autentikasi 2 Faktor dan Enkripsi) untuk melindungi data Anda dari akses yang tidak sah.</p>
        </div>
        <button onClick={() => setActiveModal('none')} className="w-full mt-4 bg-clay text-white font-bold py-3 rounded-xl hover:bg-clay/90 transition-colors">
          Tutup
        </button>
      </Modal>
    </div>
  );
}