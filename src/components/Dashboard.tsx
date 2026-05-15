import React, { useState, useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { formatCurrency } from "../lib/utils";
import { format, parseISO, isThisMonth, isThisWeek, addMonths, subMonths, getMonth, getYear } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { 
  PieChart, Plus, ArrowUpRight, ArrowDownLeft, FileText, PlusCircle, Camera, Search,
  Home, Briefcase, ShoppingBag, TrendingUp, Bus, Package, Users, Tag, HelpCircle, DollarSign,
  Gamepad, Target, Edit2, X, ChevronLeft, ChevronRight, ChevronDown
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type DashboardProps = ReturnType<typeof useTransactions> & {
  onNavigate?: (tab: string, filters?: any) => void;
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
  const { token } = useAuth();
  
  // Budget & Month state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedMonth = getMonth(selectedDate) + 1;
  const selectedYear = getYear(selectedDate);
  
  const [budgetTarget, setBudgetTarget] = useState({ income: 5000000, expense: 3000000 });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState({ income: "", expense: "" });
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);

  // Fetch budgets
  useEffect(() => {
    if (token) {
       fetch(`/api/budgets?year=${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
       })
       .then(res => res.json())
       .then((data: any[]) => {
          const budget = data.find(b => b.month === selectedMonth && b.year === selectedYear);
          if (budget) {
             setBudgetTarget({
                income: Number(budget.income_target),
                expense: Number(budget.expense_target)
             });
          } else {
             // defaults for unconfigured months
             setBudgetTarget({ income: 5000000, expense: 3000000 });
          }
       })
       .catch(err => console.error("Error fetching budgets:", err));
    }
  }, [token, selectedMonth, selectedYear]);

  const handleSaveBudget = async () => {
    const inc = Number(tempBudget.income.replace(/\D/g, "")) || 0;
    const exp = Number(tempBudget.expense.replace(/\D/g, "")) || 0;
    
    if (token) {
       try {
          await fetch('/api/budgets', {
             method: 'PUT',
             headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                month: selectedMonth,
                year: selectedYear,
                income_target: inc,
                expense_target: exp
             })
          });
       } catch (err) { console.error(err); }
    }
    setBudgetTarget({ income: inc, expense: exp });
    setIsEditingBudget(false);
  };

  const openBudgetEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempBudget({
       income: budgetTarget.income.toString(),
       expense: budgetTarget.expense.toString()
    });
    setIsEditingBudget(true);
  };

  const formatEditBudget = (val: string) => {
    if (!val) return "";
    return new Intl.NumberFormat("id-ID").format(Number(val));
  };

  const handleMonthChange = (e: React.MouseEvent, offset: number) => {
    e.stopPropagation();
    setSelectedDate(prev => offset > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  // Basic overview calculations
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Month-specific calculations based on selectedDate
  const monthlyExpenseTransactions = transactions.filter(
    (t) => t.type === "expense" && getMonth(parseISO(t.date)) + 1 === selectedMonth && getYear(parseISO(t.date)) === selectedYear
  );
  const monthlyIncomeTransactions = transactions.filter(
    (t) => t.type === "income" && getMonth(parseISO(t.date)) + 1 === selectedMonth && getYear(parseISO(t.date)) === selectedYear
  );

  const selectedMonthExpense = monthlyExpenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const selectedMonthIncome = monthlyIncomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Current month (for the top overview card)
  const currentMonthlyExpense = transactions
    .filter((t) => t.type === "expense" && isThisMonth(parseISO(t.date)))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const weeklyExpense = transactions
    .filter((t) => t.type === "expense" && isThisWeek(parseISO(t.date), { weekStartsOn: 1 }))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentMonthlyIncome = transactions
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
                      <span className="text-sm text-white/95 truncate">{formatCurrency(currentMonthlyIncome)}</span>
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
                      <span className="text-sm text-white/95 truncate">{formatCurrency(currentMonthlyExpense)}</span>
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
          <motion.div variants={itemVariants} onClick={() => setShowBudgetDetails(true)} className="bg-bg-card rounded-3xl p-6 border border-sand shadow-sm relative overflow-hidden cursor-pointer group hover:border-clay/30 transition-colors">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-500"></div>
            
            <div className="flex flex-col mb-4 relative z-10 w-full relative">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Target className="w-5 h-5" />
                     </div>
                     <div>
                        <h4 className="font-bold text-text-main text-sm">Target Anggaran</h4>
                        <div className="relative inline-flex mt-0.5">
                           <button onClick={(e) => { e.stopPropagation(); setShowMonthDropdown(!showMonthDropdown); }} className="flex items-center gap-1 text-[11px] font-bold text-text-main hover:text-clay transition-colors px-2 py-0.5 bg-sand/30 rounded-full">
                              {format(selectedDate, "LLLL yyyy", { locale: id })}
                              <ChevronDown className="w-3 h-3" />
                           </button>
                           {showMonthDropdown && (
                              <div className="absolute top-full text-xs left-0 mt-1 bg-white border border-sand rounded-xl shadow-xl z-50 overflow-hidden w-48">
                                 {Array.from({length: 12}).map((_, i) => (
                                    <div key={i} className="px-3 py-2 hover:bg-sand/30 cursor-pointer" onClick={(e) => {
                                       e.stopPropagation();
                                       setSelectedDate(new Date(selectedYear, i, 1));
                                       setShowMonthDropdown(false);
                                    }}>
                                       {format(new Date(selectedYear, i, 1), "LLLL yyyy", { locale: id })}
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                     <button onClick={(e) => handleMonthChange(e, -1)} className="p-1 hover:bg-sand/50 rounded-full transition-colors"><ChevronLeft className="w-4 h-4 text-text-muted" /></button>
                     <button onClick={(e) => handleMonthChange(e, 1)} className="p-1 hover:bg-sand/50 rounded-full transition-colors"><ChevronRight className="w-4 h-4 text-text-muted" /></button>
                     <button onClick={openBudgetEditor} className="p-1.5 ml-2 hover:bg-amber-500/10 rounded-full text-amber-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {/* Expense Target */}
               <div className="space-y-3 relative z-10 w-full mb-5">
                  <div className="flex justify-between items-end">
                     <div>
                        <span className="text-[10px] text-clay/80 font-bold uppercase tracking-wider block mb-1">Pengeluaran</span>
                        <span className="font-black text-lg text-text-main">{formatCurrency(selectedMonthExpense)}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Target Batas</span>
                        <span className="font-bold text-sm text-text-muted">{formatCurrency(budgetTarget.expense)}</span>
                     </div>
                  </div>
                  
                  <div className="w-full h-2.5 bg-sand/50 rounded-full overflow-hidden relative">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((selectedMonthExpense / budgetTarget.expense) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${selectedMonthExpense > budgetTarget.expense ? 'bg-clay shadow-[0_0_10px_rgba(240,113,103,0.5)]' : 'bg-gradient-to-r from-red-400 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                     ></motion.div>
                  </div>
               </div>

               {/* Income Target */}
               <div className="space-y-3 relative z-10 w-full">
                  <div className="flex justify-between items-end">
                     <div>
                        <span className="text-[10px] text-nature-green/80 font-bold uppercase tracking-wider block mb-1">Pemasukan</span>
                        <span className="font-black text-lg text-text-main">{formatCurrency(selectedMonthIncome)}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Target Minimal</span>
                        <span className="font-bold text-sm text-text-muted">{formatCurrency(budgetTarget.income)}</span>
                     </div>
                  </div>
                  
                  <div className="w-full h-2.5 bg-sand/50 rounded-full overflow-hidden relative">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((selectedMonthIncome / budgetTarget.income) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${selectedMonthIncome >= budgetTarget.income ? 'bg-nature-green shadow-[0_0_10px_rgba(40,167,69,0.5)]' : 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                     ></motion.div>
                  </div>
               </div>
            </div>
            {/* Click to expand text icon */}
            <div className="absolute bottom-2 right-4 text-[10px] text-text-muted font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               Klik untuk detail bulan ini <ArrowUpRight className="w-3 h-3" />
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
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-text-muted mb-2">Target Pemasukan (Rp)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-nature-green font-bold">Rp</span>
                    </div>
                    <input 
                      type="text" 
                      value={formatEditBudget(tempBudget.income)}
                      onChange={(e) => setTempBudget(prev => ({...prev, income: e.target.value.replace(/\D/g, "")}))}
                      className="w-full bg-bg-card border-2 border-sand rounded-2xl py-3 pl-12 pr-4 text-lg font-black text-text-main focus:outline-none focus:border-nature-green transition-colors"
                      placeholder="5.000.000"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-text-muted mb-2">Batas Pengeluaran (Rp)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-clay font-bold">Rp</span>
                    </div>
                    <input 
                      type="text" 
                      value={formatEditBudget(tempBudget.expense)}
                      onChange={(e) => setTempBudget(prev => ({...prev, expense: e.target.value.replace(/\D/g, "")}))}
                      className="w-full bg-bg-card border-2 border-sand rounded-2xl py-3 pl-12 pr-4 text-lg font-black text-text-main focus:outline-none focus:border-amber-500 transition-colors"
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
        
        {showBudgetDetails && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBudgetDetails(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto z-[70] bg-bg-base rounded-t-3xl border-t border-sand shadow-2xl p-6 pb-8"
            >
              <div className="max-w-md mx-auto">
                <div className="w-12 h-1.5 bg-sand rounded-full mx-auto mb-6" />
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold text-text-main">Detail Transaksi {format(selectedDate, "LLLL yyyy", { locale: id })}</h3>
                  <button onClick={() => setShowBudgetDetails(false)} className="p-2 bg-sand/50 rounded-full text-text-muted hover:text-text-main transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                   <div>
                      <h4 className="text-sm font-bold text-nature-green mb-3 uppercase tracking-wider flex items-center justify-between border-b border-sand pb-1">
                         Pemasukan
                      </h4>
                      <div className="space-y-2">
                         {monthlyIncomeTransactions.length === 0 ? (
                            <p className="text-xs text-text-muted italic">Belum ada pemasukan bulan ini.</p>
                         ) : (
                            monthlyIncomeTransactions.slice(0, 3).map((t) => {
                               const { icon: Icon, color, bg } = getCategoryStyle(t.category, 'income');
                               return (
                                  <div key={t.id} className="flex justify-between items-center bg-bg-card p-3 rounded-2xl border border-sand/50">
                                     <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
                                        <div>
                                           <h4 className="font-bold text-text-main text-sm max-w-[150px] line-clamp-1">{t.description}</h4>
                                           <p className="text-[10px] text-text-muted font-medium">{format(parseISO(t.date), "dd MMM")}</p>
                                        </div>
                                     </div>
                                     <span className="font-bold text-sm text-nature-green">+{formatCurrency(t.amount)}</span>
                                  </div>
                               );
                            })
                         )}
                      </div>
                   </div>

                   <div>
                      <h4 className="text-sm font-bold text-clay mb-3 uppercase tracking-wider flex items-center justify-between border-b border-sand pb-1">
                         Pengeluaran
                      </h4>
                      <div className="space-y-2">
                         {monthlyExpenseTransactions.length === 0 ? (
                            <p className="text-xs text-text-muted italic">Belum ada pengeluaran bulan ini.</p>
                         ) : (
                            monthlyExpenseTransactions.slice(0, 3).map((t) => {
                               const { icon: Icon, color, bg } = getCategoryStyle(t.category, 'expense');
                               return (
                                  <div key={t.id} className="flex justify-between items-center bg-bg-card p-3 rounded-2xl border border-sand/50">
                                     <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
                                        <div>
                                           <h4 className="font-bold text-text-main text-sm max-w-[150px] line-clamp-1">{t.description}</h4>
                                           <p className="text-[10px] text-text-muted font-medium">{format(parseISO(t.date), "dd MMM")}</p>
                                        </div>
                                     </div>
                                     <span className="font-bold text-sm text-clay">-{formatCurrency(t.amount)}</span>
                                  </div>
                               );
                            })
                         )}
                      </div>
                   </div>

                   <button 
                      onClick={() => {
                         setShowBudgetDetails(false);
                         onNavigate?.('history', { dateFrom: format(new Date(selectedYear, selectedMonth - 1, 1), "yyyy-MM-dd"), dateTo: format(new Date(selectedYear, selectedMonth, 0), "yyyy-MM-dd") });
                      }}
                      className="w-full mt-4 bg-clay/10 text-clay border border-clay/20 font-bold py-3 text-sm rounded-xl hover:bg-clay/20 transition-colors"
                   >
                     Lihat Riwayat Lengkap
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

