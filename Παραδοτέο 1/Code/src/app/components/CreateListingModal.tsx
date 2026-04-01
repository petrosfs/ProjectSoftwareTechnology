import { X, Plus, DollarSign, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { categories } from '../mockData';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'offer' | 'request';
}

export function CreateListingModal({ isOpen, onClose, type }: CreateListingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    price: '',
    swapAvailable: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the actual submission
    console.log('Listing created:', { ...formData, type });
    
    // Show success message (you could use toast here)
    alert(`${type === 'offer' ? 'Skill Offer' : 'Skill Request'} created successfully!`);
    
    // Reset form and close modal
    setFormData({
      title: '',
      description: '',
      category: 'Programming',
      price: '',
      swapAvailable: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {type === 'offer' ? 'Post Your Skill' : 'Request a Skill'}
              </h2>
              <p className="text-white/90">
                {type === 'offer' 
                  ? 'Share your expertise with others and start earning or swapping skills'
                  : 'Find the perfect teacher for the skill you want to learn'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-900">
              {type === 'offer' ? 'Skill Title' : 'What do you want to learn?'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={type === 'offer' 
                ? 'e.g., Advanced React & TypeScript Development'
                : 'e.g., Looking for Piano Instructor'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-900">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder={type === 'offer'
                ? 'Describe your skill, what you will teach, your experience, etc.'
                : 'Describe what you want to learn, your current level, your goals, etc.'}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-900">
              Category
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white"
            >
              {categories.filter(cat => cat !== 'All').map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price and Swap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <label className="block font-semibold text-gray-900 flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Price per Session (optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500">Leave empty if offering for free</p>
            </div>

            {/* Swap Available */}
            <div className="space-y-2">
              <label className="block font-semibold text-gray-900 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Skill Swap</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer bg-purple-50 px-4 py-3 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-colors h-[52px]">
                <input
                  type="checkbox"
                  checked={formData.swapAvailable}
                  onChange={(e) => setFormData({ ...formData, swapAvailable: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-400"
                />
                <span className="text-gray-700">
                  {type === 'offer' 
                    ? 'Open to skill swaps'
                    : 'Can offer skill swap'}
                </span>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-100 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Tip:</span>{' '}
              {type === 'offer'
                ? 'Be specific about what you can teach and your experience level. Clear descriptions attract more students!'
                : 'Be clear about your learning goals and current level. This helps teachers prepare the best lessons for you!'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-transform font-semibold shadow-lg flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{type === 'offer' ? 'Post Skill' : 'Post Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
