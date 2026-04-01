import { X, DollarSign, RefreshCw, Star, Calendar, MessageCircle } from 'lucide-react';
import { SkillListing } from '../types';

interface ViewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: SkillListing | null;
}

export function ViewListingModal({ isOpen, onClose, listing }: ViewListingModalProps) {
  if (!isOpen || !listing) return null;

  const handleBuy = () => {
    // Here you would handle the purchase flow
    console.log('Buy clicked for listing:', listing.id);
    alert('Purchase request sent! The instructor will contact you soon.');
    onClose();
  };

  const handleSwap = () => {
    // Here you would handle the swap flow
    console.log('Swap clicked for listing:', listing.id);
    alert('Swap request sent! Please wait for the other user to respond.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    listing.type === 'offer'
                      ? 'bg-green-500/20 text-green-100'
                      : 'bg-blue-500/20 text-blue-100'
                  }`}
                >
                  {listing.type === 'offer' ? 'Offering' : 'Requesting'}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {listing.title}
              </h2>
              <p className="text-white/90 text-sm">
                {listing.category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
            <img
              src={listing.userAvatar}
              alt={listing.userName}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-200"
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

          {/* Pricing Info */}
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

          {/* Action Section */}
          <div className="space-y-4 pt-4 border-t-2 border-purple-100">
            <h4 className="font-bold text-gray-900 text-lg">How would you like to proceed?</h4>

            <div className="space-y-3">
              {/* Buy Option */}
              {listing.price && (
                <button
                  onClick={handleBuy}
                  className="w-full p-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-transform shadow-lg group"
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
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              )}

              {/* Swap Option */}
              {listing.swapAvailable && (
                <button
                  onClick={handleSwap}
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
                      <RefreshCw className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              )}

              {/* Message Option */}
              <button
                onClick={() => {
                  alert('Opening message window...');
                  onClose();
                }}
                className="w-full p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 text-purple-700 rounded-xl hover:border-purple-400 transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">Send Message</span>
                </div>
              </button>
            </div>

            {!listing.price && !listing.swapAvailable && (
              <div className="text-center p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <p className="text-yellow-800">
                  This listing doesn't have pricing or swap options yet. Please contact the user directly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
