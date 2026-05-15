import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 lg:bottom-10 right-4 lg:right-10 z-50 flex items-center gap-3 bg-nature-green text-white px-4 py-3 rounded-xl shadow-xl shadow-nature-green/20"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-bold text-sm">{message}</span>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
