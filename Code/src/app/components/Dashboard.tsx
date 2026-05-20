import { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, Users, BookOpen, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { SkillCard } from './SkillCard';
import { CreateListingModal } from './CreateListingModal';

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'offer' | 'request'>('offer');
  const [listings, setListings] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState({ activeSkills: 0, activeUsers: 0, completedSessions: 0, avgRating: 0 });

  useEffect(() => {
    fetch('/api/listings', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setListings(Array.isArray(data) ? data : []));
    fetch('/api/stats', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setPlatformStats(data); });
  }, []);

  const filteredListings = listings.filter((listing) =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { icon: BookOpen,   label: 'Active Skills',        value: platformStats.activeSkills.toString(),       color: 'from-blue-500 to-blue-600' },
    { icon: Users,      label: 'Active Users',          value: platformStats.activeUsers.toString(),        color: 'from-purple-500 to-purple-600' },
    { icon: TrendingUp, label: 'Completed Sessions',    value: platformStats.completedSessions.toString(),  color: 'from-pink-500 to-pink-600' },
    { icon: Star,       label: 'Avg Rating',            value: platformStats.avgRating.toFixed(1),          color: 'from-yellow-500 to-orange-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Learn. Teach. Grow Together.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Share your skills or learn from experts. Join our community of passionate learners and teachers.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for skills, categories, or instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-lg bg-white/80 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Skills Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Recent Skills</h2>
          <Link
            to="/marketplace"
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-2xl">
            <p className="text-gray-500 text-lg">
              {listings.length === 0 ? 'Loading skills...' : 'No skills found matching your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.slice(0, 6).map((listing) => (
              <SkillCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-xl mb-6 opacity-90">
          Join thousands of learners and teachers sharing knowledge every day.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/marketplace"
            className="px-8 py-3 bg-white text-purple-600 rounded-xl hover:scale-105 transition-transform font-semibold"
          >
            Explore Skills
          </Link>
          <Link
            to="/profile"
            className="px-8 py-3 bg-purple-700 text-white rounded-xl hover:scale-105 transition-transform font-semibold border-2 border-white/30"
          >
            My Profile
          </Link>
        </div>
      </div>

      <CreateListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
      />
    </div>
  );
}
