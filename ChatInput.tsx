import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, BookOpen, Music, Smile, X, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  language: Language;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  language,
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const activeListeningRef = useRef(false);
  const baseTextRef = useRef('');

  const isFr = language === 'fr';

  // Check if browser supports Web Speech API
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Safely stop any active speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      recognitionRef.current = null;
    }
    activeListeningRef.current = false;
    setIsListening(false);
    if ('vibrate' in navigator) {
      navigator.vibrate?.(30);
    }
  };

  // Safely start speech recognition with instant response on touch
  const startListening = () => {
    setMicNotice(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicNotice(
        isFr
          ? "ℹ️ La reconnaissance vocale n'est pas supportée par ce navigateur. Vous pouvez continuer à écrire normalement."
          : 'ℹ️ Speech recognition is not supported on this browser. You can continue typing your text normally.'
      );
      return;
    }

    // Stop any existing instance first
    stopListening();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      // Configure language based on active selection (fr-FR or en-US)
      recognition.lang = isFr ? 'fr-FR' : 'en-US';

      // Save base text before speech starts to prevent repeated words
      baseTextRef.current = text.trim();

      // Give immediate visual & tactile feedback on touch (0ms delay)
      activeListeningRef.current = true;
      setIsListening(true);
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate?.(40);
        } catch {
          // ignore
        }
      }

      recognition.onstart = () => {
        activeListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            interimChunk += transcript;
          }
        }

        const spokenContent = `${finalChunk} ${interimChunk}`.trim();

        if (baseTextRef.current) {
          setText(`${baseTextRef.current} ${spokenContent}`.trim());
        } else {
          setText(spokenContent);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicNotice(
            isFr
              ? "⚠️ Accès au micro refusé. Veuillez autoriser le microphone dans les paramètres de votre navigateur."
              : '⚠️ Microphone access was denied. Please allow microphone permissions in your browser settings.'
          );
          activeListeningRef.current = false;
          setIsListening(false);
          recognitionRef.current = null;
        } else if (event.error === 'audio-capture') {
          setMicNotice(
            isFr
              ? '⚠️ Aucun microphone détecté sur cet appareil.'
              : '⚠️ No microphone was detected on this device.'
          );
          activeListeningRef.current = false;
          setIsListening(false);
          recognitionRef.current = null;
        } else if (event.error === 'no-speech') {
          // Normal pause in speech, keep listening without showing an error banner
          return;
        } else {
          activeListeningRef.current = false;
          setIsListening(false);
          recognitionRef.current = null;
        }
      };

      recognition.onend = () => {
        // If user is still dictating (Android engine auto-ends on pause), seamlessly restart
        if (activeListeningRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            // ignore if cannot restart
          }
        }
        activeListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Could not start speech recognition:', err);
      if (err?.name === 'InvalidStateError') {
        // Recognition is already active, keep listening state active
        activeListeningRef.current = true;
        setIsListening(true);
        return;
      }
      setMicNotice(
        isFr
          ? "Impossible d'activer le microphone actuellement. Vous pouvez taper au clavier."
          : 'Could not activate microphone right now. You can type using the keyboard.'
      );
      activeListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const handleToggleListening = () => {
    if (activeListeningRef.current || isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;

    stopListening();

    onSendMessage(text.trim());
    setText('');
    baseTextRef.current = '';
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertPrefix = (prefix: string) => {
    setText((prev) => (prev ? `${prefix} ${prev}` : prefix));
    textareaRef.current?.focus();
  };

  return (
    <div className="sticky bottom-0 z-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-3 pt-2 pb-2 safe-bottom">
      <div className="max-w-3xl mx-auto">
        {/* Quick Helper Shortcut Pills right above input */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
          <button
            type="button"
            onClick={() => insertPrefix(isFr ? 'Aide-moi à résoudre :' : 'Help me solve:')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 shrink-0 active:scale-95 transition-all"
          >
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span>{isFr ? 'Devoirs' : 'Homework'}</span>
          </button>
          <button
            type="button"
            onClick={() => insertPrefix(isFr ? 'Écris une chanson sur :' : 'Write a song about:')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 shrink-0 active:scale-95 transition-all"
          >
            <Music className="w-3 h-3 text-pink-400" />
            <span>{isFr ? 'Chanson' : 'Song'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setText(isFr ? 'Raconte-moi une blague drôle !' : 'Tell me a funny joke!');
              setTimeout(() => textareaRef.current?.focus(), 50);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 shrink-0 active:scale-95 transition-all"
          >
            <Smile className="w-3 h-3 text-amber-400" />
            <span>{isFr ? 'Blague' : 'Joke'}</span>
          </button>
        </div>

        {/* Permission / Unsupported Browser Notice Banner */}
        {micNotice && (
          <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs animate-in fade-in">
            <div className="flex items-start gap-2 mr-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{micNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setMicNotice(null)}
              className="p-1 rounded-md hover:bg-amber-900/50 text-amber-300 hover:text-white shrink-0"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Clear Active Listening Visualizer Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-3.5 py-2 mb-2 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs shadow-lg shadow-red-950/30">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>

              {/* Sound wave equalizer animation */}
              <div className="flex items-center gap-0.5 h-5 px-1">
                <span className="w-1 bg-red-400 rounded-full soundwave-bar" style={{ animationDelay: '0ms' }} />
                <span className="w-1 bg-red-400 rounded-full soundwave-bar" style={{ animationDelay: '200ms' }} />
                <span className="w-1 bg-red-400 rounded-full soundwave-bar" style={{ animationDelay: '400ms' }} />
                <span className="w-1 bg-red-400 rounded-full soundwave-bar" style={{ animationDelay: '150ms' }} />
              </div>

              <span className="font-semibold text-white">
                {isFr ? 'À l\'écoute (Français)... Parlez !' : 'Listening (English)... Speak now!'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleListening}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all touch-manipulation"
            >
              {isFr ? 'Terminer' : 'Done'}
            </button>
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-1.5">
          {/* Voice dictation button */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 touch-manipulation shrink-0 ${
              isListening
                ? 'bg-red-600 text-white border-red-500 animate-mic-pulse shadow-md shadow-red-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
            title={
              !isSpeechSupported
                ? isFr
                  ? 'Reconnaissance vocale non disponible'
                  : 'Speech recognition not supported'
                : isListening
                ? isFr
                  ? 'Arrêter l\'écoute (Appuyer pour stopper)'
                  : 'Stop listening (Tap to finish)'
                : isFr
                ? 'Parler au micro (Français / English)'
                : 'Speak with microphone (English / French)'
            }
            aria-label="Microphone"
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-indigo-400" />
            )}
          </button>

          {/* Text input area */}
          <div className="relative flex-1 flex items-center bg-slate-800/90 rounded-2xl border border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isFr
                  ? "Tape ton message ou parle au micro..."
                  : 'Type your message or tap the mic to speak...'
              }
              className="w-full py-2.5 pl-3.5 pr-8 bg-transparent text-sm text-white placeholder-slate-400 resize-none focus:outline-none max-h-32 leading-relaxed"
            />

            {/* Clear text button */}
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  baseTextRef.current = '';
                  textareaRef.current?.focus();
                }}
                className="absolute right-2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Clear text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition-all active:scale-95 touch-manipulation shrink-0 shadow-md ${
              text.trim() && !isLoading
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/30 cursor-pointer'
                : 'bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
