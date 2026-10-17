import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HistoryDrawer } from './components/HistoryDrawer';
import { FreeTierModal } from './components/FreeTierModal';
import { MessageItem } from './components/MessageItem';
import { QuickPrompts } from './components/QuickPrompts';
import { ChatInput } from './components/ChatInput';
import { ChatSession, Message, Language } from './types';
import { ArrowDown } from 'lucide-react';

const STORAGE_KEY = 'akim_ai_sessions_v1';
const LANG_STORAGE_KEY = 'akim_ai_lang_pref';
const AUTO_SPEAK_KEY = 'akim_ai_auto_speak_pref';

export default function App() {
  // Detect language: check localStorage or browser language
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') return saved;
    const navLang = navigator.language || '';
    return navLang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  });

  // Optional spoken replies toggle (using browser speechSynthesis)
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    return localStorage.getItem(AUTO_SPEAK_KEY) === 'true';
  });

  const handleToggleAutoSpeak = () => {
    setAutoSpeak((prev) => {
      const next = !prev;
      localStorage.setItem(AUTO_SPEAK_KEY, String(next));
      if (!next && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse sessions from localStorage', e);
    }

    // Default first session
    const initialSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Welcome to AKIM AI',
      language: 'en',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-' + Date.now();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage', e);
    }
  }, [sessions]);

  // Save language preference
  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'fr' : 'en';
    setLanguage(nextLang);
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeSessionId]);

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom('auto');
    }
  }, [streamingText, isStreaming]);

  // Handle scroll detection for floating scroll button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  // Start a new chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: language === 'fr' ? 'Nouvelle discussion' : 'New chat',
      language,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setStreamingText('');
    setIsStreaming(false);
    setIsLoading(false);
  };

  // Delete a chat session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh: ChatSession = {
          id: 'session-' + Date.now(),
          title: language === 'fr' ? 'Nouvelle discussion' : 'New chat',
          language,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (id === activeSessionId) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Clear all chats
  const handleClearAll = () => {
    const fresh: ChatSession = {
      id: 'session-' + Date.now(),
      title: language === 'fr' ? 'Nouvelle discussion' : 'New chat',
      language,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setStreamingText('');
    setIsStreaming(false);
    setIsLoading(false);
  };

  // Send message to AKIM AI
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Cancel any active speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const userMessage: Message = {
      id: 'msg-' + Date.now() + '-user',
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const currentMessages = activeSession?.messages || [];
    const updatedMessages = [...currentMessages, userMessage];

    // Auto generate title for the first message
    let sessionTitle = activeSession?.title;
    if (currentMessages.length === 0 || sessionTitle === 'Welcome to AKIM AI' || sessionTitle === 'New chat' || sessionTitle === 'Nouvelle discussion') {
      sessionTitle = textToSend.slice(0, 32).trim() + (textToSend.length > 32 ? '...' : '');
    }

    // Update session with user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: sessionTitle || s.title,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsLoading(true);
    setIsStreaming(true);
    setStreamingText('');

    try {
      // Send chat history for context
      const payload = {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        language,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullAssistantText = '';

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  fullAssistantText += parsed.chunk;
                  setStreamingText(fullAssistantText);
                } else if (parsed.error) {
                  fullAssistantText += `\n\n⚠️ ${parsed.error}`;
                  setStreamingText(fullAssistantText);
                }
              } catch (parseErr) {
                console.error('Error parsing SSE data chunk', parseErr);
              }
            }
          }
        }
      }

      // Finalize model response in active session
      const assistantMessage: Message = {
        id: 'msg-' + Date.now() + '-model',
        role: 'model',
        content: fullAssistantText || (language === 'fr' ? "Désolé, je n'ai pas pu formuler de réponse. Réessaie !" : "Sorry, I couldn't generate a response. Please try again!"),
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                updatedAt: Date.now(),
                messages: [...updatedMessages, assistantMessage],
              }
            : s
        )
      );

      // Optional spoken reply via browser speechSynthesis
      if (autoSpeak && 'speechSynthesis' in window && fullAssistantText) {
        try {
          window.speechSynthesis.cancel();
          const cleanText = fullAssistantText.replace(/[#*`_~]/g, '').replace(/\n+/g, ' ');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
          const voices = window.speechSynthesis.getVoices();
          const prefix = language === 'fr' ? 'fr' : 'en';
          const voiceMatch = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
          if (voiceMatch) {
            utterance.voice = voiceMatch;
          }
          window.speechSynthesis.speak(utterance);
        } catch (ttsErr) {
          console.warn('Speech synthesis playback error:', ttsErr);
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackErrorMessage: Message = {
        id: 'msg-' + Date.now() + '-err',
        role: 'model',
        content:
          language === 'fr'
            ? `Oups ! Une petite erreur est survenue lors de la communication. Réessaie dans un instant ! (Erreur : ${err.message || 'Réseau'})`
            : `Oops! A small connection error occurred. Please try again in a moment! (Error: ${err.message || 'Network'})`,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                updatedAt: Date.now(),
                messages: [...updatedMessages, fallbackErrorMessage],
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingText('');
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length === 0 || isLoading) return;

    const msgs = [...activeSession.messages];
    const lastMsg = msgs[msgs.length - 1];

    if (lastMsg.role === 'model') {
      // Remove last assistant message
      const popped = msgs.slice(0, msgs.length - 1);
      const lastUserMsg = popped[popped.length - 1];
      if (lastUserMsg && lastUserMsg.role === 'user') {
        // Roll back and resend
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: popped.slice(0, popped.length - 1) }
              : s
          )
        );
        handleSendMessage(lastUserMsg.content);
      }
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#0b0f19] text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <Header
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewChat={handleNewChat}
        onOpenInfo={() => setIsInfoOpen(true)}
        historyCount={sessions.length}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={handleToggleAutoSpeak}
      />

      {/* Main Chat Scroll Container */}
      <main
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 scroll-smooth select-text"
      >
        <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col justify-between">
          {/* If no messages yet, show starter prompts */}
          {activeSession.messages.length === 0 ? (
            <QuickPrompts
              language={language}
              onSelectPrompt={handleSendMessage}
            />
          ) : (
            <div className="py-2 flex flex-col">
              {activeSession.messages.map((message, idx) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isLast={idx === activeSession.messages.length - 1 && !isStreaming}
                  onRegenerate={handleRegenerate}
                  language={language}
                />
              ))}

              {/* Live Streaming Message Bubble */}
              {isStreaming && (
                <MessageItem
                  message={{
                    id: 'live-stream',
                    role: 'model',
                    content: streamingText || (language === 'fr' ? 'AKIM réfléchit...' : 'AKIM is thinking...'),
                    timestamp: Date.now(),
                  }}
                  isStreaming={true}
                  language={language}
                />
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </main>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed bottom-24 right-4 z-20 p-2.5 rounded-full bg-slate-800/90 text-white border border-slate-700 shadow-xl hover:bg-slate-700 active:scale-95 transition-all touch-manipulation"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 text-indigo-400" />
        </button>
      )}

      {/* Bottom Sticky Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        language={language}
      />

      {/* Side Drawer for History */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAll}
        language={language}
      />

      {/* Free Tier Guarantee and Android Help Modal */}
      <FreeTierModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        language={language}
      />
    </div>
  );
}
