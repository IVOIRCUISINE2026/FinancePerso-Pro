import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';

interface UnauthorizedDomainBannerProps {
  onContinueGuest: () => void;
}

export function UnauthorizedDomainBanner({ onContinueGuest }: UnauthorizedDomainBannerProps) {
  const [copied, setCopied] = useState(false);
  const currentDomain = typeof window !== 'undefined' && window.location.hostname 
    ? window.location.hostname 
    : 'finance-perso-pro.vercel.app';
  
  const firebaseProjectId = 'gen-lang-client-0207544718';
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-red-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 text-left text-xs space-y-4 shadow-xl shadow-amber-500/5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <ShieldAlert size={18} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-amber-300">Domaine à autoriser sur Firebase</h4>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Google bloque la connexion car votre domaine de déploiement n'est pas encore enregistré dans la console de sécurité Firebase.
          </p>
        </div>
      </div>

      <div className="bg-[#0B0F19]/90 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between gap-2">
        <div className="truncate">
          <div className="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider">Domaine à copier</div>
          <code className="text-white font-mono text-xs font-semibold">{currentDomain}</code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition-colors active:scale-95 text-xs"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? 'Copié !' : 'Copier'}</span>
        </button>
      </div>

      <div className="space-y-2 bg-white/5 rounded-xl p-3 text-[11px] text-slate-300 border border-white/5">
        <div className="font-semibold text-white flex items-center gap-1.5">
          <span>Étapes rapides pour débloquer (1 minute) :</span>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
          <li>
            Ouvrez la{' '}
            <a 
              href={firebaseSettingsUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-medium underline inline-flex items-center gap-1"
            >
              Console Firebase (Paramètres d'authentification)
              <ExternalLink size={10} />
            </a>
          </li>
          <li>Descendez à la section <span className="text-white font-medium">« Domaines autorisés »</span> et cliquez sur <span className="text-white font-medium">« Ajouter un domaine »</span></li>
          <li>Collez <span className="text-amber-300 font-mono font-medium">{currentDomain}</span> et cliquez sur <span className="text-white font-medium">« Ajouter »</span></li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <a
          href={firebaseSettingsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-center text-xs shadow-md shadow-amber-500/20"
        >
          <span>Ouvrir la console Firebase</span>
          <ExternalLink size={14} />
        </a>

        <button
          type="button"
          onClick={onContinueGuest}
          className="bg-white/10 hover:bg-white/15 text-slate-200 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs border border-white/10"
        >
          <Sparkles size={14} className="text-emerald-400" />
          <span>Accéder en mode Démo</span>
        </button>
      </div>
    </div>
  );
}
