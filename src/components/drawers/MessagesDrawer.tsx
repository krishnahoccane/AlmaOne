import React, { useEffect, useState } from 'react';
import { Send, X } from 'lucide-react';
import { DirectMessageThread, InstitutionTheme } from '../../types/alumni';
import { AlumniAvatar } from '../ui/CommonUI';

interface MessagesDrawerProps {
  open: boolean;
  threads: DirectMessageThread[];
  activeThreadId: string | null;
  theme: InstitutionTheme;
  onSelectThread: (threadId: string) => void;
  onSendMessage: (threadId: string, text: string) => void;
  onClose: () => void;
}

export const MessagesDrawer: React.FC<MessagesDrawerProps> = ({
  open,
  threads,
  activeThreadId,
  theme,
  onSelectThread,
  onSendMessage,
  onClose,
}) => {
  const [draft, setDraft] = useState('');

  const selectedThread =
    threads.find((t) => t.id === activeThreadId) ?? threads[0] ?? null;

  useEffect(() => {
    if (open && !activeThreadId && threads[0]) {
      onSelectThread(threads[0].id);
    }
  }, [open, activeThreadId, threads, onSelectThread]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !draft.trim()) return;
    onSendMessage(selectedThread.id, draft.trim());
    setDraft('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-[1px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Direct Messages"
    >
      <div
        className="w-full max-w-2xl bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Direct Messages</h2>
            <p className="text-[11px] text-slate-500">
              Verified cross-campus alumni inbox
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close messages drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Thread List */}
          <div className="w-[220px] sm:w-[240px] border-r border-slate-100 overflow-y-auto shrink-0 divide-y divide-slate-100">
            {threads.map((thread) => {
              const active = selectedThread?.id === thread.id;
              const lastMsg = thread.messages[thread.messages.length - 1];
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => onSelectThread(thread.id)}
                  className={`w-full p-3.5 text-left transition-colors ${
                    active ? 'bg-slate-100/80' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlumniAvatar
                      name={thread.alumnusName}
                      initials={thread.alumnusInitials}
                      tone={thread.alumnusTone}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {thread.alumnusName}
                        </span>
                        {thread.unreadCount > 0 && (
                          <span
                            className="text-[10px] font-mono font-semibold text-white px-1.5 rounded-full"
                            style={{ backgroundColor: theme.primary }}
                          >
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Conversation */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedThread ? (
              <>
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="text-xs font-semibold text-slate-900">
                    {selectedThread.alumnusName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {selectedThread.alumnusMeta}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {selectedThread.messages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">
                      Say hello to {selectedThread.alumnusName}. Your shared verified alma mater credentials are shown automatically.
                    </div>
                  ) : (
                    selectedThread.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === 'me' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                            msg.sender === 'me'
                              ? 'text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                          style={
                            msg.sender === 'me'
                              ? { backgroundColor: theme.primary }
                              : undefined
                          }
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 tabular-nums">
                          {msg.timestamp}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-3.5 border-t border-slate-100 flex items-center gap-2 bg-white"
                >
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${selectedThread.alumnusName}...`}
                    className="flex-1 h-9 px-3.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="h-9 px-3.5 rounded-lg text-white text-xs font-medium disabled:opacity-40 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Select a conversation to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
