import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertCircle, ArrowLeft, Inbox, Loader2, MessageSquare, Search, Send, ShieldCheck,
} from 'lucide-react';
import { messagesAPI, usersAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const avatarFor = (user) =>
  user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'borrowbox')}`;

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const recipientId = searchParams.get('to') || '';
  const itemId = searchParams.get('item') || '';

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [search, setSearch] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const threadEndRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your conversations');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // A "Message owner" link from an item opens a fresh thread with that member.
  useEffect(() => {
    if (!recipientId) {
      setRecipient(null);
      return undefined;
    }

    let cancelled = false;
    usersAPI
      .getById(recipientId)
      .then((response) => {
        if (!cancelled) setRecipient(response.data.data);
      })
      .catch(() => {
        if (!cancelled) toast.error('That member could not be found');
      });

    return () => {
      cancelled = true;
    };
  }, [recipientId]);

  const openConversation = useCallback(async (conversationId) => {
    setActiveId(conversationId);
    setLoadingThread(true);
    try {
      const response = await messagesAPI.getThread(conversationId);
      setThread(response.data.data || []);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.conversationId === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
        ),
      );
    } catch (err) {
      setThread([]);
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.message || 'Could not open this conversation');
      }
    } finally {
      setLoadingThread(false);
    }
  }, []);

  // Opening a thread from the URL keeps deep links shareable.
  const requestedThread = searchParams.get('thread');
  useEffect(() => {
    if (requestedThread && requestedThread !== activeId) openConversation(requestedThread);
  }, [requestedThread, activeId, openConversation]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' });
  }, [thread, loadingThread]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.conversationId === activeId) || null,
    [conversations, activeId],
  );

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    const receiver = recipient?.id || activeConversation?.otherUser?.id;

    if (!text) {
      toast.error('Write a message before sending');
      return;
    }
    if (!receiver) {
      toast.error('Choose someone to message first');
      return;
    }

    try {
      setSending(true);
      const response = await messagesAPI.send({
        receiverId: receiver,
        text,
        itemId: itemId || activeConversation?.item?.id || undefined,
      });
      setDraft('');
      const conversationId = response.data.data?.conversationId;
      if (conversationId) {
        setSearchParams({ thread: conversationId });
        await Promise.all([openConversation(conversationId), loadConversations()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Message could not be sent');
    } finally {
      setSending(false);
    }
  };

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const name = conversation.otherUser?.name?.toLowerCase() || '';
      const item = conversation.item?.title?.toLowerCase() || '';
      return name.includes(query) || item.includes(query);
    });
  }, [conversations, search]);

  const headerName = recipient?.name || activeConversation?.otherUser?.name || 'New conversation';
  const headerMeta = recipient
    ? 'Start the conversation about this item'
    : activeConversation?.item?.title || 'Direct message';

  return (
    <div className="shell py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1 className="mt-2 font-display text-[30px] font-bold tracking-[-0.02em]">Messages</h1>
          <p className="mt-2 max-w-[560px] text-[15px] text-zinc-600 dark:text-zinc-400">
            Coordinate pickups, ask questions and agree return dates without leaving BorrowBox.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-zinc-500 shadow-soft dark:text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          Private by design
        </span>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className={`card overflow-hidden ${activeId || recipientId ? 'hidden lg:block' : ''}`}>
          <div className="border-b border-border p-4">
            <label htmlFor="conversation-search" className="sr-only">Search conversations</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                id="conversation-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by member or item"
                className="input pl-10"
              />
            </div>
          </div>

          {loadingList ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((index) => <div key={index} className="skeleton h-16" />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <AlertCircle className="h-6 w-6 text-rose-500" aria-hidden="true" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
            </div>
          ) : visibleConversations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <Inbox className="h-6 w-6 text-zinc-400" aria-hidden="true" />
              <p className="text-sm font-semibold">No conversations yet</p>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                Message an owner from any listing to get started.
              </p>
              <Link to="/browse" className="btn btn-secondary btn-sm mt-1">Browse items</Link>
            </div>
          ) : (
            <ul className="max-h-[560px] divide-y divide-border overflow-y-auto">
              {visibleConversations.map((conversation) => {
                const isActive = conversation.conversationId === activeId;
                return (
                  <li key={conversation.conversationId}>
                    <button
                      type="button"
                      onClick={() => setSearchParams({ thread: conversation.conversationId })}
                      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                        isActive ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <img
                        src={avatarFor(conversation.otherUser)}
                        alt=""
                        className="h-10 w-10 flex-shrink-0 rounded-full border border-border object-cover"
                        loading="lazy"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13.5px] font-semibold">
                            {conversation.otherUser?.name || 'BorrowBox member'}
                          </span>
                          <span className="flex-shrink-0 text-[11px] text-zinc-400">
                            {formatTime(conversation.lastMessage?.createdAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-zinc-500 dark:text-zinc-400">
                          {conversation.item?.title || 'Direct message'}
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-2">
                          <span className="truncate text-[12.5px] text-zinc-500 dark:text-zinc-400">
                            {conversation.lastMessage?.senderId === user?.id ? 'You: ' : ''}
                            {conversation.lastMessage?.text}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className={`card flex min-h-[520px] flex-col overflow-hidden ${!activeId && !recipientId ? 'hidden lg:flex' : ''}`}>
          <header className="flex items-center gap-3 border-b border-border p-4">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="icon-btn lg:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {recipient || activeConversation ? (
              <>
                <img
                  src={avatarFor(recipient || activeConversation.otherUser)}
                  alt=""
                  className="h-10 w-10 rounded-full border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">{headerName}</p>
                  <p className="truncate text-[12.5px] text-zinc-500 dark:text-zinc-400">{headerMeta}</p>
                </div>
              </>
            ) : (
              <p className="text-[14px] font-semibold">Select a conversation</p>
            )}
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-zinc-50/70 p-4 dark:bg-zinc-900/40">
            {loadingThread ? (
              <div className="space-y-3">
                {[0, 1, 2].map((index) => <div key={index} className="skeleton h-14 w-2/3" />)}
              </div>
            ) : thread.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                <MessageSquare className="h-6 w-6 text-zinc-400" aria-hidden="true" />
                <p className="text-sm font-semibold">No messages yet</p>
                <p className="max-w-[320px] text-[13px] text-zinc-500 dark:text-zinc-400">
                  Keep it friendly: introduce yourself, confirm the item is available and agree a pickup window.
                </p>
              </div>
            ) : (
              thread.map((message) => {
                const isMine = message.senderId === user?.id;
                return (
                  <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-soft sm:max-w-[70%] ${
                        isMine
                          ? 'bg-brand-600 text-white'
                          : 'border border-border bg-card text-zinc-800 dark:text-zinc-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      <p className={`mt-1 text-[11px] ${isMine ? 'text-white/70' : 'text-zinc-400'}`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={threadEndRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-border p-4">
            <label htmlFor="message-draft" className="sr-only">Message</label>
            <div className="flex items-end gap-3">
              <textarea
                id="message-draft"
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage(event);
                  }
                }}
                placeholder={recipient || activeConversation ? 'Write a message' : 'Select a conversation to reply'}
                disabled={!recipient && !activeConversation}
                maxLength={2000}
                className="input min-h-[52px] resize-none"
              />
              <button
                type="submit"
                disabled={sending || (!recipient && !activeConversation)}
                className="btn btn-primary btn-md flex-shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Send
              </button>
            </div>
            <p className="mt-2 text-[12px] text-zinc-500 dark:text-zinc-400">
              Never share payment details or codes. BorrowBox staff will never ask for your password.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
