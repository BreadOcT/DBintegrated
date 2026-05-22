import { motion } from 'motion/react';
import React, { useState } from 'react';
import { Eye, EyeOff, LayoutDashboard, LineChart, Receipt, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import khbLogo from '../assets/gambar/LOGO KHB.png';

interface LoginProps {
  onNavigate: (page: 'landing' | 'register' | 'forgot-password' | 'app') => void;
}

export function Login({ onNavigate }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // 2FA States
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login gagal');
      } else if (data.twoFactorRequired) {
        setTwoFactorRequired(true);
        setTwoFactorMethod(data.method);
        setTempToken(data.tempToken);
        setOtpCode('');
        setOtpError('');
        setResendMsg('');
        if (data.method === 'email') {
          setCountdown(60);
        }
      } else {
        login(data.token, data.user, rememberMe);
        onNavigate('app');
      }
    } catch (err) {
      setError('Kesalahan jaringan. Pastikan backend server menyala.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOtpLoading(true);
    setOtpError('');
    setResendMsg('');

    try {
      const res = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: otpCode.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || 'Kode verifikasi salah atau kedaluwarsa');
      } else {
        login(data.token, data.user, rememberMe);
        onNavigate('app');
      }
    } catch (err) {
      setOtpError('Kesalahan jaringan. Silakan coba kembali.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setOtpError('');
    setResendMsg('');

    try {
      const res = await fetch('/api/auth/2fa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken })
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || 'Gagal mengirim ulang kode OTP');
      } else {
        setTempToken(data.tempToken);
        setResendMsg('Kode OTP baru berhasil dikirim ke email Anda!');
        setCountdown(60);
      }
    } catch (err) {
      setOtpError('Kesalahan jaringan saat mengirim ulang kode');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col lg:flex-row font-sans relative overflow-hidden">
      
      {/* Animated Background Behind Form */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[40%] pointer-events-none -z-0 flex items-center justify-center overflow-hidden">
         <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] rounded-full bg-clay/20 dark:bg-clay/10 blur-[80px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -90, 0],
              x: [0, -60, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] min-w-[350px] min-h-[350px] rounded-full bg-nature-green/15 dark:bg-nature-green/10 blur-[100px]"
          />
          {/* Subtle Dynamic Grid */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
      </div>

      {/* LEFT SIDE - FORM (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col px-6 py-6 sm:px-12 md:px-16 md:py-12 relative z-10 shadow-2xl bg-white/80 dark:bg-bg-base/80 backdrop-blur-2xl min-h-screen border-r border-sand">
        
        {/* Back string */}
        <button 
          onClick={() => {
            if (twoFactorRequired) {
              setTwoFactorRequired(false);
            } else {
              onNavigate('landing');
            }
          }}
          className="flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-sm transition-colors w-max"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col justify-center"
        >
          {twoFactorRequired ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="mb-8">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-nature-green/10 text-nature-green rounded-3xl animate-bounce">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-text-main text-center mb-3">
                  Verifikasi 2 Faktor
                </h2>
                <p className="text-text-muted text-center text-sm md:text-base font-semibold px-2">
                  {twoFactorMethod === 'email' 
                    ? `Kami telah mengirimkan kode OTP 6-digit ke email ${email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}.`
                    : 'Masukkan kode OTP dari aplikasi Google Authenticator Anda atau gunakan salah satu Kode Backup Darurat.'
                  }
                </p>
                {otpError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-bold text-center border border-red-200">
                    {otpError}
                  </div>
                )}
                {resendMsg && (
                  <div className="mt-4 p-3 bg-green-100 text-green-600 rounded-xl text-sm font-bold text-center border border-green-200">
                    {resendMsg}
                  </div>
                )}
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-6">
                <div className="space-y-2 group text-center">
                  <label className="text-xs font-bold text-text-main uppercase tracking-wider group-focus-within:text-nature-green transition-colors">
                    Kode Verifikasi
                  </label>
                  <input 
                    type="text"
                    required
                    maxLength={10}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="000 000"
                    className="w-full border border-sand bg-white dark:bg-bg-card rounded-2xl px-4 py-4 text-2xl font-black text-center text-text-main focus:outline-none focus:border-nature-green focus:ring-2 focus:ring-nature-green transition-all tracking-[0.2em] placeholder:font-normal placeholder:tracking-normal placeholder:text-sand hover:border-text-muted/50"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isOtpLoading}
                  className="w-full bg-nature-green hover:bg-clay text-bg-base font-bold py-4 rounded-xl transition-all shadow-lg shadow-nature-green/20 hover:shadow-clay/30 active:scale-[0.98] flex justify-center items-center gap-2 group disabled:opacity-50"
                >
                  {isOtpLoading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                  {!isOtpLoading && <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />}
                </button>
              </form>

              {twoFactorMethod === 'email' && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    disabled={countdown > 0 || isResending}
                    onClick={handleResendOtp}
                    className="text-sm font-bold text-nature-green hover:text-clay transition-colors disabled:opacity-50 disabled:hover:text-nature-green"
                  >
                    {countdown > 0 
                      ? `Kirim Ulang Kode (${countdown}s)` 
                      : isResending ? 'Mengirim...' : 'Kirim Ulang OTP ke Email'
                    }
                  </button>
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setTwoFactorRequired(false)}
                  className="text-sm font-bold text-text-muted hover:text-text-main transition-colors underline decoration-2 underline-offset-4"
                >
                  Gunakan Metode Login Lain
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-10">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex items-center gap-2 mb-8"
                >
                  <img src={khbLogo} alt="KHB Logo" className="h-12 w-auto object-contain" />
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-black text-text-main mb-3"
                >
                  Selamat Datang
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-text-muted font-medium text-sm md:text-base"
                >
                  Masukkan email dan kata sandi Anda untuk mengakses akun Anda.
                </motion.p>
                {error && <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm font-bold">{error}</div>}
              </div>

              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onSubmit={handleLogin} 
                className="space-y-5"
              >
                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-text-main uppercase tracking-wider group-focus-within:text-nature-green transition-colors">Email</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full border border-sand bg-white dark:bg-bg-card rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:outline-none focus:border-nature-green focus:ring-1 focus:ring-nature-green transition-all placeholder:font-normal placeholder:text-sand hover:border-text-muted/50"
                  />
                </div>
                
                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-text-main uppercase tracking-wider group-focus-within:text-nature-green transition-colors">Kata Sandi</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border border-sand bg-white dark:bg-bg-card rounded-xl pl-4 pr-12 py-3 text-sm font-semibold text-text-main focus:outline-none focus:border-nature-green focus:ring-1 focus:ring-nature-green transition-all hover:border-text-muted/50"
                    />
                    <button 
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-nature-green transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded accent-nature-green cursor-pointer" 
                    />
                    <span className="text-sm font-bold text-text-muted group-hover:text-text-main transition-colors">Ingat Saya</span>
                  </label>
                  <button type="button" onClick={() => onNavigate('forgot-password')} className="text-sm font-bold text-nature-green hover:text-clay transition-colors">Lupa Kata Sandi?</button>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-nature-green hover:bg-clay text-bg-base font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-nature-green/20 hover:shadow-clay/30 active:scale-[0.98] mt-6 flex justify-center items-center gap-2 group"
                >
                  Masuk <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
              </motion.form>
            </>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 relative"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-bg-base text-text-muted font-bold">Atau Masuk Dengan</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 grid grid-cols-2 gap-4"
          >
            <button className="flex items-center justify-center gap-2 border border-sand bg-white dark:bg-bg-card rounded-xl py-3 text-sm font-bold text-text-main hover:bg-sand/30 hover:border-text-muted/50 transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-sand bg-white dark:bg-bg-card rounded-xl py-3 text-sm font-bold text-text-main hover:bg-sand/30 hover:border-text-muted/50 transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm">
              <svg className="w-5 h-5 dark:fill-white" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.29-.88 3.57-.84 1.51.04 2.81.72 3.67 1.84-3.12 1.83-2.62 5.96.48 7.15-.69 1.63-1.57 3.05-2.8 4.04zM12.03 7.25c-.15-2.28 1.65-4.29 3.94-4.48.33 2.5-2.06 4.71-3.94 4.48z"/>
              </svg>
              Apple
            </button>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm font-bold text-text-muted mt-8"
          >
            Belum punya akun? <button onClick={() => onNavigate('register')} className="text-nature-green hover:text-clay transition-colors underline-offset-4 hover:underline">Daftar Sekarang.</button>
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT SIDE - ILLUSTRATION (60%) */}
      <div className="hidden lg:flex w-[60%] bg-nature-green relative overflow-hidden flex-col">
        {/* Background Decorative Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[10%] w-[80%] aspect-square rounded-full border-[100px] border-white/5 pointer-events-none"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[20%] w-[100%] aspect-square rounded-full border-[100px] border-white/5 pointer-events-none"
        />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="p-16 pt-24 text-bg-base relative z-10 max-w-2xl"
        >
          <h2 className="text-5xl font-bold leading-[1.1] mb-6">Kelola pemasukan dan pengeluaran Anda dengan mudah.</h2>
          <p className="text-bg-base/80 text-lg font-medium">Masuk untuk mengakses dasbor keuangan Anda dan raih target finansial Anda.</p>
        </motion.div>

        {/* Mockup / Decorative App UI (Laptop Frame) */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.4 }}
          whileHover={{ y: -10, rotate: -1, transition: { duration: 0.4 } }}
          className="absolute -bottom-20 -right-20 w-[110%] md:w-[90%] aspect-[16/10] bg-[#1e1e1e] rounded-tl-3xl rounded-tr-xl p-3 md:p-5 border-t-8 border-l-8 border-white/20 z-10 transform shadow-[-20px_20px_40px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          {/* Laptop Screen */}
          <div className="w-full h-full bg-bg-base rounded-lg overflow-hidden flex flex-col relative shadow-inner">
            {/* Browser Topbar */}
            <div className="h-8 bg-bg-card border-b border-sand flex items-center px-4 justify-between shrink-0">
               <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
               </div>
               <div className="w-1/2 h-4 bg-sand/30 rounded-full flex items-center justify-center">
                 <span className="text-[8px] text-text-muted font-bold tracking-widest uppercase">khb.app</span>
               </div>
               <div className="w-8"></div>
            </div>
            
            {/* Screen Content */}
            <div className="flex-1 flex p-4 gap-4 overflow-hidden relative bg-bg-base">
              
              {/* Sidebar Mockup */}
              <div className="w-32 bg-bg-card rounded-xl border border-sand p-3 flex flex-col shrink-0 gap-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-clay to-nature-green"></div>
                  <div className="w-12 h-3 bg-sand rounded-sm"></div>
                </div>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-full h-6 rounded-md flex items-center px-2 gap-2 ${i === 1 ? 'bg-nature-green/10' : ''}`}>
                    <div className={`w-3 h-3 rounded-sm ${i === 1 ? 'bg-nature-green' : 'bg-sand'}`}></div>
                    <div className={`h-2 rounded-sm ${i === 1 ? 'bg-nature-green/50 w-12' : 'bg-sand/70 w-10'}`}></div>
                  </div>
                ))}
              </div>

              {/* Main Content Mockup */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Header Mockup */}
                <div className="flex justify-between items-center bg-bg-base shrink-0 pt-1 pb-2">
                   <div className="w-24 h-4 bg-sand rounded-sm"></div>
                   <div className="w-6 h-6 rounded-full bg-sand"></div>
                </div>

                <div className="flex gap-4 flex-1 overflow-hidden">
                  {/* Left Column (Card & Actions) */}
                  <div className="flex-1 flex flex-col gap-3">
                     <div className="h-28 rounded-xl bg-gradient-to-tr from-nature-green to-[#4ade80] p-4 flex flex-col justify-end relative overflow-hidden shadow-sm">
                       <div className="w-16 h-2 bg-white/50 rounded-sm mb-2"></div>
                       <div className="w-24 h-4 bg-white rounded-sm mb-3"></div>
                       <div className="flex gap-2">
                         <div className="w-16 h-3 bg-white/20 rounded-sm backdrop-blur-sm"></div>
                         <div className="w-16 h-3 bg-black/10 rounded-sm backdrop-blur-sm"></div>
                       </div>
                       <div className="absolute top-2 right-2 w-12 h-12 bg-white/20 rounded-full blur-xl"></div>
                     </div>

                     <div className="flex justify-between gap-2 bg-bg-card p-2 rounded-xl border border-sand">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 2 ? 'bg-nature-green' : 'bg-bg-base border border-sand'}`}>
                               <div className={`w-3 h-3 rounded-sm ${i === 2 ? 'bg-white' : 'bg-sand'}`}></div>
                            </div>
                            <div className="w-8 h-1.5 bg-sand rounded-sm"></div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Right Column (Transactions) */}
                  <div className="w-40 bg-bg-card border border-sand rounded-xl p-3 flex flex-col gap-3">
                     <div className="flex justify-between items-center mb-1">
                        <div className="w-16 h-2 bg-text-main/50 rounded-sm"></div>
                        <div className="w-8 h-2 bg-nature-green/50 rounded-sm"></div>
                     </div>
                     {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-nature-green/20"></div>
                           <div className="flex-1 flex flex-col gap-1">
                              <div className="w-12 h-1.5 bg-text-main/50 rounded-sm"></div>
                              <div className="w-8 h-1.5 bg-sand rounded-sm"></div>
                           </div>
                           <div className="w-8 h-2 bg-nature-green rounded-sm"></div>
                        </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Laptop Base Lip */}
          <div className="absolute -bottom-3 -left-2 w-[104%] h-3 bg-[#a0a0a0] rounded-b-xl border border-[#c0c0c0] shadow-xl z-20">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#808080] rounded-b-md"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
