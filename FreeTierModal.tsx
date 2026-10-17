import React from 'react';
import { X, ShieldCheck, Smartphone, Mic, Volume2, Heart, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface FreeTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const FreeTierModal: React.FC<FreeTierModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const isFr = language === 'fr';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto safe-bottom"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isFr ? 'Garantie 100% Gratuit' : '100% Free Guarantee'}
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                {isFr ? 'Aucun abonnement, aucun paiement' : 'No subscription, no billing required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-slate-300 leading-relaxed">
          {/* Card 1: Free promise */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-200">
                  {isFr ? 'Conçu pour votre budget : 0 Franc, 0 Euro, 0 Dollar' : 'Designed for zero budget: $0 forever'}
                </span>
                <p className="mt-1 text-slate-300 text-[11px]">
                  {isFr
                    ? "AKIM AI utilise exclusivement les modèles gratuits de Google (Gemini 3.1 Flash Lite & Flash). Vous ne serez jamais invité à entrer une carte bancaire ou à souscrire à un forfait payant. Si une erreur 503 apparaît, c'est simplement une forte affluence passagère : patientez 5 secondes et réessayez gratuitement !"
                    : "AKIM AI exclusively uses Google's standard free tier (Gemini 3.1 Flash Lite & Flash). You will never be asked for a credit card or prompted to buy a paid plan. If Error 503 appears, it is only a temporary surge in demand—wait 5 seconds and retry for free!"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Android Phone tips */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 font-semibold text-slate-100 mb-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>{isFr ? 'Astuces pour téléphone Android' : 'Tips for Android phones'}</span>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <Mic className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{isFr ? 'Microphone gratuit :' : 'Free Voice Dictation:'}</strong>{' '}
                  {isFr
                    ? 'Appuyez sur le micro pour parler au lieu d\'écrire sur le clavier.'
                    : 'Tap the mic icon to speak your question instead of typing on a small keyboard.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{isFr ? 'Lecture à voix haute :' : 'Listen Aloud:'}</strong>{' '}
                  {isFr
                    ? 'Appuyez sur le haut-parleur sous chaque message pour qu\'AKIM vous réponde à voix haute.'
                    : 'Tap the speaker button under any message to hear AKIM read it aloud.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">📲</span>
                <span>
                  <strong>{isFr ? 'Installer sur l\'écran :' : 'Add to Home Screen:'}</strong>{' '}
                  {isFr
                    ? 'Dans Chrome sur Android, cliquez sur ⋮ en haut à droite puis "Ajouter à l\'écran d\'accueil" pour l\'ouvrir comme une vraie application.'
                    : 'In Android Chrome, tap the 3 dots (⋮) and select "Add to Home screen" to launch AKIM AI like an app!'}
                </span>
              </li>
            </ul>
          </div>

          {/* Card 3: Friendly personality */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-indigo-400 shrink-0" />
            <p className="text-[11px] text-indigo-200">
              {isFr
                ? 'AKIM est toujours respectueux, encourageant et amical. Posez vos questions sans hésitation !'
                : 'AKIM is always respectful, encouraging, and friendly. Ask anything without hesitation!'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/30 active:scale-[0.98] transition-all touch-manipulation"
        >
          {isFr ? 'Compris, retourner au chat' : 'Got it, back to chat'}
        </button>
      </div>
    </div>
  );
};
