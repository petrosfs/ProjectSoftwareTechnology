import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Clock, Video, MessageSquare, User, Plus, Search,
         Check, X, RefreshCw, AlertCircle, Loader2, MapPin, Star, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface Session {
  id: string;
  skillTitle: string;
  otherUser: string;
  otherUserId: string;
  otherUserAvatar: string;
  date: string;
  time: string;
  status: string;
  type: 'teaching' | 'learning';
  durationMinutes: number;
  deliveryMode: string;
  initiatedById: string | null;
  meetingUrl: string | null;
}

interface UserResult {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Connection {
  id: string;
  skillTitle: string;
  sourceType: 'offer' | 'swap';
  createdAt: string;
  otherUser: { id: string; name: string; avatar: string };
}

// ── Leave Review Modal ──────────────────────────────────────────────────────
function LeaveReviewModal({
  session,
  onClose,
  onSubmitted,
}: {
  session: Session;
  onClose: () => void;
  onSubmitted: (sessionId: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: session.id,
          revieweeId: session.otherUserId,
          rating,
          comment: comment.trim(),
          skillTitle: session.skillTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit review'); return; }
      onSubmitted(session.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Leave a Review</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Session info */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
            <Avatar name={session.otherUser} src={session.otherUserAvatar} size="sm" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{session.skillTitle}</p>
              <p className="text-xs text-gray-500">with {session.otherUser} · {session.date}</p>
            </div>
          </div>

          {/* Star rating */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">
              How was your experience? <span className="text-red-500">*</span>
            </p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className={`text-center text-sm font-medium mt-2 h-5 transition-colors ${
              hoverRating || rating ? 'text-purple-600' : 'text-transparent'
            }`}>
              {LABELS[hoverRating || rating]}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this teacher…"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-0.5">{comment.length}/500</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
              : <><Star className="w-4 h-4" />Submit Review</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Schedule New Modal ──────────────────────────────────────────────────────
function ScheduleModal({
  onClose,
  onCreated,
  initialUser,
  initialSkill,
}: {
  onClose: () => void;
  onCreated: () => void;
  initialUser?: { id: string; name: string; email: string; avatar: string | null };
  initialSkill?: string;
}) {
  const [myRole, setMyRole] = useState<'teaching' | 'learning'>('learning');
  const [userQuery, setUserQuery] = useState(initialUser?.name ?? '');
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(initialUser ?? null);
  const [skillTitle, setSkillTitle] = useState(initialSkill ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [mode, setMode] = useState<'online' | 'in-person'>('online');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced user search
  useEffect(() => {
    if (!userQuery.trim() || selectedUser) { setUserResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/users?q=${encodeURIComponent(userQuery)}`, { credentials: 'include' });
      if (res.ok) { setUserResults(await res.json()); setShowDropdown(true); }
    }, 300);
  }, [userQuery, selectedUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!selectedUser) { setError('Please select a user'); return; }
    if (!skillTitle.trim()) { setError('Please enter a skill / topic'); return; }
    if (!date || !time) { setError('Please select a date and time'); return; }
    const scheduledAt = `${date}T${time}:00`;
    if (new Date(scheduledAt) <= new Date()) { setError('Scheduled time must be in the future'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otherUserId: selectedUser.id, myRole, skillTitle: skillTitle.trim(), scheduledAt, durationMinutes: duration, deliveryMode: mode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to schedule session'); return; }
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Schedule New Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Role toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">My role</label>
            <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
              {(['teaching', 'learning'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setMyRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                    myRole === r ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  I'm {r}
                </button>
              ))}
            </div>
          </div>

          {/* User search */}
          <div ref={searchRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {myRole === 'teaching' ? 'Learner' : 'Teacher'}
            </label>
            {selectedUser ? (
              <div className="flex items-center gap-3 px-4 py-2.5 border-2 border-purple-300 rounded-xl bg-purple-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
                </div>
                <button onClick={() => { setSelectedUser(null); setUserQuery(''); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  onFocus={() => userResults.length > 0 && setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                />
                {showDropdown && userResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden max-h-48 overflow-y-auto">
                    {userResults.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { setSelectedUser(u); setUserQuery(u.name); setShowDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {userQuery.length >= 1 && userResults.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1 ml-1">No users found</p>
                )}
              </div>
            )}
          </div>

          {/* Skill */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill / Topic</label>
            <input
              type="text"
              placeholder="e.g. Python Basics, Guitar Chords…"
              value={skillTitle}
              onChange={e => setSkillTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
            </div>
          </div>

          {/* Duration & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-white"
              >
                {[30, 45, 60, 90, 120].map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value as 'online' | 'in-person')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-white"
              >
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reschedule Modal ────────────────────────────────────────────────────────
function RescheduleModal({
  session,
  onClose,
  onRescheduled,
}: {
  session: Session;
  onClose: () => void;
  onRescheduled: () => void;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!date || !time) return;
    const newScheduledAt = `${date}T${time}:00`;
    if (new Date(newScheduledAt) <= new Date()) {
      setError('The new time must be in the future');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/sessions/${session.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newScheduledAt }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to send reschedule request'); return; }

      // If there's a note, also send it as a message
      if (note.trim()) {
        try {
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              receiverId: session.otherUserId,
              text: `Reschedule note for "${session.skillTitle}" (${date} at ${time}): ${note.trim()}`,
            }),
          });
        } catch { /* non-fatal */ }
      }

      onRescheduled();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Propose New Time</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          A reschedule request will be sent to <strong>{session.otherUser}</strong> to approve or reject.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New date</label>
              <input type="date" value={date} min={new Date().toISOString().slice(0, 10)}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Reason for rescheduling…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm" />
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
          <button onClick={handleSend} disabled={!date || !time || sending}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm flex items-center justify-center gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Avatar helper ───────────────────────────────────────────────────────────
function Avatar({ name, src, size = 'lg' }: { name: string; src: string; size?: 'sm' | 'lg' }) {
  const cls = size === 'sm' ? 'w-12 h-12 rounded-xl' : 'w-16 h-16 rounded-2xl';
  return (
    <img src={src} alt={name}
      className={`${cls} object-cover ring-2 ring-purple-200`}
      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`; }} />
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function Sessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Session | null>(null);
  const [responding, setResponding] = useState<Record<string, boolean>>({});
  const [cancelling, setCancelling] = useState<Record<string, boolean>>({});
  const [completing, setCompleting] = useState<Record<string, boolean>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [reviewTarget, setReviewTarget] = useState<Session | null>(null);
  const [reviewedSessions, setReviewedSessions] = useState<Set<string>>(new Set());
  const [connections, setConnections] = useState<Connection[]>([]);
  const [scheduleFromConnection, setScheduleFromConnection] = useState<Connection | null>(null);

  const fetchSessions = useCallback(async () => {
    const res = await fetch('/api/sessions/mine', { credentials: 'include' });
    if (res.ok) setSessions(await res.json());
    setLoading(false);
  }, []);

  const fetchConnections = useCallback(async () => {
    const res = await fetch('/api/connections', { credentials: 'include' });
    if (res.ok) setConnections(await res.json());
  }, []);

  useEffect(() => { fetchSessions(); fetchConnections(); }, [fetchSessions, fetchConnections]);

  // Sessions that need MY response (pending, other user initiated)
  const actionRequired = sessions.filter(s =>
    s.status === 'pending' && s.initiatedById !== null && s.initiatedById !== user?.id
  );

  // Sessions I'm waiting on (I initiated, still pending)
  const waitingOn = sessions.filter(s =>
    s.status === 'pending' && (s.initiatedById === user?.id || s.initiatedById === null)
  );

  const upcoming = sessions.filter(s => s.status === 'upcoming' || s.status === 'confirmed');
  const completed = sessions.filter(s => s.status === 'completed');

  const handleResponse = async (sessionId: string, response: 'accepted' | 'rejected') => {
    setResponding(r => ({ ...r, [sessionId]: true }));
    const res = await fetch(`/api/sessions/${sessionId}/response`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ response }),
    });
    if (res.ok) {
      const { status } = await res.json();
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s));
      if (response === 'accepted') setSuccessMsg('Session confirmed!');
    }
    setResponding(r => ({ ...r, [sessionId]: false }));
  };

  const handleCancel = async (sessionId: string) => {
    setCancelling(c => ({ ...c, [sessionId]: true }));
    const res = await fetch(`/api/sessions/${sessionId}/cancel`, {
      method: 'PATCH', credentials: 'include',
    });
    if (res.ok) setSessions(prev => prev.filter(s => s.id !== sessionId));
    setCancelling(c => ({ ...c, [sessionId]: false }));
  };

  const handleComplete = async (sessionId: string) => {
    setCompleting(c => ({ ...c, [sessionId]: true }));
    const res = await fetch(`/api/sessions/${sessionId}/complete`, {
      method: 'PATCH', credentials: 'include',
    });
    if (res.ok) {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed' } : s));
      setSuccessMsg('Session marked as completed! Payment has been released to the teacher.');
    }
    setCompleting(c => ({ ...c, [sessionId]: false }));
  };

  const goToMessages = (otherUserId: string) => {
    navigate(`/messages?userId=${otherUserId}`);
  };

  const dismissConnection = async (connectionId: string) => {
    await fetch(`/api/connections/${connectionId}`, { method: 'DELETE', credentials: 'include' });
    setConnections(prev => prev.filter(c => c.id !== connectionId));
  };

  const handleLeaveReview = async (session: Session) => {
    const res = await fetch(`/api/reviews/permission/${session.id}`, { credentials: 'include' });
    if (res.ok) {
      const { allowed, reason } = await res.json();
      if (allowed) {
        setReviewTarget(session);
      } else if (reason === 'reviewAlreadyExists') {
        setReviewedSessions(prev => new Set(prev).add(session.id));
      }
    }
  };

  const totalUpcoming = upcoming.length + waitingOn.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Sessions
        </h1>
        <p className="text-lg text-gray-600">Manage your teaching and learning sessions</p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-700">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{totalUpcoming}</div>
          <div className="text-blue-100">Upcoming Sessions</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <User className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">
            {[...upcoming, ...waitingOn].filter(s => s.type === 'teaching').length}
          </div>
          <div className="text-purple-100">Teaching Sessions</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <User className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">
            {[...upcoming, ...waitingOn].filter(s => s.type === 'learning').length}
          </div>
          <div className="text-pink-100">Learning Sessions</div>
        </div>
      </div>

      {/* ── Action Required ── */}
      {actionRequired.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <h2 className="text-xl font-bold text-amber-800">Action Required ({actionRequired.length})</h2>
          </div>
          <div className="space-y-4">
            {actionRequired.map(session => (
              <div key={session.id} className="bg-white rounded-xl p-5 border border-amber-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar name={session.otherUser} src={session.otherUserAvatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{session.skillTitle}</h3>
                      <p className="text-sm text-gray-600">
                        Requested by <strong>{session.otherUser}</strong>
                        {session.type === 'teaching' ? ' (wants to learn from you)' : ' (will teach you)'}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-purple-500" />{session.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-500" />{session.time}</span>
                        <span className="flex items-center gap-1">
                          {session.deliveryMode === 'online' ? <Video className="w-3.5 h-3.5 text-purple-500" /> : <MapPin className="w-3.5 h-3.5 text-purple-500" />}
                          {session.deliveryMode}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-500" />{session.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleResponse(session.id, 'accepted')}
                      disabled={responding[session.id]}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm disabled:opacity-50"
                    >
                      {responding[session.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Accept
                    </button>
                    <button
                      onClick={() => setRescheduleTarget(session)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-semibold text-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleResponse(session.id, 'rejected')}
                      disabled={responding[session.id]}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => goToMessages(session.otherUserId)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Connections to Schedule ── */}
      {connections.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Schedule Your Sessions ({connections.length})</h2>
              <p className="text-sm text-green-600">You have new connections waiting to be scheduled</p>
            </div>
          </div>
          <div className="space-y-3">
            {connections.map(conn => (
              <div key={conn.id} className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar name={conn.otherUser.name} src={conn.otherUser.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 truncate">{conn.skillTitle}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          conn.sourceType === 'offer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {conn.sourceType === 'offer' ? 'Purchase' : 'Swap'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">with <strong>{conn.otherUser.name}</strong></p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setScheduleFromConnection(conn)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Schedule Now
                    </button>
                    <button
                      onClick={() => goToMessages(conn.otherUser.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message
                    </button>
                    <button
                      onClick={() => dismissConnection(conn.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Upcoming Sessions ── */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-transform font-semibold"
          >
            <Plus className="w-4 h-4" />
            Schedule New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
        ) : upcoming.length === 0 && waitingOn.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No upcoming sessions</p>
            <p className="text-gray-400 mt-2">Click "Schedule New" to book a session!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...upcoming, ...waitingOn].map(session => (
              <div key={session.id} className="p-5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar name={session.otherUser} src={session.otherUserAvatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{session.skillTitle}</h3>
                        {session.status === 'pending' && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                            Awaiting confirmation
                          </span>
                        )}
                        {session.status === 'confirmed' && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                            Confirmed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">with {session.otherUser}</p>
                      <span className={`inline-block px-3 py-0.5 rounded-lg text-xs font-medium ${
                        session.type === 'teaching' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {session.type === 'teaching' ? 'Teaching' : 'Learning'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 md:min-w-[180px] text-sm text-gray-700">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-600" />{session.date}</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-600" />{session.time} · {session.durationMinutes} min</span>
                    <span className="flex items-center gap-2">
                      {session.deliveryMode === 'online' ? <Video className="w-4 h-4 text-purple-600" /> : <MapPin className="w-4 h-4 text-purple-600" />}
                      {session.deliveryMode === 'online' ? 'Online' : 'In-person'}
                    </span>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    {session.status !== 'pending' && session.deliveryMode === 'online' && (
                      session.meetingUrl ? (
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform font-semibold text-sm whitespace-nowrap"
                        >
                          <Video className="w-4 h-4" />
                          Join
                        </a>
                      ) : (
                        <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm whitespace-nowrap cursor-not-allowed" title="Meeting link not available">
                          <Video className="w-4 h-4" />
                          Join
                        </span>
                      )
                    )}
                    <button
                      onClick={() => goToMessages(session.otherUserId)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm whitespace-nowrap"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    {session.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(session.id)}
                        disabled={cancelling[session.id]}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-500 border-2 border-red-100 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm whitespace-nowrap disabled:opacity-50"
                      >
                        {cancelling[session.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        Cancel
                      </button>
                    )}
                    {(session.status === 'confirmed' || session.status === 'upcoming') && (
                      <button
                        onClick={() => setRescheduleTarget(session)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 border-2 border-amber-100 rounded-lg hover:bg-amber-50 transition-colors font-semibold text-sm whitespace-nowrap"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reschedule
                      </button>
                    )}
                    {(session.status === 'confirmed' || session.status === 'upcoming') && (
                      <button
                        onClick={() => handleComplete(session.id)}
                        disabled={completing[session.id]}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors font-semibold text-sm whitespace-nowrap disabled:opacity-50"
                      >
                        {completing[session.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Past Sessions ── */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Sessions</h2>
        {completed.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No past sessions yet</p>
        ) : (
          <div className="space-y-3">
            {completed.map(session => (
              <div key={session.id} className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow bg-white">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar name={session.otherUser} src={session.otherUserAvatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{session.skillTitle}</h3>
                      <p className="text-sm text-gray-600">with {session.otherUser}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{session.date}</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      session.type === 'teaching' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {session.type === 'teaching' ? 'Taught' : 'Learned'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToMessages(session.otherUserId)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-sm font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message
                    </button>
                    {session.type === 'learning' && (
                      reviewedSessions.has(session.id) ? (
                        <span className="flex items-center gap-1 px-4 py-2 text-green-600 border border-green-200 rounded-lg bg-green-50 text-sm font-semibold whitespace-nowrap">
                          <Check className="w-3.5 h-3.5" />
                          Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleLeaveReview(session)}
                          className="flex items-center gap-1.5 px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-sm font-semibold whitespace-nowrap"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Leave Review
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showSchedule && (
        <ScheduleModal
          onClose={() => setShowSchedule(false)}
          onCreated={() => {
            setShowSchedule(false);
            setSuccessMsg('Session request sent! The other user will be notified.');
            fetchSessions();
          }}
        />
      )}
      {scheduleFromConnection && (
        <ScheduleModal
          onClose={() => setScheduleFromConnection(null)}
          initialUser={{
            id: scheduleFromConnection.otherUser.id,
            name: scheduleFromConnection.otherUser.name,
            email: '',
            avatar: scheduleFromConnection.otherUser.avatar ?? null,
          }}
          initialSkill={scheduleFromConnection.skillTitle}
          onCreated={() => {
            dismissConnection(scheduleFromConnection.id);
            setScheduleFromConnection(null);
            setSuccessMsg('Session scheduled! The other user will be notified.');
            fetchSessions();
          }}
        />
      )}
      {rescheduleTarget && (
        <RescheduleModal
          session={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={() => {
            setRescheduleTarget(null);
            setSuccessMsg('Reschedule request sent! Waiting for the other user to respond.');
            fetchSessions();
          }}
        />
      )}
      {reviewTarget && (
        <LeaveReviewModal
          session={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={sessionId => {
            setReviewedSessions(prev => new Set(prev).add(sessionId));
            setReviewTarget(null);
            setSuccessMsg('Review submitted! Thank you for your feedback.');
          }}
        />
      )}
    </div>
  );
}
