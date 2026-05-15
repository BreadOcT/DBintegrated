import { motion } from 'motion/react';
import React, { useState } from 'react';
import { Eye, EyeOff, LayoutDashboard, LineChart, Receipt, ArrowLeft, Camera, Sparkles, CheckCircle2, ShoppingCart, ArrowRight } from 'lucide-react';
import khbLogo from '../assets/gambar/LOGO KHB.png';
import { useAuth } from '../hooks/useAuth';

interface RegisterProps {
  onNavigate: (page: 'landing' | 'login' | 'app') => void;
}

export function Register({ onNavigate }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        // After successful registration, auto navigate to login or directly log them in. Let's just navigate to login
        onNavigate('login');
      }
    } catch (err) {
      setError('Network error');
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
          {/* Subtle Dynamic Grid */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
      </div>

      {/* LEFT SIDE - FORM (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col px-6 py-6 sm:px-12 md:px-16 md:py-12 relative z-10 shadow-2xl bg-white/80 dark:bg-bg-base/80 backdrop-blur-2xl min-h-screen border-r border-sand">
        
        <button 
          onClick={() => onNavigate('landing')}
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
              Buat Akun Baru
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text-muted font-medium text-sm md:text-base"
            >
              Mulai perjalanan cerdas Anda dalam mengelola keuangan hari ini.
            </motion.p>
            {error && <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm font-bold">{error}</div>}
          </div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleRegister} 
            className="space-y-4"
          >
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-text-main uppercase tracking-wider group-focus-within:text-clay transition-colors">Nama Lengkap</label>
              <input 
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full border border-sand bg-white dark:bg-bg-card rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-all placeholder:font-normal placeholder:text-sand hover:border-text-muted/50"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-bold text-text-main uppercase tracking-wider group-focus-within:text-clay transition-colors">Email</label>
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full border border-sand bg-white dark:bg-bg-card rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-all placeholder:font-normal placeholder:text-sand hover:border-text-muted/50"
              />
            </div>
            
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-text-main uppercase tracking-wider group-focus-within:text-clay transition-colors">Kata Sandi</label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-sand bg-white dark:bg-bg-card rounded-xl pl-4 pr-12 py-3 text-sm font-semibold text-text-main focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay transition-all hover:border-text-muted/50"
                />
                <button 
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-clay transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-clay hover:bg-nature-green text-bg-base font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-clay/20 hover:shadow-nature-green/30 active:scale-[0.98] mt-6 flex justify-center items-center gap-2 group"
            >
              Daftar Sekarang <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          </motion.form>

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
              <span className="px-4 bg-white dark:bg-bg-base text-text-muted font-bold">Atau Daftar Dengan</span>
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
            Sudah punya akun? <button onClick={() => onNavigate('login')} className="text-clay hover:text-nature-green transition-colors underline-offset-4 hover:underline">Masuk.</button>
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT SIDE - ILLUSTRATION (60%) */}
      <div className="hidden lg:flex w-[60%] bg-nature-green relative overflow-hidden flex-col">
        {/* Background Decorative Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[80%] aspect-square rounded-full border-[100px] border-white/5 pointer-events-none"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -left-[20%] w-[100%] aspect-square rounded-full border-[100px] border-white/10 pointer-events-none"
        />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="p-16 pt-24 text-bg-base relative z-10 max-w-2xl ml-auto text-right"
        >
          <h2 className="text-5xl font-bold leading-[1.1] mb-6">Mulai langkah awal menuju kesehatan finansial.</h2>
          <p className="text-bg-base/80 text-lg font-medium">Satu platform untuk melacak, mengelola, dan mengoptimalkan uang Anda menggunakan kecerdasan buatan.</p>
        </motion.div>

        {/* Mockup / Decorative App UI (Laptop Frame) */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotate: 8 }}
          animate={{ opacity: 1, y: 0, rotate: 4 }}
          transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.4 }}
          whileHover={{ y: -10, rotate: 2, transition: { duration: 0.4 } }}
          className="absolute -bottom-10 left-10 w-[110%] md:w-[90%] aspect-[16/10] bg-[#1e1e1e] rounded-tl-xl rounded-tr-3xl p-3 md:p-5 border-t-8 border-r-8 border-white/20 z-10 transform shadow-[20px_20px_40px_rgba(0,0,0,0.5)] cursor-pointer"
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
            <div className="flex-1 flex p-4 gap-4 overflow-hidden relative bg-bg-base/50">
              <div className="w-48 bg-white dark:bg-bg-card rounded-xl shadow-sm border border-sand p-4 flex flex-col shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-clay/10 flex items-center justify-center">
                    <Camera className="w-3 h-3 text-clay" />
                  </div>
                  <span className="text-[10px] font-bold text-text-main hover:text-clay transition-colors cursor-pointer">Fitur AI Scan</span>
                </div>
                 <div className="w-full h-32 border-2 border-dashed border-clay/30 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden bg-clay/5 group cursor-pointer hover:border-clay/60 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-nature-green shadow-[0_0_10px_#22da47] animate-[pulse_2s_ease-in-out_infinite]"></div>
                    <Receipt className="w-8 h-8 text-clay/50 group-hover:scale-110 group-hover:text-clay transition-all" />
                 </div>
                 <div className="space-y-3">
                    <div className="w-full h-2 bg-sand rounded-full"></div>
                    <div className="w-3/4 h-2 bg-sand rounded-full"></div>
                    <div className="w-1/2 h-2 bg-sand rounded-full"></div>
                 </div>
                 <div className="mt-auto pt-4">
                   <div className="w-full bg-nature-green text-white text-[10px] font-bold py-2 rounded-lg text-center shadow-sm cursor-pointer hover:bg-opacity-90">Upload Struk</div>
                 </div>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <div className="bg-white dark:bg-bg-card p-4 rounded-xl shadow-sm border border-sand hover:border-clay/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-nature-green" />  Analisis AI</span>
                    <div className="w-6 h-6 rounded-full bg-nature-green/10 flex items-center justify-center">
                      <LayoutDashboard className="w-3 h-3 text-nature-green" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                     <h3 className="text-xl font-black text-text-main flex items-center gap-2">Ekstraksi Akurat <CheckCircle2 className="w-4 h-4 text-nature-green" /></h3>
                     <span className="text-xs text-text-muted font-medium mt-1">Sistem kami mengenali item dan harga secara otomatis.</span>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-bg-card p-4 rounded-xl shadow-sm border border-sand flex-1 overflow-hidden flex flex-col hover:border-clay/30 transition-colors">
                   <div className="flex items-center justify-between mb-4 shrink-0">
                     <span className="text-[10px] font-bold text-text-main flex items-center gap-1.5"><Receipt className="w-3 h-3 text-clay" /> Hasil Scan Terbaru</span>
                     <span className="text-[9px] text-nature-green font-bold px-2 py-0.5 bg-nature-green/10 rounded-full">3 Item</span>
                   </div>
                   <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-sand/30 border border-sand">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-md bg-clay/10 flex items-center justify-center"><ShoppingCart className="w-3 h-3 text-clay" /></div>
                           <span className="text-[10px] font-bold text-text-main">Ayam Goreng Set</span>
                        </div>
                        <span className="text-[10px] font-bold text-text-main">Rp 45.000</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-sand/30 border border-sand">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-md bg-clay/10 flex items-center justify-center"><ShoppingCart className="w-3 h-3 text-clay" /></div>
                           <span className="text-[10px] font-bold text-text-main">Es Teh Manis</span>
                        </div>
                        <span className="text-[10px] font-bold text-text-main">Rp 10.000</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-sand/30 border border-sand">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-md bg-clay/10 flex items-center justify-center"><ShoppingCart className="w-3 h-3 text-clay" /></div>
                           <span className="text-[10px] font-bold text-text-main">Pajak Resto (10%)</span>
                        </div>
                        <span className="text-[10px] font-bold text-text-main">Rp 5.500</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Laptop Base Lip */}
          <div className="absolute -bottom-3 -right-2 w-[104%] h-3 bg-[#a0a0a0] rounded-b-xl border border-[#c0c0c0] shadow-xl z-20">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#808080] rounded-b-md"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
