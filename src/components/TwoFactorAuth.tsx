import React, { useState, useEffect } from 'react';
import { Shield, QrCode, Copy, Download, Key, Mail, Smartphone, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useAuth } from '../hooks/useAuth';

interface TwoFactorAuthProps {
  isOpen: boolean;
  onClose: () => void;
  is2FAEnabled: boolean;
  onToggle2FA: (enabled: boolean, method?: string) => Promise<void>;
}

type Step = 'menu' | 'setup' | 'verifySetup' | 'backupCodes' | 'manageMethods' | 'disable';
type Method = 'authenticator' | 'email' | 'sms';

export function TwoFactorAuth({ isOpen, onClose, is2FAEnabled, onToggle2FA }: TwoFactorAuthProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<Step>(is2FAEnabled ? 'manageMethods' : 'menu');
  const [selectedMethod, setSelectedMethod] = useState<Method>('authenticator');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep(is2FAEnabled ? 'manageMethods' : 'menu');
      setVerificationCode('');
      setVerificationError('');
      setPassword('');
      setPasswordError('');
    }
  }, [isOpen, is2FAEnabled]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ method: selectedMethod })
      });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('verifySetup');
      }
    } catch (error) {
      setVerificationError('Gagal generate QR Code');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    setLoading(true);
    setVerificationError('');
    try {
      const res = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: verificationCode, method: selectedMethod })
      });
      const data = await res.json();
      if (res.ok) {
        setBackupCodes(data.backupCodes);
        await onToggle2FA(true, selectedMethod);
        setStep('backupCodes');
      } else {
        setVerificationError(data.error || 'Kode tidak valid');
      }
    } catch (error) {
      setVerificationError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    setPasswordError('');
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        await onToggle2FA(false);
        setStep('menu');
        onClose();
      } else {
        setPasswordError(data.error || 'Kata sandi salah');
      }
    } catch (error) {
      setPasswordError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'backup-codes-2fa.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Autentikasi Dua Faktor">
      <div className="space-y-6">
        {/* MENU - Pilih Aksi */}
        {step === 'menu' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">Tingkatkan Keamanan Akun</p>
                <p className="text-xs text-blue-700 mt-1">Autentikasi 2 Faktor menambah lapisan keamanan dengan meminta verifikasi tambahan saat login.</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setStep('setup')}
                className="w-full flex items-center justify-between p-4 border-2 border-sand rounded-2xl hover:bg-sand/30 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-nature-green/20 flex items-center justify-center group-hover:bg-nature-green/30 transition-colors">
                    <Key className="w-5 h-5 text-nature-green" />
                  </div>
                  <div>
                    <p className="font-bold text-text-main">Aktifkan 2FA</p>
                    <p className="text-xs text-text-muted mt-0.5">Setup autentikasi dua faktor untuk akun Anda</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </button>
            </div>
          </div>
        )}

        {/* SETUP - Pilih Metode */}
        {step === 'setup' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-text-main mb-3">Pilih Metode Autentikasi:</p>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedMethod('authenticator')}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                    selectedMethod === 'authenticator'
                      ? 'border-clay bg-clay/10'
                      : 'border-sand hover:bg-sand/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 ${selectedMethod === 'authenticator' ? 'bg-clay border-clay' : 'border-sand'}`} />
                  <div className="text-left">
                    <p className="font-bold text-sm text-text-main">Google Authenticator</p>
                    <p className="text-xs text-text-muted">Aplikasi authenticator di smartphone Anda</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('email')}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                    selectedMethod === 'email'
                      ? 'border-clay bg-clay/10'
                      : 'border-sand hover:bg-sand/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 ${selectedMethod === 'email' ? 'bg-clay border-clay' : 'border-sand'}`} />
                  <div className="text-left">
                    <p className="font-bold text-sm text-text-main">Email OTP</p>
                    <p className="text-xs text-text-muted">Kode dikirim ke email Anda</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('sms')}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                    selectedMethod === 'sms'
                      ? 'border-clay bg-clay/10'
                      : 'border-sand hover:bg-sand/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 ${selectedMethod === 'sms' ? 'bg-clay border-clay' : 'border-sand'}`} />
                  <div className="text-left">
                    <p className="font-bold text-sm text-text-main">SMS OTP</p>
                    <p className="text-xs text-text-muted">Kode dikirim ke nomor ponsel Anda</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={generateQRCode}
              disabled={loading}
              className="w-full bg-clay text-white py-2.5 rounded-2xl font-bold text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Lanjutkan'}
            </button>
            <button
              onClick={() => setStep('menu')}
              className="w-full border-2 border-sand text-text-main py-2.5 rounded-2xl font-bold text-sm hover:bg-sand/20 transition-colors"
            >
              Batal
            </button>
          </div>
        )}

        {/* VERIFY SETUP - Masukkan Kode */}
        {step === 'verifySetup' && (
          <div className="space-y-4">
            {selectedMethod === 'authenticator' && (
              <>
                <div className="bg-sand/30 rounded-2xl p-6 flex items-center justify-center border-2 border-sand">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <p className="font-bold">Langkah 1:</p> Buka Google Authenticator atau aplikasi serupa
                    <p className="font-bold mt-2">Langkah 2:</p> Scan QR Code di atas
                    <p className="font-bold mt-2">Langkah 3:</p> Masukkan kode 6 digit yang ditampilkan
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-muted mb-2">Manual Key (jika scan QR Code gagal):</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={secret}
                      readOnly
                      className="flex-1 px-3 py-2 rounded-xl border border-sand text-xs font-mono bg-sand/20"
                    />
                    <button
                      onClick={() => copyToClipboard(secret)}
                      className="p-2 rounded-xl border border-sand hover:bg-sand/30 transition-colors"
                    >
                      <Copy className={`w-4 h-4 ${copied ? 'text-nature-green' : 'text-text-muted'}`} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {(selectedMethod === 'email' || selectedMethod === 'sms') && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                <p className="text-sm text-blue-900 font-medium">
                  Kode verifikasi akan dikirim ke {selectedMethod === 'email' ? 'email' : 'ponsel'} Anda
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-text-main mb-2 block">Masukkan Kode 6 Digit:</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(val);
                }}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-xl border-2 border-sand focus:border-clay outline-none text-center text-2xl font-bold tracking-widest"
              />
              {verificationError && (
                <p className="text-xs text-red-600 mt-2">{verificationError}</p>
              )}
            </div>

            <button
              onClick={verifyAndEnable2FA}
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-clay text-white py-2.5 rounded-2xl font-bold text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan 2FA'}
            </button>
            <button
              onClick={() => {
                setStep('setup');
                setVerificationCode('');
                setVerificationError('');
              }}
              className="w-full border-2 border-sand text-text-main py-2.5 rounded-2xl font-bold text-sm hover:bg-sand/20 transition-colors"
            >
              Kembali
            </button>
          </div>
        )}

        {/* BACKUP CODES */}
        {step === 'backupCodes' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-900">2FA Berhasil Diaktifkan!</p>
                <p className="text-xs text-green-700 mt-1">Simpan kode backup ini untuk akses emergency</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
              <p className="text-xs text-red-700 font-medium">
                ⚠️ Jika Anda kehilangan akses ke metode 2FA, gunakan kode ini untuk login. Simpan di tempat aman!
              </p>
            </div>

            <div className="bg-sand/20 rounded-2xl p-4 space-y-2 max-h-64 overflow-y-auto">
              {backupCodes.map((code, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-sand/50">
                  <span className="font-mono text-sm text-text-main">{code}</span>
                  <button
                    onClick={() => copyToClipboard(code)}
                    className="text-text-muted hover:text-clay transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={downloadBackupCodes}
              className="w-full flex items-center justify-center gap-2 bg-sand text-text-main py-2.5 rounded-2xl font-bold text-sm hover:bg-sand/80 transition-colors"
            >
              <Download className="w-4 h-4" /> Download Kode Backup
            </button>

            <button
              onClick={() => {
                setStep('manageMethods');
                onClose();
              }}
              className="w-full bg-clay text-white py-2.5 rounded-2xl font-bold text-sm hover:bg-clay/90 transition-colors"
            >
              Selesai
            </button>
          </div>
        )}

        {/* MANAGE METHODS - Jika sudah aktif */}
        {step === 'manageMethods' && is2FAEnabled && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-900">2FA Aktif</p>
                <p className="text-xs text-green-700 mt-1">Akun Anda dilindungi dengan autentikasi dua faktor</p>
              </div>
            </div>

            <div className="bg-bg-base/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-clay" />
                <div>
                  <p className="font-bold text-sm text-text-main">Metode Aktif: Google Authenticator</p>
                  <p className="text-xs text-text-muted mt-1">Diaktifkan 2 bulan lalu</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('disable')}
              className="w-full flex items-center justify-between p-3 border-2 border-red-200 rounded-2xl hover:bg-red-50 transition-colors text-left"
            >
              <div>
                <p className="font-bold text-sm text-red-600">Nonaktifkan 2FA</p>
                <p className="text-xs text-red-500 mt-0.5">Kurangi lapisan keamanan akun</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-600" />
            </button>

            <button
              onClick={() => onClose()}
              className="w-full border-2 border-sand text-text-main py-2.5 rounded-2xl font-bold text-sm hover:bg-sand/20 transition-colors"
            >
              Tutup
            </button>
          </div>
        )}

        {/* DISABLE 2FA */}
        {step === 'disable' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-900">Nonaktifkan 2FA</p>
                <p className="text-xs text-red-700 mt-1">Masukkan kata sandi untuk mengonfirmasi</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-main mb-2 block">Kata Sandi Akun:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi Anda"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-sand focus:border-clay outline-none text-sm"
              />
              {passwordError && (
                <p className="text-xs text-red-600 mt-2">{passwordError}</p>
              )}
            </div>

            <button
              onClick={disable2FA}
              disabled={loading || !password}
              className="w-full bg-red-600 text-white py-2.5 rounded-2xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Nonaktifkan 2FA'}
            </button>
            <button
              onClick={() => setStep('manageMethods')}
              className="w-full border-2 border-sand text-text-main py-2.5 rounded-2xl font-bold text-sm hover:bg-sand/20 transition-colors"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
