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
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";

export default function App() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const [authState, setAuthState] = useState<'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'app'>('landing');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const tState = useTransactions();
  
  // State for AI scanned values before they are saved
  const [scannedData, setScannedData] = useState<Partial<Transaction> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [historyFilters, setHistoryFilters] = useState<{ type?: 'all' | 'income' | 'expense', startDate?: string, endDate?: string } | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user && authState !== 'app') {
        setAuthState('app');
      } else if (!user && authState === 'app') {
        setAuthState('landing');
      }
    }
  }, [user, isAuthLoading, authState]);

  useEffect(() => {
    // Check URL parameters for reset token
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
      setAuthState('reset-password');
    }
  }, []);

  const handleNavigateToHistory = (filters: any) => {
    setHistoryFilters(filters);
    setActiveTab("history");
  };

  const handleScanSuccess = (data: Partial<Transaction>) => {
    setScannedData(data);
    setEditingId(null);
    setActiveTab("add_review"); // Custom internal state for viewing form after scan
  };

  const handleTransactionSubmit = async (data: Omit<Transaction, "id">) => {
    try {
      if (editingId) {
        await tState.updateTransaction(editingId, data);
        setToastMessage("Berhasil memperbarui transaksi!");
      } else {
        await tState.addTransaction(data);
        setToastMessage("Transaksi berhasil disimpan!");
      }
      setScannedData(null);
      setEditingId(null);
      setActiveTab("history"); // Redirect to history after adding
    } catch (error) {
      setToastMessage("Gagal menyimpan transaksi! Silakan coba lagi.");
    }
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

  const handleDashboardNavigate = (tab: string, filters?: any) => {
    if (tab === 'history' && filters) {
       handleNavigateToHistory(filters);
    } else {
       setActiveTab(tab);
    }
  };

  if (isAuthLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-bg-base text-clay font-bold">Memuat...</div>;
  }

  if (authState === 'landing' || !user) {
    if (authState === 'login') return <Login onNavigate={setAuthState} />;
    if (authState === 'register') return <Register onNavigate={setAuthState} />;
    if (authState === 'forgot-password') return <ForgotPassword onNavigate={setAuthState} />;
    if (authState === 'reset-password' && resetToken) return <ResetPassword onNavigate={setAuthState} token={resetToken} />;
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
            <Dashboard {...tState} onNavigate={handleDashboardNavigate} />
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
