import React, { useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Notification } from "../hooks/useNotifications";

interface NotificationPopupProps {
  popups: Array<{
    id: number;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info';
    action?: {
      label: string;
      tab?: string;
      payload?: any;
      onClick?: () => void;
    };
    autoClose?: boolean;
  }>;
  onClose: (id: number) => void;
  onActionClick: (action: any, id: number) => void;
}

export function NotificationPopup({ popups, onClose, onActionClick }: NotificationPopupProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      <AnimatePresence>
        {popups.map((popup) => (
          <PopupCard 
            key={popup.id} 
            popup={popup} 
            onClose={onClose} 
            onActionClick={onActionClick} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function PopupCard({ 
  popup, 
  onClose, 
  onActionClick 
}: { 
  popup: NotificationPopupProps["popups"][0]; 
  onClose: (id: number) => void; 
  onActionClick: (action: any, id: number) => void; 
  key?: React.Key;
}) {
  useEffect(() => {
    if (popup.autoClose === false) return;
    const timer = setTimeout(() => {
      onClose(popup.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [popup.id, onClose, popup.autoClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-nature-green shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  const borders = {
    success: "border-l-4 border-l-nature-green",
    warning: "border-l-4 border-l-amber-500",
    info: "border-l-4 border-l-blue-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
      className={`glass-card p-4 flex flex-col gap-3 shadow-2xl relative overflow-hidden bg-white/95 dark:bg-bg-card/95 backdrop-blur-md pointer-events-auto ${borders[popup.type]}`}
    >
      {/* Top row: Icon, Title, and Close Button */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {icons[popup.type]}
          <span className="font-extrabold text-sm text-text-main leading-tight">{popup.title}</span>
        </div>
        <button 
          onClick={() => onClose(popup.id)} 
          className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-sand/30 active:scale-95 transition-all shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message */}
      <p className="text-xs text-text-muted font-medium pr-4 leading-relaxed">{popup.message}</p>

      {/* Action Button (If any) */}
      {popup.action && (
        <div className="flex justify-end pt-2 border-t border-sand/30 mt-1">
          <button
            onClick={() => onActionClick(popup.action, popup.id)}
            className="flex items-center gap-1.5 bg-clay/10 text-clay hover:bg-clay hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            {popup.action.label}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
