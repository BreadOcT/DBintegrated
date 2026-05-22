import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Smartphone, Bell, Key, LogOut, Check, Camera as CameraIcon } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { TwoFactorAuth } from './TwoFactorAuth';
import { useSettings } from '../hooks/useSettings';

interface ProfileProps {
  onLogout?: () => void;
}

export function Profile({ onLogout }: ProfileProps) {
  const { user, updateProfile } = useAuth();
  const { t, language } = useSettings();

  // Modal states
  const [activeModal, setActiveModal] = useState<'none' | 'editProfile' | 'editPassword' | 'devices' | '2fa'>('none');
  
  // Profile data state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  
  // Feature states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  
  // Notification states
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [billReminder, setBillReminder] = useState(true);
  const [promoOffer, setPromoOffer] = useState(false);

  // Form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { token } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // device yang terhubung 
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfilePhone(user.phone || '');
      setProfilePhoto(user.photo || '');
      setEditName(user.name);
      setEditPhone(user.phone || '');
      setEditPhoto(user.photo || '');
      
      // Load preferensi notifikasi dari database jika ada
      if (user.weekly_report !== undefined) setWeeklyReport(Boolean(user.weekly_report));
      if (user.bill_reminder !== undefined) setBillReminder(Boolean(user.bill_reminder));
      if (user.promo_offer !== undefined) setPromoOffer(Boolean(user.promo_offer));

      // Ambil data perangkat dari backend asli
      fetchDevices();
    }
  }, [user]);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/auth/devices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (err) {
      console.error("Gagal memuat perangkat:", err);
    }
  };

  const handleLogoutDevice = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/auth/devices/${deviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDevices();
      }
    } catch (err) {
      console.error("Gagal mengeluarkan perangkat:", err);
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile({ name: editName, phone: editPhone, photo: editPhoto });
    setActiveModal('none');
  };

  // --- FUNGSI BARU: Menyimpan pengaturan notifikasi ke backend ---
  const handleToggleNotification = async (type: 'weekly' | 'bill' | 'promo', currentValue: boolean) => {
    const newValue = !currentValue;
    
    // 1. Optimistic UI update (ubah tombol seketika biar terasa cepat)
    if (type === 'weekly') setWeeklyReport(newValue);
    if (type === 'bill') setBillReminder(newValue);
    if (type === 'promo') setPromoOffer(newValue);

    // 2. Kirim ke backend
    try {
      const updatedPrefs = {
        weekly_report: type === 'weekly' ? newValue : weeklyReport,
        bill_reminder: type === 'bill' ? newValue : billReminder,
        promo_offer: type === 'promo' ? newValue : promoOffer
      };

      const res = await fetch('/api/auth/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedPrefs)
      });

      if (res.ok) {
        // Sinkronisasi dengan user state di useAuth agar tidak ter-reset ketika pindah halaman/refresh
        await updateProfile(updatedPrefs);
      } else {
        throw new Error("Respon server tidak oke");
      }
    } catch (error) {
      console.error('Gagal memperbarui notifikasi:', error);
      // Kalau error/gagal nyambung, kembalikan posisi tombol ke semula
      if (type === 'weekly') setWeeklyReport(currentValue);
      if (type === 'bill') setBillReminder(currentValue);
      if (type === 'promo') setPromoOffer(currentValue);
    }
  };
  // -------------------------------------------------------------

  const handleSavePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError(language === 'en' ? 'Confirm password does not match.' : 'Konfirmasi kata sandi tidak cocok.');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError(language === 'en' ? 'New password must be at least 6 characters.' : 'Kata sandi baru minimal 6 karakter.');
      return;
    }

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setPasswordError(data.error || (language === 'en' ? 'Failed to change password' : 'Gagal mengubah kata sandi'));
      } else {
        setPasswordSuccess(language === 'en' ? 'Password changed successfully!' : 'Kata sandi berhasil diubah!');
        setTimeout(() => {
          setActiveModal('none');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSuccess('');
        }, 1500);
      }
    } catch (e) {
      setPasswordError(language === 'en' ? 'A network error occurred.' : 'Terjadi kesalahan jaringan.');
    }
  };

  const handleToggle2FA = async (enabled: boolean, method?: string) => {
    try {
      const res = await fetch('/api/auth/2fa/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled, method })
      });

      if (res.ok) {
        setIs2FAEnabled(enabled);
      }
    } catch (error) {
      console.error('Error updating 2FA status:', error);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 mb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">{t('profile.title')}</h2>
          <p className="text-text-muted mt-1 text-sm font-medium">{t('profile.subtitle')}</p>
        </div>
      </div>

      <div className="bg-bg-card border border-sand rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-clay/20 to-nature-green/20 border-2 border-bg-base shadow-lg flex items-center justify-center overflow-hidden">
            {profilePhoto ? (
               <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <User className="w-10 h-10 text-clay" />
            )}
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
          {t('profile.editProfile')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-sand rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-text-main flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-clay" /> {t('profile.security')}
          </h4>
          <div className="flex items-center justify-between py-2 border-b border-sand/50">
            <div>
              <p className="font-bold text-sm text-text-main">{t('profile.password')}</p>
              <p className="text-xs text-text-muted mt-0.5">{t('profile.lastChanged')}</p>
            </div>
            <button onClick={() => setActiveModal('editPassword')} className="text-clay font-bold text-xs hover:underline">{t('profile.change')}</button>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-sand/50">
            <div>
              <p className="font-bold text-sm text-text-main">{t('profile.twoFactor')}</p>
              <p className="text-xs text-text-muted mt-0.5">{is2FAEnabled ? t('profile.active') : t('profile.inactive')}</p>
            </div>
            <button onClick={() => setActiveModal('2fa')} className={`${is2FAEnabled ? 'text-red-500' : 'text-nature-green'} font-bold text-xs hover:underline`}>
              {is2FAEnabled ? t('profile.manage') : t('profile.enable')}
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-sm text-text-main">{t('profile.connectedDevices')}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {devices.length === 0 ? t('profile.loadingDevices') : `${devices.length} ${t('profile.activeDevices')}`}
              </p>
            </div>
            <button onClick={() => setActiveModal('devices')} className="text-clay font-bold text-xs hover:underline">{t('profile.manage')}</button>
          </div>
        </div>

        <div className="bg-bg-card border border-sand rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-text-main flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-nature-green" /> {t('profile.notifications')}
          </h4>
          <div className="flex items-center justify-between py-2 border-b border-sand/50">
            <div>
              <p className="font-bold text-sm text-text-main">{t('profile.weeklyReport')}</p>
              <p className="text-xs text-text-muted mt-0.5">{t('profile.weeklyReportDesc')}</p>
            </div>
            <div 
              onClick={() => handleToggleNotification('weekly', weeklyReport)}
              className={`w-10 h-6 rounded-full relative cursor-pointer outline-none transition-colors duration-300 ${weeklyReport ? 'bg-nature-green' : 'bg-sand'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${weeklyReport ? 'left-5' : 'left-1'}`}></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-sand/50">
            <div>
              <p className="font-bold text-sm text-text-main">{t('profile.billReminder')}</p>
              <p className="text-xs text-text-muted mt-0.5">{t('profile.billReminderDesc')}</p>
            </div>
            <div 
              onClick={() => handleToggleNotification('bill', billReminder)}
              className={`w-10 h-6 rounded-full relative cursor-pointer outline-none transition-colors duration-300 ${billReminder ? 'bg-nature-green' : 'bg-sand'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${billReminder ? 'left-5' : 'left-1'}`}></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-sm text-text-main">{t('profile.promoOffer')}</p>
              <p className="text-xs text-text-muted mt-0.5">{t('profile.promoOfferDesc')}</p>
            </div>
            <div 
              onClick={() => handleToggleNotification('promo', promoOffer)}
              className={`w-10 h-6 rounded-full relative cursor-pointer outline-none transition-colors duration-300 ${promoOffer ? 'bg-nature-green' : 'bg-sand'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${promoOffer ? 'left-5' : 'left-1'}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-center">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4" /> {t('profile.logout')}
        </button>
      </div>

      <Modal isOpen={activeModal === 'editProfile'} onClose={() => setActiveModal('none')} title={t('profile.editProfile')}>
        <div className="space-y-4">
          <div className="flex flex-col items-center mb-4">
             <div className="relative w-24 h-24 rounded-full bg-sand/30 mb-2 overflow-hidden border-2 border-bg-base shadow-sm">
                {editPhoto ? (
                   <img src={editPhoto} alt="Edit Profile" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-text-muted" /></div>
                )}
                <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                   <CameraIcon className="w-6 h-6 text-white" />
                </div>
             </div>
             <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-clay hover:underline">{t('profile.changePhoto')}</button>
             <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">{t('profile.fullName')}</label>
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">{t('profile.phoneNumber')}</label>
            <input 
              type="tel" 
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main font-bold"
            />
          </div>
          <button 
            onClick={handleSaveProfile}
            className="w-full mt-4 bg-clay text-white font-bold py-3 rounded-xl hover:bg-clay/90 transition-colors"
          >
            {t('profile.saveChanges')}
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'editPassword'} onClose={() => { setActiveModal('none'); setPasswordError(''); setPasswordSuccess(''); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }} title={t('profile.updatePassword')}>
        <div className="space-y-4">
          {passwordError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm font-bold">{passwordError}</div>}
          {passwordSuccess && <div className="p-3 bg-green-100 text-green-600 rounded-lg text-sm font-bold">{passwordSuccess}</div>}
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">{t('profile.oldPassword')}</label>
            <input 
              type="password" 
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={t('profile.enterOldPassword')}
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">{t('profile.newPassword')}</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('profile.enterNewPassword')}
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">{t('profile.confirmPassword')}</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('profile.repeatNewPassword')}
              className="w-full px-4 py-3 bg-bg-base border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/50 transition-shadow text-text-main"
            />
          </div>
          <button 
            onClick={handleSavePassword}
            className="w-full mt-4 bg-clay text-white font-bold py-3 rounded-xl hover:bg-clay/90 transition-colors"
          >
            {t('profile.updatePassword')}
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'devices'} onClose={() => setActiveModal('none')} title={t('profile.connectedDevices')}>
        <div className="space-y-4">
          {devices.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">{t('profile.noOtherDevices')}</p>
          ) : (
            devices.map((dev: any, index: number) => (
              <div key={dev.id || index} className="p-4 border border-sand rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-text-main flex items-center gap-2">
                    {dev.device_name} 
                    {index === 0 && <span className="bg-nature-green/10 text-nature-green text-[10px] px-2 py-0.5 rounded-full">{t('profile.thisSession')}</span>}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {dev.location} • Aktif: {new Date(dev.last_active).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID')}
                  </p>
                </div>
                {index > 0 && (
                  <button 
                    onClick={() => handleLogoutDevice(dev.id)}
                    className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    {t('profile.logoutDevice')}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>

      <TwoFactorAuth 
        isOpen={activeModal === '2fa'} 
        onClose={() => setActiveModal('none')} 
        is2FAEnabled={is2FAEnabled}
        onToggle2FA={handleToggle2FA}
      />
    </div>
  );
}