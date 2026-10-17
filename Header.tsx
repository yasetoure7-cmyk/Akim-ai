import React from 'react';
import { Menu, Plus, Sparkles, ShieldCheck, Globe, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onOpenHistory: () => void;
  onNewChat: () => void;
  onOpenInfo: () => void;
  historyCount: number;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenHistory,
  onNewChat,
  onOpenInfo,
  historyCount,
  autoSpeak,
  onToggleAutoSpeak,
}) => {
  const isFr = language === 'fr';

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5 safe-top transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Menu button for chat history & new chat */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label={isFr ? 'Historique des conversations' : 'Chat history'}
            title={isFr ? 'Historique des conversations' : 'Chat history'}
          >
            <Menu className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label={isFr ? 'Nouvelle discussion' : 'New chat'}
            title={isFr ? 'Nouvelle discussion' : 'New chat'}
          >
            <Plus className="w-5 h-5 text-indigo-400" />
          </button>
        </div>

        {/* Center: Brand & Free Badge */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-base tracking-tight text-white">AKIM AI</span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                100% Free
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium leading-tight">
              {isFr ? 'Ami bilingue & devoirs' : 'Bilingual assistant & friend'}
            </span>
          </div>
        </div>

        {/* Right: Spoken replies toggle, Language switch & Free Info Modal */}
        <div className="flex items-center gap-1.5">
          {/* Spoken reply toggle */}
          <button
            onClick={onToggleAutoSpeak}
            className={`p-2 rounded-xl border transition-all active:scale-95 touch-manipulation ${
              autoSpeak
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
            aria-label={
              autoSpeak
                ? isFr
                  ? 'Réponses vocales activées (Cliquez pour couper)'
                  : 'Voice replies ON (Click to mute)'
                : isFr
                ? 'Activer les réponses vocales automatiques'
                : 'Turn ON spoken replies'
            }
            title={
              autoSpeak
                ? isFr
                  ? 'Réponses vocales automatiques : ACTIVÉES'
                  : 'Spoken replies: ON'
                : isFr
                ? 'Réponses vocales automatiques : DÉSACTIVÉES'
                : 'Spoken replies: OFF'
            }
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/60 active:scale-95 transition-all touch-manipulation"
            title={isFr ? 'Changer de langue (English / Français)' : 'Switch language (English / Français)'}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isFr ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
          </button>

          {/* Guarantee info */}
          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20 active:scale-95 transition-all touch-manipulation"
            aria-label="Free Tier Guarantee Info"
            title={isFr ? 'Garantie 100% Gratuit' : '100% Free Guarantee'}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
