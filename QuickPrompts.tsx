import React, { useState } from 'react';
import { Sparkles, BookOpen, Music, Smile, Compass, ArrowRight } from 'lucide-react';
import { Language, PromptCategory } from '../types';
import { PROMPT_TEMPLATES } from '../data/prompts';

interface QuickPromptsProps {
  language: Language;
  onSelectPrompt: (promptText: string) => void;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  language,
  onSelectPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const isFr = language === 'fr';

  const categories = [
    { id: 'all' as const, label: isFr ? 'Tout' : 'All', icon: Sparkles },
    { id: 'school' as const, label: isFr ? 'Devoirs' : 'School', icon: BookOpen },
    { id: 'songs' as const, label: isFr ? 'Chansons' : 'Songs', icon: Music },
    { id: 'jokes' as const, label: isFr ? 'Blagues' : 'Jokes', icon: Smile },
    { id: 'general' as const, label: isFr ? 'Culture' : 'General', icon: Compass },
  ];

  const filteredPrompts = PROMPT_TEMPLATES.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="py-6 px-3 flex flex-col items-center justify-center max-w-xl mx-auto w-full animate-in fade-in duration-300">
      {/* Friendly Persona Avatar & Greeting */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🤖✨</span>
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px] tracking-wider uppercase shadow-xs">
            Free
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {isFr ? 'Salut ! Je suis AKIM AI' : "Hello! I'm AKIM AI"}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xs sm:max-w-md leading-relaxed font-normal">
          {isFr
            ? "Ton assistant bilingue gratuit, drôle et poli. Je t'aide avec tes devoirs, t'écris des chansons, te raconte des blagues ou discute simplement avec toi !"
            : "Your 100% free bilingual friend. I can help with homework, compose original songs, tell clean jokes, or chat about anything!"}
        </p>
      </div>

      {/* Category selector pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 mb-3 scrollbar-none justify-start sm:justify-center px-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 touch-manipulation border ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Starter Prompts Grid - Mobile Friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {filteredPrompts.slice(0, 6).map((item, idx) => {
          const promptText = isFr ? item.promptFr : item.promptEn;
          const label = isFr ? item.labelFr : item.labelEn;

          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(promptText)}
              className="group text-left p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all active:scale-[0.98] touch-manipulation flex items-start gap-2.5"
            >
              <span className="text-xl shrink-0 mt-0.5">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-300 group-hover:text-indigo-200">
                    {label}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="mt-1 text-[11px] text-slate-300 line-clamp-2 leading-snug">
                  {promptText}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Beginner friendly reassurance banner */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 bg-slate-800/40 border border-slate-800 px-3 py-2 rounded-xl">
        <span className="text-emerald-400 font-bold">✓ 100% Free</span>
        <span>•</span>
        <span>{isFr ? 'Aucun abonnement nécessaire' : 'No subscription needed'}</span>
        <span>•</span>
        <span>{isFr ? 'Tapotez le micro pour parler' : 'Tap mic to speak'}</span>
      </div>
    </div>
  );
};
