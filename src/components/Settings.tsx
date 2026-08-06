import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { User as UserIcon, Wallet, CreditCard, Save, Bell, Mail, RefreshCw } from 'lucide-react';
import { Income, UserProfile, Transaction, FinancialReport } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { generateFinancialReport } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { X, History, FileText, ChevronRight } from 'lucide-react';

interface SettingsProps {
  user: User | null;
  incomes: Income[];
  transactions: Transaction[];
  reports: FinancialReport[];
  profile: UserProfile | null;
  onAddSalary: (amount: number) => void;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
  onAddReport: (content: string) => void;
}

export function Settings({ user, incomes, transactions, reports, profile, onAddSalary, onUpdateProfile, onAddReport }: SettingsProps) {
  const [salary, setSalary] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const currentSalary = incomes.length > 0 ? incomes[0].salaryReceived : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salary) return;
    onAddSalary(parseFloat(salary));
    setSalary('');
  };

  const generateReportPreview = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateFinancialReport(transactions, incomes);
      setReportContent(report);
      onAddReport(report); // Save report to history
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de la génération du rapport.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Configuration</h2>
          <p className="text-slate-500">Personnalisez votre expérience et gérez vos finances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-xl ring-1 ring-slate-100">
                   {user?.photoURL ? (
                     <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   ) : (
                     <UserIcon size={32} className="text-slate-400" />
                   )}
                </div>
                <div>
                  <h3 className="font-black text-2xl text-slate-800 tracking-tight">{user?.displayName || "Utilisateur"}</h3>
                  <p className="text-slate-400 font-medium">{user?.email}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100">Membre Premium</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-slate-700 flex items-center gap-2 uppercase text-xs tracking-widest">
                      <Wallet size={16} className="text-blue-500" />
                      Configuration du salaire
                    </h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-md uppercase">Actif</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                      <p className="text-xs text-slate-400 font-bold mb-2">SOLDE DE RÉFÉRENCE ACTUEL</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(currentSalary)}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 w-full flex flex-col gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                          placeholder="Entrez le nouveau montant..."
                          className="w-full pl-4 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-lg text-black"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">F.CFA</div>
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                      >
                        <RefreshCw size={18} />
                        Mettre à jour
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h3 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-2">
              <RefreshCw size={20} className="text-blue-500" />
              Automatisation & IA
            </h3>
            
            <div className="space-y-4">
              <div className="group p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">Rapports Hebdomadaires</h4>
                      <p className="text-slate-500 text-sm max-w-md">Recevez une analyse détaillée de vos dépenses chaque lundi matin par email.</p>
                      {profile?.weeklyReports && (
                        <button 
                          onClick={generateReportPreview}
                          disabled={isGeneratingReport}
                          className="mt-4 flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl"
                        >
                          {isGeneratingReport ? (
                            <RefreshCw className="animate-spin" size={14} />
                          ) : (
                            <CreditCard size={14} />
                          )}
                          Générer un rapport instantané
                        </button>
                      )}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={profile?.weeklyReports || false}
                      onChange={(e) => onUpdateProfile({ weeklyReports: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                  </label>
                </div>
              </div>

              <div className="group p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Bell size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">Alertes de dépassement</h4>
                      <p className="text-slate-500 text-sm max-w-md">Être alerté instantanément quand vous dépassez 80% du budget d'une catégorie.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={profile?.budgetNotifications || false}
                      onChange={(e) => onUpdateProfile({ budgetNotifications: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-all"></div>
            <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-6">Résumé de l'Utilisation</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-slate-400 text-sm">Emails envoyés</span>
                <span className="font-black">{reports.filter(r => r.content.length > 0).length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-slate-400 text-sm">Alertes reçues</span>
                <span className="font-black">04</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Prochain rapport</span>
                <span className="font-black text-blue-400">Lun. 08H00</span>
              </div>
            </div>
            <button 
              onClick={() => setShowHistory(true)}
              className="w-full mt-8 bg-white/10 hover:bg-white/20 transition-all py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 flex items-center justify-center gap-2"
            >
              <History size={16} />
              Historique des rapports
            </button>
          </div>

          <div className="bg-emerald-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 blur-2xl -mr-12 -mt-12"></div>
            <RefreshCw size={40} className="mb-4 opacity-50" />
            <h4 className="font-black text-xl mb-2">Optimizer v2.0</h4>
            <p className="text-emerald-100 text-sm mb-6 leading-relaxed">Le système d'IA analyse vos transactions en temps réel pour optimiser vos rapports hebdomadaires.</p>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white w-3/4"></div>
            </div>
            <p className="mt-4 text-[10px] font-black uppercase opacity-60">IA Performance : 94%</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <History size={20} />
                  </div>
                  <h3 className="font-black text-xl text-slate-800">Historique</h3>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {reports.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">Aucun rapport généré</p>
                  </div>
                ) : (
                  reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => {
                        setReportContent(report.content);
                        setShowHistory(false);
                      }}
                      className="w-full p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight">Rapport hebdomadaire</p>
                          <p className="text-xs text-slate-400 font-bold">{formatDate(report.createdAt)}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reportContent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                    <RefreshCw size={20} />
                  </div>
                  <h3 className="font-black text-xl text-slate-800">Rapport financier IA</h3>
                </div>
                <button 
                  onClick={() => setReportContent(null)}
                  className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <div className="prose prose-slate max-w-none text-black font-bold prose-p:text-black prose-p:font-black prose-headings:text-black prose-headings:font-black prose-strong:text-black prose-strong:font-black prose-li:text-black prose-li:font-black">
                  <Markdown>{reportContent}</Markdown>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setReportContent(null)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
