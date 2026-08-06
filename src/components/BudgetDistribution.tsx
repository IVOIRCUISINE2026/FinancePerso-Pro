import React from 'react';
import { Transaction, Income, CategoryBudget } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'motion/react';
import { Wallet, Info, ArrowUpRight, TrendingDown } from 'lucide-react';

interface BudgetDistributionProps {
  transactions: Transaction[];
  incomes: Income[];
  budgets: CategoryBudget[];
}

const COLORS = ['#2E5BFF', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function BudgetDistribution({ transactions, incomes, budgets }: BudgetDistributionProps) {
  const totalSalary = incomes.length > 0 ? incomes[0].salaryReceived : 0;
  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalSalary - totalSpent;

  const categoryTotals = transactions.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const distributionData = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalSalary > 0 ? (value / totalSalary) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  const remainingPercentage = totalSalary > 0 ? (balance / totalSalary) * 100 : 0;

  // 50/30/20 Rule Analysis
  const ruleGroups = {
    needs: ['Alimentation', 'Transport', 'Loyer', 'Santé', 'Education', 'Factures', 'Marché', 'Déjeuner', 'Riz', 'Électricité', 'Gaz', 'Savon', 'Eau'],
    wants: ['Loisirs', 'Shopping', 'Sorties', 'Divers', 'Canal+', 'Internet'],
  };

  const analysis = {
    needs: { label: 'Besoins (50%)', target: 50, value: 0 },
    wants: { label: 'Envies (30%)', target: 30, value: 0 },
    savings: { label: 'Épargne (20%)', target: 20, value: 0 },
  };

  transactions.forEach(t => {
    if (ruleGroups.needs.includes(t.category)) {
      analysis.needs.value += t.amount;
    } else if (ruleGroups.wants.includes(t.category)) {
      analysis.wants.value += t.amount;
    } else {
      // Default to wants if not listed or divers
      analysis.wants.value += t.amount;
    }
  });

  // Savings is what is left
  analysis.savings.value = balance > 0 ? balance : 0;

  const getPercentage = (val: number) => totalSalary > 0 ? (val / totalSalary) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Répartition & Analyse</h2>
          <p className="text-slate-400 font-medium mt-1">Analyse intelligente basée sur la règle des 50/30/20.</p>
        </div>
        <div className="bg-[#161B29] px-6 py-3 rounded-2xl border border-white/5 shadow-sm flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenu Total</p>
            <p className="text-xl font-black text-white">{formatCurrency(totalSalary)}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
            <Wallet size={20} />
          </div>
        </div>
      </div>

      {/* 50/30/20 Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(analysis).map(([key, group], index) => {
          const pct = getPercentage(group.value);
          const isOver = pct > group.target;
          return (
            <motion.div 
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#161B29] p-6 rounded-3xl border border-white/5 shadow-sm relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{group.label}</p>
                  <p className="text-2xl font-black text-white">{formatCurrency(group.value)}</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                  isOver ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                )}>
                  {pct.toFixed(1)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Usage actuel</span>
                  <span>Cible: {group.target}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (pct / group.target) * 100)}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isOver ? "bg-rose-500" : "bg-[#2E5BFF]"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[#2E5BFF] text-white p-8 rounded-3xl shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            <p className="text-blue-100 font-bold uppercase tracking-wider text-xs mb-2">Capacité d'épargne actuelle</p>
            <h3 className="text-4xl font-black mb-4">{formatCurrency(balance > 0 ? balance : 0)}</h3>
            <div className="flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
              <span className={balance >= 0 ? "text-emerald-300" : "text-rose-300"}>
                {remainingPercentage.toFixed(1)}% du revenu disponible
              </span>
            </div>
          </div>

          <div className="bg-amber-900/10 p-6 rounded-3xl border border-amber-500/20 shadow-sm flex-1">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                  <Info size={20} />
                </div>
                <h4 className="font-bold text-amber-500">Analyse IA</h4>
             </div>
             <p className="text-sm text-amber-200 leading-relaxed font-medium">
                {balance < 0 ? (
                  "Attention ! Vos dépenses dépassent vos revenus. Pensez à réduire vos 'Envies' pour stabiliser votre budget."
                ) : remainingPercentage < 20 ? (
                  "Votre épargne est un peu faible. Essayez de réduire les dépenses non-essentielles pour atteindre l'objectif de 20%."
                ) : (
                  "Excellent ! Votre répartition respecte les principes de santé financière. Continuez ainsi pour bâtir votre patrimoine."
                )}
             </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161B29] rounded-3xl border border-white/5 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-white uppercase tracking-tight text-lg">Top Catégories de Dépenses</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <TrendingDown size={14} />
                Trié par impact financier
              </div>
            </div>
            
            <div className="p-8">
              {distributionData.length > 0 ? (
                <div className="space-y-8">
                  {distributionData.map((item, index) => (
                    <motion.div 
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-6 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-bold text-slate-300 group-hover:text-[#2E5BFF] transition-colors">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-white">{formatCurrency(item.value)}</p>
                          <p className="text-[10px] font-bold text-slate-500">{item.percentage.toFixed(1)}% du total</p>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, item.percentage)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full shadow-inner shadow-black/5"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <ArrowUpRight size={24} />
                  </div>
                  <p className="text-slate-400 font-medium">Enregistrez des transactions pour voir votre répartition.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
