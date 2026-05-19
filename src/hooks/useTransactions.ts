import { useState, useEffect } from "react";
import { Transaction } from "../types";
import { useAuth } from "./useAuth";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Fallback to local storage if no DB is connected, but the API handles the mock now!
  useEffect(() => {
    if (token) {
      fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) {
           if (res.status === 401 || res.status === 403) logout();
           throw new Error("Failed to fetch");
        }
        return res.json();
      })
      .then(data => {
        setTransactions(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [token, logout]);

  const addTransaction = async (t: Omit<Transaction, "id">) => {
    if (!token) return;
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(t)
      });
      if (res.ok) {
        const { id } = await res.json();
        const newTransaction = { ...t, id };
        setTransactions((prev) => [newTransaction, ...prev]);
      } else {
        throw new Error("Failed to add transaction");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
        );
      } else {
        throw new Error("Failed to update transaction");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
       console.error(err);
    }
  };

  // Derived states for convenience
  const income = transactions.filter((t) => t.type === "income");
  const expense = transactions.filter((t) => t.type === "expense");
  const totalIncome = income.reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = expense.reduce((acc, t) => acc + Number(t.amount), 0);
  const totalProfit = totalIncome - totalExpense;

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    income,
    expense,
    totalIncome,
    totalExpense,
    totalProfit,
    isLoading
  };
}
