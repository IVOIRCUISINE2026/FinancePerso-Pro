import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { Transaction, CategoryBudget, Income } from '../types';
import { formatCurrency, cn, getBudgetPeriodStart, getBudgetPeriodEnd } from '../lib/utils';
import { chatWithAI } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FinancialBotProps {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  incomes: Income[];
}

export function FinancialBot({ transactions, budgets, incomes }: FinancialBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Bonjour ! Je suis votre assistant financier FinancePerso Pro. Comment puis-je vous aider aujourd'hui ?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState<string[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Analyse mes dépenses du mois",
    "Est-ce que je dépasse mon budget ?",
    "Comment puis-je économiser davantage ?",
    "Quelles sont mes plus grosses dépenses ?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time budget analysis
  useEffect(() => {
    const alerts: string[] = [];
    const now = new Date();
    const startOfPeriod = getBudgetPeriodStart(now);
    const endOfPeriod = getBudgetPeriodEnd(now);
    
    budgets.forEach(budget => {
      const spent = transactions
        .filter(t => t.category === budget.category && t.date >= startOfPeriod && t.date <= endOfPeriod)
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (spent > budget.amount) {
        alerts.push(`Dépassement de budget pour **${budget.category}** : ${formatCurrency(spent)} dépensés sur ${formatCurrency(budget.amount)} prévus.`);
      } else if (spent > budget.amount * 0.9) {
        alerts.push(`Budget presque atteint pour **${budget.category}** : ${formatCurrency(spent)} dépensés (${Math.round((spent/budget.amount)*100)}%).`);
      }
    });

    if (JSON.stringify(alerts) !== JSON.stringify(budgetAlerts)) {
      setBudgetAlerts(alerts);
      if (alerts.length > 0) setShowAlerts(true);
    }
  }, [transactions, budgets, budgetAlerts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = {
        totalIncome: incomes.length > 0 ? incomes[0].salaryReceived : 0,
        budgets: budgets.map(b => ({ category: b.category, limit: b.amount })),
        recentTransactions: transactions.slice(0, 10).map(t => ({ 
          category: t.category, 
          amount: t.amount, 
          date: new Date(t.date).toLocaleDateString('fr-FR') 
        })),
        currentAlerts: budgetAlerts
      };

      const aiResponse = await chatWithAI([...messages, userMessage], context);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-[#161B29] rounded-3xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2E5BFF] flex items-center justify-center">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Conseiller Financier</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">En ligne</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-[#2E5BFF]/20 text-[#2E5BFF]' : 'bg-white/10 text-slate-400'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed relative ${
                  m.role === 'user' 
                    ? 'bg-[#2E5BFF] text-white rounded-tr-none' 
                    : 'bg-white/10 text-slate-200 border border-white/5 shadow-sm rounded-tl-none'
                }`}>
                  <div className="markdown-body prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                  {/* Bubble pointer */}
                  <div className={cn(
                    "absolute top-0 w-3 h-3",
                    m.role === 'user' 
                      ? "right-[-6px] bg-[#2E5BFF] [clip-path:polygon(0_0,0_100%,100%_0)]" 
                      : "left-[-6px] bg-white/10 [clip-path:polygon(0_0,100%_0,100%_100%)]"
                  )} />
                </div>
              </div>
            </motion.div>
          ))}
          {messages.length === 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2 mb-4 ml-11"
            >
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q);
                  }}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:bg-[#2E5BFF]/10 hover:border-[#2E5BFF]/30 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-400">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm">
                  <Loader2 className="w-4 h-4 text-[#2E5BFF] animate-spin" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Budget Alerts Panel (Sticky footer above input) */}
      <AnimatePresence>
        {budgetAlerts.length > 0 && showAlerts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-6 pb-2"
          >
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 relative">
              <button 
                onClick={() => setShowAlerts(false)}
                className="absolute top-3 right-3 text-amber-500/50 hover:text-amber-500 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-2 text-amber-500">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Alertes Budgétaires</span>
              </div>
              <div className="space-y-1.5">
                {budgetAlerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-200/80">
                    <ChevronRight size={12} className="mt-0.5 shrink-0" />
                    <div className="markdown-body inline-block">
                      <ReactMarkdown>{alert}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez-moi une question sur vos finances..."
            className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2E5BFF]/50 transition-all font-medium shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 w-10 bg-[#2E5BFF] rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:scale-95 active:scale-90"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-3 text-center">
          L'IA peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  );
}
