export type TransactionType = "income" | "expense";

export interface TransactionItem {
  name: string;
  price: number;
  qty?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // ISO format
  amount: number;
  category: string;
  description: string;
  storeName?: string;
  items?: TransactionItem[];
}

export const EXPENSE_CATEGORIES = [
  "Bahan Baku",
  "Operasional",
  "Transportasi",
  "Gaji Pegawai",
  "Pemasaran",
  "Lain-lain",
];

export const INCOME_CATEGORIES = [
  "Penjualan Produk",
  "Jasa",
  "Lain-lain",
];
