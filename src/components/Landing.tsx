import { motion, AnimatePresence } from 'motion/react';
import { Camera, PieChart, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Users, Star, Zap, Lock, Receipt, FileText, ArrowUpRight, ArrowDownLeft, ChevronRight, Home, CreditCard, Sun, Moon, Mail, EyeOff, LineChart, Wallet, Quote, Menu, X, Package, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import khbLogo from '../assets/gambar/LOGO KHB.png';

interface LandingProps {
  onNavigate: (page: 'login' | 'register' | 'app') => void;
}

export function Landing({ onNavigate }: LandingProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light",
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const steps = [
    { 
      title: "Daftar & Verifikasi", 
      desc: "Buat akun KHB Anda kurang dari 1 menit.",
      icon: Users
    },
    { 
      title: "Scan Struk", 
      desc: "Foto nota belanja Anda, biarkan AI yang bekerja.",
      icon: Camera
    },
    { 
      title: "Tinjau Data", 
      desc: "AI mengekstrak nominal, toko, dan tanggal otomatis.",
      icon: Sparkles
    },
    { 
      title: "Pantau Laporan", 
      desc: "Lihat ringkasan dan grafik arus kas Anda.",
      icon: PieChart
    }
  ];

  const faqs = [
    {
      q: "Apa itu KHB?",
      a: "KHB adalah aplikasi pencatatan keuangan cerdas yang menggunakan teknologi AI untuk mengekstrak informasi dari foto struk belanja secara otomatis."
    },
    {
      q: "Apakah data saya aman?",
      a: "Sangat aman. Kami menggunakan enkripsi kelas industri dan menyimpan data secara lokal maupun cloud dengan privasi tingkat tinggi."
    },
    {
      q: "Berapa biaya penggunaannya?",
      a: "KHB dapat diakses sepenuhnya gratis untuk semua pengguna dengan fitur esensial."
    },
    {
      q: "Bagaimana cara kerja Scan AI?",
      a: "Cukup foto struk belanja Anda melalui aplikasi. AI kami akan memproses tulisan pada struk menjadi data tekstual seperti total, tanggal, dan nama toko."
    }
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-main overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-6">
        <div className="w-full max-w-5xl relative">
          <div className="w-full bg-bg-base/80 dark:bg-bg-card/80 backdrop-blur-xl border border-sand/50 shadow-xl shadow-sand/10 rounded-full h-16 flex items-center justify-between px-4 md:px-6 transition-colors relative z-20">
            <div className="flex items-center gap-3">
              <img src={khbLogo} alt="KHB Logo" className="h-12 object-contain" />
            </div>
            <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-text-muted">
              <a href="#home" className="hover:text-nature-green transition-colors">Beranda</a>
              <a href="#features" className="hover:text-nature-green transition-colors">Fitur</a>
              <a href="#how" className="hover:text-nature-green transition-colors">Bantuan</a>
              <a href="#faq" className="hover:text-nature-green transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 md:p-2.5 rounded-full hover:bg-sand/50 text-text-main transition-colors active:scale-95"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="hidden md:flex bg-nature-green text-bg-base px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-bold hover:bg-opacity-90 hover:shadow-lg hover:shadow-nature-green/20 transition-all active:scale-95 items-center"
              >
                Masuk <ArrowRight className="inline ml-1.5 w-4 h-4"/>
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="lg:hidden p-2 rounded-full hover:bg-sand/50 text-text-main transition-colors flex items-center justify-center focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-20 left-0 right-0 bg-bg-card border border-sand shadow-2xl rounded-3xl p-6 flex flex-col gap-4 lg:hidden z-10"
              >
                <div className="flex flex-col gap-4 font-bold text-text-main text-lg">
                  <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-nature-green transition-colors pb-2 border-b border-sand/50">Beranda</a>
                  <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-nature-green transition-colors pb-2 border-b border-sand/50">Fitur</a>
                  <a href="#how" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-nature-green transition-colors pb-2 border-b border-sand/50">Bantuan</a>
                  <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-nature-green transition-colors pb-2 border-b border-sand/50">FAQ</a>
                </div>
                <button 
                  onClick={() => onNavigate('login')}
                  className="bg-nature-green text-bg-base px-6 py-3 rounded-xl text-md font-bold hover:bg-opacity-90 transition-all active:scale-95 flex items-center justify-center mt-2 w-full"
                >
                  Masuk Sekarang
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-36 pb-20 px-6 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
          {/* Concentric Circles matching the reference */}
          <div className="absolute w-[800px] h-[800px] border border-gray-200/50 rounded-full opacity-30 mt-64" />
          <div className="absolute w-[1200px] h-[1200px] border border-gray-200/50 rounded-full opacity-20 mt-64" />
          <div className="absolute w-[1600px] h-[1600px] border border-gray-200/50 rounded-full opacity-10 mt-64" />
          
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute mt-64 w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full bg-gradient-to-tr from-green-200/60 via-lime-200/50 to-emerald-200/40 dark:from-green-900/30 dark:via-lime-800/20 dark:to-emerald-900/20 blur-[100px]"
          />
        </div>
        
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 bg-bg-card px-4 py-2 rounded-full border border-sand shadow-sm mb-8 hover:shadow-md transition-shadow cursor-default"
          >
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 border-bg-card bg-nature-green opacity-${i*30}`}></div>
              ))}
            </div>
            <span className="text-xs font-bold text-text-muted">Dipercaya oleh 10.000+ pengguna</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-text-main tracking-tight leading-[1.1] mb-6 max-w-4xl"
          >
            Pencatatan Keuangan <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-clay to-nature-green">
              Tanpa Ribet
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl font-medium"
          >
            KHB menawarkan fitur AI modern untuk mengekstrak struk belanja Anda secara gratis dan instan.
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => onNavigate('register')}
            className="bg-nature-green text-bg-base px-8 py-4 rounded-full text-base font-bold hover:shadow-xl hover:shadow-nature-green/30 transition-all flex items-center gap-2"
          >
            Daftar Gratis <ArrowRight className="w-5 h-5"/>
          </motion.button>

          {/* Glowing Green Backdrop (Behind everything) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-16 w-[800px] sm:w-[1200px] aspect-square bg-gradient-to-tr from-purple-500/30 to-nature-green/40 dark:from-purple-500/10 dark:to-nature-green/20 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

          {/* Hero Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
            className="mt-12 sm:mt-16 w-full max-w-[280px] sm:max-w-[320px] relative mx-auto"
            style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
          >
            <div className="relative z-10 w-full aspect-[9/19] bg-bg-card rounded-[2.5rem] md:rounded-[3rem] border-[8px] md:border-[10px] border-text-main shadow-2xl overflow-hidden p-5 flex flex-col pt-10">
              {/* Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 flex items-center justify-between px-2 shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-white/20"></div>
                 <div className="w-2 h-2 rounded-full bg-white/10"></div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-text-main tracking-tight">Halo, Pengguna!</h3>
                  <p className="text-[10px] text-text-muted font-medium mt-0.5">Ringkasan hari ini</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-clay/10 flex items-center justify-center">
                  <span className="font-bold text-clay text-sm">P</span>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-2xl p-5 shadow-lg shadow-purple-500/20 bg-gradient-to-tr from-purple-600 to-nature-green text-white mb-6 shrink-0">
                <div className="absolute bottom-0 right-0 w-32 h-full pointer-events-none overflow-hidden">
                  <svg className="absolute -bottom-4 right-0 w-32 h-32 opacity-20 transform rotate-12" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="160" cy="40" r="18" fill="white" fillOpacity="0.9" />
                    <circle cx="160" cy="40" r="12" fill="transparent" stroke="white" strokeWidth="2" />
                    <circle cx="50" cy="130" r="12" fill="white" fillOpacity="0.5" />
                    <path d="M20 160 L60 110 L90 130 L150 50" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <p className="text-[9px] font-bold tracking-wider uppercase opacity-90 mb-1">Total Saldo Saat Ini</p>
                  <h2 className="text-2xl font-black mt-1 mb-3 drop-shadow-md">Rp 12.500.000</h2>
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold">
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20">
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>Masuk: Rp 15M</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-lg backdrop-blur-sm border border-black/10">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Keluar: Rp 2.5M</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-around items-start px-2 py-3 bg-bg-card rounded-2xl border border-sand shadow-sm mb-6 shrink-0 z-10 relative">
                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-bg-base border border-sand flex items-center justify-center text-clay group-hover:scale-110 group-hover:bg-clay/10 transition-all">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-text-main group-hover:text-clay transition-colors">Laporan</span>
                </div>
                <div className="flex flex-col items-center gap-2 group cursor-pointer -translate-y-2">
                  <div className="w-12 h-12 rounded-full bg-nature-green text-white shadow-lg shadow-nature-green/40 flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                    <span className="font-extrabold text-2xl leading-none">+</span>
                  </div>
                  <span className="text-[9px] font-bold text-text-main group-hover:text-nature-green transition-colors mt-[-4px]">Input</span>
                </div>
                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-bg-base border border-sand flex items-center justify-center text-clay group-hover:scale-110 group-hover:bg-clay/10 transition-all">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-text-main group-hover:text-clay transition-colors">Scan</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                <div className="flex justify-between items-center shrink-0">
                  <h3 className="text-[11px] font-extrabold text-text-main tracking-tight">Transaksi Terkini</h3>
                  <span className="text-[9px] font-bold text-nature-green cursor-pointer hover:underline">Lihat Semua</span>
                </div>
                <div className="h-12 shrink-0 rounded-xl bg-sand/30 border border-sand flex items-center px-3 gap-3 hover:-translate-y-1 hover:shadow-md hover:bg-sand/50 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0"><Package className="w-4 h-4"/></div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[11px] font-bold text-text-main truncate">Beli Baku Kayu</div>
                    <div className="text-[9px] text-text-muted">12 Mei, 13:00</div>
                  </div>
                  <div className="text-[10px] font-bold text-clay">- Rp 285.000</div>
                </div>
                <div className="h-12 shrink-0 rounded-xl bg-sand/30 border border-sand flex items-center px-3 gap-3 hover:-translate-y-1 hover:shadow-md hover:bg-sand/50 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0"><TrendingUp className="w-4 h-4"/></div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[11px] font-bold text-text-main truncate">Pembayaran Jasa IT</div>
                    <div className="text-[9px] text-text-muted">12 Mei, 09:00</div>
                  </div>
                  <div className="text-[10px] font-bold text-nature-green">+ Rp 5.500.000</div>
                </div>
              </div>
              
              <div className="mt-auto pt-3 border-t border-sand flex justify-between items-center px-1 shrink-0 pb-1">
                <Home className="w-4 h-4 text-clay" />
                <PieChart className="w-4 h-4 text-text-muted" />
                <div className="w-10 h-10 rounded-full bg-clay flex items-center justify-center -translate-y-4 shadow-lg shadow-clay/20 text-white shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <FileText className="w-4 h-4 text-text-muted" />
                <Users className="w-4 h-4 text-text-muted" />
              </div>
            </div>

            {/* Floating Elements 3D Tilted */}
            <motion.div 
              initial={{ opacity: 0, x: -50, y: 20, rotateX: 10, rotateY: 25, rotateZ: -8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.6, type: "spring", bounce: 0.4 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="hidden lg:flex flex-col absolute top-32 -left-48 lg:-left-64 z-0 bg-white/90 backdrop-blur-xl p-4 md:p-5 rounded-3xl shadow-2xl border border-white/50 w-64"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-500">Akurasi Ekstraksi AI</span>
                <span className="text-sm font-black text-nature-green">99.8%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-8 mb-4 overflow-hidden relative">
                <div className="bg-nature-green h-full rounded-full w-[99.8%] flex items-center px-3">
                  <span className="text-[10px] font-bold text-white">Akurat</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-2xl">
                 <div className="flex flex-col">
                   <span className="text-[9px] font-bold text-gray-400">Status Scan Struk</span>
                   <span className="text-xs font-extrabold text-gray-900">12 Item Ditemukan</span>
                 </div>
                 <div className="flex gap-1.5">
                   <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-400"><Camera className="w-3 h-3" /></div>
                   <div className="w-6 h-6 rounded-md bg-nature-green flex items-center justify-center text-white"><CheckCircle2 className="w-3 h-3" /></div>
                 </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50, y: 20, rotateX: 15, rotateY: -25, rotateZ: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.8, type: "spring", bounce: 0.4 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="hidden lg:flex flex-col absolute top-48 -right-48 lg:-right-64 z-0 bg-white/90 backdrop-blur-xl p-4 md:p-5 rounded-3xl shadow-2xl border border-white/50 w-56"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Analisis<br/>Pengeluaran</span>
                </div>
                <span className="text-[10px] font-black text-clay">-12.4%</span>
              </div>
              <div className="flex items-end gap-2 h-16 w-full justify-between px-2">
                 {/* Bar Chart Mock */}
                 <div className="w-6 bg-gray-100 rounded-t-md h-8 relative"><span className="absolute -bottom-4 left-1 text-[8px] text-gray-400">Sen</span></div>
                 <div className="w-6 bg-gray-100 rounded-t-md h-12 relative"><span className="absolute -bottom-4 left-1 text-[8px] text-gray-400">Sel</span></div>
                 <div className="w-6 bg-gray-100 rounded-t-md h-6 relative"><span className="absolute -bottom-4 left-1 text-[8px] text-gray-400">Rab</span></div>
                 <div className="w-6 bg-clay rounded-t-md h-16 relative shadow-[0_0_10px_rgba(255,107,107,0.4)]"><span className="absolute -top-4 -left-1 text-[8px] font-bold text-clay">Kam</span></div>
                 <div className="w-6 bg-gray-100 rounded-t-md h-10 relative"><span className="absolute -bottom-4 left-1 text-[8px] text-gray-400">Jum</span></div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -50, y: 50, rotateX: -10, rotateY: 15, rotateZ: -5 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.7, type: "spring", bounce: 0.4 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="hidden lg:flex flex-col absolute bottom-12 -left-40 lg:-left-56 z-20 bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-3xl shadow-2xl border border-white/50 w-52"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-500">Scan Struk Terbaru</span>
                <span className="text-[9px] font-bold text-nature-green">Lihat Detail</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-1">
                 <span className="text-xs font-bold text-gray-900 truncate">Sinar Jaya Mart</span>
                 <span className="text-[10px] font-black text-clay">-Rp 450rb</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50, y: 50, rotateX: -15, rotateY: -15, rotateZ: 5 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.9, type: "spring", bounce: 0.4 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="hidden lg:flex flex-col absolute bottom-20 -right-36 lg:-right-52 z-20 bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-3xl shadow-2xl border border-white/50 w-48"
            >
              <div className="flex justify-around items-center border-b border-gray-100 pb-2 mb-2">
                 <span className="text-[9px] font-bold text-gray-400">Bulan Ini</span>
                 <span className="text-[10px] font-bold text-gray-900 bg-nature-green/10 text-nature-green px-2 py-0.5 rounded-full">Hemat</span>
                 <span className="text-[9px] font-bold text-gray-400">Total</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                 <span className="text-[10px] font-bold text-gray-500">Total Pengeluaran</span>
                 <span className="text-[12px] font-black text-gray-900">Rp 2.45M</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="how" className="py-24 px-6 bg-bg-card border-t border-sand overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-4xl font-black text-clay mb-2 text-center">4 Langkah Mudah Kelola Keuangan</h2>
          <p className="text-text-muted mb-16 text-center">Atur akun Anda dalam hitungan menit dan mulai pantau pengeluaran Anda.</p>

          <div className="flex flex-col md:flex-row gap-12 w-full mt-4">
            {/* Steps List */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              {steps.map((step, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setActiveStep(idx)}
                  className={`group w-full text-left p-6 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                    activeStep === idx 
                      ? 'border-nature-green bg-bg-base shadow-md scale-105' 
                      : 'border-transparent hover:bg-sand/30 hover:scale-[1.02]'
                  }`}
                >
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${activeStep === idx ? 'bg-nature-green text-bg-base' : 'bg-sand text-text-muted group-hover:bg-nature-green/20 group-hover:text-nature-green'}`}>
                    <step.icon className="w-4 h-4"/>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-1 transition-colors ${activeStep === idx ? 'text-nature-green' : 'text-text-main group-hover:text-nature-green'}`}>{step.title}</h3>
                    <p className={`text-sm transition-colors ${activeStep === idx ? 'text-text-muted' : 'text-text-muted group-hover:text-text-main'}`}>{step.desc}</p>
                  </div>
                  {activeStep === idx && <ChevronRight className="ml-auto text-nature-green"/>}
                </motion.button>
              ))}
            </div>

            {/* Step Preview Mockup */}
            <div className="w-full md:w-2/3 bg-bg-base rounded-[2rem] p-8 md:p-12 border border-sand flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-nature-green/5 group-hover:scale-105 transition-transform duration-700"></div>
               <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative z-10 w-full max-w-sm bg-bg-card rounded-3xl shadow-xl border border-sand p-6 flex flex-col gap-4"
                  >
                    {activeStep === 0 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col items-center gap-2 mb-4 group cursor-pointer">
                           <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-nature-green rounded-xl md:rounded-2xl mb-2 shadow-sm flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                              <Users className="w-6 h-6 text-white" />
                           </div>
                           <h4 className="font-black text-text-main group-hover:text-nature-green transition-colors">Daftar Akun Baru</h4>
                           <p className="text-[10px] text-text-muted text-center leading-tight">Mulai kelola keuangan Anda<br/>kurang dari 1 menit.</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-text-main ml-1">Email <span className="text-red-500">*</span></label>
                          <div className="w-full h-10 bg-bg-base border border-sand rounded-lg flex items-center px-3 hover:border-clay/50 transition-colors focus-within:border-clay group cursor-text">
                             <Mail className="w-4 h-4 text-text-muted group-hover:text-clay transition-colors mr-2" />
                             <span className="text-xs text-text-muted">contoh@email.com</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-text-main ml-1">Password <span className="text-red-500">*</span></label>
                          <div className="w-full h-10 bg-bg-base border border-sand rounded-lg flex items-center px-3 justify-between hover:border-clay/50 transition-colors focus-within:border-clay group cursor-text">
                             <div className="flex items-center">
                               <Lock className="w-4 h-4 text-text-muted group-hover:text-clay transition-colors mr-2" />
                               <span className="text-xs text-text-muted tracking-widest">••••••••</span>
                             </div>
                             <EyeOff className="w-4 h-4 text-text-muted hover:text-text-main cursor-pointer transition-colors" />
                          </div>
                        </div>
                        <button className="w-full h-10 bg-nature-green text-white font-bold text-sm flex items-center justify-center gap-2 rounded-lg mt-2 shadow-md shadow-nature-green/20 hover:bg-opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all">
                           Buat Akun
                        </button>
                        <button className="w-full h-10 bg-text-main text-white font-bold text-xs flex items-center justify-center gap-2 rounded-lg shadow-md hover:bg-opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all mt-1">
                           <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] text-text-main font-black">G</div>
                           Daftar dengan Google
                        </button>
                      </div>
                    )}
                    {activeStep === 1 && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                           <div className="w-8 h-8 rounded-full bg-clay/10 flex items-center justify-center cursor-pointer hover:bg-clay/20 transition-colors">
                              <ArrowLeft className="w-4 h-4 text-clay" />
                           </div>
                           <span className="font-bold text-text-main text-sm">Scan Struk</span>
                           <div className="w-8 h-8 rounded-full bg-sand cursor-pointer flex items-center justify-center hover:bg-sand/70 transition-colors group">
                              <Zap className="w-4 h-4 text-text-muted group-hover:text-yellow-500 transition-colors" />
                           </div>
                        </div>
                        <div className="w-full aspect-[4/4] sm:aspect-[4/5] bg-clay/5 border-2 border-dashed border-clay/30 rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-clay/60 transition-colors cursor-pointer relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-1 bg-nature-green shadow-[0_0_15px_#22da47] animate-[pulse_2s_ease-in-out_infinite]"></div>
                           <div className="w-16 h-16 rounded-full bg-clay/10 flex items-center justify-center text-clay group-hover:scale-110 transition-transform duration-300 shadow-inner">
                              <Camera className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500"/>
                           </div>
                           <span className="font-bold text-clay opacity-80 group-hover:text-nature-green group-hover:opacity-100 transition-colors">Arahkan pada struk</span>
                        </div>
                        <button className="w-full h-12 bg-nature-green text-white font-bold text-sm flex items-center justify-center rounded-xl shadow-md shadow-nature-green/20 hover:bg-opacity-90 hover:-translate-y-1 active:scale-95 transition-all gap-2 group">
                           <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
                           Ambil Foto
                        </button>
                      </div>
                    )}
                    {activeStep === 2 && (
                      <div className="flex flex-col gap-3 h-full">
                         <div className="text-center mb-2 mt-4">
                           <div className="w-12 h-12 bg-nature-green/10 rounded-full mx-auto flex items-center justify-center mb-3 group cursor-pointer hover:bg-nature-green/20 transition-colors">
                              <Sparkles className="w-6 h-6 text-nature-green lg:animate-pulse group-hover:animate-bounce" />
                           </div>
                           <h4 className="font-black text-text-main text-base mb-2 group-hover:text-nature-green transition-colors cursor-default">Ekstraksi Selesai!</h4>
                           <span className="text-[10px] text-nature-green font-bold px-3 py-1 bg-nature-green/10 rounded-full uppercase tracking-wider">Berhasil</span>
                         </div>
                         <div className="flex-1 bg-border/5 dark:bg-card/5 rounded-xl border border-sand p-4 flex flex-col gap-3 min-h-0 overflow-y-auto w-full mt-2">
                           <div className="flex justify-between items-center py-2 border-b border-sand/50 last:border-0 hover:bg-bg-base hover:px-2 -mx-2 px-2 rounded-lg transition-all cursor-default group/item">
                             <div className="flex flex-col gap-1">
                               <span className="font-bold text-xs text-text-main group-hover/item:text-clay transition-colors">Ayam Goreng Set</span>
                               <span className="text-[10px] text-text-muted">1x @ 45.000</span>
                             </div>
                             <span className="font-black text-sm text-text-main group-hover/item:-translate-y-0.5 transition-transform">Rp 45k</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-sand/50 last:border-0 hover:bg-bg-base hover:px-2 -mx-2 px-2 rounded-lg transition-all cursor-default group/item">
                             <div className="flex flex-col gap-1">
                               <span className="font-bold text-xs text-text-main group-hover/item:text-clay transition-colors">Es Teh Manis</span>
                               <span className="text-[10px] text-text-muted">1x @ 10.000</span>
                             </div>
                             <span className="font-black text-sm text-text-main group-hover/item:-translate-y-0.5 transition-transform">Rp 10k</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-sand/50 last:border-0 hover:bg-bg-base hover:px-2 -mx-2 px-2 rounded-lg transition-all cursor-default group/item">
                             <div className="flex flex-col gap-1">
                               <span className="font-bold text-xs text-text-main group-hover/item:text-clay transition-colors">Pajak Resto (10%)</span>
                               <span className="text-[10px] text-text-muted">Layanan</span>
                             </div>
                             <span className="font-black text-sm text-text-main group-hover/item:-translate-y-0.5 transition-transform">Rp 5.5k</span>
                           </div>
                         </div>
                      </div>
                    )}
                    {activeStep === 3 && (
                      <div className="flex flex-col gap-4">
                        <div className="bg-gradient-to-tr from-purple-600 to-nature-green p-5 rounded-2xl text-white shadow-lg shadow-purple-500/20 group hover:-translate-y-1 hover:shadow-xl transition-all cursor-default">
                           <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1 block">Saldo Saat Ini</span>
                           <h4 className="text-2xl font-black mb-1 group-hover:scale-105 origin-left transition-transform">Rp 5.240.000</h4>
                           <span className="text-xs font-bold text-white mt-1 bg-white/20 px-2 py-0.5 rounded-full inline-block group-hover:bg-white/30 transition-colors">+2.5% vs bulan lalu</span>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex-1 bg-bg-base rounded-xl border border-sand p-3 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-nature-green/50 transition-all cursor-pointer group">
                              <div className="w-8 h-8 rounded-full bg-nature-green/10 flex items-center justify-center mb-2 group-hover:bg-nature-green transition-colors">
                                <ArrowDownLeft className="w-4 h-4 text-nature-green group-hover:text-white transition-colors" />
                              </div>
                              <span className="text-[10px] font-bold text-text-muted group-hover:text-text-main transition-colors">Pemasukan</span>
                              <span className="font-black text-sm text-text-main">3.5jt</span>
                           </div>
                           <div className="flex-1 bg-bg-base rounded-xl border border-sand p-3 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-clay/50 transition-all cursor-pointer group">
                              <div className="w-8 h-8 rounded-full bg-clay/10 flex items-center justify-center mb-2 group-hover:bg-clay transition-colors">
                                <ArrowUpRight className="w-4 h-4 text-clay group-hover:text-white transition-colors" />
                              </div>
                              <span className="text-[10px] font-bold text-text-muted group-hover:text-text-main transition-colors">Pengeluaran</span>
                              <span className="font-black text-sm text-text-main">1.2jt</span>
                           </div>
                        </div>
                        <div className="flex-1 bg-bg-base border border-sand rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:border-nature-green/30 transition-colors cursor-default">
                           <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-text-main">Riwayat Terakhir</span>
                              <span className="text-[10px] font-bold text-nature-green hover:underline cursor-pointer">Lihat Semua</span>
                           </div>
                           <div className="flex items-center gap-3 group/item cursor-pointer">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover/item:scale-110 transition-transform"><Receipt className="w-4 h-4"/></div>
                              <div className="flex-1 flex flex-col gap-0.5">
                                 <span className="font-bold text-xs text-text-main group-hover/item:text-orange-500 transition-colors">Sayur & Ayam</span>
                                 <span className="text-[9px] text-text-muted">Superindo</span>
                              </div>
                              <span className="font-black text-xs text-text-main group-hover/item:-translate-y-0.5 transition-transform">-Rp 85k</span>
                           </div>
                           <div className="flex items-center gap-3 group/item cursor-pointer">
                              <div className="w-8 h-8 rounded-full bg-nature-green/10 flex items-center justify-center text-nature-green group-hover/item:scale-110 transition-transform"><CreditCard className="w-4 h-4"/></div>
                              <div className="flex-1 flex flex-col gap-0.5">
                                 <span className="font-bold text-xs text-text-main group-hover/item:text-nature-green transition-colors">Transfer Masuk</span>
                                 <span className="text-[9px] text-text-muted">BCA</span>
                              </div>
                              <span className="font-black text-xs text-nature-green group-hover/item:-translate-y-0.5 transition-transform">+Rp 200k</span>
                           </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-bg-card border-y border-sand">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex justify-between items-end mb-12">
            <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-black text-clay mb-4">Apa Kata Pengguna Kami</h2>
              <p className="text-text-muted">Mendapatkan popularitas di kalangan pebisnis dan pengguna harian.</p>
            </motion.div>
            <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} className="hidden md:flex gap-2">
              <button className="w-10 h-10 rounded-full border border-sand flex items-center justify-center hover:bg-clay hover:text-white hover:border-transparent transition-all active:scale-95"><ArrowLeft className="w-5 h-5"/></button>
              <button className="w-10 h-10 rounded-full border border-sand flex items-center justify-center hover:bg-clay hover:text-white hover:border-transparent transition-all active:scale-95"><ArrowRight className="w-5 h-5"/></button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { 
                 name: "Andi M.", 
                 role: "Freelancer", 
                 text: "Saya awalnya tidak percaya, tapi fitur AI-nya sangat mempermudah saat merekap bon-bon pengeluaran proyek.", 
                 wrapper: "from-orange-500/10 to-transparent", 
                 bg: "bg-white dark:bg-bg-card",
                 border: "border-orange-500/20", 
                 hover: "hover:border-orange-500/50 hover:shadow-orange-500/20", 
                 star: "text-orange-400", 
                 avatar: "bg-gradient-to-tr from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30",
                 iconColor: "text-orange-500",
                 nameHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400"
               },
               { 
                 name: "Siti Rahma", 
                 role: "Ibu Rumah Tangga", 
                 text: "Sangat membantu untuk track belanja harian. UI-nya simpel sekali dan enak dilihat. Mantap KHB!", 
                 wrapper: "from-nature-green/10 to-transparent", 
                 bg: "bg-white dark:bg-bg-card",
                 border: "border-nature-green/20", 
                 hover: "hover:border-nature-green/50 hover:shadow-nature-green/20", 
                 star: "text-nature-green", 
                 avatar: "bg-gradient-to-tr from-nature-green to-emerald-600 text-white shadow-lg shadow-nature-green/30",
                 iconColor: "text-nature-green",
                 nameHover: "group-hover:text-nature-green dark:group-hover:text-emerald-400"
               },
               { 
                 name: "Budi Santoso", 
                 role: "Pemilik UMKM", 
                 text: "Prosesnya jauh lebih cepat dari catat manual di buku. Saya sudah beralih sepenuhnya ke KHB.", 
                 wrapper: "from-blue-500/10 to-transparent", 
                 bg: "bg-white dark:bg-bg-card",
                 border: "border-blue-500/20", 
                 hover: "hover:border-blue-500/50 hover:shadow-blue-500/20", 
                 star: "text-blue-400", 
                 avatar: "bg-gradient-to-tr from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30",
                 iconColor: "text-blue-500",
                 nameHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
               }
             ].map((t, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  key={i} className={`p-[1px] rounded-[2rem] bg-gradient-to-b ${t.wrapper} relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 shadow-lg hover:shadow-2xl ${t.hover}`}
                >
                  <div className={`w-full h-full ${t.bg} rounded-[2rem] p-8 flex flex-col gap-6 relative`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-current/5 to-transparent rounded-bl-full pointer-events-none -z-0"></div>
                    <div className="flex justify-between items-start mb-2 z-10 relative">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${t.star} fill-current group-hover:scale-110 transition-transform`} style={{ transitionDelay: `${star * 50}ms` }} />
                        ))}
                      </div>
                      <Quote className={`w-10 h-10 ${t.iconColor} opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300`} />
                    </div>
                    <p className="text-text-main font-medium leading-relaxed z-10 relative flex-1 text-sm md:text-base">"{t.text}"</p>
                    <div className="mt-auto flex items-center gap-4 z-10 relative pt-4 border-t border-sand/50">
                      <div className={`w-12 h-12 ${t.avatar} rounded-full flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform duration-300`}>{t.name[0]}</div>
                      <div>
                        <h4 className={`font-bold text-text-main ${t.nameHover} transition-colors`}>{t.name}</h4>
                        <p className="text-xs text-text-muted">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
             ))}
          </div>
        </motion.div>
      </section>

      {/* Grid Features */}
      <section id="features" className="py-24 px-6 bg-bg-card overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-clay mb-4">Keamanan, Kecepatan & Kemudahan</h2>
            <p className="text-text-muted">Prinsip utama yang kami pegang untuk setiap pengguna.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-bg-base rounded-[2.5rem] p-10 border border-sand flex flex-col pb-0 overflow-hidden h-[400px] hover:border-clay/50 hover:shadow-xl transition-all duration-500"
            >
               <h3 className="text-2xl font-black text-text-main mb-2 group-hover:text-clay transition-colors">Setiap Langkah Aman</h3>
               <p className="text-text-muted mb-10 max-w-sm">Privasi Anda adalah prioritas kami. Data difilter dengan seksama dan terlindungi.</p>
               <div className="w-full h-[220px] bg-[#1e1e1e] rounded-t-2xl border-x-[12px] border-t-[12px] border-[#2c2c2c] mt-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] translate-y-8 group-hover:translate-y-0 transition-transform duration-500 relative flex flex-col">
                 <div className="w-full h-8 bg-black/40 rounded-t flex items-center px-4 gap-1.5 shrink-0 backdrop-blur-sm border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                 </div>
                 <div className="w-full flex-1 bg-bg-base overflow-hidden p-6 relative flex flex-col justify-center">
                    <div className="w-full h-14 bg-bg-card/80 rounded-xl flex items-center justify-center border-dashed border-2 border-sand group-hover:border-clay/50 group-hover:bg-clay/5 transition-colors shadow-sm relative z-10">
                      <Lock className="w-5 h-5 text-text-muted mr-2 group-hover:text-clay transition-colors"/> 
                      <span className="font-bold text-text-main">Aman Terkendali</span>
                    </div>
                    <div className="w-full flex gap-4 mt-6 opacity-60">
                       <div className="w-10 h-10 rounded-full bg-sand"></div>
                       <div className="flex-1 space-y-3">
                         <div className="w-3/4 h-3 bg-gradient-to-r from-clay/20 to-transparent rounded-full"></div>
                         <div className="w-1/2 h-3 bg-gradient-to-r from-clay/20 to-transparent rounded-full"></div>
                       </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-bg-base to-transparent z-20"></div>
                 </div>
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group bg-bg-base rounded-[2.5rem] p-10 border border-sand flex flex-col pb-0 overflow-hidden h-[400px] hover:border-nature-green/50 hover:shadow-xl transition-all duration-500"
            >
               <h3 className="text-2xl font-black text-text-main mb-2 group-hover:text-nature-green transition-colors">Proses Instan & Cepat</h3>
               <p className="text-text-muted mb-10 max-w-sm">Uang masuk atau keluar? Catat dan lihat hasilnya secara realtime di kalender Anda.</p>
               <div className="w-full h-[220px] bg-[#1e1e1e] rounded-t-2xl border-x-[12px] border-t-[12px] border-[#2c2c2c] mt-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] translate-y-8 group-hover:translate-y-0 transition-transform duration-500 relative flex flex-col">
                 <div className="w-full h-8 bg-black/40 rounded-t flex items-center px-4 gap-1.5 shrink-0 backdrop-blur-sm border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                 </div>
                 <div className="w-full flex-1 bg-bg-base overflow-hidden p-5 flex gap-4 relative">
                    <div className="w-1/2 h-full bg-bg-card border border-sand rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group-hover:border-nature-green/30 transition-colors shadow-sm">
                      <div className="w-3/4 h-3 bg-text-main/20 rounded-full group-hover:w-full transition-all duration-700"></div>
                      <div className="w-1/2 h-3 bg-text-main/10 rounded-full"></div>
                      <div className="w-2/3 h-8 bg-nature-green/80 rounded-md mt-auto group-hover:h-12 transition-all duration-500 relative z-10"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 bg-nature-green/10 rounded-tl-full blur-xl"></div>
                    </div>
                    <div className="w-1/2 h-full bg-bg-card border border-sand rounded-xl p-4 relative overflow-hidden group-hover:border-nature-green/30 transition-colors shadow-sm flex flex-col justify-end">
                      <div className="flex items-end justify-between h-16 w-full gap-2 relative z-10">
                        <div className="w-full bg-nature-green/40 h-[30%] rounded-t-sm group-hover:h-[60%] transition-all duration-500 delay-75"></div>
                        <div className="w-full bg-nature-green/60 h-[50%] rounded-t-sm group-hover:h-[80%] transition-all duration-500 delay-150"></div>
                        <div className="w-full bg-nature-green/80 h-[40%] rounded-t-sm group-hover:h-[100%] transition-all duration-500 delay-200"></div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-nature-green/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                    </div>
                    <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1500ms] ease-in-out pointer-events-none mix-blend-overlay"></div>
                 </div>
               </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-bg-base rounded-[2.5rem] p-10 border border-sand flex items-center justify-between col-span-1 md:col-span-2 overflow-hidden relative hover:border-text-main/20 hover:shadow-xl transition-all duration-500"
            >
                <div className="max-w-md relative z-10">
                   <h3 className="text-2xl font-black text-text-main mb-2">Dukungan Terbaik</h3>
                   <p className="text-text-muted mb-6">Kami memprioritaskan kenyamanan Anda. Anda selalu bisa menghubungi tim support atau komunitas kami.</p>
                   <button className="bg-text-main text-bg-base px-6 py-2.5 rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 group-hover:bg-clay group-hover:shadow-clay/20">
                     Panduan Pusat <ArrowRight className="w-4 h-4"/>
                   </button>
                </div>
                <div className="hidden md:flex w-64 h-64 bg-gradient-to-br from-clay/20 to-nature-green/20 rounded-full absolute -right-10 -bottom-10 pointer-events-none border-4 border-bg-card shadow-inner items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                  <Zap className="w-24 h-24 text-text-main/20 group-hover:text-clay/50 transition-colors" />
                </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-bg-base relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sand/20 to-transparent rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-clay/5 to-transparent rounded-full blur-[80px] -z-10 -translate-x-1/2 translate-y-1/3"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16 md:mb-20">
            <span className="text-clay font-bold tracking-widest uppercase text-sm mb-4 block">Bantuan & Dukungan</span>
            <h2 className="text-3xl md:text-5xl font-black text-text-main mb-6 leading-tight">
              Pertanyaan yang Sering<br/><span className="text-clay">Diajukan</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            <div className="md:col-span-4 flex flex-col gap-6">
               <div className="bg-bg-card p-8 rounded-[2rem] border border-sand shadow-sm sticky top-28 flex flex-col items-center md:items-start text-center md:text-left transition-transform hover:-translate-y-1 hover:shadow-xl duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-clay/20 to-nature-green/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                      <Mail className="w-8 h-8 text-text-main" />
                  </div>
                  <h3 className="font-bold text-text-main text-2xl mb-3">Butuh Bantuan Ekstra?</h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-8">Tim support kami siap menjawab semua pertanyaan Anda lebih detail.</p>
                  <button className="w-full bg-text-main text-bg-base font-bold py-3.5 px-6 rounded-xl hover:bg-clay transition-all hover:shadow-lg shadow-clay/20 active:scale-95 flex items-center justify-center gap-2 group">
                    Hubungi Kami <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
               </div>
            </div>

            <div className="md:col-span-8 flex flex-col gap-4">
              {faqs.map((faq, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className={`bg-bg-card border rounded-[1.5rem] overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'border-clay/40 shadow-md shadow-clay/5' : 'border-sand shadow-sm hover:border-clay/30 hover:shadow-md'}`}
                  >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full text-left p-6 md:p-8 flex justify-between items-center gap-4 focus:outline-none group"
                  >
                    <span className={`font-bold md:text-lg transition-colors ${activeFaq === idx ? 'text-clay' : 'text-text-main group-hover:text-clay'}`}>
                       {faq.q}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${activeFaq === idx ? 'bg-clay/10 text-clay' : 'bg-sand/30 text-text-muted group-hover:bg-sand/60'}`}>
                       {activeFaq === idx ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                    </div>
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 md:px-8 pb-6 md:pb-8 pt-0 outline-none"
                      >
                        <div className="text-text-muted font-medium leading-relaxed border-t border-sand/30 pt-6">
                           {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 overflow-hidden bg-bg-card">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto bg-gray-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-2xl group"
        >
          {/* Animated Background Decor */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-clay/20 animate-pulse rounded-full blur-3xl group-hover:bg-nature-green/20 transition-colors duration-1000"></div>

          <div className="p-8 sm:p-12 md:p-20 z-10 w-full md:w-1/2">
             <div className="inline-flex items-center gap-2 bg-gray-800/80 rounded-full px-4 py-1.5 mb-8 border border-white/10 shadow-lg backdrop-blur-md">
               <div className="flex -space-x-2">
                 <div className="w-6 h-6 rounded-full bg-clay border border-gray-900 z-20"></div>
                 <div className="w-6 h-6 rounded-full bg-nature-green border border-gray-900 z-10"></div>
                 <div className="w-6 h-6 rounded-full bg-orange-400 border border-gray-900"></div>
               </div>
               <span className="text-xs font-bold text-gray-300">Bergabung dengan 1.2M+ pengguna</span>
             </div>
             <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left text-white">Mulai atur keuangan Anda sekarang.</h2>
             <p className="text-gray-400 mb-10 text-lg">Dapatkan fitur maksimal untuk pengelolaan finansial yang lebih terorganisir, cerdas dan transparan.</p>
             <div className="flex flex-wrap gap-4">
               <button 
                onClick={() => onNavigate('register')}
                className="bg-nature-green text-gray-900 px-6 md:px-8 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-opacity-90 hover:shadow-xl hover:shadow-nature-green/30 hover:-translate-y-1 transition-all active:scale-95"
               >
                 <Zap className="w-5 h-5"/> Daftar Sekarang Gratis
               </button>
             </div>
          </div>
          <div className="w-full md:w-1/2 relative h-[350px] md:h-[500px]">
             {/* Phone Cutoff Design */}
             <div className="absolute top-10 right-0 md:top-20 md:right-0 w-[300px] sm:w-[400px] h-[600px] sm:h-[800px] bg-white dark:bg-[#1a1a1a] rounded-[3rem] border-[12px] border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] transform -rotate-[15deg] p-4 overflow-hidden group-hover:-rotate-12 group-hover:translate-x-4 transition-all duration-700 mx-auto left-0 md:left-auto md:mx-0">
                <div className="w-full h-full bg-gray-50 dark:bg-[#111] rounded-[2rem] flex flex-col pt-8 px-4 opacity-95 border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden shadow-inner cursor-pointer">
                   
                   {/* Top Bar */}
                   <div className="flex justify-between items-center mb-6">
                     <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 p-0.5 relative group/profile">
                       <div className="w-full h-full rounded-full bg-gradient-to-tr from-clay to-nature-green p-[2px] group-hover/profile:rotate-90 transition-transform duration-500">
                         <div className="w-full h-full rounded-full bg-gray-50 dark:bg-[#111] flex items-center justify-center font-bold text-xs text-gray-900 dark:text-white group-hover/profile:bg-gray-900 group-hover/profile:text-white dark:group-hover:bg-white dark:group-hover:text-gray-900 transition-colors">U</div>
                       </div>
                     </div>
                     <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-nature-green transition-colors">Ringkasan Bulan Ini</h3>
                     <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <LineChart className="w-5 h-5" />
                     </div>
                   </div>

                   {/* Main Card */}
                   <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl border border-gray-700/50 mb-5 transform group-hover:scale-[1.02] transition-transform duration-500 hover:shadow-2xl">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <span className="text-[10px] font-bold opacity-70 mb-1 block uppercase tracking-wider text-white/80">Total Saldo</span>
                          <h4 className="text-3xl font-black text-white group-hover:translate-x-1 transition-transform">Rp 12.500.000</h4>
                        </div>
                        <div className="bg-white/20 p-2 rounded-xl group-hover:bg-nature-green/40 transition-colors">
                          <Wallet className="w-6 h-6 text-white"/>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-3">
                         <div className="flex-1 bg-white/10 rounded-xl p-2 sm:p-3 hover:bg-nature-green/20 transition-colors cursor-pointer border border-white/5">
                           <div className="flex items-center gap-1.5 mb-1.5">
                             <div className="w-4 h-4 rounded-full bg-nature-green/20 flex items-center justify-center">
                               <ArrowDownLeft className="w-3 h-3 text-nature-green" />
                             </div>
                             <span className="text-[9px] sm:text-[10px] font-bold text-white/70">Pemasukan</span>
                           </div>
                           <span className="font-black text-xs sm:text-sm text-white">Rp 18.2jt</span>
                         </div>
                         <div className="flex-1 bg-white/10 rounded-xl p-2 sm:p-3 hover:bg-clay/20 transition-colors cursor-pointer border border-white/5">
                           <div className="flex items-center gap-1.5 mb-1.5">
                             <div className="w-4 h-4 rounded-full bg-clay/20 flex items-center justify-center">
                               <ArrowUpRight className="w-3 h-3 text-clay" />
                             </div>
                             <span className="text-[9px] sm:text-[10px] font-bold text-white/70">Pengeluaran</span>
                           </div>
                           <span className="font-black text-xs sm:text-sm text-white">Rp 5.7jt</span>
                         </div>
                      </div>
                   </div>

                   {/* Quick Actions */}
                   <div className="grid grid-cols-4 gap-1.5 sm:gap-3 mb-6">
                      {[
                        { icon: Camera, label: "Scan", color: "text-clay", bg: "bg-clay/10", border: 'border-clay/20', hover: 'hover:bg-clay', iconHover: 'group-hover:text-white dark:group-hover:text-white' },
                        { icon: Receipt, label: "Input", color: "text-nature-green", bg: "bg-nature-green/10", border: 'border-nature-green/20', hover: 'hover:bg-nature-green', iconHover: 'group-hover:text-white dark:group-hover:text-white' },
                        { icon: PieChart, label: "Laporan", color: "text-gray-900 dark:text-gray-200", bg: "bg-gray-100 dark:bg-gray-800", border: 'border-transparent', hover: 'hover:bg-gray-900 dark:hover:bg-gray-100', iconHover: 'group-hover:text-white dark:group-hover:text-gray-900' },
                        { icon: Lock, label: "Aman", color: "text-gray-900 dark:text-gray-200", bg: "bg-gray-100 dark:bg-gray-800", border: 'border-transparent', hover: 'hover:bg-gray-900 dark:hover:bg-gray-100', iconHover: 'group-hover:text-white dark:group-hover:text-gray-900' },
                      ].map((action, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 sm:gap-2 group/action cursor-pointer">
                          <div className={`w-[45px] h-[45px] sm:w-[60px] sm:h-[60px] rounded-[1rem] sm:rounded-[1.25rem] ${action.bg} ${action.border} border flex items-center justify-center transition-all duration-300 ${action.color} shadow-sm group-hover/action:shadow-md group-hover/action:-translate-y-1 ${action.hover}`}>
                             <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${action.iconHover}`} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 group-hover/action:text-gray-900 dark:group-hover/action:text-white transition-colors">{action.label}</span>
                        </div>
                      ))}
                   </div>

                   {/* Recent Transactions */}
                   <div className="flex-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-black text-sm text-gray-900 dark:text-white">Transaksi Terakhir</span>
                        <span className="text-[10px] text-nature-green font-bold bg-nature-green/10 px-2 py-0.5 rounded-full hover:bg-nature-green/20 cursor-pointer transition-colors">Lihat Semua</span>
                      </div>
                      <div className="space-y-4 flex-1 overflow-hidden relative">
                        <div className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group/tx">
                           <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-sm group-hover/tx:scale-110 transition-transform">
                              <Receipt className="w-5 h-5" />
                           </div>
                           <div className="flex-1">
                              <div className="font-bold text-sm text-gray-900 dark:text-white group-hover/tx:text-orange-500 transition-colors">Belanja Mingguan</div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">Superindo</div>
                           </div>
                           <div className="font-black text-sm text-gray-900 dark:text-white group-hover/tx:-translate-y-0.5 transition-transform">-Rp 350.000</div>
                        </div>
                        <div className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group/tx">
                           <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm group-hover/tx:scale-110 transition-transform">
                              <FileText className="w-5 h-5" />
                           </div>
                           <div className="flex-1">
                              <div className="font-bold text-sm text-gray-900 dark:text-white group-hover/tx:text-blue-500 transition-colors">Tagihan Listrik</div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">PLN Mobile</div>
                           </div>
                           <div className="font-black text-sm text-gray-900 dark:text-white group-hover/tx:-translate-y-0.5 transition-transform">-Rp 250.000</div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 dark:from-[#111] to-transparent"></div>
                      </div>
                   </div>

                   <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1500ms] ease-in-out pointer-events-none mix-blend-overlay"></div>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Stats & Footer */}
      <footer className="pt-24 pb-12 px-6 bg-bg-card border-t border-sand">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-4 lg:col-span-5 flex flex-col items-start text-left">
             <div className="flex items-center gap-2 mb-6">
                <img src={khbLogo} alt="KHB Logo" className="h-16 w-auto object-contain" />
             </div>
             <p className="text-sm font-medium text-text-muted leading-relaxed mb-8 max-w-sm">
                Platform inovatif yang menggunakan teknologi AI modern untuk mendigitalisasi pencatatan finansial Anda agar lebih mudah, cepat, dan transparan.
             </p>
             <div className="flex gap-8 items-center">
               <div className="flex flex-col gap-1">
                 <h4 className="text-clay font-extrabold text-2xl">1.2M+</h4>
                 <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Pengguna Aktif</span>
               </div>
               <div className="w-px h-10 bg-sand"></div>
               <div className="flex flex-col gap-1">
                 <h4 className="text-nature-green font-extrabold text-2xl">4.8</h4>
                 <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Rating App Store</span>
               </div>
             </div>
          </div>
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
             <div className="flex flex-col gap-4">
               <h4 className="font-bold text-text-main uppercase tracking-wider text-xs mb-2">Produk</h4>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Fitur AI Scan</a>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Laporan Keuangan</a>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Integrasi Bot</a>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Harga</a>
             </div>
             <div className="flex flex-col gap-4">
               <h4 className="font-bold text-text-main uppercase tracking-wider text-xs mb-2">Perusahaan</h4>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Tentang Kami</a>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Karir</a>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Blog</a>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Hubungi Kami</a>
             </div>
             <div className="flex flex-col gap-4 col-span-2 sm:col-span-1">
               <h4 className="font-bold text-text-main uppercase tracking-wider text-xs mb-2">Legal</h4>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Syarat & Ketentuan</a>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Kebijakan Privasi</a>
               <a href="#" className="text-sm text-text-muted hover:text-nature-green transition-colors">Keamanan Data</a>
             </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-sand text-xs font-medium text-text-muted gap-4">
           <div>© 2026 KHB App by AI Studio. Hak cipta dilindungi.</div>
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-nature-green shadow-[0_0_8px_rgba(34,218,71,0.5)]"></span>
                <span className="font-bold">Sistem Normal</span>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
}

