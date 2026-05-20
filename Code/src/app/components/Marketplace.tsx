import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, DollarSign, Star, RefreshCw, Plus } from 'lucide-react';
import { categories } from '../mockData';
import { SkillCard } from './SkillCard';
import { CreateListingModal } from './CreateListingModal';

export function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'offer' | 'request'>('all');
  const [swapFilter, setSwapFilter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'offer' | 'request'>('offer');
  const [listings, setListings] = useState<import('../types').SkillListing[]>([]);

  useEffect(() => {
    fetch('/api/listings', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setListings(Array.isArray(data) ? data : []));
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.userName ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;

    const matchesPrice =
      priceFilter === 'all' ||
      (priceFilter === 'free' && !listing.price) ||
      (priceFilter === 'paid' && listing.price);

    const matchesType = typeFilter === 'all' || listing.type === typeFilter;
    const matchesSwap = !swapFilter || listing.swapAvailable;

    return matchesSearch && matchesCategory && matchesPrice && matchesType && matchesSwap;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Skill Marketplace
        </h1>
        <p className="text-lg text-gray-600">
          Discover skills, connect with experts, and start learning today
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 space-y-4">
        {/* Search */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search skills, categories, or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl border-2 transition-all ${
              showFilters
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-purple-600 border-purple-200 hover:border-purple-400'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden md:inline">Filters</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-purple-100">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Price</span>
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white"
              >
                <option value="all">All Prices</option>
                <option value="free">Free/Swap Only</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Type</span>
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="offer">Skills Offered</option>
                <option value="request">Skills Requested</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Swap Available</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer bg-white px-4 py-2 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-colors">
                <input
                  type="checkbox"
                  checked={swapFilter}
                  onChange={(e) => setSwapFilter(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-400"
                />
                <span className="text-gray-700">Only show swap available</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-bold text-purple-600">{filteredListings.length}</span> skills found
        </p>
        <select className="px-4 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white/80 backdrop-blur-sm text-sm">
          <option>Most Recent</option>
          <option>Highest Rated</option>
          <option>Lowest Price</option>
          <option>Highest Price</option>
        </select>
      </div>

      {/* Skills Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-16 bg-white/50 rounded-2xl">
          <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-xl">
            {listings.length === 0 ? 'Loading skills...' : 'No skills found matching your criteria.'}
          </p>
          {listings.length > 0 && (
            <p className="text-gray-400 mt-2">Try adjusting your filters or search query.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <SkillCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <button
          onClick={() => { setModalType('offer'); setIsModalOpen(true); }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-transform shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Post Skill</span>
        </button>
        <button
          onClick={() => { setModalType('request'); setIsModalOpen(true); }}
          className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:scale-105 transition-transform border-2 border-purple-300 shadow-lg"
        >
          <Search className="w-5 h-5" />
          <span>Request Skill</span>
        </button>
      </div>

      <CreateListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        onSuccess={(listing) => listing && setListings((prev) => [listing, ...prev])}
      />
    </div>
  );
}
