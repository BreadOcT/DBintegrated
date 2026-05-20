import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { Transaction } from "../types";
import { useSettings } from "../hooks/useSettings";
import { 
  Calendar, Filter, Trash2, Edit, Download, AlertTriangle, X, Plus, Minus,
  Home, Briefcase, ShoppingBag, TrendingUp, Bus, Package, Users, Tag, PlusCircle,
  ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";

interface HistoryProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit?: (t: Transaction) => void;
  initialFilters?: {
    type?: "all" | "income" | "expense";
    startDate?: string;
    endDate?: string;
  } | null;
}

export const getCategoryStyle = (category: string, type: 'income' | 'expense') => {
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

export function History({ transactions, onDelete, onEdit, initialFilters }: HistoryProps) {
  const { formatCurrency } = useSettings();
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(initialFilters?.type || "all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>(initialFilters?.startDate || "");
  const [endDate, setEndDate] = useState<string>(initialFilters?.endDate || "");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedTrx, setExpandedTrx] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTrx(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  React.useEffect(() => {
    if (initialFilters) {
      setFilterType(initialFilters.type || "all");
      setStartDate(initialFilters.startDate || "");
      setEndDate(initialFilters.endDate || "");
    }
  }, [initialFilters]);
  
  const filtered = transactions.filter(t => {
    const matchType = filterType === "all" ? true : t.type === filterType;
    const matchCategory = filterCategory === "all" ? true : t.category === filterCategory;
    const tDateOnly = t.date.split("T")[0];
    const matchStart = startDate ? tDateOnly >= startDate : true;
    const matchEnd = endDate ? tDateOnly <= endDate : true;
    return matchType && matchCategory && matchStart && matchEnd;
  });

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  const exportCSV = () => {
    const headers = ["ID", "Tanggal", "Tipe", "Kategori", "Keterangan", "Nama Toko", "Nominal"];
    const rows = filtered.map(t => [
      t.id,
      t.date,
      t.type === "income" ? "Pemasukan" : "Pengeluaran",
      t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${(t.storeName || "").replace(/"/g, '""')}"`,
      t.amount
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `laporan_keuangan_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const groupedTransactions = filtered.reduce((acc, t) => {
    if (!acc[t.date]) {
      acc[t.date] = [];
    }
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const groupedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <>
      <div className="pt-2 pb-24 max-w-lg mx-auto lg:max-w-none">
        <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-xl font-extrabold text-text-main">Riwayat Transaksi</h2>
        <button 
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full transition-colors text-clay bg-clay/10 hover:bg-clay/20"
          onClick={exportCSV}
        >
          <Download className="h-3 w-3"/> Ekspor
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6 px-1">
        <div className="grid grid-cols-3 gap-2">
          {["all", "income", "expense"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-2 py-2.5 text-[11px] sm:text-xs font-bold rounded-xl text-center transition-colors ${
                filterType === type 
                  ? "bg-clay text-white shadow-md shadow-clay/20" 
                  : "bg-bg-card text-text-muted border border-sand hover:border-clay"
              }`}
            >
              {type === "all" ? "Semua" : type === "income" ? "Pemasukan" : "Pengeluaran"}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center justify-center gap-2 bg-bg-card border border-sand rounded-xl px-4 py-2.5 text-text-main font-bold hover:bg-sand/30 transition-colors w-full sm:w-auto"
        >
          <Filter className="w-4 h-4 text-clay" /> Cari / Filter Berdasarkan
          {(filterCategory !== "all" || startDate || endDate) && (
            <span className="w-2 h-2 rounded-full bg-clay ml-1"></span>
          )}
        </button>
      </div>

      <div className="space-y-8 px-1">
        <AnimatePresence>
          {groupedDates.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="py-12 text-center text-text-muted text-sm bg-sand/20 rounded-2xl border border-dashed border-sand"
            >
              Belum ada transaksi untuk filter ini.
            </motion.div>
          ) : (
            groupedDates.map(date => {
              const dateTransactions = groupedTransactions[date];
              
              const totalIncome = dateTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
              const totalExpense = dateTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

              return (
                <motion.div 
                  key={`group-${date}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="flex justify-between items-end border-b border-sand pb-2 mb-3">
                    <h3 className="text-sm font-extrabold text-text-main">
                      {format(parseISO(date), "dd MMMM yyyy")}
                    </h3>
                    <div className="flex gap-3 text-[10px] font-bold">
                      {totalIncome > 0 && <span className="text-nature-green">+{formatCurrency(totalIncome)}</span>}
                      {totalExpense > 0 && <span className="text-clay">-{formatCurrency(totalExpense)}</span>}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {dateTransactions.map(t => {
                      const { icon: Icon, color, bg } = getCategoryStyle(t.category, t.type as 'income' | 'expense');
                      const hasItems = t.items && t.items.length > 0;
                      const isExpanded = !!expandedTrx[t.id];
                      return (
                        <motion.div 
                          key={`card-${t.id}`}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col bg-bg-card p-3 sm:p-4 rounded-2xl shadow-sm border border-sand/50 hover:border-sand transition-colors"
                        >
                          <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex flex-shrink-0 items-center justify-center transition-colors ${bg} ${color}`}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <p className={`text-[9px] sm:text-[10px] mb-0.5 uppercase tracking-wider font-semibold truncate ${color}`}>{t.category}</p>
                                <h4 className="font-bold text-text-main text-xs sm:text-sm truncate">{t.description}</h4>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {t.storeName && (
                                    <span className="text-[9px] sm:text-[10px] text-text-muted mt-0.5 font-semibold bg-sand/35 px-1.5 py-0.5 rounded truncate">{t.storeName}</span>
                                  )}
                                  {hasItems && (
                                    <button 
                                      onClick={() => toggleExpand(t.id)} 
                                      className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-clay bg-clay/10 hover:bg-clay/20 px-1.5 py-0.5 rounded transition-all mt-0.5 active:scale-95"
                                    >
                                      {isExpanded ? "Sembunyikan Rincian" : `Rincian (${t.items.length})`}
                                      {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0 pl-1 border-l border-sand/30">
                              <div className={`font-bold text-[11px] sm:text-sm break-all max-w-[120px] text-right mb-1.5 ${t.type === 'income' ? 'text-nature-green' : 'text-clay'}`}>
                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                              </div>
                              <div className="flex items-center gap-1">
                                {onEdit && (
                                  <button onClick={() => onEdit(t)} className="text-text-muted hover:text-clay p-1 rounded-md bg-sand/30 hover:bg-sand/50 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                                )}
                                <button onClick={() => setDeleteId(t.id)} className="text-text-muted hover:text-rose-600 p-1 rounded-md bg-sand/30 hover:bg-rose-100 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </div>
                          </div>

                          {/* Collapsible item details */}
                          {hasItems && isExpanded && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-sand/30 pl-10 sm:pl-16 pr-1"
                            >
                              <div className="space-y-1.5">
                                {t.items!.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-[11px] sm:text-xs text-text-main font-medium py-0.5 border-b border-dashed border-sand/30 last:border-0">
                                    <span className="flex items-center gap-1 text-text-main truncate max-w-[150px] sm:max-w-xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-clay/60 shrink-0"></span>
                                      <span className="truncate">{item.name}</span> 
                                      <span className="text-text-muted text-[9px] sm:text-[10px] ml-1 bg-sand/30 px-1 rounded shrink-0">x{item.qty || 1}</span>
                                    </span>
                                    <span className="font-extrabold text-clay shrink-0">
                                      {formatCurrency((item.price || 0) * (item.qty || 1))}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
      </div>

      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
              onClick={() => setDeleteId(null)}
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-bg-card border border-sand shadow-xl rounded-2xl p-6 max-w-sm w-full pointer-events-auto"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <button onClick={() => setDeleteId(null)} className="text-text-muted hover:text-text-main">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-text-main mb-2">Hapus Transaksi?</h3>
                <p className="text-text-muted text-sm mb-6">
                  Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus permanen dari riwayat Anda.
                </p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Batal</Button>
                  <Button variant="danger" className="flex-1" onClick={confirmDelete}>Hapus</Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
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
                  <h3 className="text-xl font-extrabold text-text-main flex items-center gap-2">
                    <Filter className="w-5 h-5 text-clay" /> Cari & Filter
                  </h3>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-sand/50 rounded-full text-text-muted hover:text-text-main transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">Pilih Kategori</label>
                    <select 
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-bg-card border-2 border-sand rounded-xl px-4 py-3 text-text-main font-bold focus:outline-none focus:border-clay transition-colors"
                    >
                      <option value="all">Semua Kategori</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">Rentang Tanggal</label>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-bg-card border-2 border-sand rounded-xl px-3 py-3 text-text-main focus:outline-none focus:border-clay font-bold w-full transition-colors text-sm sm:text-base"
                      />
                      <span className="text-text-muted hidden sm:block font-bold">-</span>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-bg-card border-2 border-sand rounded-xl px-3 py-3 text-text-main focus:outline-none focus:border-clay font-bold w-full transition-colors text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                  <button 
                    onClick={() => {
                      setFilterCategory("all");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl text-text-main font-bold hover:bg-sand/50 transition-colors border-2 border-transparent hover:border-sand"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full sm:flex-1 bg-gradient-to-r from-clay to-nature-orange text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    Terapkan Filter
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
