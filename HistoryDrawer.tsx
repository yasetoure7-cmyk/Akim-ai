import React, { useState } from 'react';
import { X, Plus, MessageSquare, Trash2, Search, Download, Clock } from 'lucide-react';
import { ChatSession, Language } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  language: Language;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  const isFr = language === 'fr';

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(q);
    const contentMatch = s.messages.some((m) => m.content.toLowerCase().includes(q));
    return titleMatch || contentMatch;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleExportAll = () => {
    const textData = sessions
      .map((s) => {
        const header = `=== ${s.title} (${new Date(s.createdAt).toLocaleString()}) ===\n`;
        const msgs = s.messages
          .map((m) => `[${m.role === 'user' ? 'YOU' : 'AKIM AI'}]:\n${m.content}\n`)
          .join('\n');
        return `${header}\n${msgs}\n`;
      })
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `akim-ai-chats-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-4/5 max-w-xs sm:max-w-sm h-full bg-slate-900 border-r border-slate-800 flex flex-col z-10 safe-top safe-bottom shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-white text-base">
              {isFr ? 'Mes Discussions' : 'Chat History'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 active:scale-[0.98] transition-all touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>{isFr ? 'Nouvelle Discussion' : 'New Chat'}</span>
          </button>
        </div>

        {/* Search Input */}
        {sessions.length > 2 && (
          <div className="px-3 pb-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={isFr ? 'Rechercher...' : 'Search chats...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <p>{isFr ? 'Aucune discussion trouvée' : 'No chats found'}</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all border ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold truncate text-white">
                      {session.title || (isFr ? 'Discussion sans titre' : 'Untitled chat')}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatDate(session.updatedAt)}</span>
                      <span>•</span>
                      <span>{session.messages.length} msg</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title={isFr ? 'Supprimer' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions: Export and Clear all */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {sessions.length > 0 && (
            <button
              onClick={handleExportAll}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isFr ? 'Exporter mes discussions' : 'Export all chats (.txt)'}</span>
            </button>
          )}

          {sessions.length > 0 && (
            showConfirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClearAll();
                    setShowConfirmClear(false);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold"
                >
                  {isFr ? 'Oui, effacer tout' : 'Confirm Clear'}
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                >
                  {isFr ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="w-full text-center py-1.5 text-[11px] text-slate-500 hover:text-red-400 transition-colors"
              >
                {isFr ? 'Effacer tout l\'historique' : 'Clear all history'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
