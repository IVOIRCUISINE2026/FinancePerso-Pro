import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = 'primary'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  variant === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-[#2E5BFF]'
                }`}>
                  <AlertCircle size={24} />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 leading-relaxed italic">{message}</p>
            </div>

            <div className="p-8 bg-slate-50 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                  variant === 'danger' 
                    ? 'bg-rose-500 shadow-rose-200 hover:bg-rose-600' 
                    : 'bg-[#2E5BFF] shadow-blue-200 hover:bg-blue-600'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
