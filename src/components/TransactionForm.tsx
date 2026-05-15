import React, { useState } from "react";
import { format } from "date-fns";
import {
  Transaction,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../types";
import { Button } from "./ui/Button";
import { Plus } from "lucide-react";
import { motion } from "motion/react";

interface TransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit: (data: Omit<Transaction, "id">) => void;
  onCancel: () => void;
  isReviewMode?: boolean; // If true, implies it came from AI
  isEditMode?: boolean;
}

export function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  isReviewMode = false,
  isEditMode = false,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(
    initialData?.type || "expense",
  );
  const [date, setDate] = useState(
    initialData?.date || format(new Date(), "yyyy-MM-dd"),
  );
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [category, setCategory] = useState(
    initialData?.category || EXPENSE_CATEGORIES[0],
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [storeName, setStoreName] = useState(initialData?.storeName || "");
  const [items, setItems] = useState(initialData?.items || []);

  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return alert("Nominal tidak valid");

    onSubmit({
      type,
      date,
      amount: Number(amount),
      category,
      description,
      storeName,
      items,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="glass-card max-w-2xl mx-auto p-6 md:p-8"
    >
      <h2 className="text-xl md:text-2xl font-extrabold mb-6 text-text-main text-center">
        {isReviewMode
          ? "Tinjau Hasil Scan AI"
          : isEditMode
            ? "Edit Transaksi"
            : "Catat Transaksi"}
      </h2>

      {isReviewMode && (
        <div className="mb-6 p-4 bg-orange-100 border border-orange-200 text-orange-800 rounded-2xl text-sm shadow-sm flex flex-col items-center text-center">
          <span className="font-bold mb-1">Perhatian!</span>
          <span>
            AI telah mengekstrak data dari foto. Silakan periksa dan perbaiki
            jika ada kesalahan.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Modern Segmented Control */}
        <div className="flex bg-sand/50 p-1.5 rounded-2xl mb-8 relative">
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
              type === "expense"
                ? "bg-bg-card text-clay shadow-md"
                : "text-text-muted hover:text-text-main"
            }`}
            onClick={() => {
              setType("expense");
              setCategory(EXPENSE_CATEGORIES[0]);
            }}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
              type === "income"
                ? "bg-bg-card text-nature-green shadow-md"
                : "text-text-muted hover:text-text-main"
            }`}
            onClick={() => {
              setType("income");
              setCategory(INCOME_CATEGORIES[0]);
            }}
          >
            Pemasukan
          </button>
        </div>

        {/* Amount Input */}
        <div className="flex flex-col items-center px-4">
          <span className="text-text-muted font-bold text-xs uppercase tracking-widest mb-3">
            {type === "expense" ? "Nominal Pengeluaran" : "Nominal Pemasukan"}
          </span>
          <div className="relative flex items-center justify-center w-full mb-6">
            <span className="text-3xl font-bold text-text-muted mr-3">Rp</span>
            <input
              type="number"
              required
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`text-5xl md:text-6xl font-black bg-transparent text-center focus:outline-none w-full max-w-[280px] placeholder-sand/50 transition-colors ${type === "expense" ? "text-clay focus:text-clay" : "text-nature-green focus:text-nature-green"}`}
              placeholder="0"
            />
          </div>

          {/* Quick Config */}
          <div className="flex flex-wrap gap-2 w-full justify-center">
            {[10000, 20000, 50000, 100000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${amount === preset.toString() ? (type === "expense" ? "bg-clay text-white shadow-md shadow-clay/20 border border-clay" : "bg-nature-green text-white shadow-md shadow-nature-green/20 border border-nature-green") : "bg-bg-card text-text-muted border border-sand hover:bg-sand/30 hover:text-text-main"}`}
              >
                {preset.toLocaleString("id-ID")}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-sand/50 my-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">
              Tanggal
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-sand rounded-2xl shadow-sm focus:border-clay focus:ring-clay border p-4 bg-bg-card text-text-main font-bold outline-none transition-all hover:border-clay/50"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-sand rounded-2xl shadow-sm focus:border-clay focus:ring-clay border p-4 bg-bg-card text-text-main font-bold outline-none transition-all hover:border-clay/50 appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">
              Keterangan
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-sand rounded-2xl shadow-sm focus:border-clay focus:ring-clay border p-4 bg-bg-card text-text-main font-semibold outline-none transition-all hover:border-clay/50 placeholder:font-normal"
              placeholder="Cth: Makan siang, Transportasi"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">
              Nama Toko (Opsional)
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full border-sand rounded-2xl shadow-sm focus:border-clay focus:ring-clay border p-4 bg-bg-card text-text-main font-semibold outline-none transition-all hover:border-clay/50 placeholder:font-normal"
              placeholder="Cth: Indomaret, Solaria"
            />
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 bg-soft-cream p-4 rounded-xl border border-sand">
            <h4 className="text-sm font-semibold mb-2 text-text-main">
              Item Spesifik dari Nota
            </h4>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-bg-card p-2 border border-sand rounded-lg text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-text-main">
                      {item.name}
                    </span>
                    <span className="text-text-muted text-xs">
                      Qty: {item.qty || 1}
                    </span>
                  </div>
                  <span className="font-bold text-clay">
                    Rp{item.price.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-clay italic mt-2">
              Detail item ini disetel opsional, Anda bisa menyesuaikan deskripsi
              utama di atas.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-6 pb-20">
          <button
            type="submit"
            className={`w-full text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95 ${type === "expense" ? "bg-clay shadow-clay/30" : "bg-nature-green shadow-nature-green/30"}`}
          >
            {isReviewMode
              ? "Simpan Scan AI"
              : isEditMode
                ? "Simpan Perubahan"
                : "Catat Transaksi"}
          </button>
          {onCancel && (
            <button
              type="button"
              className="w-full border-2 border-sand text-text-main font-bold text-base py-3.5 rounded-2xl hover:bg-sand/30 transition-colors"
              onClick={onCancel}
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
