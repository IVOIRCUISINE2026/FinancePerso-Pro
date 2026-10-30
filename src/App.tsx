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
import { Wallet, LogIn, Loader2, Sparkles, Video, Play } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0F19] text-white p-6 space-y-4">
        <Loader2 className="w-9 h-9 text-[#2E5BFF] animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Chargement de FinancePerso Pro...</p>
        <button
          type="button"
          onClick={loginAsGuest}
          className="text-xs text-blue-400 hover:text-blue-300 underline pt-2"
        >
          Ouvrir immédiatement l'application (Mode Démo)
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0F19] p-6 relative overflow-y-auto">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-10 z-20">
          <DateTimeDisplay />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#161B29] p-8 sm:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-7 border border-white/5 my-auto"
        >
          <div className="w-20 h-20 bg-[#2E5BFF] rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <Wallet className="text-white" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight">FinancePerso Pro</h1>
            <p className="text-slate-400 text-sm leading-relaxed">Gérez votre salaire, suivez vos dépenses et optimisez votre budget mensuel.</p>
          </div>
          
          {loginError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="w-full text-left"
            >
              {typeof loginError === 'string' ? (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs font-medium border border-red-500/20">
                  {loginError}
                </div>
              ) : (
                loginError
              )}
            </motion.div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#2E5BFF] flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-bold text-white hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 text-sm"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <LogIn size={18} className="text-white" />
              )}
              {isLoggingIn ? "Connexion Google..." : "Se connecter avec Google"}
            </button>

            <button
              type="button"
              onClick={loginAsGuest}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold transition-all active:scale-95 text-xs"
            >
              <Sparkles size={15} className="text-emerald-400" />
              <span>Ouvrir l'application en mode Démo (Sans compte)</span>
            </button>
          </div>

          {/* Option FinancePerso Pro en vidéo */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsVideoTourOpen(true)}
              className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 hover:from-blue-600/30 hover:via-indigo-600/30 hover:to-purple-600/30 text-white border border-blue-500/30 hover:border-blue-400/50 flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group shadow-lg shadow-blue-500/10 active:scale-95"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E5BFF] to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
                  <Video size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">FinancePerso Pro en vidéo</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                      Voix off
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Toutes les rubriques expliquées (20s chacune avec voix off)</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-[#2E5BFF] transition-all shrink-0">
                <Play size={13} className="translate-x-0.5" />
              </div>
            </button>
          </div>
          
          <p className="text-xs text-slate-500">
            En vous connectant, vous acceptez nos conditions d'utilisation.
          </p>
        </motion.div>

        {/* Video Tour Modal on Home Page */}
        <VideoTourModal 
          isOpen={isVideoTourOpen} 
          onClose={() => setIsVideoTourOpen(false)} 
          onLaunchDemo={loginAsGuest}
        />
      </div>
    );
  }

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
        <div className="flex justify-end mb-8 sticky top-0 z-20 pointer-events-none">
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
