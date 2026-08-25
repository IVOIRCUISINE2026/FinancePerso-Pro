import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, AlertCircle, Check, Tag } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: string[];
  onAddCategory: (categoryName: string, budgetAmount: number) => void;
}

const SUGGESTED_CATEGORIES = [
  'Santé',
  'Pharmacie',
  'Scolarité',
  'Carburant',
  'Loyer',
  'Loisirs',
  'Vêtements',
  'Épargne',
  'Assurance',
  'Cadeaux',
  'Restaurant',
  'Abonnements',
  'Beauté / Coiffure',
  'Maison',
];

export function AddCategoryModal({
  isOpen,
  onClose,
  existingCategories,
  onAddCategory,
}: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = categoryName.trim();
    if (!trimmed) {
      setError('Veuillez entrer un nom de catégorie.');
      return;
    }

    const exists = existingCategories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      setError(`La catégorie « ${trimmed} » existe déjà dans votre tableau budgétaire.`);
      return;
    }

    const parsedAmount = Math.max(0, parseFloat(budgetAmount) || 0);
    onAddCategory(trimmed, parsedAmount);
    setCategoryName('');
    setBudgetAmount('');
    setError(null);
    onClose();
  };

  const handleSelectSuggestion = (name: string) => {
    setCategoryName(name);
    setError(null);
  };

  const handleAddPreset = (delta: number) => {
    const current = parseFloat(budgetAmount) || 0;
    setBudgetAmount((current + delta).toString());
  };

  const availableSuggestions = SUGGESTED_CATEGORIES.filter(
    (s) => !existingCategories.some((c) => c.toLowerCase() === s.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-[#161B29] border border-white/10 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl overflow-hidden z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
                <Plus size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Ajouter une ligne au Budget
                </h3>
                <p className="text-xs text-slate-400">
                  Créez une nouvelle catégorie budgétaire personnalisée
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Name */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Nom de la catégorie
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Ex: Scolarité, Santé, Carburant..."
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-[#3B82F6] transition-all placeholder:text-slate-600"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Suggestions */}
            {availableSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <Tag size={12} className="text-[#3B82F6]" />
                  <span>Suggestions rapides</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                  {availableSuggestions.slice(0, 10).map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => handleSelectSuggestion(sugg)}
                      className={cn(
                        "px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all",
                        categoryName.toLowerCase() === sugg.toLowerCase()
                          ? "bg-[#3B82F6] border-[#3B82F6] text-white"
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      )}
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Amount */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Budget alloué par période (optionnel)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-4 pr-20 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-[#3B82F6] transition-all placeholder:text-slate-600"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs pointer-events-none">
                  F.CFA
                </div>
              </div>
            </div>

            {/* Preset Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAddPreset(5000)}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-white/5 hover:border-blue-500/30 rounded-xl text-xs font-bold transition-all"
              >
                +5 000
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset(10000)}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-white/5 hover:border-blue-500/30 rounded-xl text-xs font-bold transition-all"
              >
                +10 000
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset(25000)}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-white/5 hover:border-blue-500/30 rounded-xl text-xs font-bold transition-all"
              >
                +25 000
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset(50000)}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-white/5 hover:border-blue-500/30 rounded-xl text-xs font-bold transition-all"
              >
                +50 000
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold text-sm transition-all border border-white/5"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98"
              >
                <Check size={18} />
                Ajouter la ligne
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
