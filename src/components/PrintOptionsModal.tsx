import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PieChart, FileText, Download } from 'lucide-react';

interface PrintOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportStatus: () => void;
  onExportDetails: () => void;
}

export function PrintOptionsModal({ isOpen, onClose, onExportStatus, onExportDetails }: PrintOptionsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#161B29] border border-white/10 rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Options d'exportation</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <button
              onClick={() => {
                onExportStatus();
                onClose();
              }}
              className="w-full group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-[#2E5BFF]/10 border border-white/5 hover:border-[#2E5BFF]/30 transition-all text-left active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2E5BFF]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <PieChart className="text-[#2E5BFF]" size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white mb-1">Point du statut budgétaire</p>
                <p className="text-sm text-slate-400">Télécharger le récapitulatif du budget par catégorie pour le mois en cours.</p>
              </div>
              <Download size={18} className="text-slate-500 group-hover:text-[#2E5BFF] transition-colors" />
            </button>

            <button
              onClick={() => {
                onExportDetails();
                onClose();
              }}
              className="w-full group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-[#2E5BFF]/10 border border-white/5 hover:border-[#2E5BFF]/30 transition-all text-left active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2E5BFF]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="text-[#2E5BFF]" size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white mb-1">Cumul et détails des dépenses</p>
                <p className="text-sm text-slate-400">Liste détaillée de toutes les transactions et cumul total des dépenses récentes.</p>
              </div>
              <Download size={18} className="text-slate-500 group-hover:text-[#2E5BFF] transition-colors" />
            </button>
          </div>

          <div className="p-6 bg-white/[0.02] border-t border-white/5">
            <p className="text-xs text-slate-500 text-center italic">
              Les rapports sont générés au format PDF pour une impression facile.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
