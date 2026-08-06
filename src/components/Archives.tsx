import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Archive as ArchiveIcon, Calendar, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight, Wallet, Info, Download } from 'lucide-react';
import { Archive, Transaction, Income, CategoryBudget } from '../types';
import { formatCurrency, formatDate, cn, getBudgetPeriodStart, getBudgetPeriodEnd, formatBudgetPeriod } from '../lib/utils';
import { ConfirmModal } from './ConfirmModal';

interface ArchivesProps {
  archives: Archive[];
  transactions: Transaction[];
  incomes: Income[];
  budgets: CategoryBudget[];
  onArchiveMonth: (key: string, label: string) => Promise<void>;
  onDeleteArchive: (id: string) => Promise<void>;
}

export function Archives({
  archives,
  transactions,
  incomes,
  budgets,
  onArchiveMonth,
  onDeleteArchive
}: ArchivesProps) {
  const [expandedArchiveId, setExpandedArchiveId] = useState<string | null>(null);
  const [archiveToDelete, setArchiveToDelete] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showManualSuccess, setShowManualSuccess] = useState(false);

  const now = new Date();
  const startOfCurrentPeriod = getBudgetPeriodStart(now);
  const endOfCurrentPeriod = getBudgetPeriodEnd(now);
  const currentMonthYearKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const periodLabel = `Période ${formatBudgetPeriod(startOfCurrentPeriod, endOfCurrentPeriod)}`;
  const capitalizedLabel = periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1);

  // Check if current month is already archived
  const isCurrentMonthArchived = archives.some(arch => arch.id === currentMonthYearKey);
  const hasActiveData = transactions.length > 0 || incomes.length > 0;

  const handleManualArchive = async () => {
    if (!hasActiveData) return;
    setIsArchiving(true);
    try {
      await onArchiveMonth(currentMonthYearKey, capitalizedLabel);
      setShowManualSuccess(true);
      setTimeout(() => setShowManualSuccess(false), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (archiveToDelete) {
      await onDeleteArchive(archiveToDelete);
      setArchiveToDelete(null);
    }
  };

  const exportToCSV = (archive: Archive) => {
    const csvRows: string[] = [];

    // UTF-8 BOM so Excel opens with proper accents and semicolon separator
    csvRows.push('\uFEFF');

    // Headers & Information
    csvRows.push(`"Rapport Financier - ${archive.monthLabel}"`);
    csvRows.push(`"Archivé le";"${formatDate(archive.archivedAt)}"`);
    csvRows.push("");

    // Financial Summary
    csvRows.push('"RÉSUMÉ DU MOIS"');
    csvRows.push('"Indicateur";"Montant"');
    csvRows.push(`"Revenu total";"${archive.totalIncome.toFixed(2)} F.CFA"`);
    csvRows.push(`"Dépenses totales";"${archive.totalExpenses.toFixed(2)} F.CFA"`);
    const balance = archive.totalIncome - archive.totalExpenses;
    csvRows.push(`"Épargne globale";"${balance.toFixed(2)} F.CFA"`);
    csvRows.push("");

    // Incomes Section
    csvRows.push('"DÉTAIL DES REVENUS (VERSEMENTS DE SALAIRES)"');
    csvRows.push('"Date";"Montant"');
    if (archive.incomes && archive.incomes.length > 0) {
      archive.incomes.forEach(inc => {
        csvRows.push(`"${formatDate(inc.dateReceived)}";"${inc.salaryReceived.toFixed(2)} F.CFA"`);
      });
    } else {
      csvRows.push('"Aucun versement enregistré";""');
    }
    csvRows.push("");

    // Transactions Section
    csvRows.push('"DÉTAIL DES DÉPENSES (TRANSACTIONS)"');
    csvRows.push('"Date";"Catégorie";"Note / Description";"Montant"');
    if (archive.transactions && archive.transactions.length > 0) {
      archive.transactions.forEach(tx => {
        const escapedNote = (tx.note || "").replace(/"/g, '""');
        csvRows.push(`"${formatDate(tx.date)}";"${tx.category}";"${escapedNote}";"${tx.amount.toFixed(2)} F.CFA"`);
      });
    } else {
      csvRows.push('"Aucune dépense enregistrée";"";"";""');
    }

    // Create file trigger and download
    const csvContent = csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Archive_Financiere_${archive.monthLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Days till 25th of the month
  const today = now.getDate();
  const daysUntil25 = today <= 25 ? 25 - today : 25 + (new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - today);

  return (
    <div className="space-y-8 w-full p-4 md:p-0">
      {/* Header Banner */}
      <div className="bg-[#161B29] rounded-3xl p-10 text-center border border-white/5 relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#2E5BFF]/30" />
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#2E5BFF]/10 text-[#2E5BFF] rounded-xl flex items-center justify-center">
            <ArchiveIcon size={22} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Archives Mensuelles</h1>
        </div>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
          Conservez et analysez vos résumés financiers passés. Vos données de salaire et de dépenses sont automatiquement archivées chaque 25 du mois.
        </p>
        
        {/* Info Banner on Date 25 */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-4 py-2 rounded-full">
          <Calendar size={14} />
          {today === 25 ? (
            <span className="font-bold">Aujourd'hui, c'est le 25 du mois ! Archivage automatique et nettoyage activé.</span>
          ) : (
            <span>Dans <strong className="font-black">{daysUntil25} jours</strong> (le 25 du mois), la réinitialisation et l'archivage automatiques auront lieu.</span>
          )}
        </div>
      </div>

      {/* Manual Trigger Section */}
      {!isCurrentMonthArchived && (
        <div className="bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-left">
            <div className="w-10 h-10 bg-[#2E5BFF]/15 text-[#2E5BFF] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Info size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Archiver le mois en cours manuellement</h3>
              <p className="text-xs text-slate-400 mt-1">
                Transférez immédiatement vos {transactions.length} dépenses et vos salaires vers la base d'archives. Cela nettoiera l'affichage actuel.
              </p>
            </div>
          </div>
          <button
            onClick={handleManualArchive}
            disabled={!hasActiveData || isArchiving}
            className="shrink-0 bg-[#2E5BFF] hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-[#2E5BFF] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/15"
          >
            {isArchiving ? "Archivage..." : "Archiver maintenant"}
          </button>
        </div>
      )}

      {/* Success feedbacks */}
      <AnimatePresence>
        {showManualSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2"
          >
            <CheckCircle size={16} />
            <span>Le mois de {capitalizedLabel} a été archivé avec succès, et le tableau de bord actif est maintenant réinitialisé !</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archive Items List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span>Historique des archives ({archives.length})</span>
        </h2>

        {archives.length === 0 ? (
          <div className="bg-[#161B29] border border-white/5 rounded-2xl p-12 text-center text-slate-400">
            <ArchiveIcon size={40} className="mx-auto text-slate-600 mb-4" />
            <p className="text-sm font-medium">Aucun mois n'a encore été archivé.</p>
            <p className="text-xs text-slate-500 mt-1">Les données archivées apparaîtront ici dès le prochain 25 du mois.</p>
          </div>
        ) : (
          archives.map((archive) => {
            const isExpanded = expandedArchiveId === archive.id;
            const balance = archive.totalIncome - archive.totalExpenses;
            const savingsPercentage = archive.totalIncome > 0 ? (balance / archive.totalIncome) * 100 : 0;

            return (
              <motion.div
                key={archive.id}
                layout
                className="bg-[#161B29] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Header overview */}
                <div
                  onClick={() => setExpandedArchiveId(isExpanded ? null : archive.id)}
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-300">
                      <Calendar size={18} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-extrabold text-[#2E5BFF]">{archive.monthLabel}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Archivé le {formatDate(archive.archivedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Top totals */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-left w-full md:w-auto">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Revenu</span>
                      <span className="text-xs font-bold text-emerald-400">{formatCurrency(archive.totalIncome)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Dépenses</span>
                      <span className="text-xs font-bold text-rose-400">{formatCurrency(archive.totalExpenses)}</span>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Épargne ({savingsPercentage.toFixed(0)}%)</span>
                      <span className={cn("text-xs font-black", balance >= 0 ? "text-blue-400" : "text-amber-500")}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToCSV(archive);
                      }}
                      className="p-2 hover:bg-white/5 text-slate-400 hover:text-[#2E5BFF] rounded-lg transition-colors"
                      title="Exporter en CSV"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setArchiveToDelete(archive.id);
                      }}
                      className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-lg transition-colors"
                      title="Supprimer l'archive"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 hover:bg-white/5 text-slate-300 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/5 bg-[#121622] p-6 text-left overflow-hidden space-y-6"
                    >
                      {/* Export Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <div>
                          <h4 className="text-sm font-bold text-white">Exporter les données de ce mois</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Télécharger l'intégralité du récapitulatif ({archive.transactions?.length || 0} dépenses et {archive.incomes?.length || 0} revenus) au format CSV.</p>
                        </div>
                        <button
                          onClick={() => exportToCSV(archive)}
                          className="flex items-center gap-2 bg-[#2E5BFF] hover:bg-blue-600 font-bold text-white rounded-lg px-4 py-2 text-xs transition-all shadow-md shadow-blue-500/15 shrink-0"
                        >
                          <Download size={14} />
                          <span>Télécharger le CSV</span>
                        </button>
                      </div>

                      {/* Grid metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Revenu Total</span>
                            <span className="text-lg font-extrabold text-emerald-400">{formatCurrency(archive.totalIncome)}</span>
                          </div>
                          <ArrowUpRight size={24} className="text-emerald-500 opacity-40" />
                        </div>
                        <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Dépenses Totales</span>
                            <span className="text-lg font-extrabold text-rose-400">{formatCurrency(archive.totalExpenses)}</span>
                          </div>
                          <ArrowDownRight size={24} className="text-rose-500 opacity-40" />
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Épargne Totale</span>
                            <span className="text-lg font-extrabold text-blue-400">{formatCurrency(balance)}</span>
                          </div>
                          <Wallet size={24} className="text-blue-500 opacity-40" />
                        </div>
                      </div>

                      {/* Archived Transactions Table */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Historique détaillé des dépenses ({archive.transactions?.length || 0})</h4>
                        {(archive.transactions && archive.transactions.length > 0) ? (
                          <div className="border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-xs text-slate-300">
                              <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5 text-slate-400 text-[10px] uppercase font-bold">
                                  <th className="p-3 text-left">Date</th>
                                  <th className="p-3 text-left">Catégorie</th>
                                  <th className="p-3 text-left">Note</th>
                                  <th className="p-3 text-right">Montant</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {archive.transactions.map((tx, idx) => (
                                  <tr key={idx} className="hover:bg-white/[0.01]">
                                    <td className="p-3 text-slate-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                                    <td className="p-3">
                                      <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-bold">
                                        {tx.category}
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-300 max-w-[200px] truncate">{tx.note || '-'}</td>
                                    <td className="p-3 text-right font-bold text-rose-400 whitespace-nowrap">{formatCurrency(tx.amount)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Aucune transaction enregistrée pour ce mois.</p>
                        )}
                      </div>

                      {/* Archived Incomes Table */}
                      {archive.incomes && archive.incomes.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Versements de Salaires ({archive.incomes.length})</h4>
                          <div className="border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-xs text-slate-300">
                              <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5 text-slate-400 text-[10px] uppercase font-bold">
                                  <th className="p-3 text-left">Date</th>
                                  <th className="p-3 text-right">Montant Reçu</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {archive.incomes.map((inc, idx) => (
                                  <tr key={idx} className="hover:bg-white/[0.01]">
                                    <td className="p-3 text-slate-400 whitespace-nowrap">{formatDate(inc.dateReceived)}</td>
                                    <td className="p-3 text-right font-bold text-emerald-400 whitespace-nowrap">{formatCurrency(inc.salaryReceived)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={archiveToDelete !== null}
        onClose={() => setArchiveToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer cette archive ?"
        message="Cette action est irréversible. L'historique entier de ce mois sera définitivement effacé de la base."
        confirmText="Supprimer"
        cancelText="Conserver"
        variant="danger"
      />
    </div>
  );
}
