import { motion } from 'motion/react';
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import khbLogo from '../assets/gambar/LOGO KHB.png';

interface ForgotPasswordProps {
  onNavigate: (page: 'landing' | 'login' | 'register' | 'forgot-password' | 'app') => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Gagal mengirim email reset');
      } else {
        setSuccess('Tautan reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
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
      </div>

      {/* LEFT SIDE - FORM (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col px-6 py-6 sm:px-12 md:px-16 md:py-12 relative z-10 shadow-2xl bg-white/80 dark:bg-bg-base/80 backdrop-blur-2xl min-h-screen border-r border-sand mx-auto">
        
        <button 
          onClick={() => onNavigate('login')}
          className="flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-sm transition-colors w-max"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col justify-center"
        >
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
              Lupa Kata Sandi?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text-muted font-medium text-sm md:text-base"
            >
              Jangan khawatir! Masukkan alamat email yang terdaftar, dan kami akan mengirimkan tautan untuk mereset kata sandi Anda.
            </motion.p>
            {error && <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm font-bold">{error}</div>}
            {success && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-bold">{success}</div>}
          </div>

          {!success && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit} 
              className="space-y-5"
            >
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-text-main uppercase tracking-wider group-focus-within:text-nature-green transition-colors">Email Anda</label>
                <div className="relative">
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full border border-sand bg-white dark:bg-bg-card rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-text-main focus:outline-none focus:border-nature-green focus:ring-1 focus:ring-nature-green transition-all placeholder:font-normal placeholder:text-sand hover:border-text-muted/50"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-nature-green transition-colors" />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full bg-nature-green hover:bg-clay text-bg-base font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-nature-green/20 hover:shadow-clay/30 mt-6 flex justify-center items-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
              >
                {isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'} <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>
      
      {/* RIGHT SIDE - DECORATIVE (60%) */}
      <div className="hidden lg:flex w-[60%] bg-nature-green relative overflow-hidden flex-col items-center justify-center">
         <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute w-[120%] aspect-square rounded-full border-[100px] border-white/5 pointer-events-none"
        />
        <div className="text-center relative z-10 px-20">
            <h2 className="text-5xl font-bold leading-[1.1] text-bg-base mb-6">Tenang saja.</h2>
            <p className="text-bg-base/80 text-xl font-medium">Kami akan membantu Anda mendapatkan kembali akses ke akun keuangan Anda dengan cepat dan aman.</p>
        </div>
      </div>
    </div>
  );
}
