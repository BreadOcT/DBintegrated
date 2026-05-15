import React, { useState, useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { formatCurrency } from "../lib/utils";
import { format, parseISO, isThisMonth, isThisWeek } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { 
  PieChart, Plus, ArrowUpRight, ArrowDownLeft, FileText, PlusCircle, Camera, Search,
  Home, Briefcase, ShoppingBag, TrendingUp, Bus, Package, Users, Tag, HelpCircle, DollarSign,
  Gamepad, Target, Edit2, X
} from "lucide-react";

type DashboardProps = ReturnType<typeof useTransactions> & {
  onNavigate?: (tab: string) => void;
};

const getCategoryStyle = (category: string, type: 'income' | 'expense') => {
  switch (category) {
    case "Bahan Baku": return { icon: Package, color: "text-amber-500", bg: "bg-amber-500/10" };
    case "Operasional": return { icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" };
    case "Transportasi": return { icon: Bus, color: "text-teal-500", bg: "bg-teal-500/10" };
    case "Gaji Pegawai": return { icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" };
    case "Pemasaran": return { icon: Home, color: "text-purple-500", bg: "bg-purple-500/10" };
    case "Penjualan Produk": return { icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    case "Jasa": return { icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-500/10" };
    default: 
      return type === 'income' 
        ? { icon: PlusCircle, color: "text-nature-green", bg: "bg-nature-green/10" }
        : { icon: Tag, color: "text-clay", bg: "bg-clay/10" };
  }
};

export function Dashboard({
  transactions,
  totalProfit,
  onNavigate,
}: DashboardProps) {
  const [budgetTarget, setBudgetTarget] = useState<number>(3000000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("budgetTarget");
    if (saved) {
      setBudgetTarget(Number(saved));
    }
  }, []);

  const handleSaveBudget = () => {
    const val = Number(tempBudget.replace(/\D/g, ""));
    if (val > 0) {
      setBudgetTarget(val);
      localStorage.setItem("budgetTarget", val.toString());
      setIsEditingBudget(false);
    }
  };

  const openBudgetEditor = () => {
    setTempBudget(budgetTarget.toString());
    setIsEditingBudget(true);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setTempBudget(raw);
  };

  const formatEditBudget = (val: string) => {
    if (!val) return "";
    return new Intl.NumberFormat("id-ID").format(Number(val));
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => t.type === "expense" && isThisMonth(parseISO(t.date)))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const weeklyExpense = transactions
    .filter((t) => t.type === "expense" && isThisWeek(parseISO(t.date), { weekStartsOn: 1 }))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyIncome = transactions
    .filter((t) => t.type === "income" && isThisMonth(parseISO(t.date)))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const weeklyIncome = transactions
    .filter((t) => t.type === "income" && isThisWeek(parseISO(t.date), { weekStartsOn: 1 }))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pt-2 max-w-lg mx-auto lg:max-w-none pb-24 lg:pb-0"
    >
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0 flex flex-col space-y-6">
        {/* Left Column on Desktop */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Purple Gradient Balance Card */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-6 shadow-xl shadow-purple-500/20 bg-gradient-to-tr from-purple-600 to-nature-green text-white">
            {/* Abstract Vector Illustration */}
            <div className="absolute bottom-0 right-0 w-48 h-full pointer-events-none overflow-hidden">
              <svg className="absolute -bottom-6 right-0 w-56 h-56 opacity-20 transform rotate-12" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="160" cy="40" r="18" fill="white" fillOpacity="0.9" />
                <circle cx="160" cy="40" r="12" fill="transparent" stroke="white" strokeWidth="2" />
                <circle cx="50" cy="130" r="12" fill="white" fillOpacity="0.5" />
                <path d="M20 160 L60 110 L90 130 L150 50" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M120 50 L150 50 L150 80" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M180 200C160 150 190 100 200 80" stroke="white" strokeWidth="12" strokeLinecap="round" />
                <path d="M150 200C130 170 100 180 80 200" stroke="white" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>

            <div className="relative z-10 pt-2 mb-2">
              <p className="text-sm font-medium text-white/90 mb-1 tracking-wide uppercase text-[11px] font-bold">
                Total Saldo Saat Ini
              </p>
              <h3 className={`text-5xl sm:text-6xl md:text-5xl font-black font-sans tracking-tight mb-6 drop-shadow-md truncate ${totalProfit < 0 ? 'text-red-400' : 'text-white'}`} title={formatCurrency(totalProfit)}>
                {formatCurrency(totalProfit)}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-white/90">
                <div className="flex flex-col bg-white/20 px-4 py-3 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none"></div>
                  <div className="flex items-center gap-1.5 opacity-90 mb-2">
                    <ArrowDownLeft className="w-4 h-4 text-white" />
                    <span className="text-[10px] uppercase tracking-wider">Pemasukan</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] opacity-70 mb-0.5">Bulan Ini</span>
                      <span className="text-sm text-white/95 truncate">{formatCurrency(monthlyIncome)}</span>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] opacity-70 mb-0.5">Minggu Ini</span>
                      <span className="text-sm text-white/95 truncate">{formatCurrency(weeklyIncome)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col bg-black/20 px-4 py-3 rounded-xl border border-black/10 shadow-sm backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none"></div>
                  <div className="flex items-center gap-1.5 opacity-90 mb-2">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                    <span className="text-[10px] uppercase tracking-wider">Pengeluaran</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] opacity-70 mb-0.5">Bulan Ini</span>
                      <span className="text-sm text-white/95 truncate">{formatCurrency(monthlyExpense)}</span>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] opacity-70 mb-0.5">Minggu Ini</span>
                      <span className="text-sm text-white/95 truncate">{formatCurrency(weeklyExpense)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="flex justify-around items-start px-2 py-4 bg-bg-card rounded-3xl border border-sand shadow-sm">
            <button onClick={() => onNavigate?.('report')} className="flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-full bg-bg-base shadow-sm border border-sand flex items-center justify-center text-clay group-hover:bg-nature-green group-hover:text-white group-hover:border-nature-green transition-all transform group-hover:scale-105 active:scale-95">
                <PieChart className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-text-main">Laporan</span>
            </button>
            <button onClick={() => onNavigate?.('add')} className="flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-full bg-nature-green text-white shadow-lg shadow-nature-green/30 flex items-center justify-center transition-all transform group-hover:scale-105 active:scale-95">
                <Plus className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold text-text-main">Input</span>
            </button>
            <button onClick={() => onNavigate?.('history')} className="flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-full bg-bg-base shadow-sm border border-sand flex items-center justify-center text-clay group-hover:bg-nature-green group-hover:text-white group-hover:border-nature-green transition-all transform group-hover:scale-105 active:scale-95">
                <Search className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-text-main">Riwayat</span>
            </button>
            <button onClick={() => onNavigate?.('scan')} className="flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-full bg-bg-base shadow-sm border border-sand flex items-center justify-center text-clay group-hover:bg-nature-green group-hover:text-white group-hover:border-nature-green transition-all transform group-hover:scale-105 active:scale-95">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-text-main">Scan</span>
            </button>
          </motion.div>

          {/* Budget Progress Feature */}
          <motion.div variants={itemVariants} className="bg-bg-card rounded-3xl p-6 border border-sand shadow-sm relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-500"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-text-main text-sm">Target Anggaran Bulanan</h4>
                  <p className="text-[10px] uppercase font-bold text-text-muted mt-0.5">Bulan Ini</p>
                </div>
              </div>
              <button onClick={openBudgetEditor} className="p-2 hover:bg-amber-500/10 rounded-full text-amber-500 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Pengeluaran</span>
                  <span className="font-black text-lg text-text-main">{formatCurrency(monthlyExpense)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Batas Maksimal</span>
                  <span className="font-bold text-sm text-text-muted">{formatCurrency(budgetTarget)}</span>
                </div>
              </div>
              
              <div className="w-full h-3 bg-sand/50 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((monthlyExpense / budgetTarget) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${monthlyExpense > budgetTarget ? 'bg-clay shadow-[0_0_10px_rgba(240,113,103,0.5)]' : 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}
                ></motion.div>
              </div>
              <p className={`text-[10px] font-bold mt-2 ${monthlyExpense > budgetTarget ? 'text-clay' : 'text-text-muted'}`}>
                {monthlyExpense > budgetTarget 
                  ? "Peringatan: Kamu sudah melebihi batas anggaran bulanan!" 
                  : `Tersisa ${formatCurrency(Math.max(budgetTarget - monthlyExpense, 0))} dari anggaranmu.`}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column on Desktop */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Recent Transactions */}
          <motion.div variants={itemVariants} className="pt-2 bg-bg-card border border-sand p-6 rounded-3xl shadow-sm flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-extrabold text-text-main tracking-tight">Transaksi Terkini</h3>
              <button onClick={() => onNavigate?.('history')} className="text-nature-green text-xs font-bold hover:underline">Lihat Semua</button>
            </div>
        
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 text-text-muted text-sm bg-sand/20 rounded-2xl border border-dashed border-sand">Belum ada transaksi terkini.</div>
          ) : (
            recentTransactions.map((t) => {
              const { icon: Icon, color, bg } = getCategoryStyle(t.category, t.type as 'income' | 'expense');
              return (
              <div key={t.id} onClick={() => onNavigate?.('history')} className="flex justify-between items-center bg-bg-card p-4 rounded-2xl shadow-sm border border-sand/50 hover:border-sand transition-colors group/trx cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center transition-all group-hover/trx:scale-110 ${bg} ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <p className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${color}`}>{t.category}</p>
                    <h4 className="font-bold text-text-main text-sm max-w-[120px] sm:max-w-[180px] line-clamp-1">{t.description}</h4>
                    <p className="text-[10px] text-text-muted mt-1 font-medium">{format(parseISO(t.date), "dd-MM-yyyy")}</p>
                  </div>
                </div>
                <div className={`font-bold text-sm whitespace-nowrap pl-2 ${t.type === 'income' ? 'text-nature-green' : 'text-clay'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
              </div>
            )})
          )}
        </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isEditingBudget && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingBudget(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-bg-base rounded-t-3xl border-t border-sand shadow-2xl p-6 pb-8"
            >
              <div className="max-w-md mx-auto">
                <div className="w-12 h-1.5 bg-sand rounded-full mx-auto mb-6" />
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold text-text-main">Edit Batas Anggaran</h3>
                  <button onClick={() => setIsEditingBudget(false)} className="p-2 bg-sand/50 rounded-full text-text-muted hover:text-text-main transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-8">
                  <label className="block text-sm font-bold text-text-muted mb-2">Batas Maksimal Bulanan (Rp)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-text-main font-bold">Rp</span>
                    </div>
                    <input 
                      type="text" 
                      value={formatEditBudget(tempBudget)}
                      onChange={handleBudgetChange}
                      className="w-full bg-bg-card border-2 border-sand rounded-2xl py-4 pl-12 pr-4 text-xl font-black text-text-main focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="3.000.000"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleSaveBudget}
                    className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

