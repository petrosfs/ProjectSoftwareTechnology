import { Search, Send, MoreVertical, Star, Trash2, CheckCheck, X, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';

interface OtherUser {
  id: string;
  name: string;
  avatar: string | null;
  rating: number;
}

interface Conversation {
  id: string;
  otherUser: OtherUser;
  lastMessage: string;
  lastMessageTime: string | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  isMe: boolean;
  isRead: boolean;
  createdAt: string;
}

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (msgStart.getTime() === todayStart.getTime()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const diffDays = (todayStart.getTime() - msgStart.getTime()) / 86400000;
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

function UserAvatar({ name, avatar, size = 'md' }: { name: string; avatar: string | null; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-12 h-12 text-sm';
  if (avatar) {
    return <img src={avatar} alt={name} className={`${cls} rounded-full object-cover ring-2 ring-purple-200 flex-shrink-0`} />;
  }
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold ring-2 ring-purple-200 flex-shrink-0`}>
      {initials}
    </div>
  );
}

export function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<OtherUser | null>(null); // new conv with no history yet
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedConv = conversations.find(c => c.id === selectedId) ?? null;

  // Load conversations (no routing logic here)
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/conversations', { credentials: 'include' });
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Reactively handle ?userId= param: runs whenever URL param or conversations change
  useEffect(() => {
    const targetId = searchParams.get('userId');
    if (!targetId || loading) return;

    // Clear the param from URL immediately so this effect doesn't re-fire
    setSearchParams({}, { replace: true });

    const existing = conversations.find(c => c.otherUser.id === targetId);
    if (existing) {
      setSelectedId(existing.id);
      setMessages([]);
    } else {
      fetch(`/api/users/${targetId}`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(u => {
          if (u) setPendingUser({ id: u.id, name: u.name, avatar: u.avatar ?? null, rating: u.rating ?? 0 });
        });
    }
  }, [searchParams, conversations, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Default selection: first conversation when no userId param and nothing selected
  useEffect(() => {
    if (loading || selectedId || pendingUser) return;
    if (searchParams.get('userId')) return; // wait for the routing effect above
    if (conversations.length > 0) setSelectedId(conversations[0].id);
  }, [loading, conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load messages for selected conversation
  const fetchMessages = useCallback(async (convId: string) => {
    const res = await fetch(`/api/messages/${convId}`, { credentials: 'include' });
    if (res.ok) setMessages(await res.json());
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!selectedId) return;
    fetchMessages(selectedId);
    // Mark as read
    fetch(`/api/messages/${selectedId}/read`, { method: 'PATCH', credentials: 'include' });
    setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, unreadCount: 0 } : c));
  }, [selectedId, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpenFor) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenFor(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenFor]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setMessages([]);
  };

  const handleSend = async () => {
    const receiverId = selectedConv?.otherUser.id ?? pendingUser?.id;
    if (!messageText.trim() || !receiverId || sending) return;
    const text = messageText.trim();
    setMessageText('');
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ receiverId, text }),
      });
      if (res.ok) {
        const newMsg: Message = await res.json();
        if (pendingUser) {
          // First message — conversation was just created, reload list and select it
          setPendingUser(null);
          const convRes = await fetch('/api/messages/conversations', { credentials: 'include' });
          if (convRes.ok) {
            const data: Conversation[] = await convRes.json();
            setConversations(data);
            setSelectedId(newMsg.conversationId);
          }
          setMessages([newMsg]);
        } else {
          setMessages(prev => [...prev, newMsg]);
          setConversations(prev => prev.map(c =>
            c.id === selectedId ? { ...c, lastMessage: text, lastMessageTime: newMsg.createdAt } : c
          ));
        }
      } else {
        setMessageText(text);
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleMarkRead = async (convId: string) => {
    await fetch(`/api/messages/${convId}/read`, { method: 'PATCH', credentials: 'include' });
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
    setMenuOpenFor(null);
  };

  const handleDeleteConversation = async (convId: string) => {
    await fetch(`/api/messages/${convId}`, { method: 'DELETE', credentials: 'include' });
    const remaining = conversations.filter(c => c.id !== convId);
    setConversations(remaining);
    if (selectedId === convId) {
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      setMessages([]);
    }
    setDeleteConfirm(null);
  };

  const filtered = conversations.filter(c =>
    c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-lg text-gray-600">Connect with your learning partners</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 overflow-hidden h-[600px] flex">

        {/* ── Left: Conversations List ── */}
        <div className="w-full md:w-1/3 border-r border-purple-100 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-purple-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-lg border border-purple-200 focus:border-purple-400 focus:outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
                <MessageSquare className="w-8 h-8 text-purple-200" />
                <p className="text-gray-400 text-sm">
                  {searchQuery ? `No results for "${searchQuery}"` : 'No conversations yet'}
                </p>
              </div>
            ) : (
              filtered.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-purple-50 transition-colors border-b border-purple-50 text-left ${selectedId === conv.id ? 'bg-purple-50' : ''}`}
                >
                  <div className="relative">
                    <UserAvatar name={conv.otherUser.name} avatar={conv.otherUser.avatar} />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {conv.otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                    {conv.otherUser.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-400">{conv.otherUser.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Right: Chat Area ── */}
        <div className="hidden md:flex md:flex-col flex-1 min-w-0">
          {selectedConv || pendingUser ? (
            <>
              {/* Header */}
              {(() => {
                const cu = selectedConv?.otherUser ?? pendingUser!;
                return (
              <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <UserAvatar name={cu.name} avatar={cu.avatar} size="sm" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{cu.name}</h3>
                    {cu.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">{cu.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* 3-dot menu — only for existing conversations */}
                {selectedConv && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpenFor(menuOpenFor === selectedConv.id ? null : selectedConv.id)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    aria-label="Conversation options"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  {menuOpenFor === selectedConv.id && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                      <button
                        onClick={() => handleMarkRead(selectedConv.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                      >
                        <CheckCheck className="w-4 h-4 text-purple-500" />
                        Mark as read
                      </button>
                      <div className="h-px bg-gray-100" />
                      <button
                        onClick={() => { setDeleteConfirm(selectedConv.id); setMenuOpenFor(null); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete conversation
                      </button>
                    </div>
                  )}
                </div>
                )}
              </div>
                );
              })()}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    {pendingUser ? `Start a conversation with ${pendingUser.name}` : 'No messages yet — say hello!'}
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.isMe
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <span className={`text-xs mt-1 block ${msg.isMe ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-purple-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message…"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    disabled={sending}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-sm disabled:opacity-60"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageText.trim() || sending}
                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-purple-300" />
              </div>
              <p className="text-base font-medium text-gray-500">Select a conversation</p>
              <p className="text-sm">Choose from your conversations on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete conversation?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">All messages will be permanently deleted. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConversation(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
