import React, { useState, useEffect } from 'react';
import { Copy, Check, Volume2, VolumeX, Sparkles, User, RotateCcw } from 'lucide-react';
import { Message, Language } from '../types';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  isLast?: boolean;
  onRegenerate?: () => void;
  language: Language;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
  isLast = false,
  onRegenerate,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';
  const isFr = language === 'fr';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // Clean up speech synthesis if message unmounts
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis?.cancel();
      }
    };
  }, [isSpeaking]);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert(isFr ? 'Synthèse vocale non disponible sur ce navigateur' : 'Text-to-speech not supported on this browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // stop any ongoing speech

    // Clean markdown symbols for cleaner pronunciation
    const cleanText = message.content
      .replace(/[#*`_~]/g, '')
      .replace(/\n+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isFr ? 'fr-FR' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find matching language voice on the device
    const voices = window.speechSynthesis.getVoices();
    const prefix = isFr ? 'fr' : 'en';
    const voiceMatch = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Helper function to format message text into paragraphs, bullet lists, and song verses
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm text-indigo-300 mt-2">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-base text-indigo-200 mt-2.5">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-extrabold text-base text-white mt-3">
                {trimmed.replace('# ', '')}
              </h2>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-indigo-400 font-bold leading-relaxed">•</span>
                <span className="flex-1">{formatInline(trimmed.substring(2))}</span>
              </div>
            );
          }

          // Numbered lists (e.g. 1. 2. )
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="font-bold text-indigo-400 text-xs shrink-0 mt-0.5">{numMatch[1]}.</span>
                <span className="flex-1">{formatInline(numMatch[2])}</span>
              </div>
            );
          }

          // Lyrics verse / chorus markers e.g. (Couplet 1), (Chorus), [Refrain]
          if (/^(\(|\[).*(Refrain|Chorus|Couplet|Verse|Bridge|Pont).*(\)|\])$/i.test(trimmed)) {
            return (
              <div key={idx} className="text-xs font-bold uppercase tracking-wider text-cyan-400 pt-1 pb-0.5">
                {trimmed}
              </div>
            );
          }

          return <p key={idx}>{formatInline(line)}</p>;
        })}
      </div>
    );
  };

  // Helper for bold and italic styling
  const formatInline = (text: string) => {
    // Basic regex replacer for **bold** and *italic*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full gap-2.5 my-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Akim avatar */}
      {!isUser && (
        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 mt-1">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {/* Bubble container */}
      <div className={`max-w-[88%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-xs border border-indigo-400/30'
              : 'bg-slate-800/90 text-slate-200 rounded-tl-xs border border-slate-700/70'
          }`}
        >
          {renderFormattedContent(message.content)}

          {/* Streaming blinking cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 align-middle bg-cyan-400 animate-pulse rounded-xs" />
          )}

          {/* Prominent one-tap retry button for 503 / temporary errors */}
          {!isUser && !isStreaming && onRegenerate && (message.content.includes('503') || message.content.includes('Réessayer') || message.content.includes('Retry')) && (
            <button
              onClick={onRegenerate}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 touch-manipulation cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFr ? 'Réessayer maintenant' : 'Retry now'}</span>
            </button>
          )}
        </div>

        {/* Action bar for Akim response */}
        {!isUser && !isStreaming && message.content && (
          <div className="flex items-center gap-1 mt-1.5 px-1 text-slate-400">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation"
              title={copied ? (isFr ? 'Copié !' : 'Copied!') : (isFr ? 'Copier le texte' : 'Copy text')}
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Read aloud button */}
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation ${
                isSpeaking ? 'text-indigo-400 bg-indigo-500/20' : ''
              }`}
              title={
                isSpeaking
                  ? isFr
                    ? 'Arrêter la lecture'
                    : 'Stop reading'
                  : isFr
                  ? 'Écouter la réponse'
                  : 'Read aloud'
              }
              aria-label="Read aloud"
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Regenerate if last */}
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation"
                title={isFr ? 'Régénérer la réponse' : 'Regenerate response'}
                aria-label="Regenerate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <span className="text-[10px] text-slate-500 ml-1">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {isUser && (
          <span className="text-[10px] text-slate-500 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-700/80 border border-slate-600 flex items-center justify-center text-slate-300 mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
