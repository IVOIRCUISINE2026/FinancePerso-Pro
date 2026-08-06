import { Transaction, Income } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../lib/utils';

interface AnalyticsProps {
  transactions: Transaction[];
  incomes: Income[];
}

const COLORS = ['#2E5BFF', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function Analytics({ transactions, incomes }: AnalyticsProps) {
  // Pie Chart Data: Expenses by Category
  const categoryData = transactions.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  // Bar Chart Data: Daily spends for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    return d.getTime();
  }).reverse();

  const dailyStats = last7Days.map(time => {
    const amount = transactions.filter(t => new Date(t.date).setHours(0, 0, 0, 0) === time)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return {
      name: new Date(time).toLocaleDateString('fr-FR', { weekday: 'short' }),
      amount
    };
  });

  const totalSalary = incomes.length > 0 ? incomes[0].salaryReceived : 0;
  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const highestCategory = categoryData.length > 0 
    ? [...categoryData].sort((a, b) => b.value - a.value)[0] 
    : { name: 'Aucune', value: 0 };
  const avgDaily = totalSpent / (transactions.length > 0 ? (Math.max(1, (Date.now() - Math.min(...transactions.map(t => t.date))) / (1000 * 60 * 60 * 24))) : 1);
  const percentSpent = totalSalary > 0 ? (totalSpent / totalSalary) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Statistiques</h2>
        <p className="text-slate-400">Analysez vos habitudes de consommation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161B29] p-6 rounded-2xl border border-white/5">
          <p className="text-sm text-slate-500 mb-1">Catégorie la plus coûteuse</p>
          <p className="text-xl font-bold text-white">{highestCategory.name}</p>
          <p className="text-sm text-slate-400">{formatCurrency(highestCategory.value)}</p>
        </div>
        <div className="bg-[#161B29] p-6 rounded-2xl border border-white/5">
          <p className="text-sm text-slate-500 mb-1">Moyenne quotidienne</p>
          <p className="text-xl font-bold text-white">{formatCurrency(avgDaily)}</p>
          <p className="text-sm text-slate-400">basé sur l'activité</p>
        </div>
        <div className="bg-[#161B29] p-6 rounded-2xl border border-white/5">
          <p className="text-sm text-slate-500 mb-1">Dépensé du salaire</p>
          <p className="text-xl font-bold text-[#F43F5E]">{percentSpent.toFixed(1)}%</p>
          <div className="w-full bg-white/5 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#F43F5E] h-full" style={{ width: `${Math.min(100, percentSpent)}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#161B29] p-6 rounded-2xl border border-white/5 h-96">
          <h3 className="font-bold text-white mb-6">Répartition par catégorie</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#161B29', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => formatCurrency(value)} 
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#161B29] p-6 rounded-2xl border border-white/5 h-96">
          <h3 className="font-bold text-white mb-6">Évolution journalière (7j)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#161B29', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => formatCurrency(value)} 
              />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
