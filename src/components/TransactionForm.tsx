import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../lib/utils';

interface TransactionFormProps {
  onAdd: (data: { amount: number; category: string; date: number; note: string }) => void;
  onClose?: () => void;
  categories?: string[];
}

export function TransactionForm({ onAdd, onClose, categories = DEFAULT_CATEGORIES }: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(categories[0] || 'Marché');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const finalCategory = isCustomCategory ? (customCategoryName.trim() || 'Divers') : category;

    onAdd({
      amount: parseFloat(amount),
      category: finalCategory,
      date: new Date(date).getTime(),
      note,
    });
    setAmount('');
    setNote('');
    setCustomCategoryName('');
    setIsCustomCategory(false);
  };

  return (
    <div className="bg-[#161B29] p-8 rounded-3xl shadow-2xl border border-white/5 max-w-md mx-auto w-full relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      )}
      <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <Plus className="text-[#3B82F6]" size={20} />
        Ajouter une dépense
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            Montant (F.CFA)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
            placeholder="0"
            required
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              Catégorie
            </label>
            <button
              type="button"
              onClick={() => setIsCustomCategory(!isCustomCategory)}
              className="text-[11px] font-bold text-[#3B82F6] hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <Tag size={12} />
              <span>{isCustomCategory ? "Choisir existante" : "+ Autre catégorie"}</span>
            </button>
          </div>

          {isCustomCategory ? (
            <input
              type="text"
              value={customCategoryName}
              onChange={(e) => setCustomCategoryName(e.target.value)}
              placeholder="Ex: Scolarité, Vêtements..."
              className="w-full px-4 py-3 bg-white/5 border border-blue-500/50 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              required
              autoFocus
            />
          ) : (
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#161B29] text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            Date de l'opération
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all [color-scheme:dark]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            Note (optionnel)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 resize-none"
            placeholder="Détail de la dépense..."
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={!amount}
          className="w-full bg-[#2E5BFF] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
        >
          <Plus size={18} />
          Enregistrer
        </button>
      </form>
    </div>
  );
}
