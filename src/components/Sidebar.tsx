import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, PieChart, Settings, LogOut, Wallet, ChevronLeft, ChevronRight, LayoutList, BarChart3, Printer, Phone, User, RotateCcw, Sparkles, Archive } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ConfirmModal } from './ConfirmModal';
import { PrintOptionsModal } from './PrintOptionsModal';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  isCollapsed: boolean;
  variant?: 'default' | 'printer';
  hasAlert?: boolean;
}

function NavItem({ icon: Icon, label, active, onClick, isCollapsed, variant = 'default', hasAlert }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 px-4 py-3 w-full text-left transition-all font-medium relative group",
        active 
          ? "text-[#2E5BFF] bg-blue-500/10" 
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
        variant === 'printer' && "mt-4 text-[#3B82F6] hover:text-[#60A5FA] border-t border-white/5 pt-6"
      )}
    >
      <div className="relative shrink-0">
        <Icon size={20} className={cn(active ? "text-[#2E5BFF]" : variant === 'printer' ? "text-[#3B82F6]" : "text-slate-400 group-hover:text-slate-200")} />
        {hasAlert && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#161B29] shadow-lg shadow-rose-500/20" 
          />
        )}
      </div>
      {!isCollapsed && <span className="truncate">{label}</span>}
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 top-2 bottom-2 w-1 bg-[#2E5BFF] rounded-r-full" 
        />
      )}
    </button>
  );
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onExportStatus?: () => void;
  onExportDetails?: () => void;
  onToggleOrientation?: () => void;
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  onLogout, 
  isCollapsed, 
  setIsCollapsed, 
  onExportStatus, 
  onExportDetails,
  onToggleOrientation,
  hasBudgetAlerts
}: SidebarProps & { hasBudgetAlerts?: boolean }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  return (
    <>
      <motion.div 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        className="bg-[#161B29] border-r border-white/5 flex flex-col h-full relative"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-[#161B29] border border-white/10 rounded-full p-1 shadow-sm hover:bg-[#1E2533] z-50 text-slate-400 hover:text-slate-200"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={cn("p-6 flex items-center gap-3 mb-4 overflow-hidden", isCollapsed && "px-4")}>
          <div className="shrink-0 w-10 h-10 bg-[#2E5BFF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Wallet className="text-white" size={24} />
          </div>
          {!isCollapsed && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl text-white tracking-tight whitespace-nowrap"
            >
              FinancePerso Pro
            </motion.h1>
          )}
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem 
            icon={LayoutDashboard} 
            label="Accueil" 
            active={activeTab === 'dashboard'} 
            onClick={() => onTabChange('dashboard')} 
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={PlusCircle} 
            label="Ajouter" 
            active={activeTab === 'add'} 
            onClick={() => onTabChange('add')} 
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={LayoutList} 
            label="Répartition" 
            active={activeTab === 'distribution'} 
            onClick={() => onTabChange('distribution')} 
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={PieChart} 
            label="Statistiques" 
            active={activeTab === 'analytics'} 
            onClick={() => onTabChange('analytics')} 
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={BarChart3} 
            label="Synthèse" 
            active={activeTab === 'summary'} 
            onClick={() => onTabChange('summary')} 
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={Sparkles} 
            label="Espace AI" 
            active={activeTab === 'assistant'} 
            onClick={() => onTabChange('assistant')} 
            isCollapsed={isCollapsed}
            hasAlert={hasBudgetAlerts}
          />
          <NavItem 
            icon={Archive} 
            label="Archives" 
            active={activeTab === 'archives'} 
            onClick={() => onTabChange('archives')} 
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={Settings} 
            label="Paramètres" 
            active={activeTab === 'settings'} 
            onClick={() => onTabChange('settings')} 
            isCollapsed={isCollapsed}
          />
          
          <NavItem 
            icon={Printer} 
            label="Imprimer Rapport" 
            onClick={() => setShowPrintModal(true)} 
            isCollapsed={isCollapsed}
            variant="printer"
          />

          <NavItem 
            icon={RotateCcw} 
            label="Orientation" 
            onClick={() => onToggleOrientation?.()} 
            isCollapsed={isCollapsed}
          />
        </nav>

        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-6 p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <User size={12} className="text-[#3B82F6]" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Concepteur</span>
            </div>
            <p className="text-sm font-bold text-white mb-1.5 leading-tight">Jean Cyrille AHORET</p>
            <div className="flex items-center gap-2 text-slate-400 group cursor-pointer hover:text-slate-300 transition-colors">
              <Phone size={10} className="text-[#3B82F6]" />
              <span className="text-[10px] font-medium tabular-nums tracking-wider">00225 0103697499</span>
            </div>
          </motion.div>
        )}

        <div className={cn("p-4 border-t border-white/5", isCollapsed && "px-2")}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? "Déconnexion" : undefined}
            className={cn(
              "flex items-center gap-3 px-4 py-3 w-full text-left text-rose-500 hover:bg-rose-500/10 transition-colors font-medium rounded-xl",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </motion.div>

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={onLogout}
        title="Se déconnecter ?"
        message="Vos données sont sauvegardées en toute sécurité dans le cloud et ne seront pas effacées. Vous pourrez les retrouver en vous reconnectant."
        confirmText="Déconnexion"
        cancelText="Rester connecté"
        variant="danger"
      />

      <PrintOptionsModal 
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onExportStatus={onExportStatus || (() => {})}
        onExportDetails={onExportDetails || (() => {})}
      />
    </>
  );
}
