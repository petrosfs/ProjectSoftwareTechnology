import { Star, Edit, Calendar, Award, BookOpen, Clock, MessageSquare, Mail } from 'lucide-react';
import { currentUser, upcomingSessions, userReviews } from '../mockData';

export function Profile() {
  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white/30 shadow-2xl"
            />

            {/* User Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{currentUser.name}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">{currentUser.rating.toFixed(1)}</span>
                      <span className="text-white/80">({currentUser.reviewsCount} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-5 h-5" />
                      <span>{currentUser.skills.length} Skills</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:scale-105 transition-transform font-semibold shadow-lg">
                    <Edit className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>

              <p className="text-lg text-white/90">{currentUser.bio}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{currentUser.skills.length}</div>
              <div className="text-sm text-white/80">Skills</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{upcomingSessions.length}</div>
              <div className="text-sm text-white/80">Upcoming Sessions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{currentUser.reviewsCount}</div>
              <div className="text-sm text-white/80">Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Skills */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Skills</h2>
              <button className="text-purple-600 hover:text-purple-700 font-semibold">
                + Add Skill
              </button>
            </div>

            <div className="space-y-4">
              {currentUser.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{skill.name}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          skill.level === 'Expert'
                            ? 'bg-green-100 text-green-700'
                            : skill.level === 'Intermediate'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill.level}
                      </span>
                      <span className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{skill.yearsOfExperience}+ years</span>
                      </span>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 p-2">
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>

            <div className="space-y-4">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl border border-purple-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={review.fromUserAvatar}
                        alt={review.fromUser}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{review.fromUser}</p>
                        <p className="text-sm text-gray-600">{review.skillTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sessions & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Schedule Session</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-semibold">View Messages</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                <Award className="w-5 h-5" />
                <span className="font-semibold">Achievements</span>
              </button>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>

            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={session.otherUserAvatar}
                      alt={session.otherUser}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {session.skillTitle}
                      </p>
                      <p className="text-sm text-gray-600">{session.otherUser}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-purple-600">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-block mt-3 px-3 py-1 rounded-lg text-xs font-medium ${
                      session.type === 'teaching'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {session.type === 'teaching' ? 'Teaching' : 'Learning'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <Mail className="w-5 h-5 text-purple-600" />
                <span>alex.johnson@email.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>Available for messages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
