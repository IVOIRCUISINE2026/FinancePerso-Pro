import { Transaction, Income, CategoryBudget, TransactionCategory } from '../types';
import { formatCurrency, formatDate, cn, getBudgetPeriodStart, getBudgetPeriodEnd, formatBudgetPeriod } from '../lib/utils';
import { TrendingUp, TrendingDown, CreditCard, Clock, Trash2, PieChart as PieIcon, Info, PlusCircle, Edit2, Check, X as CloseIcon, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { exportBudgetStatusToPDF } from '../lib/pdfExport';

interface DashboardProps {
  transactions: Transaction[];
  incomes: Income[];
  budgets: CategoryBudget[];
  onTabChange?: (tab: string) => void;
  onDeleteTransaction?: (id: string) => void;
  onClearCategory?: (category: string) => void;
  onUpdateBudget?: (category: string, amount: number) => void;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899', '#06B6D4'];

function MetricCard({ 
  title, 
  amount, 
  icon: Icon, 
  trend,
  colorClass,
  isSecondary
}: { 
  title: string, 
  amount: number, 
  icon: any, 
  trend?: string,
  colorClass: string,
  isSecondary?: boolean
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-[#161B29] p-6 rounded-2xl border border-white/5 text-left w-full h-full"
    >
      <div className="flex flex-col gap-1 mb-4">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
        <h3 className={cn("text-3xl font-black tracking-tight", colorClass)}>{formatCurrency(amount)}</h3>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className={cn("w-2 h-2 rounded-full", colorClass)} />
          <span className="text-[10px] font-bold text-slate-400">{trend}</span>
        </div>
      )}
    </motion.div>
  );
}

function ProgressMetric({ title, percentage, color }: { title: string, percentage: number, color: string }) {
  return (
    <div className="bg-[#161B29] p-6 rounded-2xl border border-white/5 h-full">
      <div className="flex flex-col gap-1 mb-4">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
        <h3 className="text-3xl font-black tracking-tight" style={{ color }}>{percentage.toFixed(1)}%</h3>
      </div>
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}


export function Dashboard({ transactions, incomes, budgets, onTabChange, onDeleteTransaction, onClearCategory, onUpdateBudget }: DashboardProps) {
  const [categoryToClear, setCategoryToClear] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const now = new Date();
  const startOfPeriod = getBudgetPeriodStart(now);
  const endOfPeriod = getBudgetPeriodEnd(now);

  const totalSalary = incomes.length > 0 ? incomes[0].salaryReceived : 0;
  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpentMonth = transactions
    .filter(t => t.date >= startOfPeriod && t.date <= endOfPeriod)
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const balance = totalSalary - totalSpentMonth;

  const today = new Date().setHours(0, 0, 0, 0);
  const todayTransactions = transactions.filter(t => new Date(t.date).setHours(0, 0, 0, 0) === today);

  // Quick Analytics Data
  const chartData = transactions
    .filter(t => t.date >= startOfPeriod && t.date <= endOfPeriod)
    .reduce((acc: any[], curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, []).slice(0, 5);

  const savingsRate = totalSalary > 0 ? (balance / totalSalary) * 100 : 0;

  // Budget Status calculation
  const statusData = Object.values(TransactionCategory).map((category) => {
    const budgetObj = budgets.find(b => b.category === category);
    let budget = budgetObj ? budgetObj.amount : 0;
    if (!budgetObj && category === TransactionCategory.EAU) {
      budget = 10000;
    }
    
    const actual = transactions
      .filter(t => t.category === category && t.date >= startOfPeriod && t.date <= endOfPeriod)
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const remaining = budget - actual;
    const isOver = budget > 0 && actual > budget;
    // Simulated trend for UI
    const trend = Array.from({ length: 4 }).map(() => Math.random() > 0.5);

    return { category, budget, actual, remaining, isOver, trend };
  });

  const handleStartEdit = (category: string, currentBudget: number) => {
    setEditingCategory(category);
    setEditValue(currentBudget > 0 ? currentBudget.toString() : '');
  };

  const handleSaveBudget = () => {
    if (editingCategory) {
      const amount = parseFloat(editValue) || 0;
      onUpdateBudget?.(editingCategory, amount);
      setEditingCategory(null);
    }
  };

  const totalBudget = statusData.reduce((acc, curr) => acc + curr.budget, 0);
  const totalActual = statusData.reduce((acc, curr) => acc + curr.actual, 0);
  const totalRemaining = totalBudget - totalActual;
  const totalPercentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  const getRecentMonths = () => {
    const months = [];
    const locale = 'fr-FR';
    for (let i = 0; i < 1; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleDateString(locale, { month: 'long' });
      months.push(monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1));
    }
    return months;
  };

  const recentMonths = getRecentMonths();

  return (
    <div className="space-y-8 w-full p-4 md:p-0">
      {/* Header Section from Image */}
      <div className="bg-[#161B29] rounded-3xl p-10 text-center border border-white/5 relative overflow-hidden mb-12">
         <div className="absolute top-0 left-0 right-0 h-1 bg-[#2E5BFF]/30" />
         <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-white rounded-sm" />
            <h1 className="text-xl font-bold text-white uppercase tracking-widest">SUIVI BUDGÉTAIRE PERSONNEL</h1>
         </div>
         <p className="text-slate-400 text-sm max-w-md mx-auto mb-6 italic">Prenez le contrôle de votre argent avec un suivi automatisé.</p>
         <div className="bg-[#F43F5E] text-white px-6 py-2 rounded-full font-black inline-block shadow-lg shadow-rose-500/30">
            Dépenses de la période ({formatBudgetPeriod(startOfPeriod, endOfPeriod)}) : {formatCurrency(totalSpentMonth)}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Revenu Mensuel" 
          amount={totalSalary} 
          icon={TrendingUp} 
          colorClass="text-[#10B981]" 
          trend="Salaire configuré"
        />
        <MetricCard 
          title="Dépenses du mois" 
          amount={totalSpentMonth} 
          icon={TrendingDown} 
          colorClass="text-[#F43F5E]" 
          trend={`${((totalSpentMonth / (totalSalary || 1)) * 100).toFixed(1)}% du revenu`}
        />
        <MetricCard 
          title="Reste à vivre" 
          amount={balance > 0 ? balance : 0} 
          icon={CreditCard} 
          colorClass="text-[#06B6D4]"
          trend="Disponible ce mois"
        />
        <ProgressMetric 
          title="Taux d'Épargne" 
          percentage={savingsRate} 
          color="#10B981"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#161B29] p-8 rounded-3xl border border-white/5">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-4 h-4 text-[#10B981]"><CreditCard size={16} /></span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenus vs Dépenses</h3>
          </div>
          <div className="space-y-4">
            {recentMonths.map((month, i) => {
              const isCurrent = i === 0;
              const incomeVal = totalSalary;
              const expensesVal = isCurrent ? totalSpentMonth : Math.round(totalSalary * (i === 1 ? 0.65 : 0.58));
              const expPercent = incomeVal > 0 ? Math.min(100, Math.round((expensesVal / incomeVal) * 100)) : 0;

              return (
                <div 
                  key={month} 
                  className={cn(
                    "p-4 rounded-2xl transition-all duration-300 space-y-2.5", 
                    isCurrent 
                      ? "bg-[#1E293B]/60 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20" 
                      : "bg-transparent border border-transparent"
                  )}
                  id={`revenue-expense-month-${month.toLowerCase()}`}
                >
                  <div className="flex justify-between items-center pb-1">
                    <span className={cn("text-xs font-extrabold uppercase tracking-wider", isCurrent ? "text-blue-300" : "text-slate-400")}>
                      Période : {formatBudgetPeriod(startOfPeriod, endOfPeriod)}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Mois en cours (En Exergue)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                       <span>Revenu</span>
                       <span className="text-[#10B981] font-extrabold">{formatCurrency(incomeVal)}</span>
                    </div>
                    <div className="w-full bg-white/5 h-4 rounded-md overflow-hidden p-[2px]">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: incomeVal > 0 ? '100%' : '0%' }} 
                         className="h-full bg-[#10B981] rounded-sm" 
                       />
                    </div>
                    
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                       <span>Dépenses</span>
                       <span className="text-[#F43F5E] font-extrabold">
                         {formatCurrency(expensesVal)} ({expPercent}%)
                       </span>
                    </div>
                    <div className="w-full bg-white/5 h-4 rounded-md overflow-hidden p-[2px]">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: `${expPercent}%` }} 
                         className="h-full bg-[#F43F5E] rounded-sm" 
                       />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#161B29] p-8 rounded-3xl border border-white/5">
          <div className="flex items-center gap-2 mb-8">
             <span className="text-[#F59E0B]">🍔</span>
             <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dépenses par Catégorie</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                    cornerRadius={4}
                  >
                    {chartData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                <span className="text-sm font-black text-white">{formatCurrency(totalSpentMonth)}</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-2">
               {chartData.map((item, index) => (
                 <div key={item.name} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                   <span className="text-[10px] font-bold text-slate-400 capitalize">{item.name} {( (item.value / (totalSpentMonth || 1)) * 100).toFixed(0)}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Status Table Section */}
      <div className="bg-[#161B29] rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <span className="w-4 h-4 bg-white/10 rounded-sm flex items-center justify-center text-white text-[10px]">📋</span>
             <h3 className="text-sm font-bold text-white uppercase tracking-wider">Statut Budgétaire par Catégorie</h3>
           </div>
           
           <button 
             onClick={() => exportBudgetStatusToPDF(transactions, budgets)}
             className="flex items-center gap-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] px-4 py-2 rounded-xl transition-all border border-[#3B82F6]/20 group"
             title="Télécharger le rapport PDF"
           >
             <Printer size={16} className="group-hover:rotate-12 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Exporter PDF</span>
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1D2433] text-[10px] font-black text-[#3B82F6] uppercase tracking-widest">
                <th className="px-8 py-4">Catégorie</th>
                <th className="px-8 py-4 text-right">Budget</th>
                <th className="px-8 py-4 text-right">Actuel</th>
                <th className="px-8 py-4 text-right">Restant</th>
                <th className="px-8 py-4 text-center">Statut</th>
                <th className="px-8 py-4 text-center">Trend</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {statusData.map((item, index) => (
                <tr key={index} className="text-[12px] font-medium hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5 text-slate-300 flex items-center gap-2">
                    <span className="opacity-50">📋</span>
                    {item.category}
                  </td>
                  <td className="px-8 py-5 text-slate-300 text-right">
                    {editingCategory === item.category ? (
                      <div className="flex items-center justify-end gap-1">
                        <input 
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 w-24 text-right text-white focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <button onClick={handleSaveBudget} className="text-emerald-500 p-1 hover:bg-emerald-500/10 rounded"><Check size={14}/></button>
                        <button onClick={() => setEditingCategory(null)} className="text-rose-500 p-1 hover:bg-rose-500/10 rounded"><CloseIcon size={14}/></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleStartEdit(item.category, item.budget)}
                        className="group flex items-center justify-end gap-2 ml-auto hover:text-white transition-colors"
                      >
                        {item.budget > 0 ? formatCurrency(item.budget) : <span className="text-slate-500">Définir...</span>}
                        <Edit2 size={12} className="opacity-0 group-hover:opacity-100" />
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-5 text-slate-300 text-right">
                     <div className="flex flex-col items-end">
                       <span className="font-bold">{formatCurrency(item.actual)}</span>
                       <span className="text-[9px] text-slate-500 uppercase">Ce mois</span>
                     </div>
                  </td>
                  <td className={cn(
                    "px-8 py-5 text-right font-bold",
                    item.isOver ? "text-[#F43F5E]" : item.budget > 0 ? "text-[#10B981]" : "text-slate-500"
                  )}>
                    {item.budget > 0 ? formatCurrency(item.remaining) : "—"}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {item.budget > 0 ? (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                        item.isOver ? "bg-rose-500/20 text-[#F43F5E]" : "bg-emerald-500/20 text-[#10B981]"
                      )}>
                        {item.isOver ? "Dépassement" : "Respecté"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Aucun budget</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-1">
                       {item.trend.map((active, i) => (
                         <div 
                           key={i} 
                           className={cn(
                             "w-1 h-3 rounded-full transition-all duration-500",
                             active ? "bg-[#3B82F6]" : "bg-white/10"
                           )} 
                         />
                       ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onTabChange?.('add')}
                      className="p-2 text-slate-500 hover:text-[#3B82F6] hover:bg-blue-500/10 rounded-xl transition-all"
                      title="Ajouter une dépense"
                    >
                      <PlusCircle size={16} />
                    </button>
                    <button 
                      onClick={() => setCategoryToClear(item.category)}
                      className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Effacer la catégorie"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#1D2433]/80 border-t-2 border-[#3B82F6]/50 sticky bottom-0 z-10 backdrop-blur-md">
              <tr className="text-[12px] font-black group">
                <td className="px-8 py-5 text-[#3B82F6] uppercase tracking-[0.2em] italic flex items-center gap-2 group-hover:pl-10 transition-all duration-300">
                  <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-pulse" />
                  TOTAL GLOBAL
                </td>
                <td className="px-8 py-5 text-right text-white text-sm font-bold tabular-nums">
                  {formatCurrency(totalBudget)}
                </td>
                <td className="px-8 py-5 text-right text-white text-sm font-bold tabular-nums">
                  {formatCurrency(totalActual)}
                </td>
                <td className={cn(
                  "px-8 py-5 text-right text-sm font-black tabular-nums transition-colors duration-300",
                  totalRemaining < 0 ? "text-rose-400" : "text-emerald-400"
                )}>
                  {formatCurrency(totalRemaining)}
                </td>
                <td colSpan={3} className="px-8 py-5">
                  <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <div className="flex justify-between text-[9px] uppercase tracking-tighter text-slate-400 font-black">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={10} className="text-[#3B82F6]" />
                        Utilisation
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-sm bg-white/5",
                        totalPercentage > 100 ? "text-rose-400" : "text-emerald-400"
                      )}>
                        {totalPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, totalPercentage)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full relative z-10",
                          totalActual > totalBudget ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]" : "bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                        )}
                      />
                      {totalPercentage > 100 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.2, 0.5, 0.2] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-rose-500/20 z-0"
                        />
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!categoryToClear}
        onClose={() => setCategoryToClear(null)}
        onConfirm={() => {
          if (categoryToClear) onClearCategory?.(categoryToClear);
        }}
        title="Effacer la catégorie ?"
        message={`Attention, toutes les transactions enregistrées dans la catégorie "${categoryToClear}" seront définitivement supprimées.`}
        confirmText="Tout effacer"
        cancelText="Conserver"
        variant="danger"
      />
    </div>
  );
}

