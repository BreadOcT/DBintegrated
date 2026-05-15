import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, DollarSign, Globe, Download, Trash2, Shield, Info, Smartphone, ChevronRight } from 'lucide-react';
import { Modal } from './ui/Modal';

export function Settings() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light",
  );

  const [activeModal, setActiveModal] = useState<'none' | 'currency' | 'language' | 'delete' | 'export'>('none');
  const [currency, setCurrency] = useState('Rupiah (IDR)');
  const [language, setLanguage] = useState('Bahasa Indonesia');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme((localStorage.getItem("theme") as "light" | "dark") || "light");
    };
    window.addEventListener('storage', handleThemeChange);
    return () => window.removeEventListener('storage', handleThemeChange);
  }, []);

  const handleToggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleExport = () => {
    setActiveModal('none');
    showToast('Data berhasil diekspor ke email Anda.');
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
          <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">Pengaturan</h2>
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
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-clay shadow transition-all duration-300 ${theme === 'dark' ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <div onClick={() => setActiveModal('currency')} className="flex items-center justify-between p-4 hover:bg-sand/30 rounded-2xl transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-text-main">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-main">Mata Uang</p>
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
                  <p className="font-bold text-sm text-text-main">Basa & Regional</p>
                  <p className="text-xs text-text-muted mt-0.5">{language}</p>
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
            <div onClick={() => setActiveModal('export')} className="flex items-center justify-between p-4 hover:bg-sand/30 rounded-2xl transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-nature-green/10 text-nature-green flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-nature-green">Ekspor Data</p>
                  <p className="text-xs text-text-muted mt-0.5">Unduh data transaksi (.csv/.pdf)</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-nature-green text-white text-xs font-bold rounded-full pointer-events-none">Ekspor</button>
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
              <a href="#" onClick={(e) => e.preventDefault()} className="flex justify-center p-3 rounded-xl bg-sand/30 hover:bg-sand/50 transition-colors text-sm font-bold text-text-main">
                Syarat & Ketentuan
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="flex justify-center p-3 rounded-xl bg-sand/30 hover:bg-sand/50 transition-colors text-sm font-bold text-text-main">
                Kebijakan Privasi
              </a>
            </div>
          </div>
        </section>
      </div>

      <Modal isOpen={activeModal === 'currency'} onClose={() => setActiveModal('none')} title="Pilih Mata Uang">
        <div className="space-y-2">
          {['Rupiah (IDR)', 'US Dollar (USD)', 'Euro (EUR)'].map((curr) => (
            <button 
              key={curr}
              onClick={() => { setCurrency(curr); setActiveModal('none'); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${currency === curr ? 'bg-clay/10 text-clay border border-clay/20' : 'bg-bg-base text-text-main hover:bg-sand/50'}`}
            >
              {curr}
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'language'} onClose={() => setActiveModal('none')} title="Basa & Regional">
        <div className="space-y-2">
          {['Bahasa Indonesia', 'English', 'Basa Sunda'].map((lang) => (
            <button 
              key={lang}
              onClick={() => { setLanguage(lang); setActiveModal('none'); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${language === lang ? 'bg-clay/10 text-clay border border-clay/20' : 'bg-bg-base text-text-main hover:bg-sand/50'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'export'} onClose={() => setActiveModal('none')} title="Ekspor Data">
        <div className="text-center py-4">
          <Download className="w-12 h-12 text-nature-green mx-auto mb-4" />
          <p className="text-text-main font-medium mb-6">Pilih format untuk mengekspor data transaksi Anda.</p>
          <div className="flex gap-4 max-w-xs mx-auto">
            <button onClick={handleExport} className="flex-1 bg-nature-green hover:bg-green-600 text-white font-bold py-2 rounded-xl transition-colors">.CSV</button>
            <button onClick={handleExport} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl transition-colors">.PDF</button>
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
    </div>
  );
}
