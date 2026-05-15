import React, { useState } from 'react';
import { User, Mail, Shield, Smartphone, Bell, Key, LogOut, Check } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ProfileProps {
  onLogout?: () => void;
}

export function Profile({ onLogout }: ProfileProps) {
  // Modal states
  const [activeModal, setActiveModal] = useState<'none' | 'editProfile' | 'editPassword' | 'devices'>('none');
  
  // Profile data state
  const [profileName, setProfileName] = useState('Pengguna Setia');
  const [profileEmail, setProfileEmail] = useState('pengguna@example.com');
  const [profilePhone, setProfilePhone] = useState('+62 812 3456 7890');
  
  // Feature states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [billReminder, setBillReminder] = useState(true);
  const [promoOffer, setPromoOffer] = useState(false);

  // Form states
  const [editName, setEditName] = useState(profileName);
  const [editPhone, setEditPhone] = useState(profilePhone);

  const handleSaveProfile = () => {
    setProfileName(editName);
    setProfilePhone(editPhone);
    setActiveModal('none');
  };

  const handleSavePassword = () => {
    setActiveModal('none');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 mb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">Profil Saya</h2>
          <p className="text-text-muted mt-1 text-sm font-medium">Kelola informasi akun dan preferensi Anda.</p>
        </div>
      </div>

      <div className="bg-bg-card border border-sand rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-clay/20 to-nature-green/20 border-2 border-bg-base shadow-lg flex items-center justify-center">
            <User className="w-10 h-10 text-clay" />
          </div>
        </div>
        <div className="text-center sm:text-left flex-1">
          <h3 className="text-xl font-extrabold text-text-main">{profileName}</h3>
          <p className="text-text-muted text-sm my-1 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
            <Mail className="w-4 h-4" /> {profileEmail}
          </p>
          <p className="text-text-muted text-sm flex items-center justify-center sm:justify-start gap-1.5 font-medium">
            <Smartphone className="w-4 h-4" /> {profilePhone}
          </p>
        </div>
        <button 
          onClick={() => {
            setEditName(profileName);
            setEditPhone(profilePhone);
            setActiveModal('editProfile');
          }}
          className="bg-sand/50 text-text-main hover:bg-clay hover:text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
        >
          Edit Profil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-sand rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-text-main flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-clay" /> Keamanan
          </h4>
          <div className="flex items-center justify-between py-2 border-b border-sand/50">
            <div>
              <p className="font-bold text-sm text-text-main">Kata Sandi</p>
              <p className="text-xs text-text-muted mt-0.5">Terakhir diubah baru-baru ini</p>
            </div>
            <button onClick={() => setActiveModal('editPassword')} className="text-clay font-bold text-xs hover:underline">Ubah</button>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-sand/50">
            <div>
              <p className="font-bold text-sm text-text-main">Autentikasi 2 Faktor</p>
              <p className="text-xs text-text-muted mt-0.5">{is2FAEnabled ? 'Sudah aktif' : 'Tidak aktif'}</p>
            </div>
            <button onClick={() => setIs2FAEnabled(!is2FAEnabled)} className={`${is2FAEnabled ? 'text-red-500' : 'text-nature-green'} font-bold text-xs hover:underline`}>
              {is2FAEnabled ? 'Matikan' : 'Aktifkan'}
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-sm text-text-main">Perangkat Terhubung</p>
              <p className="text-xs text-text-muted mt-0.5">2 perangkat aktif</p>
            </div>
            <button onClick={() => setActiveModal('devices')} className="text-clay font-bold text-xs hover:underline">Kelola</button>
          </div>
        </div>

        <div className="bg-bg-card border border-sand rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-text-main flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-nature-green" /> Notifikasi
          </h4>
          <div className="flex items-center justify-between py-2 border-b border-sand/50">
            <div>
              <p className="font-bold text-sm text-text-main">Laporan Mingguan</p>
              <p className="text-xs text-text-muted mt-0.5">Terima rekapan keuangan via email</p>
            </div>
            <div 
              onClick={() => setWeeklyReport(!weeklyReport)}
              className={`w-10 h-6 rounded-full relative cursor-pointer outline-none ${weeklyReport ? 'bg-nature-green' : 'bg-sand'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${weeklyReport ? 'left-5' : 'left-1'}`}></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-sand/50">
            <div>
              <p className="font-bold text-sm text-text-main">Pengingat Tagihan</p>
              <p className="text-xs text-text-muted mt-0.5">Notifikasi H-3 jatuh tempo</p>
            </div>
            <div 
              onClick={() => setBillReminder(!billReminder)}
              className={`w-10 h-6 rounded-full relative cursor-pointer outline-none ${billReminder ? 'bg-nature-green' : 'bg-sand'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${billReminder ? 'left-5' : 'left-1'}`}></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-sm text-text-main">Promo & Penawaran</p>
              <p className="text-xs text-text-muted mt-0.5">Info fitur baru dan diskon</p>
            </div>
            <div 
              onClick={() => setPromoOffer(!promoOffer)}
              className={`w-10 h-6 rounded-full relative cursor-pointer outline-none ${promoOffer ? 'bg-nature-green' : 'bg-sand'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${promoOffer ? 'left-5' : 'left-1'}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-center">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4" /> Keluar dari Akun
        </button>
      </div>

      <Modal isOpen={activeModal === 'editProfile'} onClose={() => setActiveModal('none')} title="Edit Profil">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Nomor Telepon</label>
            <input 
              type="tel" 
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main"
            />
          </div>
          <button 
            onClick={handleSaveProfile}
            className="w-full mt-4 bg-clay text-white font-bold py-3 rounded-xl hover:bg-clay/90 transition-colors"
          >
            Simpan Perubahan
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'editPassword'} onClose={() => setActiveModal('none')} title="Ubah Kata Sandi">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Kata Sandi Lama</label>
            <input 
              type="password" 
              placeholder="Masukkan kata sandi lama"
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Kata Sandi Baru</label>
            <input 
              type="password" 
              placeholder="Masukkan kata sandi baru"
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Konfirmasi Kata Sandi Baru</label>
            <input 
              type="password" 
              placeholder="Ulangi kata sandi baru"
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main"
            />
          </div>
          <button 
            onClick={handleSavePassword}
            className="w-full mt-4 bg-clay text-white font-bold py-3 rounded-xl hover:bg-clay/90 transition-colors"
          >
            Perbarui Kata Sandi
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'devices'} onClose={() => setActiveModal('none')} title="Perangkat Terhubung">
        <div className="space-y-4">
          <div className="p-4 border border-sand rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-text-main flex items-center gap-2">iPhone 13 Pro <span className="bg-nature-green/10 text-nature-green text-[10px] px-2 py-0.5 rounded-full">Saat ini</span></p>
              <p className="text-xs text-text-muted mt-1">Bandung, Indonesia • Terakhir aktif 2 menit lalu</p>
            </div>
          </div>
          <div className="p-4 border border-sand rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-text-main">MacBook Air M1</p>
              <p className="text-xs text-text-muted mt-1">Jakarta, Indonesia • Terakhir aktif 2 hari lalu</p>
            </div>
            <button className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Keluarkan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
