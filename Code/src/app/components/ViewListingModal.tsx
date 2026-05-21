import { useState, useEffect, useRef } from 'react';
import { X, DollarSign, RefreshCw, Star, Calendar, MessageCircle, Check, Loader2, AlertCircle, ChevronRight, Send, ArrowLeft, CreditCard, Lock, Shield, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SkillListing } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserSkill {
  id: string;
  name: string;
  level: string;
  yearsOfExperience: number;
}

interface ViewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: SkillListing | null;
  onDelete?: (id: string) => void;
}

type Step = 'view' | 'payment' | 'swapPicker' | 'messageComposer' | 'teachOffer' | 'success';

export function ViewListingModal({ isOpen, onClose, listing, onDelete }: ViewListingModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<Step>('view');
  const [successType, setSuccessType] = useState<'purchase' | 'swap' | 'teachPrice' | 'teachSwap' | null>(null);
  const [mySkills, setMySkills] = useState<UserSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [messageText, setMessageText] = useState('');
  const [teachMode, setTeachMode] = useState<'price' | 'swap'>('price');
  const [proposedPrice, setProposedPrice] = useState('');
  const [ownerSkills, setOwnerSkills] = useState<UserSkill[]>([]);
  const [selectedOwnerSkillId, setSelectedOwnerSkillId] = useState('');
  const [loadingOwnerSkills, setLoadingOwnerSkills] = useState(false);
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<{ price: number; platformFee: number; total: number } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('view');
      setSuccessType(null);
      setSelectedSkillId('');
      setError('');
      setMessageText('');
      setCardNumber('');
      setCardName('');
      setExpiry('');
      setCvv('');
      setPaymentInfo(null);
      setTeachMode('price');
      setProposedPrice('');
      setOwnerSkills([]);
      setSelectedOwnerSkillId('');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }, [isOpen]);

  // Auto-focus textarea when composer opens
  useEffect(() => {
    if (step === 'messageComposer') {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [step]);

  if (!isOpen || !listing) return null;

  const isOwnListing = user?.id === listing.userId;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing!.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        onClose();
        onDelete?.(listing!.id);
      }
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ receiverId: listing.userId, text }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send message');
        return;
      }
      onClose();
      navigate(`/messages?userId=${listing.userId}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Card validation helpers
  const luhn = (num: string) => {
    const digits = num.replace(/\D/g, '');
    let sum = 0, even = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits[i]);
      if (even) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      even = !even;
    }
    return sum % 10 === 0;
  };

  const isExpiryValid = (val: string) => {
    const [mm, yy] = val.split('/');
    if (!mm || !yy || mm.length !== 2 || yy.length !== 2) return false;
    const month = parseInt(mm), year = 2000 + parseInt(yy);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    return new Date(year, month - 1, 1) >= new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const openPayment = async () => {
    if (!listing) return;
    setCheckingAvailability(true);
    setError('');
    try {
      const res = await fetch(`/api/payments/listing/${listing.id}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.available) {
        setError(data.reason === 'alreadyPurchased'
          ? 'This skill is currently unavailable — it has already been purchased and is awaiting session completion.'
          : 'This listing is no longer available.');
        return;
      }
      setPaymentInfo({ price: data.listing.price, platformFee: data.listing.platformFee, total: data.listing.total });
      setStep('payment');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handlePayAndOrder = async () => {
    if (!listing) return;
    setError('');
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16) { setError('Card number must be 16 digits.'); return; }
    if (!luhn(rawCard)) { setError('Invalid card number.'); return; }
    if (!isExpiryValid(expiry)) { setError('Card has expired or expiry is invalid (MM/YY).'); return; }
    if (cvv.length < 3) { setError('Invalid security code.'); return; }
    if (!cardName.trim()) { setError('Cardholder name is required.'); return; }
    // Simulated decline cases
    const last4 = rawCard.slice(-4);
    if (last4 === '0000') { setError('Payment declined: Insufficient funds.'); return; }
    if (last4 === '0001') { setError('Payment declined: Card refused by issuer.'); return; }

    setSubmitting(true);
    try {
      const holdRes = await fetch('/api/payments/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ listingId: listing.id }),
      });
      const holdData = await holdRes.json();
      if (!holdRes.ok) {
        setError(holdData.reason === 'alreadyPurchased'
          ? 'This skill was just purchased by someone else.'
          : holdData.error || 'Payment failed.');
        return;
      }
      // Create the offer
      await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ listingId: listing.id }),
      });
      setSuccessType('purchase');
      setStep('success');
    } finally {
      setSubmitting(false);
    }
  };

  const openSwapPicker = async () => {
    setError('');
    setLoadingSkills(true);
    try {
      const res = await fetch('/api/myskills', { credentials: 'include' });
      if (res.ok) setMySkills(await res.json());
    } finally {
      setLoadingSkills(false);
    }
    setStep('swapPicker');
  };

  const loadSkillsIfNeeded = async () => {
    if (mySkills.length > 0) return;
    setLoadingSkills(true);
    try {
      const res = await fetch('/api/myskills', { credentials: 'include' });
      if (res.ok) setMySkills(await res.json());
    } finally {
      setLoadingSkills(false);
    }
  };

  const loadOwnerSkillsIfNeeded = async () => {
    if (!listing || ownerSkills.length > 0) return;
    setLoadingOwnerSkills(true);
    try {
      const res = await fetch(`/api/users/${listing.userId}/skills`, { credentials: 'include' });
      if (res.ok) setOwnerSkills(await res.json());
    } finally {
      setLoadingOwnerSkills(false);
    }
  };

  const handleTeachPriceOffer = async () => {
    const price = Number(proposedPrice);
    if (!proposedPrice || isNaN(price) || price <= 0) {
      setError('Εισάγετε έγκυρη τιμή ανά session (> 0).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          listingId: listing!.id,
          proposedPrice: price,
          message: messageText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Αποτυχία αποστολής πρότασης.'); return; }
      setSuccessType('teachPrice');
      setStep('success');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwap = async () => {
    if (!selectedSkillId) { setError('Επίλεξε ένα skill σου για να προσφέρεις'); return; }
    if (listing!.type === 'request' && !selectedOwnerSkillId) {
      setError('Επίλεξε ένα skill του χρήστη που θέλεις ως αντάλλαγμα');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body: Record<string, string> = {
        responderId: listing!.userId,
        offeredSkillId: selectedSkillId,
        targetSkillId: listing!.id,
      };
      if (listing!.type === 'request') body.wantedSkillId = selectedOwnerSkillId;
      const res = await fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send swap request');
        return;
      }
      setSuccessType(listing!.type === 'request' ? 'teachSwap' : 'swap');
      setStep('success');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  listing.type === 'offer' ? 'bg-green-500/20 text-green-100' : 'bg-blue-500/20 text-blue-100'
                }`}>
                  {listing.type === 'offer' ? 'Offering' : 'Requesting'}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-1">{listing.title}</h2>
              <p className="text-white/80 text-sm">{listing.category}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── Message composer ── */}
        {step === 'messageComposer' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setStep('view'); setError(''); setMessageText(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Send a Message</h4>
                <p className="text-sm text-gray-500">to <strong>{listing.userName}</strong></p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <img
                src={listing.userAvatar}
                alt={listing.userName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200 flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.userName)}&background=7c3aed&color=fff`; }}
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{listing.userName}</p>
                <p className="text-xs text-gray-500 truncate">Re: {listing.title}</p>
              </div>
            </div>

            <div>
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                }}
                placeholder={listing.type === 'request'
                  ? `Hi ${listing.userName.split(' ')[0]}, I can help you learn "${listing.title}"…`
                  : `Hi ${listing.userName.split(' ')[0]}, I'm interested in your "${listing.title}" listing…`}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">{messageText.length}/1000</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('view'); setError(''); setMessageText(''); }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                  : <><Send className="w-4 h-4" />Send Message</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Payment step ── */}
        {step === 'payment' && paymentInfo && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => { setStep('view'); setError(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Secure Payment</h4>
                <p className="text-sm text-gray-500">{listing?.title}</p>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Session price</span><span>€{paymentInfo.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform fee (10%)</span><span>€{paymentInfo.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
                <span>Total held</span><span>€{paymentInfo.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 pt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Amount is held securely until the session is completed.
              </p>
            </div>

            {/* Card form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="FULL NAME"
                  value={cardName}
                  onChange={e => setCardName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm uppercase tracking-wider"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CVV</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder="•••"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <button
              onClick={handlePayAndOrder}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
                : <><Lock className="w-4 h-4" />Pay & Hold €{paymentInfo.total.toFixed(2)}</>}
            </button>
            <p className="text-center text-xs text-gray-400">
              Your payment will be held until the session is completed.
            </p>
          </div>
        )}

        {/* ── Teach offer step (for request listings) ── */}
        {step === 'teachOffer' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setStep('view'); setError(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Offer to Teach</h4>
                <p className="text-sm text-gray-500">to <strong>{listing.userName}</strong></p>
              </div>
            </div>

            {/* Tab selector */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => { setTeachMode('price'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  teachMode === 'price' ? 'bg-white text-purple-700 shadow' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-1" />
                Propose a Price
              </button>
              <button
                onClick={() => { setTeachMode('swap'); setError(''); loadSkillsIfNeeded(); loadOwnerSkillsIfNeeded(); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  teachMode === 'swap' ? 'bg-white text-purple-700 shadow' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <RefreshCw className="w-4 h-4 inline mr-1" />
                Offer a Swap
              </button>
            </div>

            {/* Price mode */}
            {teachMode === 'price' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Your rate per session (€) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="π.χ. 30"
                      value={proposedPrice}
                      onChange={e => setProposedPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Message (προαιρετικό)
                  </label>
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder={`Hi ${listing.userName.split(' ')[0]}, I can help you learn "${listing.title}"…`}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right mt-0.5">{messageText.length}/500</p>
                </div>
              </div>
            )}

            {/* Swap mode */}
            {teachMode === 'swap' && (
              <div className="space-y-4">
                {/* My skill — what I'll teach */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Skill που προσφέρεις (θα διδάξεις)
                  </p>
                  {loadingSkills ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    </div>
                  ) : mySkills.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>Δεν έχεις skills στο προφίλ σου.</p>
                      <p className="mt-0.5">Πρόσθεσε skills από τη σελίδα Προφίλ.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {mySkills.map(skill => (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedSkillId(skill.id)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all text-left ${
                            selectedSkillId === skill.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{skill.name}</p>
                            <p className="text-xs text-gray-500">{skill.level} · {skill.yearsOfExperience} yr{skill.yearsOfExperience !== 1 ? 's' : ''}</p>
                          </div>
                          {selectedSkillId === skill.id && <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Owner's skill — what I want in return */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Skill που θέλεις ως αντάλλαγμα (από τον/την {listing.userName})
                  </p>
                  {loadingOwnerSkills ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    </div>
                  ) : ownerSkills.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>Ο/Η {listing.userName} δεν έχει skills στο προφίλ του/της.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {ownerSkills.map(skill => (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedOwnerSkillId(skill.id)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all text-left ${
                            selectedOwnerSkillId === skill.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{skill.name}</p>
                            <p className="text-xs text-gray-500">{skill.level} · {skill.yearsOfExperience} yr{skill.yearsOfExperience !== 1 ? 's' : ''}</p>
                          </div>
                          {selectedOwnerSkillId === skill.id && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setStep('view'); setError(''); }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Πίσω
              </button>
              {teachMode === 'price' ? (
                <button
                  onClick={handleTeachPriceOffer}
                  disabled={submitting || !proposedPrice}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Αποστολή…</> : <><Send className="w-4 h-4" />Αποστολή Πρότασης</>}
                </button>
              ) : (
                <button
                  onClick={handleSwap}
                  disabled={!selectedSkillId || (listing.type === 'request' && !selectedOwnerSkillId) || submitting || mySkills.length === 0}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Αποστολή…</> : <><RefreshCw className="w-4 h-4" />Πρόταση Ανταλλαγής</>}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Success state ── */}
        {step === 'success' && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {successType === 'teachPrice' ? 'Πρόταση Εστάλη!'
                : successType === 'teachSwap' ? 'Πρόταση Ανταλλαγής Εστάλη!'
                : successType === 'purchase' ? 'Request Sent!'
                : 'Swap Request Sent!'}
            </h3>
            <p className="text-gray-600 max-w-sm">
              {successType === 'teachPrice'
                ? `Η πρόταση διδασκαλίας στάλθηκε στον/στην ${listing.userName}. Θα λάβεις ειδοποίηση όταν απαντήσει.`
                : successType === 'teachSwap'
                ? `Η πρόταση ανταλλαγής στάλθηκε στον/στην ${listing.userName}. Θα λάβεις ειδοποίηση όταν απαντήσει.`
                : successType === 'purchase'
                ? `Your purchase request has been forwarded to ${listing.userName}. They will respond shortly.`
                : `Your swap request has been forwarded to ${listing.userName}. They will review your offer and respond.`}
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        )}

        {/* ── Swap skill picker ── */}
        {step === 'swapPicker' && (
          <div className="p-6 space-y-5">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">Choose a skill to offer</h4>
              <p className="text-sm text-gray-500">
                Select one of your skills to swap with <strong>{listing.userName}</strong>'s "{listing.title}"
              </p>
            </div>

            {loadingSkills ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : mySkills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You don't have any skills in your profile yet.</p>
                <p className="text-sm mt-1">Add skills in your Profile page first.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mySkills.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkillId(skill.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      selectedSkillId === skill.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{skill.name}</p>
                      <p className="text-xs text-gray-500">{skill.level} · {skill.yearsOfExperience} yr{skill.yearsOfExperience !== 1 ? 's' : ''}</p>
                    </div>
                    {selectedSkillId === skill.id && (
                      <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setStep('view'); setError(''); }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSwap}
                disabled={!selectedSkillId || submitting || mySkills.length === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : <><RefreshCw className="w-4 h-4" />Send Swap Request</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Main view ── */}
        {step === 'view' && (
          <div className="p-6 space-y-6">
            {/* User info */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
              <img
                src={listing.userAvatar}
                alt={listing.userName}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-200"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.userName)}&background=7c3aed&color=fff`; }}
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{listing.userName}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-700">{(listing.userRating ?? 0).toFixed(1)}</span>
                  <span className="text-sm text-gray-500">rating</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-lg">Description</h4>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Pricing — only for offer listings */}
            {listing.type === 'offer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.price && (
                  <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-gray-900">Price per Session</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${listing.price}</p>
                  </div>
                )}
                {listing.swapAvailable && (
                  <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <RefreshCw className="w-5 h-5 text-purple-600" />
                      <span className="font-bold text-gray-900">Swap Available</span>
                    </div>
                    <p className="text-sm text-gray-600">Exchange skills instead of payment</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t-2 border-purple-100">
              {isOwnListing ? (
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <p className="text-yellow-800 font-medium text-sm">Αυτή είναι η δική σου αγγελία.</p>
                  </div>
                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="w-full py-3 rounded-xl border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Διαγραφή Αγγελίας
                    </button>
                  ) : (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl space-y-3">
                      <p className="text-red-800 font-semibold text-sm">Είσαι σίγουρος/η; Η αγγελία θα διαγραφεί οριστικά.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(false)}
                          className="flex-1 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 text-sm"
                        >
                          Ακύρωση
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                        >
                          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Διαγραφή
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : listing.type === 'request' ? (
                /* ── Request listing: viewer proposes price or swap ── */
                <>
                  <h4 className="font-bold text-gray-900 text-lg">Can you help?</h4>
                  <p className="text-sm text-gray-500">
                    Ο/Η {listing.userName} αναζητά κάποιον να τον/τη διδάξει αυτό το skill. Πρότεινε τιμή ή ανταλλαγή.
                  </p>
                  <button
                    onClick={() => setStep('teachOffer')}
                    className="w-full p-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-transform shadow-lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ChevronRight className="w-5 h-5" />
                      <span className="font-semibold">Offer to Teach</span>
                    </div>
                  </button>
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                </>
              ) : (
                /* ── Offer listing: purchase / swap / message ── */
                <>
                  <h4 className="font-bold text-gray-900 text-lg">How would you like to proceed?</h4>

                  <div className="space-y-3">
                    {listing.price && (
                      <button
                        onClick={openPayment}
                        disabled={checkingAvailability}
                        className="w-full p-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-transform shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 rounded-lg">
                              <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <h5 className="font-bold text-lg">Purchase Session</h5>
                              <p className="text-sm text-white/90">Pay ${listing.price} per session</p>
                            </div>
                          </div>
                          <div className="p-2 bg-white/20 rounded-lg group-hover:translate-x-1 transition-transform">
                            {checkingAvailability ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                          </div>
                        </div>
                      </button>
                    )}

                    {listing.swapAvailable && (
                      <button
                        onClick={openSwapPicker}
                        className="w-full p-5 bg-white border-2 border-purple-300 text-purple-600 rounded-xl hover:scale-105 transition-transform shadow-lg group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                              <RefreshCw className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <h5 className="font-bold text-lg">Skill Swap</h5>
                              <p className="text-sm text-purple-600/80">Exchange your skill for theirs</p>
                            </div>
                          </div>
                          <div className="p-2 bg-purple-100 rounded-lg group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => setStep('messageComposer')}
                      className="w-full p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 text-purple-700 rounded-xl hover:border-purple-400 transition-all"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-semibold">Send Message</span>
                      </div>
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {!listing.price && !listing.swapAvailable && (
                    <div className="text-center p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                      <p className="text-yellow-800">
                        This listing doesn't have pricing or swap options yet. Please contact the user directly.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
