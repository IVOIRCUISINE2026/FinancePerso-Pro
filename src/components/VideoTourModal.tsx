import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Maximize2, 
  Minimize2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  BarChart3,
  Archive,
  Printer,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Video,
  Layers,
  Info,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';

export interface VideoTourChapter {
  id: string;
  rubrique: string;
  badge: string;
  title: string;
  subtitle: string;
  durationSeconds: number;
  voiceScript: string;
  subtitles: string[];
  visualType: 
    | 'intro'
    | 'dashboard'
    | 'salary'
    | 'transactions'
    | 'budgets'
    | 'analytics'
    | 'summary'
    | 'ai_bot'
    | 'archives'
    | 'pdf_export'
    | 'outro';
}

export const VIDEO_TOUR_CHAPTERS: VideoTourChapter[] = [
  {
    id: 'intro',
    rubrique: 'Vue d\'ensemble',
    badge: 'Introduction',
    title: 'Bienvenue sur FinancePerso Pro',
    subtitle: 'La suite financière conçue pour le cycle du 25 au 25 du mois',
    durationSeconds: 20,
    voiceScript: "Bienvenue dans la présentation officielle de FinancePerso Pro, l'application conçue pour maîtriser votre trésorerie selon le cycle de paie du 25 au 25 du mois. Découvrez étape par étape comment piloter votre salaire, sécuriser votre épargne et éliminer les découverts bancaires.",
    subtitles: [
      "Bienvenue dans la présentation officielle de FinancePerso Pro.",
      "Une architecture unique synchronisée sur votre cycle de paie du 25 au 25.",
      "Pilotez votre salaire, sécurisez votre épargne et évitez tout découvert.",
      "Suivez ce guide vidéo de 20 secondes par rubrique pour tout maîtriser."
    ],
    visualType: 'intro'
  },
  {
    id: 'dashboard',
    rubrique: 'Accueil',
    badge: 'Rubrique 1',
    title: 'Tableau de bord & Seuil de sécurité 10%',
    subtitle: 'Solde en temps réel, indicateurs clés et alerte automatique',
    durationSeconds: 20,
    voiceScript: "La rubrique Accueil affiche en direct votre solde disponible, le cumul de vos dépenses et votre trésorerie globale. Une jauge intelligente de sécurité vous avertit dès que vos réserves franchissent le seuil critique des 10 % du salaire, pour vous protéger avant la fin du mois.",
    subtitles: [
      "La rubrique Accueil centralise en temps réel votre solde bancaire disponible.",
      "Consultez le total de vos dépenses et le montant restant jusqu'au 25.",
      "La jauge de sécurité budgétaire vous alerte dès le passage sous les 10 %.",
      "Anticipez sereinement vos dépenses sans jamais risquer le découvert."
    ],
    visualType: 'dashboard'
  },
  {
    id: 'salary',
    rubrique: 'Salaire & Revenus',
    badge: 'Rubrique 2',
    title: 'Cycle de paie du 25 au 25',
    subtitle: 'Enregistrement de la paie et réinitialisation de trésorerie',
    durationSeconds: 20,
    voiceScript: "Dans la rubrique Salaire, vous enregistrez vos revenus chaque 25 du mois. L'application calcule immédiatement votre période de référence active, met à jour votre solde initial et évalue automatiquement votre capacité de dépense quotidienne jusqu'au prochain virement.",
    subtitles: [
      "Enregistrez votre salaire perçu chaque 25 du mois en un seul clic.",
      "L'application recalcule instantanément votre période budgétaire de 30 jours.",
      "Visualisez votre reste à vivre journalier recommandé jusqu'au prochain 25.",
      "Une gestion sur mesure adaptée au calendrier réel de vos revenus."
    ],
    visualType: 'salary'
  },
  {
    id: 'transactions',
    rubrique: 'Ajouter',
    badge: 'Rubrique 3',
    title: 'Gestion des Dépenses & Transactions',
    subtitle: 'Saisie ultra-rapide avec catégorie, date et note',
    durationSeconds: 20,
    voiceScript: "La rubrique Ajouter vous permet d'enregistrer vos dépenses au quotidien en quelques secondes. Renseignez simplement le montant, la catégorie associée, la date et une note explicative. Vos enveloppes budgétaires et votre solde disponible se mettent à jour instantanément.",
    subtitles: [
      "Saisissez rapidement vos achats du jour : montant, date et description.",
      "Affectez chaque dépense à sa catégorie : alimentation, loisirs, factures...",
      "Mise à jour instantanée de votre solde et de vos barres de budget.",
      "Gardez un contrôle rigoureux de vos flux financiers au fil des jours."
    ],
    visualType: 'transactions'
  },
  {
    id: 'budgets',
    rubrique: 'Répartition',
    badge: 'Rubrique 4',
    title: 'Enveloppes Budgétaires par Catégorie',
    subtitle: 'Plafonds personnalisés et alertes de dépassement',
    durationSeconds: 20,
    voiceScript: "Avec la rubrique Répartition, appliquez la méthode des enveloppes budgétaires. Définissez des plafonds personnalisés pour le logement, l'alimentation ou les loisirs. Des barres dynamiques avec code couleur vous préviennent en temps réel dès qu'une catégorie approche de sa limite.",
    subtitles: [
      "Appliquez la méthode éprouvée des enveloppes budgétaires personnalisées.",
      "Attribuez un plafond financier clair pour chaque poste de dépenses.",
      "Codes couleur intuitifs : vert sous contrôle, orange alerte, rouge dépassé.",
      "Maîtrisez vos limites sans restriction inutile pour préserver vos économies."
    ],
    visualType: 'budgets'
  },
  {
    id: 'analytics',
    rubrique: 'Statistiques',
    badge: 'Rubrique 5',
    title: 'Analyses & Graphiques Avancés',
    subtitle: 'Camemberts de ventilation et histogrammes comparatifs',
    durationSeconds: 20,
    voiceScript: "La rubrique Statistiques transforme vos données en visualisations graphiques avancées. Explorez la répartition de vos dépenses grâce aux diagrammes circulaires, analysez les tendances de consommation et identifiez avec précision vos plus importants leviers d'économies.",
    subtitles: [
      "Visualisez clairement votre comportement financier grâce aux graphiques.",
      "Diagrammes circulaires détaillant la part relative de chaque catégorie.",
      "Histogrammes comparatifs pour repérer les hausses anormales de dépenses.",
      "Prenez des décisions éclairées pour réduire vos coûts chaque mois."
    ],
    visualType: 'analytics'
  },
  {
    id: 'summary',
    rubrique: 'Synthèse',
    badge: 'Rubrique 6',
    title: 'Bilan Mensuel & Santé Financière',
    subtitle: 'Ratios d\'épargne et indicateurs de performance',
    durationSeconds: 20,
    voiceScript: "Dans la rubrique Synthèse, découvrez un bilan complet de votre performance financière. L'application calcule votre taux d'épargne net, compare vos charges fixes à vos dépenses variables et projette votre solde final pour vous garantir une tranquillité d'esprit absolue.",
    subtitles: [
      "Consultez un bilan financier consolidé et votre score de santé budgétaire.",
      "Mesure précise du taux d'épargne net réalisé sur votre cycle de paie.",
      "Distinction nette entre dépenses incompressibles et dépenses discrétionnaires.",
      "Projections fiables pour préparer vos projets d'avenir en confiance."
    ],
    visualType: 'summary'
  },
  {
    id: 'ai_bot',
    rubrique: 'Espace AI',
    badge: 'Rubrique 7',
    title: 'Assistant Financier Intelligent',
    subtitle: 'Conseils proactifs, alertes prédictives et questions interactives',
    durationSeconds: 20,
    voiceScript: "L'Espace AI met à votre service un conseiller financier intelligent propulsé par Gemini. Il examine vos habitudes de dépenses, identifie les opportunités d'optimisation et répond immédiatement à toutes vos questions financières par des conseils pratiques et personnalisés.",
    subtitles: [
      "Un conseiller financier propulsé par l'IA Gemini disponible 24h sur 24.",
      "Analyse proactive de vos comptes pour détecter les économies possibles.",
      "Posez vos questions en langage naturel et recevez des astuces adaptées.",
      "Un accompagnement sur mesure pour perfectionner votre gestion financière."
    ],
    visualType: 'ai_bot'
  },
  {
    id: 'archives',
    rubrique: 'Archives',
    badge: 'Rubrique 8',
    title: 'Clôture Automatique & Historique',
    subtitle: 'Sauvegarde automatique chaque 25 du mois',
    durationSeconds: 20,
    voiceScript: "La rubrique Archives conserve l'historique complet de votre parcours. À chaque échéance du 25 du mois, votre période budgétaire est clôturée et sécurisée automatiquement. Vous pouvez ainsi comparer vos mois passés et mesurer la progression de votre épargne au fil du temps.",
    subtitles: [
      "Clôture et archivage automatiques de chaque période le 25 du mois.",
      "Accédez en un clic à l'historique de tous vos mois précédents.",
      "Comparez vos bilans passés pour suivre vos efforts d'économie.",
      "Une mémoire financière infalsifiable pour mesurer votre enrichissement."
    ],
    visualType: 'archives'
  },
  {
    id: 'pdf_export',
    rubrique: 'Imprimer Rapport',
    badge: 'Rubrique 9',
    title: 'Génération & Export de Rapports PDF',
    subtitle: 'Bilans officiels et relevés détaillés en un clic',
    durationSeconds: 20,
    voiceScript: "La rubrique Imprimer vous permet d'exporter des bilans financiers certifiés au format PDF en un clic. Choisissez entre un tableau récapitulatif avec jauges graphiques ou un relevé exhaustif de vos dépenses pour vos archives personnelles, votre comptable ou votre banque.",
    subtitles: [
      "Générez des rapports PDF haute définition professionnels en un clic.",
      "Deux modèles disponibles : synthèse graphique ou relevé détaillé complet.",
      "Documents clairs et soignés, prêts pour impression ou archivage numérique.",
      "Partagez facilement vos justificatifs auprès de votre banque ou conseiller."
    ],
    visualType: 'pdf_export'
  },
  {
    id: 'outro',
    rubrique: 'Prêt à commencer',
    badge: 'Conclusion',
    title: 'Prenez le contrôle de votre argent',
    subtitle: 'Rejoignez FinancePerso Pro dès aujourd\'hui',
    durationSeconds: 20,
    voiceScript: "Vous maîtrisez maintenant l'ensemble des rubriques de FinancePerso Pro. Prenez dès aujourd'hui le contrôle total de vos finances en vous connectant avec votre compte Google ou en explorant immédiatement l'application grâce au mode Démo interactif.",
    subtitles: [
      "Vous possédez désormais toutes les clés pour maîtriser FinancePerso Pro.",
      "Une gestion simplifiée, sans stress et alignée sur votre paie du 25.",
      "Connectez-vous en un clic avec Google pour sécuriser vos données.",
      "Ou cliquez sur Tester le mode Démo pour commencer dès maintenant !"
    ],
    visualType: 'outro'
  }
];

