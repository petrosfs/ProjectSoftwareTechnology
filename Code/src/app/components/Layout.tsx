import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Home, Search, User, MessageSquare, Calendar, PlusCircle, LogOut, Bell, Check, X, DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}
import { CreateListingModal } from './CreateListingModal';
import { DogLogo } from './DogLogo';
import { useAuth } from '../context/AuthContext';

interface PendingOffer {
  id: string;
  listingTitle: string;
  listingPrice: number | null;
  message: string | null;
  createdAt: string;
  buyer: { id: string; name: string; avatar: string };
}

interface PendingSwap {
  id: string;
  offeredSkillName: string;
  offeredSkillLevel: string;
  targetListingTitle: string;
  message: string | null;
  createdAt: string;
  requester: { id: string; name: string; avatar: string };
}

interface InboxNotif {
  id: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

function UserAvatar({ name, src, size = 8 }: { name: string; src: string; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full object-cover ring-2 ring-purple-200`;
  return (
    <img
      src={src}
      alt={name}
      className={cls}
      onError={e => {
        (e.target as HTMLImageElement).src =
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`;
      }}
    />
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'offer' | 'request'>('offer');

  const [panelOpen, setPanelOpen] = useState(false);
  const [offers, setOffers] = useState<PendingOffer[]>([]);
  const [swaps, setSwaps] = useState<PendingSwap[]>([]);
  const [inboxNotifs, setInboxNotifs] = useState<InboxNotif[]>([]);
  const [deciding, setDeciding] = useState<Record<string, boolean>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadInbox = inboxNotifs.filter(n => !n.isRead).length;
  const totalPending = offers.length + swaps.length + unreadInbox;

  const fetchNotifications = async (): Promise<void> => {
    const [oRes, sRes, nRes] = await Promise.all([
      fetch('/api/offers/received', { credentials: 'include' }),
      fetch('/api/swaps/received', { credentials: 'include' }),
      fetch('/api/notifications', { credentials: 'include' }),
    ]);
    if (oRes.ok) setOffers(await oRes.json());
    if (sRes.ok) setSwaps(await sRes.json());
    if (nRes.ok) setInboxNotifs(await nRes.json());
  };

  const markInboxRead = () => {
    fetch('/api/notifications/read-all', { method: 'PATCH', credentials: 'include' });
    setInboxNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Close panel on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleOfferDecision = async (offerId: string, decision: 'accepted' | 'rejected') => {
    setDeciding(d => ({ ...d, [offerId]: true }));
    const res = await fetch(`/api/offers/${offerId}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ decision }),
    });
    if (res.ok) setOffers(prev => prev.filter(o => o.id !== offerId));
    setDeciding(d => ({ ...d, [offerId]: false }));
  };

  const handleSwapDecision = async (swapId: string, decision: 'accepted' | 'rejected') => {
    setDeciding(d => ({ ...d, [swapId]: true }));
    const res = await fetch(`/api/swaps/${swapId}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ decision }),
    });
    if (res.ok) setSwaps(prev => prev.filter(s => s.id !== swapId));
    setDeciding(d => ({ ...d, [swapId]: false }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/marketplace', icon: Search, label: 'Marketplace' },
    { path: '/sessions', icon: Calendar, label: 'Sessions' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <DogLogo className="w-10 h-10" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillUs
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side: bell + avatar + logout */}
            <div className="flex items-center space-x-2" ref={panelRef}>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    const opening = !panelOpen;
                    setPanelOpen(opening);
                    if (opening) { fetchNotifications().then(markInboxRead); }
                  }}
                  className="relative p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {totalPending > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalPending > 9 ? '9+' : totalPending}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {panelOpen && (
                  <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden z-50">
                    <div className="px-5 py-3 border-b border-purple-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <span className="text-xs text-gray-500">{totalPending} pending</span>
                    </div>

                    <div className="max-h-[28rem] overflow-y-auto divide-y divide-gray-100">
                      {/* Pending Offers */}
                      {offers.map(offer => (
                        <div key={offer.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 bg-blue-100 rounded-lg flex-shrink-0">
                              <DollarSign className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <UserAvatar name={offer.buyer.name} src={offer.buyer.avatar} size={6} />
                                <p className="text-sm font-semibold text-gray-900 truncate">{offer.buyer.name}</p>
                              </div>
                              <p className="text-sm text-gray-600">
                                wants to <strong>purchase</strong> your "<span className="text-purple-700">{offer.listingTitle}</span>"
                                {offer.listingPrice ? ` for $${offer.listingPrice}` : ''}
                              </p>
                              {offer.message && (
                                <p className="text-xs text-gray-400 mt-1 italic">"{offer.message}"</p>
                              )}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleOfferDecision(offer.id, 'accepted')}
                                  disabled={deciding[offer.id]}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
                                >
                                  {deciding[offer.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleOfferDecision(offer.id, 'rejected')}
                                  disabled={deciding[offer.id]}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pending Swaps */}
                      {swaps.map(swap => (
                        <div key={swap.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 bg-purple-100 rounded-lg flex-shrink-0">
                              <RefreshCw className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <UserAvatar name={swap.requester.name} src={swap.requester.avatar} size={6} />
                                <p className="text-sm font-semibold text-gray-900 truncate">{swap.requester.name}</p>
                              </div>
                              <p className="text-sm text-gray-600">
                                wants to <strong>swap</strong> "<span className="text-purple-700">{swap.offeredSkillName}</span>" ({swap.offeredSkillLevel}) for your "<span className="text-purple-700">{swap.targetListingTitle}</span>"
                              </p>
                              {swap.message && (
                                <p className="text-xs text-gray-400 mt-1 italic">"{swap.message}"</p>
                              )}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleSwapDecision(swap.id, 'accepted')}
                                  disabled={deciding[swap.id]}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
                                >
                                  {deciding[swap.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleSwapDecision(swap.id, 'rejected')}
                                  disabled={deciding[swap.id]}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Inbox: outcome notifications */}
                      {inboxNotifs.length > 0 && (
                        <>
                          <div className="px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Updates
                          </div>
                          {inboxNotifs.map(n => (
                            <div key={n.id} className={`px-5 py-3 flex items-start gap-3 ${n.isRead ? '' : 'bg-blue-50/60'}`}>
                              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-blue-500'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 leading-snug">{n.body}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {offers.length === 0 && swaps.length === 0 && inboxNotifs.length === 0 && (
                        <div className="px-5 py-8 text-center text-gray-400 text-sm">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/profile" className="flex items-center space-x-2">
                <img
                  src={user?.avatar || 'https://i.pravatar.cc/150?img=1'}
                  alt={user?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&background=7c3aed&color=fff`;
                  }}
                />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Αποσύνδεση"
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-purple-100 z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-purple-600' : ''}`} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => {
          setModalType('offer');
          setIsModalOpen(true);
        }}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-40"
      >
        <PlusCircle className="w-7 h-7" />
      </button>

      <CreateListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
      />
    </div>
  );
}
