import React, { useState } from "react";
import { Transaction } from "../types";
import { useSettings } from "../hooks/useSettings";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { format, parseISO, subDays, endOfMonth, parse } from "date-fns";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, ArrowRight, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { getCategoryStyle } from "./History";

interface SimpleAccountingReportProps {
  transactions: Transaction[];
  onNavigateToHistory?: (filters: any) => void;
}

export function SimpleAccountingReport({ transactions, onNavigateToHistory }: SimpleAccountingReportProps) {
  const { formatCurrency } = useSettings();
  const [timeFilter, setTimeFilter] = useState("Mingguan");

  let expenseChartData = [];
  let incomeChartData = [];

  if (timeFilter === "Mingguan") {
    const filterDays = 7;
    const dateRange = Array.from({ length: filterDays }).map((_, i) =>
      format(subDays(new Date(), (filterDays - 1) - i), "yyyy-MM-dd")
    );
    
    expenseChartData = dateRange.map((date) => {
      const dayTransactions = transactions.filter((t) => t.type === "expense" && t.date.startsWith(date));
      const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      const categories = dayTransactions.reduce((acc, t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) existing.value += t.amount;
        else acc.push({ name: t.category, value: t.amount });
        return acc;
      }, [] as {name: string, value: number}[]);

      return {
        date: format(parseISO(date), "dd MMM"),
        rawStartDate: date,
        rawEndDate: date,
        value: total,
        categories: categories.sort((a, b) => b.value - a.value)
      };
    });

    incomeChartData = dateRange.map((date) => {
      const dayTransactions = transactions.filter((t) => t.type === "income" && t.date.startsWith(date));
      const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      const categories = dayTransactions.reduce((acc, t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) existing.value += t.amount;
        else acc.push({ name: t.category, value: t.amount });
        return acc;
      }, [] as {name: string, value: number}[]);

      return {
        date: format(parseISO(date), "dd MMM"),
        rawStartDate: date,
        rawEndDate: date,
        value: total,
        categories: categories.sort((a, b) => b.value - a.value)
      };
    });
  } else {
    // Bulanan -> 6 months
    const filterMonths = 6;
    const dateRange = Array.from({ length: filterMonths }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - ((filterMonths - 1) - i));
      return format(d, "yyyy-MM");
    });
    
    expenseChartData = dateRange.map((month) => {
      const monthTransactions = transactions.filter((t) => t.type === "expense" && t.date.startsWith(month));
      const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      const categories = monthTransactions.reduce((acc, t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) existing.value += t.amount;
        else acc.push({ name: t.category, value: t.amount });
        return acc;
      }, [] as {name: string, value: number}[]);

      return {
        date: format(new Date(`${month}-01T00:00:00`), "MMM yyyy"),
        rawStartDate: `${month}-01`,
        rawEndDate: format(endOfMonth(new Date(`${month}-01T00:00:00`)), "yyyy-MM-dd"),
        value: total,
        categories: categories.sort((a, b) => b.value - a.value)
      };
    });

    incomeChartData = dateRange.map((month) => {
      const monthTransactions = transactions.filter((t) => t.type === "income" && t.date.startsWith(month));
      const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      const categories = monthTransactions.reduce((acc, t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) existing.value += t.amount;
        else acc.push({ name: t.category, value: t.amount });
        return acc;
      }, [] as {name: string, value: number}[]);

      return {
        date: format(new Date(`${month}-01T00:00:00`), "MMM yyyy"),
        rawStartDate: `${month}-01`,
        rawEndDate: format(endOfMonth(new Date(`${month}-01T00:00:00`)), "yyyy-MM-dd"),
        value: total,
        categories: categories.sort((a, b) => b.value - a.value)
      };
    });
  }

  // Aggregate data by date for Line chart
  const chartData = expenseChartData.map((exp, i) => {
    return {
      date: exp.date,
      Pengeluaran: exp.value,
      Pendapatan: incomeChartData[i].value,
    };
  });

  const totalExpense = expenseChartData.reduce((sum, item) => sum + item.value, 0);
  const totalIncome = incomeChartData.reduce((sum, item) => sum + item.value, 0);

  const recentExpenses = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
    
  const recentIncomes = transactions
    .filter(t => t.type === 'income')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const handleBarClick = (data: any, type: 'income' | 'expense') => {
    if (onNavigateToHistory && data) {
      const payloadData = data.payload || (data.activePayload && data.activePayload[0] && data.activePayload[0].payload) || data;
      if (payloadData && payloadData.rawStartDate) {
        onNavigateToHistory({
          type,
          startDate: payloadData.rawStartDate,
          endDate: payloadData.rawEndDate
        });
      }
    }
  };

  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-card p-4 rounded-2xl border border-sand shadow-xl z-50 min-w-[200px]">
          <p className="font-bold text-sm mb-3 text-text-main border-b border-sand pb-2">{data.date}</p>
          <div className="space-y-2">
            {data.categories.length > 0 ? data.categories.map((c: any) => (
              <div key={c.name} className="flex justify-between items-center gap-6 text-xs">
                <span className="text-text-muted">{c.name}</span>
                <span className="font-bold text-text-main">{formatCurrency(c.value)}</span>
              </div>
            )) : (
              <p className="text-xs text-text-muted italic">Tidak ada data transaksi</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-sand flex justify-between items-center text-sm font-black">
            <span className="text-text-main">Total:</span>
            <span className={payload[0].dataKey === "value" && payload[0].color === "#ef4444" ? "text-clay" : "text-nature-green"}>
              {formatCurrency(data.value)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pt-2 max-w-lg mx-auto lg:max-w-none"
    >
      <div className="flex justify-between items-center px-2 mb-4">
        <h2 className="text-xl font-extrabold text-text-main">Statistik</h2>
      </div>

      <div className="glass-card p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-text-main">Tren Arus Kas</h3>
          <div className="flex bg-sand/30 p-1 rounded-full">
            {["Mingguan", "Bulanan"].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-300 ${
                  timeFilter === filter
                    ? "bg-nature-green text-white shadow-sm"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f05f3b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f05f3b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22da47" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22da47" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} minTickGap={timeFilter === "Bulanan" ? 15 : 5} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="Pengeluaran" stroke="#f05f3b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Pengeluaran" />
              <Line type="monotone" dataKey="Pendapatan" stroke="#22da47" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Pendapatan" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
        <div className="bg-gradient-to-br from-nature-green to-emerald-500 rounded-3xl p-4 md:p-5 text-white shadow-lg shadow-nature-green/30 flex items-center gap-3 md:gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="bg-white/20 p-2.5 md:p-3 rounded-2xl border border-white/30 shadow-inner z-10 shrink-0">
            <ArrowDownLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div className="z-10 flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-white/90 mb-0.5">Pemasukan</p>
            <p className="font-extrabold text-base md:text-xl tracking-tight truncate" title={formatCurrency(totalIncome)}>{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-clay to-rose-500 rounded-3xl p-4 md:p-5 text-white shadow-lg shadow-clay/30 flex items-center gap-3 md:gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="bg-white/20 p-2.5 md:p-3 rounded-2xl border border-white/30 shadow-inner z-10 shrink-0">
            <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div className="z-10 flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-white/90 mb-0.5">Pengeluaran</p>
            <p className="font-extrabold text-base md:text-xl tracking-tight truncate" title={formatCurrency(totalExpense)}>{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 shadow-sm mt-6 mb-24">
        <h3 className="font-bold text-text-main mb-6">Distribusi Kategori ({timeFilter})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 text-center">Pengeluaran</h4>
            <div className="h-48 flex items-center justify-center mb-6">
              {totalExpense > 0 ? (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} onClick={(data) => handleBarClick(data, 'expense')}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} minTickGap={5} />
                      <YAxis hide />
                      <Tooltip content={<CustomCategoryTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} style={{ filter: 'drop-shadow(0px -2px 6px rgba(239,68,68,0.4))', cursor: 'pointer' }} onClick={(data) => handleBarClick(data, 'expense')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-text-muted text-sm">Belum ada data</div>
              )}
            </div>
            
            <div className="flex-1">
              <h5 className="text-xs font-extrabold text-text-main mb-3 px-1">Riwayat Pengeluaran</h5>
              <div className="glass-card divide-y divide-sand border border-sand shadow-sm bg-white/50">
                {recentExpenses.length > 0 ? (
                  recentExpenses.map(expense => {
                    const { icon: Icon, color, bg } = getCategoryStyle(expense.category, 'expense');
                    return (
                      <div key={expense.id} className="p-3 flex items-center justify-between hover:bg-sand/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl cursor-pointer" onClick={() => onNavigateToHistory && onNavigateToHistory({ type: 'expense' })}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-text-main text-xs truncate max-w-[120px]">{expense.storeName || expense.description}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{format(parseISO(expense.date), "dd MMM")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-clay text-xs">- {formatCurrency(expense.amount)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-text-muted text-xs">Belum ada pengeluaran</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 text-center">Pendapatan</h4>
            <div className="h-48 flex items-center justify-center mb-6">
              {totalIncome > 0 ? (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} onClick={(data) => handleBarClick(data, 'income')}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} minTickGap={5} />
                      <YAxis hide />
                      <Tooltip content={<CustomCategoryTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} style={{ filter: 'drop-shadow(0px -2px 6px rgba(34,197,94,0.4))', cursor: 'pointer' }} onClick={(data) => handleBarClick(data, 'income')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-text-muted text-sm">Belum ada data</div>
              )}
            </div>
            
            <div className="flex-1">
              <h5 className="text-xs font-extrabold text-text-main mb-3 px-1">Riwayat Pendapatan</h5>
              <div className="glass-card divide-y divide-sand border border-sand shadow-sm bg-white/50">
                {recentIncomes.length > 0 ? (
                  recentIncomes.map(income => {
                    const { icon: Icon, color, bg } = getCategoryStyle(income.category, 'income');
                    return (
                      <div key={income.id} className="p-3 flex items-center justify-between hover:bg-sand/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl cursor-pointer" onClick={() => onNavigateToHistory && onNavigateToHistory({ type: 'income' })}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-text-main text-xs truncate max-w-[120px]">{income.storeName || income.description}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{format(parseISO(income.date), "dd MMM")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-nature-green text-xs">+ {formatCurrency(income.amount)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-text-muted text-xs">Belum ada pendapatan</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => onNavigateToHistory && onNavigateToHistory({ type: 'all' })}
          className="mt-8 glass-card w-full p-4 flex items-center justify-center gap-2 hover:bg-sand/30 transition-colors group"
        >
          <span className="font-bold text-text-main text-sm">Lihat riwayat lengkap</span>
          <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-clay transition-colors" />
        </button>
      </div>
    </motion.div>
  );
}