interface VideoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDemo?: () => void;
}

export function VideoTourModal({ isOpen, onClose, onLaunchDemo }: VideoTourModalProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chapterElapsedSeconds, setChapterElapsedSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showChapterList, setShowChapterList] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const currentChapter = VIDEO_TOUR_CHAPTERS[currentChapterIndex];

  // Total presentation duration calculation
  const totalDurationSeconds = VIDEO_TOUR_CHAPTERS.reduce((acc, c) => acc + c.durationSeconds, 0);
  const elapsedTotalSeconds = VIDEO_TOUR_CHAPTERS.slice(0, currentChapterIndex).reduce((acc, c) => acc + c.durationSeconds, 0) + chapterElapsedSeconds;

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice narration runner for current chapter
  const speakCurrentChapter = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    if (isMuted) {
      setIsSpeaking(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(currentChapter.voiceScript);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.02 * playbackSpeed;
      utterance.pitch = 1.0;

      // Select French voice if available
      const frenchVoices = availableVoices.filter(v => v.lang.startsWith('fr'));
      const naturalVoice = frenchVoices.find(v => 
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('thomas') ||
        v.name.toLowerCase().includes('amélie') ||
        v.name.toLowerCase().includes('audrey')
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      } else if (frenchVoices.length > 0) {
        utterance.voice = frenchVoices[0];
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      setIsSpeaking(false);
    }
  };

  // Playback timer & chapter progression
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (isPlaying) {
      speakCurrentChapter();

      timerRef.current = setInterval(() => {
        setChapterElapsedSeconds(prev => {
          if (prev + 1 >= currentChapter.durationSeconds) {
            // Move to next chapter
            if (currentChapterIndex < VIDEO_TOUR_CHAPTERS.length - 1) {
              setCurrentChapterIndex(curr => curr + 1);
              return 0;
            } else {
              // End of tour
              setIsPlaying(false);
              return currentChapter.durationSeconds;
            }
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsSpeaking(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, currentChapterIndex, isPlaying, isMuted, playbackSpeed]);

  // Handle Close & cleanup
  const handleClose = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsSpeaking(false);
    onClose();
  };

  // Toggle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        speakCurrentChapter();
      }
      setIsPlaying(true);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      speakCurrentChapter();
    }
  };

  // Jump to chapter
  const selectChapter = (index: number) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentChapterIndex(index);
    setChapterElapsedSeconds(0);
    setIsPlaying(true);
  };

  // Reset from start
  const handleRestart = () => {
    selectChapter(0);
  };

  const nextChapter = () => {
    if (currentChapterIndex < VIDEO_TOUR_CHAPTERS.length - 1) {
      selectChapter(currentChapterIndex + 1);
    }
  };

  const prevChapter = () => {
    if (chapterElapsedSeconds > 2) {
      setChapterElapsedSeconds(0);
      speakCurrentChapter();
    } else if (currentChapterIndex > 0) {
      selectChapter(currentChapterIndex - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        ref={containerRef}
        className="w-full max-w-5xl bg-[#0F1420] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] relative"
      >
        {/* Top Video Header Bar */}
        <div className="bg-[#161B29] px-4 py-3 sm:px-6 sm:py-3.5 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2E5BFF] flex items-center justify-center shadow-md shadow-blue-500/20">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm tracking-tight">FinancePerso Pro en vidéo</span>
                <span className="bg-blue-500/20 text-[#3B82F6] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                  HD 1080p
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Voix off active
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Présentation guidée : 20 secondes par rubrique pour tout maîtriser</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChapterList(!showChapterList)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition flex items-center gap-1.5"
            >
              <Layers size={14} />
              <span className="hidden md:inline">Sommaire</span>
              <span className="text-slate-400 font-mono text-[11px]">({currentChapterIndex + 1}/{VIDEO_TOUR_CHAPTERS.length})</span>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Fermer la vidéo"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Video Screen Area */}
        <div className="relative flex-1 bg-gradient-to-b from-[#0B0F19] to-[#0A0D15] overflow-hidden flex flex-col justify-between min-h-[380px] sm:min-h-[440px]">
          {/* Audio Wave / Voix Off Status Ribbon */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="flex items-center gap-0.5 h-3.5">
              {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((height, i) => (
                <motion.div
                  key={i}
                  animate={isSpeaking ? { scaleY: [0.3, height, 0.2] } : { scaleY: 0.2 }}
                  transition={{ repeat: Infinity, duration: 0.6 + i * 0.1, ease: "easeInOut" }}
                  className="w-0.5 bg-[#2E5BFF] rounded-full origin-bottom h-full"
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-slate-200">
              {isMuted ? "Voix off muette" : isSpeaking ? "Narration en cours..." : "Voix off prête"}
            </span>
            <span className="text-[10px] text-slate-400 bg-white/10 px-1.5 py-0.5 rounded font-mono">FR</span>
          </div>

          {/* Chapter Badge & Rubrique Countdown on Video */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <span className="bg-[#2E5BFF]/90 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              {currentChapter.badge} • {currentChapter.rubrique}
            </span>
            <span className="bg-black/70 backdrop-blur-md text-emerald-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-lg flex items-center gap-1.5">
              <Clock size={12} className="text-emerald-400" />
              00:{chapterElapsedSeconds.toString().padStart(2, '0')} / 00:20
            </span>
          </div>

          {/* Video Visual Stage */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChapter.id}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-3xl flex flex-col items-center text-center space-y-4"
              >
                {/* Visual Canvas Representation */}
                <VisualMockStage chapter={currentChapter} onLaunchDemo={onLaunchDemo} onClose={handleClose} />

                {/* Chapter Title & Headline */}
                <div className="space-y-1 max-w-xl">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentChapter.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    {currentChapter.subtitle}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Side Chapter Drawer */}
            <AnimatePresence>
              {showChapterList && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="absolute right-0 top-0 bottom-0 w-72 sm:w-80 bg-[#161B29]/95 backdrop-blur-xl border-l border-white/10 p-4 overflow-y-auto z-30 shadow-2xl flex flex-col"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Toutes les rubriques</span>
                    <button 
                      onClick={() => setShowChapterList(false)}
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                    {VIDEO_TOUR_CHAPTERS.map((chap, idx) => {
                      const isActive = idx === currentChapterIndex;
                      const isPast = idx < currentChapterIndex;
                      return (
                        <button
                          key={chap.id}
                          onClick={() => {
                            selectChapter(idx);
                            setShowChapterList(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 text-xs ${
                            isActive 
                              ? 'bg-[#2E5BFF] text-white shadow-md shadow-blue-500/20' 
                              : isPast 
                              ? 'bg-white/5 text-slate-300 hover:bg-white/10' 
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                            isActive ? 'bg-white text-[#2E5BFF]' : isPast ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'
                          }`}>
                            {isPast ? '✓' : idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold truncate">{chap.rubrique}</div>
                            <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{chap.title}</div>
                          </div>
                          <span className="text-[10px] font-mono opacity-70 shrink-0">{chap.durationSeconds}s</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dynamic Captions / Subtitles Bar */}
          {showSubtitles && (
            <div className="px-4 py-2 sm:px-8 sm:py-3 bg-black/70 backdrop-blur-md border-t border-white/5 mx-2 sm:mx-6 rounded-xl sm:rounded-2xl mb-2 flex items-center justify-center text-center">
              <motion.p 
                key={`${currentChapter.id}-${Math.floor(chapterElapsedSeconds / 5)}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs sm:text-sm text-amber-100/90 font-medium tracking-wide leading-relaxed max-w-2xl"
              >
                "{currentChapter.subtitles[Math.min(Math.floor(chapterElapsedSeconds / (currentChapter.durationSeconds / currentChapter.subtitles.length)), currentChapter.subtitles.length - 1)] || currentChapter.voiceScript}"
              </motion.p>
            </div>
          )}

          {/* Bottom Player Controller Bar */}
          <div className="bg-[#161B29] border-t border-white/5 px-4 py-3 sm:px-6 sm:py-3.5 space-y-2.5 shrink-0">
            {/* Timeline Progress Bar (Interactive Scrubber) */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono font-medium text-slate-400 w-10 text-right">
                {formatTime(elapsedTotalSeconds)}
              </span>
              
              <div 
                className="flex-1 h-2 bg-white/10 hover:h-3 rounded-full overflow-hidden cursor-pointer relative group transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickFraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const targetSecond = clickFraction * totalDurationSeconds;
                  
                  // Find corresponding chapter
                  let acc = 0;
                  for (let i = 0; i < VIDEO_TOUR_CHAPTERS.length; i++) {
                    const nextAcc = acc + VIDEO_TOUR_CHAPTERS[i].durationSeconds;
                    if (targetSecond <= nextAcc || i === VIDEO_TOUR_CHAPTERS.length - 1) {
                      selectChapter(i);
                      setChapterElapsedSeconds(Math.max(0, Math.floor(targetSecond - acc)));
                      break;
                    }
                    acc = nextAcc;
                  }
                }}
              >
                {/* Total progress */}
                <div 
                  className="h-full bg-[#2E5BFF] transition-[width] duration-300 rounded-full"
                  style={{ width: `${(elapsedTotalSeconds / totalDurationSeconds) * 100}%` }}
                />

                {/* Chapter Dividers */}
                {VIDEO_TOUR_CHAPTERS.map((chap, i) => {
                  const startSec = VIDEO_TOUR_CHAPTERS.slice(0, i).reduce((s, c) => s + c.durationSeconds, 0);
                  const leftPercent = (startSec / totalDurationSeconds) * 100;
                  return (
                    <div 
                      key={chap.id} 
                      className="absolute top-0 bottom-0 w-0.5 bg-black/60 pointer-events-none" 
                      style={{ left: `${leftPercent}%` }}
                    />
                  );
                })}
              </div>

              <span className="text-[11px] font-mono font-medium text-slate-400 w-10">
                {formatTime(totalDurationSeconds)}
              </span>
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              {/* Left playback controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={prevChapter}
                  className="p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
                  title="Rubrique précédente"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl bg-[#2E5BFF] hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition"
                  title={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
                </button>

                <button
                  onClick={nextChapter}
                  className="p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
                  title="Rubrique suivante"
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={handleRestart}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition hidden sm:inline-flex"
                  title="Recommencer depuis le début"
                >
                  <RotateCcw size={16} />
                </button>

                {/* Sound Button */}
                <button
                  onClick={toggleMute}
                  className={`p-1.5 sm:p-2 rounded-lg transition flex items-center gap-1.5 ${
                    isMuted ? 'text-rose-400 hover:text-rose-300 bg-rose-500/10' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={isMuted ? "Activer la voix off" : "Couper la voix off"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span className="text-xs font-semibold hidden md:inline">
                    {isMuted ? "Son coupé" : "Voix off"}
                  </span>
                </button>

                {/* Mobile / Tablet Chapter Timer */}
                <span className="lg:hidden text-emerald-400 font-mono text-[11px] font-bold bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                  00:{chapterElapsedSeconds.toString().padStart(2, '0')} / 00:20
                </span>
              </div>

              {/* Current Chapter Label in center */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300">
                <span className="text-slate-500">Rubrique active :</span>
                <span className="font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-2">
                  <span>{currentChapter.rubrique} ({currentChapterIndex + 1}/{VIDEO_TOUR_CHAPTERS.length})</span>
                  <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    00:{chapterElapsedSeconds.toString().padStart(2, '0')} / 00:20
                  </span>
                </span>
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-2">
                {/* Speed Multiplier */}
                <button
                  onClick={() => {
                    const nextRate = playbackSpeed === 1.0 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1.0;
                    setPlaybackSpeed(nextRate);
                  }}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition"
                  title="Vitesse de lecture"
                >
                  {playbackSpeed}x
                </button>

                {/* CC Subtitles Toggle */}
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    showSubtitles ? 'bg-[#2E5BFF]/20 text-[#3B82F6] border border-blue-500/30' : 'text-slate-400 bg-white/5 hover:text-white'
                  }`}
                  title="Sous-titres"
                >
                  CC
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
                  title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                {/* Direct Demo Trigger */}
                {onLaunchDemo && (
                  <button
                    onClick={() => {
                      handleClose();
                      onLaunchDemo();
                    }}
                    className="ml-1 sm:ml-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <Sparkles size={14} />
                    <span>Essayer l'app</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stage components rendering animated mockups of each app screen
function VisualMockStage({ 
  chapter,
  onLaunchDemo,
  onClose
}: { 
  chapter: VideoTourChapter;
  onLaunchDemo?: () => void;
  onClose: () => void;
}) {
  switch (chapter.visualType) {
    case 'intro':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2E5BFF]/10 rounded-full blur-2xl" />
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-16 h-16 rounded-2xl bg-[#2E5BFF] flex items-center justify-center shadow-xl shadow-blue-500/30"
            >
              <CreditCard className="w-8 h-8 text-white" />
            </motion.div>
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-widest text-[#2E5BFF]">FinancePerso Pro</span>
              <h3 className="text-2xl font-black text-white">Gestionnaire de Salaire & Budget</h3>
              <p className="text-xs text-slate-400">Le compagnon idéal de chaque mois, calibré du 25 au 25.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full pt-2">
              <div className="bg-white/5 p-2.5 rounded-xl text-center border border-white/5">
                <div className="text-emerald-400 font-bold text-sm">25 au 25</div>
                <div className="text-[10px] text-slate-400">Cycle de Paie</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl text-center border border-white/5">
                <div className="text-blue-400 font-bold text-sm">10% Alerte</div>
                <div className="text-[10px] text-slate-400">Seuil Sécurité</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl text-center border border-white/5">
                <div className="text-purple-400 font-bold text-sm">IA Gemini</div>
                <div className="text-[10px] text-slate-400">Conseils Pro</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'dashboard':
      return (
        <div className="w-full max-w-xl bg-[#161B29] p-5 rounded-2xl border border-white/10 shadow-2xl text-left space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Période active : 25 Mai au 25 Juin</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">Temps réel</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Solde Actif</div>
              <div className="text-lg font-black text-emerald-400">{formatCurrency(1480)}</div>
              <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">+60.4% restant</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Dépenses</div>
              <div className="text-lg font-black text-rose-400">{formatCurrency(970)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">18 opérations</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Salaire Reçu</div>
              <div className="text-lg font-black text-blue-400">{formatCurrency(2450)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Le 25 du mois</div>
            </div>
          </div>

          {/* Security Alert Bar */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="text-emerald-400 w-5 h-5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-300">Zone de Sécurité Optimale</div>
                <div className="text-[10px] text-slate-400">Solde supérieur au seuil d'alerte de 10% ({formatCurrency(245)})</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">60.4%</span>
          </div>
        </div>
      );

    case 'salary':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-5 rounded-2xl border border-white/10 shadow-2xl text-left space-y-3">
          <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
            <Calendar className="w-8 h-8 text-[#2E5BFF] shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Rythme calé sur votre virement mensuel</div>
              <div className="text-[11px] text-slate-400">Chaque 25 du mois, la trésorerie est ajustée au centime près.</div>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Salaire mensuel déclaré</span>
              <span className="text-white font-mono font-bold">{formatCurrency(2450)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Jours écoulés dans le cycle</span>
              <span className="text-emerald-400 font-bold">12 jours sur 30</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[40%]" />
            </div>
            <div className="text-right text-[10px] text-slate-400">Prochaine paie dans 18 jours</div>
          </div>
        </div>
      );

    case 'transactions':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-5 rounded-2xl border border-white/10 shadow-2xl text-left space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Aperçu Saisie & Historique</div>
          <div className="space-y-2">
            {[
              { cat: 'Alimentation & Courses', amount: -68.50, date: 'Aujourd\'hui', color: 'text-amber-400' },
              { cat: 'Carburant / Transport', amount: -45.00, date: 'Hier', color: 'text-blue-400' },
              { cat: 'Loyer & Charges', amount: -650.00, date: '25 du mois', color: 'text-rose-400' }
            ].map((tx, idx) => (
              <div key={idx} className="bg-white/5 p-2.5 rounded-xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${tx.color === 'text-amber-400' ? 'bg-amber-400' : tx.color === 'text-blue-400' ? 'bg-blue-400' : 'bg-rose-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">{tx.cat}</div>
                    <div className="text-[10px] text-slate-400">{tx.date}</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">{formatCurrency(tx.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'budgets':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-5 rounded-2xl border border-white/10 shadow-2xl text-left space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Enveloppes Budgétaires</div>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">Alimentation & Supermarché</span>
                <span className="text-slate-300 font-mono">320 € / 450 €</span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[71%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">Transports & Carburant</span>
                <span className="text-slate-300 font-mono">110 € / 150 €</span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[73%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">Loisirs & Sorties</span>
                <span className="text-slate-300 font-mono">85 € / 200 €</span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[42%]" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'analytics':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-5 rounded-2xl border border-white/10 shadow-2xl text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ventilation Graphique</span>
            <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">Interactif</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-[#2E5BFF] border-t-amber-400 border-r-rose-400 flex items-center justify-center shrink-0">
              <PieIcon className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Logement (54%)</span>
                <span className="text-white font-mono font-bold">650 €</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Courses (26%)</span>
                <span className="text-white font-mono font-bold">320 €</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Transport & Divers (20%)</span>
                <span className="text-white font-mono font-bold">245 €</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'summary':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-5 rounded-2xl border border-white/10 shadow-2xl text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Santé Financière du Mois</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Score : 92 / 100
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Taux d'Épargne Réalisé</div>
              <div className="text-xl font-black text-emerald-400 mt-1">28.5 %</div>
              <div className="text-[10px] text-slate-400 mt-0.5">+4% vs mois dernier</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Reste à Vivre Quotidien</div>
              <div className="text-xl font-black text-blue-400 mt-1">42.80 € / j</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Sur 18 jours restants</div>
            </div>
          </div>
        </div>
      );

    case 'ai_bot':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-5 rounded-2xl border border-white/10 shadow-2xl text-left space-y-3">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white">Conseiller Budgétaire Intelligent</span>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-xs font-bold text-purple-300">Analyse Proactive Gemini</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Votre solde est sain. En modérant légèrement vos sorties ce week-end, vous pourrez épargner <span className="text-emerald-400 font-bold">120 € de plus</span> lors de la clôture du 25."
            </p>
          </div>
        </div>
      );

    case 'archives':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-5 rounded-2xl border border-white/10 shadow-2xl text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Archives Mensuelles</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Clôture au 25</span>
          </div>
          <div className="space-y-1.5">
            <div className="bg-white/5 p-2.5 rounded-xl flex items-center justify-between border border-white/5">
              <span className="text-xs text-slate-200 font-semibold">Période du 25 Avril au 25 Mai</span>
              <span className="text-xs font-mono font-bold text-emerald-400">+520 € épargnés</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl flex items-center justify-between border border-white/5">
              <span className="text-xs text-slate-200 font-semibold">Période du 25 Mars au 25 Avril</span>
              <span className="text-xs font-mono font-bold text-emerald-400">+480 € épargnés</span>
            </div>
          </div>
        </div>
      );

    case 'pdf_export':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-5 rounded-2xl border border-white/10 shadow-2xl text-left space-y-3">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Printer className="w-4 h-4 text-[#2E5BFF]" />
            <span className="text-xs font-bold text-white">Exports & Bilans Officiels PDF</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">PDF</div>
              <div className="text-xs font-bold text-white">État du Budget</div>
              <div className="text-[10px] text-slate-400">Rapport synthétique certifié</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">PDF</div>
              <div className="text-xs font-bold text-white">Relevé Détaillé</div>
              <div className="text-[10px] text-slate-400">Toutes vos opérations horodatées</div>
            </div>
          </div>
        </div>
      );

    case 'outro':
      return (
        <div className="w-full max-w-lg bg-[#161B29] p-6 rounded-3xl border border-white/10 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">Vous connaissez toutes les rubriques !</h3>
            <p className="text-xs text-slate-400">Prêt à prendre le contrôle de votre cycle financier du 25 au 25 ?</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
            {onLaunchDemo && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchDemo();
                }}
                className="bg-[#2E5BFF] hover:bg-blue-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>Ouvrir l'application (Mode Démo)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs px-4 py-3 rounded-xl border border-white/10 transition"
            >
              Fermer la vidéo
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
