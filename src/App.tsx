import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { History } from "./components/History";
import { Scanner } from "./components/Scanner";
import { TransactionForm } from "./components/TransactionForm";
import { SimpleAccountingReport } from "./components/Report";
import { Notifications } from "./components/Notifications";
import { useTransactions } from "./hooks/useTransactions";
import { useAuth } from "./hooks/useAuth";
import { Transaction } from "./types";
import { Toast } from "./components/ui/Toast";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";

export default function App() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const [authState, setAuthState] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState("dashboard");
  const tState = useTransactions();
  
  // State for AI scanned values before they are saved
  const [scannedData, setScannedData] = useState<Partial<Transaction> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [historyFilters, setHistoryFilters] = useState<{ type?: 'all' | 'income' | 'expense', startDate?: string, endDate?: string } | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        setAuthState('app');
      } else if (authState === 'app') {
        setAuthState('landing');
      }
    }
  }, [user, isAuthLoading]);

  const handleNavigateToHistory = (filters: any) => {
    setHistoryFilters(filters);
    setActiveTab("history");
  };

  const handleScanSuccess = (data: Partial<Transaction>) => {
    setScannedData(data);
    setEditingId(null);
    setActiveTab("add_review"); // Custom internal state for viewing form after scan
  };

  const handleTransactionSubmit = (data: Omit<Transaction, "id">) => {
    if (editingId) {
      tState.updateTransaction(editingId, data);
      setToastMessage("Berhasil memperbarui transaksi!");
    } else {
      tState.addTransaction(data);
      setToastMessage("Transaksi berhasil disimpan!");
    }
    setScannedData(null);
    setEditingId(null);
    setActiveTab("history"); // Redirect to history after adding
  };

  const handleCancelForm = () => {
    setScannedData(null);
    setEditingId(null);
    setActiveTab("dashboard");
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setScannedData(t);
    setActiveTab("edit");
  };

  const handleLogout = () => {
    logout();
    setAuthState('landing');
    setActiveTab('dashboard');
  };

  if (isAuthLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-bg-base text-clay font-bold">Memuat...</div>;
  }

  if (authState === 'landing' || !user) {
    if (authState === 'login') return <Login onNavigate={setAuthState} />;
    if (authState === 'register') return <Register onNavigate={setAuthState} />;
    return <Landing onNavigate={setAuthState} />;
  }

  return (
    <Layout activeTab={activeTab === "add_review" ? "scan" : activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full h-full"
        >
          {activeTab === "dashboard" && (
            <Dashboard {...tState} onNavigate={setActiveTab} />
          )}
          
          {activeTab === "history" && (
            <History 
              transactions={tState.transactions} 
              onDelete={tState.deleteTransaction} 
              onEdit={handleEdit}
              initialFilters={historyFilters}
            />
          )}

          {activeTab === "scan" && (
            <Scanner onScanSuccess={handleScanSuccess} />
          )}

          {activeTab === "add" && (
            <TransactionForm 
              onSubmit={handleTransactionSubmit} 
              onCancel={handleCancelForm} 
            />
          )}

          {activeTab === "add_review" && (
            <TransactionForm 
              initialData={scannedData || undefined}
              isReviewMode={true}
              onSubmit={handleTransactionSubmit} 
              onCancel={handleCancelForm} 
            />
          )}

          {activeTab === "edit" && (
            <TransactionForm 
              initialData={scannedData || undefined}
              isReviewMode={false}
              isEditMode={true}
              onSubmit={handleTransactionSubmit} 
              onCancel={handleCancelForm} 
            />
          )}

          {activeTab === "report" && (
            <SimpleAccountingReport 
              transactions={tState.transactions} 
              onNavigateToHistory={handleNavigateToHistory}
            />
          )}

          {activeTab === "notifications" && (
            <Notifications />
          )}

          {activeTab === "profile" && (
            <Profile onLogout={handleLogout} />
          )}

          {activeTab === "settings" && (
            <Settings />
          )}
        </motion.div>
      </AnimatePresence>
      <Toast 
        message={toastMessage} 
        isVisible={!!toastMessage} 
        onClose={() => setToastMessage("")} 
      />
    </Layout>
  );
}
