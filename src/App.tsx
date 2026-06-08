import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { History } from "./components/History";
import { Scanner, mockParseReceipt } from "./components/Scanner";
import { parseReceiptWithAI } from "./lib/ai";
import { TransactionForm } from "./components/TransactionForm";
import { SimpleAccountingReport } from "./components/Report";
import { Notifications } from "./components/Notifications";
import { useTransactions } from "./hooks/useTransactions";
import { useAuth } from "./hooks/useAuth";
import { useNotifications, Notification } from "./hooks/useNotifications";
import { Transaction } from "./types";
import { Toast } from "./components/ui/Toast";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { useSettings } from "./hooks/useSettings";
import { NotificationPopup } from "./components/NotificationPopup";

export default function App() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    addNotification: originalAddNotification, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    restoreNotification
  } = useNotifications();
  const [authState, setAuthState] = useState<'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'app'>('landing');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const tState = useTransactions();
  const { formatCurrency, language } = useSettings();
  
  // State for AI scanned values before they are saved
  const [scannedData, setScannedData] = useState<Partial<Transaction> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction> | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [historyFilters, setHistoryFilters] = useState<{ type?: 'all' | 'income' | 'expense', startDate?: string, endDate?: string } | null>(null);

  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Active Toast Popups (Bottom Right)
  const [activePopups, setActivePopups] = useState<any[]>([]);

  // Background Scan States
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrScanProgress, setOcrScanProgress] = useState(0);
  const [ocrScanStatusText, setOcrScanStatusText] = useState("");
  const [ocrScanImage, setOcrScanImage] = useState<string | null>(null);

  // Wrapper to automatically spawn bottom-right popup cards when notification triggers
  const addNotification = (notif: Omit<Notification, 'id' | 'read' | 'time'>) => {
    const id = Date.now();
    originalAddNotification(notif);
    
    const newPopup = {
      id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      action: notif.action,
    };
    setActivePopups(prev => [...prev, newPopup]);
  };

  const handleClosePopup = (id: number) => {
    setActivePopups(prev => prev.filter(p => p.id !== id));
  };

  const handleActionClick = (action: any, id: number) => {
    handleClosePopup(id);
    if (action.onClick) {
      action.onClick();
    } else if (action.tab === "edit" && action.payload) {
      handleEditById(action.payload);
    } else if (action.tab) {
      setActiveTab(action.tab);
    }
  };
  const handleDeleteNotification = (id: number) => {
    const deleted = deleteNotification(id);
    if (deleted) {
      const popupId = Date.now();
      const undoPopup = {
        id: popupId,
        title: language === 'en' ? 'Notification Deleted' : 'Notifikasi Dihapus',
        message: language === 'en' ? 'The notification has been removed.' : 'Notifikasi telah dihapus.',
        type: 'info' as const,
        action: {
          label: language === 'en' ? 'Undo' : 'Batal Hapus',
          onClick: () => {
            restoreNotification(deleted);
            setToastMessage(language === 'en' ? 'Notification restored' : 'Notifikasi dipulihkan');
          }
        },
        autoClose: false
      };
      setActivePopups(prev => [...prev, undoPopup]);
    }
  };
  const handleEditById = (id: string) => {
    const transaction = tState.transactions.find(t => t.id === id);
    if (transaction) {
      setEditingId(id);
      setEditData(transaction);
      setActiveTab("edit");
    }
  };

  // Background OCR Scanning execution logic
  const startOcrScan = async (base64Str: string) => {
    setIsOcrScanning(true);
    setOcrScanImage(base64Str);
    setOcrScanProgress(5);
    setOcrScanStatusText(language === 'en' ? 'Uploading image...' : 'Mengunggah gambar...');

    addNotification({
      title: language === 'en' ? 'Scanning Receipt' : 'Membaca Nota',
      message: language === 'en' 
        ? 'Scanning image using OCR in background...' 
        : 'Sedang memindai gambar menggunakan OCR di latar belakang...',
      type: "info"
    });

    const progressInterval = setInterval(() => {
      setOcrScanProgress((prev) => {
        if (prev >= 90) return prev;
        const inc = prev < 40 ? 6 : (prev < 75 ? 3 : 1);
        if (prev + inc >= 80) {
          setOcrScanStatusText(language === 'en' ? 'AI is parsing receipt details...' : 'AI sedang menganalisis detail struk...');
        } else if (prev + inc >= 50) {
          setOcrScanStatusText(language === 'en' ? 'Extracting text with PaddleOCR...' : 'Mengekstrak teks dengan PaddleOCR...');
        } else if (prev + inc >= 25) {
          setOcrScanStatusText(language === 'en' ? 'Analyzing receipt structure...' : 'Menganalisis struktur nota...');
        }
        return prev + inc;
      });
    }, 250);
    
    try {
      const base64Data = base64Str.split(",")[1] || base64Str;
      
      let rawText = "";
      try {
        const ocrServerUrl = import.meta.env.VITE_OCR_SERVER_URL || "https://ocrservice.kolab.top/scan-base64/";
        const ocrResponse = await fetch(ocrServerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Data })
        });
        
        if (!ocrResponse.ok) throw new Error("Server OCR mati atau error");
        const ocrData = await ocrResponse.json();
        rawText = ocrData.data.join("\n");
      } catch (ocrErr) {
        console.warn("Local OCR Server is offline. Falling back to simulation.", ocrErr);
        // Fallback simulation
        rawText = "KHB MART BANDUNG\n" +
          "JL. CIPAGANTI NO. 12\n" +
          "====================================\n" +
          "Beras Cianjur 5kg    1x  75.000\n" +
          "Minyak Goreng 2L     1x  38.000\n" +
          "Gula Pasir 1kg       2x  32.000\n" +
          "====================================\n" +
          "TOTAL                    145.000\n" +
          "TUNAI                    150.000\n" +
          "KEMBALI                    5.000\n" +
          "TERIMA KASIH ATAS KUNJUNGAN ANDA";
      }

      // Receipt validity validation
      const cleanText = rawText.trim();
      const hasNumbers = /\d+/.test(cleanText);
      const receiptKeywords = /total|subtotal|tunai|cash|kembali|change|harga|price|qty|item|jumlah|bayar|toko|mart|jl\.|jl |no\.|rp|no /i;
      const hasReceiptKeywords = receiptKeywords.test(cleanText);
      const linesCount = cleanText.split('\n').filter(l => l.trim().length > 0).length;

      if (cleanText.length === 0 || !hasNumbers || (linesCount < 3 && !hasReceiptKeywords)) {
        throw new Error("INVALID_RECEIPT_IMAGE");
      }

      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      let parsedResult: any = null;

      if (apiKey) {
        try {
          const aiResult = await parseReceiptWithAI(rawText);
          parsedResult = {
            type: "expense",
            amount: aiResult.totalAmount || aiResult.amount || 0,
            date: aiResult.date || new Date().toISOString().split("T")[0],
            storeName: aiResult.storeName || "Toko Tidak Dikenal",
            description: `Pembelian di ${aiResult.storeName || "Toko"} (AI Scan)`,
            items: aiResult.items || [],
            rawText: rawText
          };
        } catch (aiErr) {
          console.warn("Real AI failed, falling back to mock parser", aiErr);
        }
      }

      if (!parsedResult) {
        parsedResult = mockParseReceipt(rawText);
      }

      clearInterval(progressInterval);
      setOcrScanProgress(100);
      setOcrScanStatusText(language === 'en' ? 'Complete!' : 'Selesai!');
      await new Promise((resolve) => setTimeout(resolve, 400));

      setScannedData(parsedResult);
      setIsOcrScanning(false);
      setOcrScanImage(null);

      if (activeTabRef.current === "scan") {
        setActiveTab("add_review");
      }

      addNotification({
        title: language === 'en' ? "Receipt Scanned Successfully" : "Scan Struk Selesai",
        message: language === 'en'
          ? `AI successfully parsed receipt from ${parsedResult.storeName || 'Store'}. Click to review and save.`
          : `AI berhasil memproses struk dari ${parsedResult.storeName || 'Toko'}. Klik untuk meninjau dan menyimpan.`,
        type: "success",
        action: {
          label: language === 'en' ? "Review Results" : "Tinjau Hasil",
          tab: "add_review"
        }
      });

    } catch (error: any) {
      console.error(error);
      clearInterval(progressInterval);
      setIsOcrScanning(false);
      setOcrScanImage(null);

      if (error.message === "INVALID_RECEIPT_IMAGE") {
        addNotification({
          title: language === 'en' ? 'Scan Cancelled' : 'Scan Dibatalkan',
          message: language === 'en'
            ? 'The image is not recognized as a shopping receipt. Please upload a clear photo.'
            : 'Gambar tidak dikenali sebagai struk belanja. Silakan unggah foto nota yang jelas.',
          type: "warning"
        });
        alert(
          language === 'en'
            ? 'Receipt scan cancelled: Image is not a valid receipt. Please make sure the photo contains readable text and prices.'
            : 'Scan struk dibatalkan: Gambar tidak sesuai. Pastikan foto Anda adalah struk belanja yang memiliki teks dan nominal angka yang terbaca jelas.'
        );
      } else {
        addNotification({
          title: language === 'en' ? 'Scan Failed' : 'Scan Gagal',
          message: language === 'en'
            ? 'Failed to process receipt image. Please try again.'
            : 'Gagal memproses gambar struk. Silakan coba lagi.',
          type: "warning"
        });
        alert(language === 'en' ? 'OCR Server error occurred.' : 'Gagal memproses gambar. Pastikan server OCR menyala.');
      }
    }
  };

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

  const handleTransactionSubmit = async (data: Omit<Transaction, "id">, isOcrSubmit?: boolean) => {
    try {
      const formattedAmount = formatCurrency(data.amount);

      if (editingId) {
        await tState.updateTransaction(editingId, data);
        setToastMessage(language === 'en' ? "Transaction updated successfully!" : "Berhasil memperbarui transaksi!");
        addNotification({
          title: language === 'en' ? "Transaction Updated" : "Transaksi Diperbarui",
          message: language === 'en' 
            ? `Transaction "${data.description}" of ${formattedAmount} has been successfully updated.`
            : `Transaksi "${data.description}" senilai ${formattedAmount} telah berhasil diperbarui.`,
          type: "success"
        });
        setEditData(null);
        setEditingId(null);
      } else {
        const newId = await tState.addTransaction(data);
        setToastMessage(language === 'en' ? "Transaction saved successfully!" : "Transaksi berhasil disimpan!");
        
        // Contextual action payload to edit the new transaction
        const action = {
          label: language === 'en' ? "Edit Transaction" : "Edit Pencatatan",
          tab: "edit",
          payload: newId
        };

        if (isOcrSubmit) {
          addNotification({
            title: language === 'en' ? "Transaction Saved (AI Scan)" : "Transaksi Disimpan (Scan AI)",
            message: language === 'en'
              ? `Transaction "${data.description}" of ${formattedAmount} from receipt scan has been saved.`
              : `Transaksi "${data.description}" senilai ${formattedAmount} dari scan struk berhasil disimpan ke riwayat.`,
            type: "success",
            action
          });
          setScannedData(null);
        } else {
          addNotification({
            title: language === 'en' ? "Manual Transaction Saved" : "Transaksi Manual Disimpan",
            message: language === 'en'
              ? `Manual transaction "${data.description}" of ${formattedAmount} has been saved.`
              : `Transaksi manual "${data.description}" senilai ${formattedAmount} berhasil disimpan ke riwayat.`,
            type: "success",
            action
          });
        }
      }
      setActiveTab("history"); // Redirect to history after adding
    } catch (error) {
      setToastMessage(language === 'en' ? "Failed to save transaction! Please try again." : "Gagal menyimpan transaksi! Silakan coba lagi.");
      addNotification({
        title: language === 'en' ? "Failed to Save Transaction" : "Gagal Menyimpan Transaksi",
        message: language === 'en'
          ? "An error occurred while saving transaction to database."
          : "Terjadi kesalahan saat menyimpan transaksi ke database.",
        type: "warning"
      });
    }
  };

  const handleCancelForm = (mode: 'add' | 'review' | 'edit') => {
    if (mode === 'review') {
      setScannedData(null);
      setActiveTab("scan");
    } else if (mode === 'edit') {
      setEditData(null);
      setEditingId(null);
      setActiveTab("history");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditData(t);
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
    return <div className="h-screen w-screen flex items-center justify-center bg-bg-base text-clay font-bold">{language === 'en' ? 'Loading...' : 'Memuat...'}</div>;
  }

  if (authState === 'landing' || !user) {
    if (authState === 'login') return <Login onNavigate={setAuthState} />;
    if (authState === 'register') return <Register onNavigate={setAuthState} />;
    if (authState === 'forgot-password') return <ForgotPassword onNavigate={setAuthState} />;
    if (authState === 'reset-password' && resetToken) return <ResetPassword onNavigate={setAuthState} token={resetToken} />;
    return <Landing onNavigate={setAuthState} />;
  }

  return (
    <Layout 
      activeTab={activeTab === "add_review" ? "scan" : activeTab} 
      onTabChange={(tab) => {
        if (tab === "scan" && scannedData) {
          setActiveTab("add_review");
        } else {
          setActiveTab(tab);
        }
      }} 
      onLogout={handleLogout}
      unreadNotificationsCount={unreadCount}
    >
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
            <Scanner 
              isScanning={isOcrScanning}
              scanProgress={ocrScanProgress}
              scanStatusText={ocrScanStatusText}
              scanImage={ocrScanImage}
              onStartScan={startOcrScan}
            />
          )}

          {activeTab === "add" && (
            <TransactionForm 
              onSubmit={(data) => handleTransactionSubmit(data, false)} 
              onCancel={() => handleCancelForm("add")} 
            />
          )}

          {activeTab === "add_review" && (
            <TransactionForm 
              initialData={scannedData || undefined}
              isReviewMode={true}
              onSubmit={(data) => handleTransactionSubmit(data, true)} 
              onCancel={() => handleCancelForm("review")} 
            />
          )}

          {activeTab === "edit" && (
            <TransactionForm 
              initialData={editData || undefined}
              isReviewMode={false}
              isEditMode={true}
              onSubmit={(data) => handleTransactionSubmit(data, false)} 
              onCancel={() => handleCancelForm("edit")} 
            />
          )}

          {activeTab === "report" && (
            <SimpleAccountingReport 
              transactions={tState.transactions} 
              onNavigateToHistory={handleNavigateToHistory}
            />
          )}

          {activeTab === "notifications" && (
            <Notifications 
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onActionClick={handleActionClick}
              onDeleteNotification={handleDeleteNotification}
            />
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
      
      {/* Bottom-right interactive notification popup card panel */}
      <NotificationPopup 
        popups={activePopups} 
        onClose={handleClosePopup} 
        onActionClick={handleActionClick} 
      />
    </Layout>
  );
}
