import { useState, useEffect, useRef } from 'react';
import { X, DollarSign, RefreshCw, Star, Calendar, MessageCircle, Check, Loader2, AlertCircle, ChevronRight, Send, ArrowLeft } from 'lucide-react';
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
}

type Step = 'view' | 'swapPicker' | 'messageComposer' | 'success';

export function ViewListingModal({ isOpen, onClose, listing }: ViewListingModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<Step>('view');
  const [successType, setSuccessType] = useState<'purchase' | 'swap' | null>(null);
  const [mySkills, setMySkills] = useState<UserSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [messageText, setMessageText] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('view');
      setSuccessType(null);
      setSelectedSkillId('');
      setError('');
      setMessageText('');
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

  const handlePurchase = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ listingId: listing.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send request');
        return;
      }
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

  const handleSwap = async () => {
    if (!selectedSkillId) { setError('Please select a skill to offer'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          responderId: listing.userId,
          offeredSkillId: selectedSkillId,
          targetSkillId: listing.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send swap request');
        return;
      }
      setSuccessType('swap');
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
                placeholder={`Hi ${listing.userName.split(' ')[0]}, I'm interested in your "${listing.title}" listing…`}
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

        {/* ── Success state ── */}
        {step === 'success' && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {successType === 'purchase' ? 'Request Sent!' : 'Swap Request Sent!'}
            </h3>
            <p className="text-gray-600 max-w-sm">
              {successType === 'purchase'
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
                  <span className="font-semibold text-gray-700">{listing.userRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">rating</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-lg">Description</h4>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Pricing */}
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

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t-2 border-purple-100">
              {isOwnListing ? (
                <div className="text-center p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-yellow-800 font-medium">This is your own listing.</p>
                </div>
              ) : (
                <>
                  <h4 className="font-bold text-gray-900 text-lg">How would you like to proceed?</h4>

                  <div className="space-y-3">
                    {listing.price && (
                      <button
                        onClick={handlePurchase}
                        disabled={submitting}
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
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
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
