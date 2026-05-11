import { useState } from 'react';
import { Star, ArrowRight, DollarSign, RefreshCw } from 'lucide-react';
import { SkillListing } from '../types';
import { ViewListingModal } from './ViewListingModal';

interface SkillCardProps {
  listing: SkillListing;
}

export function SkillCard({ listing }: SkillCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ViewListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listing={listing}
      />
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={listing.userAvatar}
              alt={listing.userName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{listing.userName}</h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">{listing.userRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              listing.type === 'offer'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {listing.type === 'offer' ? 'Offering' : 'Requesting'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{listing.description}</p>

        {/* Category */}
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
          {listing.category}
        </span>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {listing.price && (
              <div className="flex items-center space-x-1 text-gray-900">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold">{listing.price}</span>
                <span className="text-sm text-gray-600">/session</span>
              </div>
            )}
            {listing.swapAvailable && (
              <div className="flex items-center space-x-1 text-purple-600">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Swap Available</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-semibold group-hover:translate-x-1 transition-transform"
          >
            <span className="text-sm">View</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
