import React from 'react';
import { Transaction, Income, CategoryBudget } from '../types';
import { formatCurrency, cn, getBudgetPeriodStart, getBudgetPeriodEnd, formatBudgetPeriod } from '../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SummaryProps {
  transactions: Transaction[];
  incomes: Income[];
  budgets: CategoryBudget[];
}

export function Summary({ transactions, incomes, budgets }: SummaryProps) {
  const now = new Date();

  const totalSalary = incomes.length > 0 ? incomes[0].salaryReceived : 0;
  
  // Calculate this current period's stats (25th to 25th)
  const thisMonthStart = getBudgetPeriodStart(now);
  const thisMonthEnd = getBudgetPeriodEnd(now);
  const thisMonthTransactions = transactions.filter(t => t.date >= thisMonthStart && t.date <= thisMonthEnd);
  const thisMonthSpent = thisMonthTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Calculate last period's stats (25th to 25th of last month) for comparison
  const dPrev = new Date(thisMonthStart);
  dPrev.setMonth(dPrev.getMonth() - 1);
  const lastMonthStart = getBudgetPeriodStart(dPrev);
  const lastMonthEnd = getBudgetPeriodEnd(dPrev);
  const lastMonthTransactions = transactions.filter(t => t.date >= lastMonthStart && t.date <= lastMonthEnd);
  const lastMonthSpent = lastMonthTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const diffSpent = lastMonthSpent > 0 ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100 : 0;
  const savingsRate = totalSalary > 0 ? ((totalSalary - thisMonthSpent) / totalSalary) * 100 : 0;

  // Category breakdown for chart
  const categoryData = thisMonthTransactions.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Synthèse Financière</h2>
          <p className="text-slate-400 mt-1">Analyse approfondie de votre comportement financier ce mois-ci.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-500/20">
            {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(now)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Consommation Revenu" 
          value={`${((thisMonthSpent / (totalSalary || 1)) * 100).toFixed(1)}%`}
          subtitle="Part du salaire dépensée"
          icon={Zap}
          trend={thisMonthSpent > totalSalary ? "Surconsommation" : "Sous contrôle"}
          trendColor={thisMonthSpent > totalSalary ? "text-rose-500" : "text-emerald-500"}
        />
        <SummaryCard 
          title="Économies Prévues" 
          value={formatCurrency(Math.max(0, totalSalary - thisMonthSpent))}
          subtitle="Reste à la fin du mois"
          icon={Target}
          trend={`${savingsRate.toFixed(1)}% du revenu`}
          trendColor="text-blue-400"
        />
        <SummaryCard 
          title="Comparaisons" 
          value={formatCurrency(thisMonthSpent)}
          subtitle="vs mois dernier"
          icon={diffSpent > 0 ? TrendingUp : TrendingDown}
          trend={`${diffSpent > 0 ? '+' : ''}${diffSpent.toFixed(1)}%`}
          trendColor={diffSpent > 0 ? "text-rose-500" : "text-emerald-500"}
        />
        <SummaryCard 
          title="Moyenne Quotidienne" 
          value={formatCurrency(thisMonthSpent / (now.getDate() || 1))}
          subtitle="Rythme de dépense"
          icon={PieChartIcon}
          trend="Calculé au prorata"
          trendColor="text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#161B29] rounded-3xl p-8 border border-white/5 shadow-2xl">
          <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            Répartition des Dépenses
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#161B29] rounded-3xl p-8 border border-white/5 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-white mb-2">Santé Financière</h3>
            <p className="text-slate-400 text-sm mb-8">Analyse automatique du moteur IA.</p>
            
            <div className="space-y-6">
              <HealthMetric 
                label="Limites Budgétaires" 
                value={budgets.length > 0 ? "Configuré" : "Non défini"}
                status={budgets.length > 0 ? "good" : "warning"}
              />
              <HealthMetric 
                label="Ratio d'Épargne" 
                value={savingsRate > 20 ? "Excellent" : savingsRate > 0 ? "Correct" : "Critique"}
                status={savingsRate > 20 ? "good" : savingsRate > 0 ? "warning" : "bad"}
              />
              <HealthMetric 
                label="Rythme de Croissance" 
                value={diffSpent < 0 ? "En baisse" : "En hausse"}
                status={diffSpent < 0 ? "good" : "warning"}
              />
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <p className="text-blue-400 text-sm font-medium italic">
              {savingsRate > 30 
                ? "Excellent travail ! Votre taux d'épargne est bien au-dessus de la moyenne. Pensez à investir le surplus." 
                : "Vous dépensez une part importante de votre revenu. Essayez de réduire les dépenses non essentielles."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon: Icon, trend, trendColor }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161B29] p-6 rounded-3xl border border-white/5 shadow-xl"
    >
      <div className="bg-white/5 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
        <Icon className="text-blue-500" size={24} />
      </div>
      <div>
        <h4 className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">{title}</h4>
        <div className="text-2xl font-black text-white mb-1">{value}</div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-[10px] font-bold uppercase">{subtitle}</span>
          <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-black/20", trendColor)}>
            {trend}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function HealthMetric({ label, value, status }: { label: string, value: string, status: 'good' | 'warning' | 'bad' }) {
  const colors = {
    good: 'bg-emerald-500',
    warning: 'bg-amber-500',
    bad: 'bg-rose-500'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white font-bold">{value}</p>
      </div>
      <div className={cn("w-3 h-3 rounded-full shadow-lg", colors[status], status === 'good' ? 'shadow-emerald-500/20' : status === 'warning' ? 'shadow-amber-500/20' : 'shadow-rose-500/20')} />
    </div>
  );
}
