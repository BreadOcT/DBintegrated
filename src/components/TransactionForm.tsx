import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  Transaction,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../types";
import { Button } from "./ui/Button";
import { Plus, ShoppingBag, Check, X, Pencil } from "lucide-react";
import { motion } from "motion/react";
import { useSettings } from "../hooks/useSettings";

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
  const { t, language } = useSettings();
  
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
  const [items, setItems] = useState<any[]>(initialData?.items || []);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Recalculate amount if items array has items
  React.useEffect(() => {
    if (items.length > 0) {
      const total = items.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0);
      setAmount(total.toString());
    }
  }, [items]);

  // Click outside card to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest('[data-ignore-click-outside="true"]')) {
        return;
      }
      if (cardRef.current && !cardRef.current.contains(target)) {
        setNewItemName("");
        setNewItemPrice("");
        setNewItemQty("1");
        setIsAddingItem(false);
        setEditingItemIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      return alert(language === 'en' ? "Item name cannot be empty" : "Nama item tidak boleh kosong");
    }
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price < 0) {
      return alert(language === 'en' ? "Invalid price" : "Harga tidak valid");
    }
    const qty = parseInt(newItemQty) || 1;

    const newItem = {
      name: newItemName.trim(),
      price,
      qty
    };

    if (editingItemIdx !== null) {
      const updated = [...items];
      updated[editingItemIdx] = newItem;
      setItems(updated);
    } else {
      setItems([...items, newItem]);
    }

    setNewItemName("");
    setNewItemPrice("");
    setNewItemQty("1");
    setIsAddingItem(false);
    setEditingItemIdx(null);
  };

  const handleCancelAddItem = () => {
    setNewItemName("");
    setNewItemPrice("");
    setNewItemQty("1");
    setIsAddingItem(false);
    setEditingItemIdx(null);
  };

  const handleStartEdit = (index: number) => {
    setEditingItemIdx(index);
    setNewItemName(items[index].name);
    setNewItemQty(items[index].qty.toString());
    setNewItemPrice(items[index].price.toString());
    setIsAddingItem(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
    if (editingItemIdx === index) {
      handleCancelAddItem();
    }
  };

  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      return alert(language === 'en' ? "Invalid amount" : "Nominal tidak valid");
    }

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
          ? t('trxForm.reviewTitle')
          : isEditMode
            ? t('trxForm.editTitle')
            : t('trxForm.addTitle')}
      </h2>

      {isReviewMode && (
        <div className="mb-6 p-4 bg-orange-100 border border-orange-200 text-orange-800 rounded-2xl text-sm shadow-sm flex flex-col items-center text-center">
          <span className="font-bold mb-1">{language === 'en' ? 'Attention!' : 'Perhatian!'}</span>
          <span>{t('trxForm.reviewDesc')}</span>
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
            {t('dashboard.expense')}
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
            {t('dashboard.income')}
          </button>
        </div>

        {/* Amount Input */}
        <div className="flex flex-col items-center px-4">
          <span className="text-text-muted font-bold text-xs uppercase tracking-widest mb-3">
            {type === "expense" ? t('trxForm.expenseAmount') : t('trxForm.incomeAmount')}
          </span>
          <div className="relative flex items-center justify-center w-full mb-6">
            <span className="text-3xl font-bold text-text-muted mr-3">Rp</span>
            <input
              type="number"
              required
              min="0"
              disabled={items.length > 0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`font-black bg-transparent text-center focus:outline-none w-full max-w-full px-4 placeholder-sand/50 transition-all ${
                amount.length > 12 
                  ? "text-2xl sm:text-3xl" 
                  : amount.length > 8 
                    ? "text-3xl sm:text-4xl" 
                    : "text-4xl sm:text-5xl md:text-6xl"
              } ${items.length > 0 ? "opacity-60 cursor-not-allowed" : ""} ${
                type === "expense" ? "text-clay focus:text-clay" : "text-nature-green focus:text-nature-green"
              }`}
              placeholder="0"
            />
          </div>

          {items.length > 0 && (
            <p className="text-xs font-bold text-clay animate-pulse mb-4">
              {t('trxForm.autoFilled')}
            </p>
          )}

          {/* Quick Config */}
          {items.length === 0 && (
            <div className="flex flex-wrap gap-2 w-full justify-center">
              {[10000, 20000, 50000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${amount === preset.toString() ? (type === "expense" ? "bg-clay text-white shadow-md shadow-clay/20 border border-clay" : "bg-nature-green text-white shadow-md shadow-nature-green/20 border border-nature-green") : "bg-bg-card text-text-muted border border-sand hover:bg-sand/30 hover:text-text-main"}`}
                >
                  {preset.toLocaleString(language === 'en' ? 'en-US' : 'id-ID')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full bg-sand/50 my-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">
              {t('trxForm.date')}
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
              {t('trxForm.category')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-sand rounded-2xl shadow-sm focus:border-clay focus:ring-clay border p-4 bg-bg-card text-text-main font-bold outline-none transition-all hover:border-clay/50 appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">
              {t('trxForm.description')}
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-sand rounded-2xl shadow-sm focus:border-clay focus:ring-clay border p-4 bg-bg-card text-text-main font-semibold outline-none transition-all hover:border-clay/50 placeholder:font-normal font-bold"
              placeholder={t('trxForm.descriptionPlaceholder')}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">
              {t('trxForm.storeName')}
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full border-sand rounded-2xl shadow-sm focus:border-clay focus:ring-clay border p-4 bg-bg-card text-text-main font-semibold outline-none transition-all hover:border-clay/50 placeholder:font-normal font-bold"
              placeholder={t('trxForm.storeNamePlaceholder')}
            />
          </div>
        </div>

        {/* Section: Rincian Item */}
        <div className="flex flex-col gap-4 bg-sand/10 p-5 rounded-3xl border border-sand/40 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#68B943]/10 text-[#68B943] rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-black text-text-main">
                  {t('trxForm.itemDetails')}
                </label>
              </div>
            </div>
            
            {items.length > 0 && (
              <span className="text-xs font-bold text-[#68B943] bg-[#68B943]/10 px-2.5 py-1 rounded-full">
                {items.length} {t('trxForm.item')}
              </span>
            )}
          </div>

          {/* List of current items */}
          {items.length > 0 && (
            <div className="space-y-2 pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-card p-4 border border-sand/50 rounded-2xl shadow-sm text-sm">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#68B943]/10 text-[#68B943] text-xs font-black flex items-center justify-center shrink-0">
                      {item.qty || 1}x
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-extrabold text-text-main text-sm break-words whitespace-normal block">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-sand/30">
                    <span className="font-black text-purple-700 text-sm whitespace-nowrap">
                      Rp {((item.price || 0) * (item.qty || 1)).toLocaleString(language === 'en' ? 'en-US' : 'id-ID')}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        data-ignore-click-outside="true"
                        onClick={() => handleStartEdit(idx)}
                        className={`p-2 rounded-xl transition-colors ${editingItemIdx === idx ? 'bg-[#68B943]/10 text-[#68B943]' : 'text-text-muted hover:bg-sand/50 hover:text-text-main'}`}
                        title="Edit Item"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 hover:bg-red-50 rounded-xl text-text-muted hover:text-red-500 transition-colors"
                        title="Hapus Item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Item form card (Green border when active) */}
          {(isAddingItem || editingItemIdx !== null) && (
            <motion.div 
              ref={cardRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-bg-card border-2 border-[#68B943] p-5 rounded-2xl space-y-4 shadow-md"
            >
              <div>
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5 block">
                  {t('trxForm.itemName')}
                </label>
                <input
                  type="text"
                  placeholder={t('trxForm.itemNamePlaceholder')}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full border-b border-sand pb-1 text-sm bg-transparent outline-none focus:border-[#68B943] text-text-main font-semibold placeholder-sand/60 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5 block">
                    {t('trxForm.qty')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="w-full border-b border-sand pb-1 text-sm bg-transparent outline-none focus:border-[#68B943] text-text-main font-semibold text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5 block">
                    {t('trxForm.totalRp')}
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full border-b border-sand pb-1 text-sm bg-transparent outline-none focus:border-[#68B943] text-text-main font-semibold text-right placeholder-sand/60 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelAddItem}
                  className="flex items-center gap-1 text-xs font-bold text-text-muted hover:text-text-main px-3 py-2 rounded-xl transition-all"
                >
                  <X className="w-3.5 h-3.5" /> {t('trxForm.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#68B943] text-white px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> {editingItemIdx !== null ? t('trxForm.save') : t('trxForm.add')}
                </button>
              </div>
            </motion.div>
          )}

          {/* + Tambah button at the bottom of the cards list */}
          {!(isAddingItem || editingItemIdx !== null) && (
            <button
              type="button"
              data-ignore-click-outside="true"
              onClick={() => setIsAddingItem(true)}
              className="flex items-center justify-center gap-1.5 border border-dashed border-[#68B943] bg-white dark:bg-bg-card text-text-main font-bold text-sm py-2.5 px-6 rounded-2xl hover:bg-[#68B943]/5 hover:border-[#68B943] w-full shadow-sm active:scale-95 transition-all mt-2"
            >
              <Plus className="w-4 h-4 text-[#68B943]" /> {t('trxForm.add')}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-6 pb-20">
          <button
            type="submit"
            className={`w-full text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95 ${type === "expense" ? "bg-clay shadow-clay/30" : "bg-nature-green shadow-nature-green/30"}`}
          >
            {isReviewMode
              ? t('trxForm.saveAiScan')
              : isEditMode
                ? t('trxForm.saveChanges')
                : t('trxForm.record')}
          </button>
          {onCancel && (
            <button
              type="button"
              className="w-full border-2 border-sand text-text-main font-bold text-base py-3.5 rounded-2xl hover:bg-sand/30 transition-colors"
              onClick={onCancel}
            >
              {t('trxForm.cancel')}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
