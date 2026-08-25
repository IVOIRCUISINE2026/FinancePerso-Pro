import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { TransactionCategory, CategoryBudget } from '../types';
import { formatCurrency, cn, DEFAULT_CATEGORIES } from '../lib/utils';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  budgets: CategoryBudget[];
  categories?: string[];
  onSaveBudget: (category: string, amount: number) => void;
  onDeleteCategory?: (category: string) => void;
  onOpenAddCategory?: () => void;
  currentExpensesByCategory?: Record<string, number>;
}

export function BudgetModal({
  isOpen,
  onClose,
  selectedCategory: initialCategory,
  budgets,
  categories = DEFAULT_CATEGORIES,
  onSaveBudget,
  onDeleteCategory,
  onOpenAddCategory,
  currentExpensesByCategory = {},
}: BudgetModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || categories[0] || Object.values(TransactionCategory)[0]
  );
  const [amountInput, setAmountInput] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    } else if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [initialCategory, categories]);

  useEffect(() => {
    if (activeCategory) {
      const budgetObj = budgets.find((b) => b.category === activeCategory);
      let currentVal = budgetObj ? budgetObj.amount : 0;
      if (!budgetObj && activeCategory === TransactionCategory.EAU) {
        currentVal = 10000;
      }
      setAmountInput(currentVal > 0 ? currentVal.toString() : '');
      setSuccessNotice(null);
    }
  }, [activeCategory, budgets]);

  if (!isOpen) return null;

  const currentExpense = currentExpensesByCategory[activeCategory] || 0;
  const parsedAmount = parseFloat(amountInput) || 0;
  const budgetObj = budgets.find((b) => b.category === activeCategory);
  const initialBudget = budgetObj ? budgetObj.amount : (activeCategory === TransactionCategory.EAU ? 10000 : 0);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveBudget(activeCategory, parsedAmount);
    setSuccessNotice(`Budget pour "${activeCategory}" mis à jour (${formatCurrency(parsedAmount)}) !`);
    setTimeout(() => {
      setSuccessNotice(null);
    }, 2500);
  };

  const handleAddPreset = (delta: number) => {
    const newVal = Math.max(0, parsedAmount + delta);
    setAmountInput(newVal.toString());
  };

  const handleSetExact = (val: number) => {
    setAmountInput(val.toString());
  };

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

        {/* Modal Window */}
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
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Modifier le Budget
                </h3>
                <p className="text-xs text-slate-400">
                  Ajustez les limites budgétaires par catégorie
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

          {/* Category Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                Sélectionner la catégorie ({categories.length})
              </label>
              {onOpenAddCategory && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAddCategory();
                  }}
                  className="text-xs font-bold text-[#3B82F6] hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} />
                  <span>Nouvelle ligne</span>
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
              {categories.map((cat) => {
                const isSelected = cat === activeCategory;
                const catBudget = budgets.find((b) => b.category === cat)?.amount ?? (cat === TransactionCategory.EAU ? 10000 : 0);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0",
                      isSelected
                        ? "bg-[#3B82F6] border-[#3B82F6] text-white shadow-lg shadow-blue-500/20"
                        : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <span>{cat}</span>
                    {catBudget > 0 && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md font-mono",
                        isSelected ? "bg-black/20 text-white" : "bg-white/10 text-slate-400"
                      )}>
                        {formatCurrency(catBudget)}
                      </span>
                    )}
                  </button>
                );
              })}

              {onOpenAddCategory && (
                <button
                  type="button"
                  onClick={onOpenAddCategory}
                  className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border border-dashed border-blue-500/40 text-blue-400 hover:bg-blue-500/10 shrink-0"
                >
                  <Plus size={14} />
                  <span>Ajouter catégorie...</span>
                </button>
              )}
            </div>
          </div>

          {/* Current vs New Budget Info */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                Budget actuel
              </span>
              <p className="text-base font-black text-white mt-0.5">
                {initialBudget > 0 ? formatCurrency(initialBudget) : 'Non défini (0 F.CFA)'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                Dépenses réelles
              </span>
              <p className={cn(
                "text-base font-black mt-0.5",
                currentExpense > initialBudget && initialBudget > 0 ? "text-rose-400" : "text-slate-300"
              )}>
                {formatCurrency(currentExpense)}
              </p>
            </div>
          </div>

          {/* Amount Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Nouveau montant alloué à « {activeCategory} »
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0"
                  className="w-full pl-4 pr-20 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-[#3B82F6] transition-all"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs pointer-events-none">
                  F.CFA
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Ajustements rapides
              </span>
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
                <button
                  type="button"
                  onClick={() => handleSetExact(0)}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 rounded-xl text-xs font-bold transition-all ml-auto"
                >
                  Remettre à 0
                </button>
              </div>
            </div>

            {/* Success Feedback */}
            {successNotice && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2"
              >
                <Check size={16} />
                <span>{successNotice}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold text-sm transition-all border border-white/5"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98"
              >
                <Check size={18} />
                Enregistrer le budget
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
