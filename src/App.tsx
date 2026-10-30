import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { BudgetDistribution } from './components/BudgetDistribution';
import { Settings } from './components/Settings';
import { Summary } from './components/Summary';
import { TransactionForm } from './components/TransactionForm';
import { FinancialBot } from './components/FinancialBot';
import { ConfirmModal } from './components/ConfirmModal';
import { useFinance } from './hooks/useFinance';
import { signInWithGoogle } from './lib/firebase';
import { Wallet, LogIn, Loader2, Sparkles, Video, Play, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DateTimeDisplay } from './components/DateTimeDisplay';
import { formatCurrency, cn, getBudgetPeriodStart, getBudgetPeriodEnd, getAvailableCategories } from './lib/utils';
import { exportBudgetStatusToPDF, exportDetailedExpensesToPDF } from './lib/pdfExport';
import { Archives } from './components/Archives';
import { VideoTourModal } from './components/VideoTourModal';
import { UnauthorizedDomainBanner } from './components/UnauthorizedDomainBanner';

export default function App() {
  const { 
    user, 
    loading, 
    isGuest,
    loginAsGuest,
    logout,
    transactions, 
    incomes, 
    budgets,
    reports,
    archives,
    profile,
    addTransaction, 
    deleteTransaction,
    deleteTransactionsByCategory,
    deleteCategoryBudget,
    addIncome, 
    addReport,
    syncUserProfile,
    updateUserProfile,
    updateCategoryBudget,
    archiveMonth,
    deleteArchive
  } = useFinance();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isForcedLandscape, setIsForcedLandscape] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<React.ReactNode | null>(null);
  const [showAutoArchiveSuccess, setShowAutoArchiveSuccess] = useState<string | null>(null);
  const [isVideoTourOpen, setIsVideoTourOpen] = useState(false);

  // Automatic archive on the 25th of the month
  useEffect(() => {
    if (!user || loading || (transactions.length === 0 && incomes.length === 0)) return;

    const today = new Date();
    if (today.getDate() === 25) {
      const monthYearKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const dStart = new Date(today.getFullYear(), today.getMonth() - 1, 25);
      const dEnd = new Date(today.getFullYear(), today.getMonth(), 25);
      const completedPeriodLabel = `Période du ${dStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${dEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      const capitalizedMonthLabel = completedPeriodLabel;

      const isAlreadyArchived = archives && archives.some(arch => arch.id === monthYearKey);
      if (!isAlreadyArchived) {
        archiveMonth(monthYearKey, capitalizedMonthLabel).then(() => {
          setShowAutoArchiveSuccess(capitalizedMonthLabel);
        }).catch((err) => {
          console.error("Auto archive failed", err);
        });
      }
    }
  }, [user, loading, transactions, incomes, archives, archiveMonth]);

  useEffect(() => {
    if (user) {
      syncUserProfile();
    }
  }, [user]);

  const handlePrint = () => {
    exportBudgetStatusToPDF(transactions, budgets);
  };

  const handleExportDetails = () => {
    exportDetailedExpensesToPDF(transactions);
  };

  const toggleOrientation = async () => {
    try {
      if (!isForcedLandscape) {
        // Try hardware lock if possible
        if (typeof screen.orientation !== 'undefined' && 'lock' in screen.orientation) {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
          await (screen.orientation as any).lock('landscape');
        }
      } else {
        if (typeof screen.orientation !== 'undefined' && 'unlock' in screen.orientation) {
          (screen.orientation as any).unlock();
          if (document.fullscreenElement) {
            await document.exitFullscreen();
          }
        }
      }
    } catch (e) {
      console.log('Mobile orientation lock not supported or failed', e);
    }
    setIsForcedLandscape(!isForcedLandscape);
  };

  const hasBudgetAlerts = budgets.some(budget => {
    const now = new Date();
    const startOfPeriod = getBudgetPeriodStart(now);
    const endOfPeriod = getBudgetPeriodEnd(now);
    const spent = transactions
      .filter(t => t.category === budget.category && t.date >= startOfPeriod && t.date <= endOfPeriod)
      .reduce((sum, t) => sum + t.amount, 0);
    return spent > budget.amount;
  });

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/network-request-failed' ||
        (error?.message && error.message.includes('Pending promise was never set'))
      ) {
        console.warn("Login attempt was interrupted or cancelled:", error?.code || error?.message);
      } else {
        console.warn("Login attempt issue:", error);
      }
      
      if (error.code === 'auth/popup-blocked') {
        setLoginError("Le popup de connexion a été bloqué par votre navigateur. Veuillez autoriser les fenêtres contextuelles et réessayer.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLoginError("La fenêtre de connexion a été fermée avant la validation. Vous pouvez réitérer la connexion en cliquant sur le bouton ci-dessous.");
      } else if (error.code === 'auth/network-request-failed' || (error.message && error.message.includes('network-request-failed'))) {
        setLoginError("Une erreur réseau s'est produite lors de la connexion. Vérifiez votre connexion internet et réessayez.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        setLoginError("La requête de connexion a été annulée. Veuillez réessayer.");
      } else if (error.code === 'auth/unauthorized-domain' || (error.message && error.message.includes('unauthorized-domain'))) {
        setLoginError(<UnauthorizedDomainBanner onContinueGuest={loginAsGuest} />);
      } else if (error.code === 'auth/internal-error') {
        setLoginError("Erreur interne d'authentification. Veuillez réessayer.");
      } else if (error.code === 'auth/argument-error' || (error.message && error.message.includes('argument-error'))) {
        setLoginError("Erreur de configuration d'authentification. Veuillez réessayer.");
      } else if (error.message && error.message.includes('Assertion')) {
        setLoginError("Une restriction du navigateur est survenue. Veuillez vérifier vos paramètres et réessayer.");
      } else {
        setLoginError(`Erreur de connexion (${error.code || 'inconnue'}). Veuillez réessayer.`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };


  const handleAddTransaction = async (data: { amount: number, category: string, date: number, note: string }) => {
    await addTransaction(data);
    setActiveTab('dashboard');

    // Alert check (10% of last salary)
    const currentSalary = incomes.length > 0 ? incomes[0].salaryReceived : 0;
    const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0) + data.amount;
    const balance = currentSalary - totalSpent;
    if (balance < (0.1 * currentSalary)) {
      alert(`Attention ! Votre solde (${formatCurrency(balance)}) est inférieur à 10% de votre salaire.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2E5BFF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="w-16 h-16 rounded-3xl bg-[#2E5BFF] flex items-center justify-center shadow-xl shadow-blue-500/25 mb-6 animate-pulse">
          <Wallet size={32} className="text-white" />
        </div>
        <div className="flex items-center gap-3 text-slate-300 font-bold text-sm">
          <Loader2 className="animate-spin text-[#2E5BFF]" size={18} />
          <span>Sécurisation & Vérification de session...</span>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4 md:p-6 text-white relative overflow-y-auto">
        {/* Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2E5BFF]/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px]" />
        </div>

        {/* Date Time Bar at Top */}
        <div className="w-full max-w-md flex justify-center mb-6 z-10">
          <DateTimeDisplay />
        </div>

        <div className="w-full max-w-md bg-[#161B29]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-2xl relative z-10 space-y-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl bg-[#2E5BFF] flex items-center justify-center shadow-2xl shadow-blue-500/40 relative group">
            <Wallet size={38} className="text-white" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#161B29] flex items-center justify-center text-white text-[10px]">
              <ShieldCheck size={12} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              FinancePerso Pro
            </h1>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm mx-auto">
              Gérez votre salaire, suivez vos dépenses et optimisez votre budget mensuel.
            </p>
          </div>

          {/* Security badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <ShieldCheck size={14} className="text-blue-400" />
            <span>Sécurité Firebase Authentication Activée</span>
          </div>

          {/* Error notice if present */}
          {loginError && (
            <div className="w-full">
              {typeof loginError === 'string' ? (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-300 text-left space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-rose-200">
                    <ShieldAlert size={16} />
                    <span>Notification de connexion</span>
                  </div>
                  <p>{loginError}</p>
                </div>
              ) : (
                loginError
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="w-full space-y-3 pt-2">
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#2E5BFF] hover:bg-[#254ED9] text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Se connecter avec Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={loginAsGuest}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 py-3 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-xs text-slate-300 hover:text-white"
            >
              <Sparkles size={14} className="text-emerald-400" />
              <span>Ouvrir l'application en mode Démo (Sans compte)</span>
            </button>
          </div>

          {/* Video Tour card matching design */}
          <div 
            onClick={() => setIsVideoTourOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 hover:from-blue-600/25 hover:via-indigo-600/25 hover:to-purple-600/25 border border-blue-500/30 rounded-2xl p-3.5 transition-all cursor-pointer group flex items-center justify-between gap-3 text-left shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#2E5BFF] flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Video size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-white text-xs md:text-sm">FinancePerso Pro en vidéo</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-500/30">
                    Voix off
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Toutes les rubriques (20s chacune avec voix off)</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white shrink-0 transition-colors">
              <Play size={12} className="fill-white" />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            En vous connectant, vous acceptez nos conditions d'utilisation.
          </p>
        </div>

        {/* Video Tour Modal */}
        <VideoTourModal 
          isOpen={isVideoTourOpen} 
          onClose={() => setIsVideoTourOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0B0F19] relative overflow-hidden">
      {/* Background Decorative Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2E5BFF]/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" 
        />
      </div>

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={logout} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onExportStatus={handlePrint}
        onExportDetails={handleExportDetails}
        onToggleOrientation={toggleOrientation}
        onOpenVideoTour={() => setIsVideoTourOpen(true)}
        hasBudgetAlerts={hasBudgetAlerts}
      />

      {/* Floating Assistant Bubble */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveTab('assistant')}
        className={cn(
          "fixed bottom-8 right-8 w-14 h-14 bg-[#2E5BFF] rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center text-white z-50 md:hidden",
          activeTab === 'assistant' && "hidden"
        )}
      >
        <Sparkles size={24} />
        {hasBudgetAlerts && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#161B29] flex items-center justify-center text-[10px] font-bold">
            !
          </span>
        )}
      </motion.button>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sticky top-0 z-20 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsVideoTourOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 hover:from-blue-600/30 hover:via-indigo-600/30 hover:to-purple-600/30 border border-blue-500/30 text-white text-xs font-bold transition-all shadow-sm active:scale-95 group"
            >
              <div className="w-5 h-5 rounded-lg bg-[#2E5BFF] flex items-center justify-center text-white shrink-0">
                <Video size={12} />
              </div>
              <span>FinancePerso Pro en vidéo</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-500/30">
                Voix off
              </span>
            </button>
            {isGuest ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Sparkles size={13} className="text-amber-400" />
                <span>Mode Démo (Invité)</span>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="ml-1 underline text-white hover:text-amber-200 font-bold"
                >
                  Se connecter
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>Sécurité Firebase Activée</span>
              </div>
            )}
          </div>
          <div className="pointer-events-auto">
            <DateTimeDisplay />
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                transactions={transactions} 
                incomes={incomes} 
                budgets={budgets}
                onTabChange={setActiveTab}
                onDeleteTransaction={deleteTransaction}
                onClearCategory={deleteTransactionsByCategory}
                onUpdateBudget={updateCategoryBudget}
                onDeleteCategoryBudget={deleteCategoryBudget}
              />
            )}
            
            {activeTab === 'add' && (
              <div className="max-w-xl mx-auto pt-12">
                <TransactionForm 
                  onAdd={handleAddTransaction} 
                  categories={getAvailableCategories(budgets, transactions)}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <Analytics transactions={transactions} incomes={incomes} />
            )}

            {activeTab === 'summary' && (
              <Summary transactions={transactions} incomes={incomes} budgets={budgets} />
            )}
            
            {activeTab === 'assistant' && (
              <FinancialBot transactions={transactions} budgets={budgets} incomes={incomes} />
            )}

            {activeTab === 'archives' && (
              <Archives 
                archives={archives}
                transactions={transactions}
                incomes={incomes}
                budgets={budgets}
                onArchiveMonth={archiveMonth}
                onDeleteArchive={deleteArchive}
              />
            )}

            {activeTab === 'distribution' && (
              <BudgetDistribution transactions={transactions} incomes={incomes} budgets={budgets} />
            )}

            {activeTab === 'settings' && (
              <Settings 
                user={user} 
                incomes={incomes} 
                transactions={transactions}
                reports={reports}
                profile={profile}
                onAddSalary={addIncome} 
                onUpdateProfile={updateUserProfile}
                onAddReport={addReport}
                isGuest={isGuest}
                onLoginGoogle={handleLogin}
                isLoggingIn={isLoggingIn}
                loginError={loginError}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Auto archive success modal */}
      <ConfirmModal
        isOpen={showAutoArchiveSuccess !== null}
        onClose={() => setShowAutoArchiveSuccess(null)}
        onConfirm={() => setShowAutoArchiveSuccess(null)}
        title="Archivage automatique réussi !"
        message={`Nous sommes le 25 du mois ! Vos données financières de la période active ont été archivées avec succès dans l'onglet 'Archives' sous '${showAutoArchiveSuccess}', et votre tableau de bord actuel a été réinitialisé.`}
        confirmText="Compris !"
        cancelText="Fermer"
        variant="primary"
      />

      {/* Video Tour Modal in Authenticated View */}
      <VideoTourModal 
        isOpen={isVideoTourOpen} 
        onClose={() => setIsVideoTourOpen(false)} 
      />
    </div>
  );
}
