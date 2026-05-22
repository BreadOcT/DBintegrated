import React, { useState, useEffect } from 'react';
import { Shield, Copy, Download, Key, AlertCircle, Check, ChevronRight } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

interface TwoFactorAuthProps {
  isOpen: boolean;
  onClose: () => void;
  is2FAEnabled: boolean;
  onToggle2FA: (enabled: boolean, method?: string) => Promise<void>;
}

// Langkah 'setup' (pilih metode) dihapus karena langsung tembak Email
type Step = 'menu' | 'verifySetup' | 'backupCodes' | 'manageMethods' | 'disable';

export function TwoFactorAuth({ isOpen, onClose, is2FAEnabled, onToggle2FA }: TwoFactorAuthProps) {
  const { token } = useAuth();
  const { t } = useSettings();
  const [step, setStep] = useState<Step>(is2FAEnabled ? 'manageMethods' : 'menu');
  
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

  const requestOTP = async () => {
    setLoading(true);
    setVerificationError('');
    try {
      const res = await fetch('/api/auth/2fa/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ method: 'email' }) // Langsung set permanen ke email
      });
      if (res.ok) {
        setStep('verifySetup');
      } else {
        setVerificationError(t('twoFactor.failSendOtp'));
      }
    } catch (error) {
      setVerificationError(t('twoFactor.failVerifyCode'));
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
        body: JSON.stringify({ code: verificationCode, method: 'email' })
      });
      const data = await res.json();
      if (res.ok) {
        setBackupCodes(data.backupCodes);
        await onToggle2FA(true, 'email');
        setStep('backupCodes');
      } else {
        setVerificationError(data.error || t('twoFactor.invalidCode'));
      }
    } catch (error) {
      setVerificationError(t('twoFactor.errorOccurred'));
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
        setPasswordError(data.error || t('twoFactor.wrongPassword'));
      }
    } catch (error) {
      setPasswordError(t('twoFactor.errorOccurred'));
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('twoFactor.title')}>
      <div className="space-y-6">
        {/* MENU - Halaman Awal */}
        {step === 'menu' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">{t('twoFactor.increaseSecurity')}</p>
                <p className="text-xs text-blue-700 mt-1">{t('twoFactor.desc')}</p>
              </div>
            </div>

            <div className="space-y-3">
              {verificationError && (
                <p className="text-xs text-red-600 text-center font-bold mb-2">{verificationError}</p>
              )}
              <button
                onClick={requestOTP}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 border-2 border-sand rounded-2xl hover:bg-sand/30 transition-colors text-left group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-nature-green/20 flex items-center justify-center group-hover:bg-nature-green/30 transition-colors">
                    <Key className="w-5 h-5 text-nature-green" />
                  </div>
                  <div>
                    <p className="font-bold text-text-main">{loading ? t('twoFactor.processing') : t('twoFactor.enableEmailOtp')}</p>
                    <p className="text-xs text-text-muted mt-0.5">{t('twoFactor.setupSec')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </button>
            </div>
          </div>
        )}

        {/* VERIFY SETUP - Masukkan Kode OTP Email */}
        {step === 'verifySetup' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
              <p className="text-sm text-blue-900 font-medium">
                {t('twoFactor.otpSent')}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-text-main mb-2 block">{t('twoFactor.enter6Digit')}</label>
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
              {loading ? t('twoFactor.verifying') : t('twoFactor.verifyEnable')}
            </button>
            <button
              onClick={() => {
                setStep('menu'); // Kembali ke halaman awal
                setVerificationCode('');
                setVerificationError('');
              }}
              className="w-full border-2 border-sand text-text-main py-2.5 rounded-2xl font-bold text-sm hover:bg-sand/20 transition-colors"
            >
              {t('twoFactor.cancel')}
            </button>
          </div>
        )}

        {/* BACKUP CODES */}
        {step === 'backupCodes' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-900">{t('twoFactor.successEnabled')}</p>
                <p className="text-xs text-green-700 mt-1">{t('twoFactor.saveBackupCodes')}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
              <p className="text-xs text-red-700 font-medium">
                {t('twoFactor.backupWarning')}
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
              <Download className="w-4 h-4" /> {t('twoFactor.downloadBackup')}
            </button>

            <button
              onClick={() => {
                setStep('manageMethods');
                onClose();
              }}
              className="w-full bg-clay text-white py-2.5 rounded-2xl font-bold text-sm hover:bg-clay/90 transition-colors"
            >
              {t('twoFactor.done')}
            </button>
          </div>
        )}

        {/* MANAGE METHODS - Jika sudah aktif */}
        {step === 'manageMethods' && is2FAEnabled && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-900">{t('twoFactor.active')}</p>
                <p className="text-xs text-green-700 mt-1">{t('twoFactor.protectedDesc')}</p>
              </div>
            </div>

            <div className="bg-bg-base/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-clay" />
                <div>
                  <p className="font-bold text-sm text-text-main">{t('twoFactor.activeMethod')}</p>
                  <p className="text-xs text-text-muted mt-1">{t('twoFactor.statusProtected')}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('disable')}
              className="w-full flex items-center justify-between p-3 border-2 border-red-200 rounded-2xl hover:bg-red-50 transition-colors text-left"
            >
              <div>
                <p className="font-bold text-sm text-red-600">{t('twoFactor.disable')}</p>
                <p className="text-xs text-red-500 mt-0.5">{t('twoFactor.disableDesc')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-600" />
            </button>

            <button
              onClick={() => onClose()}
              className="w-full border-2 border-sand text-text-main py-2.5 rounded-2xl font-bold text-sm hover:bg-sand/20 transition-colors"
            >
              {t('twoFactor.close')}
            </button>
          </div>
        )}

        {/* DISABLE 2FA */}
        {step === 'disable' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-900">{t('twoFactor.disable')}</p>
                <p className="text-xs text-red-700 mt-1">{t('twoFactor.enterPasswordConfirm')}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-main mb-2 block">{t('twoFactor.accountPassword')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('twoFactor.enterYourPassword')}
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
              {loading ? t('twoFactor.processing') : t('twoFactor.disable')}
            </button>
            <button
              onClick={() => setStep('manageMethods')}
              className="w-full border-2 border-sand text-text-main py-2.5 rounded-2xl font-bold text-sm hover:bg-sand/20 transition-colors"
            >
              {t('twoFactor.cancel')}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}