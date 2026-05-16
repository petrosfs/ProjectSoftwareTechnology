import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MessageSquare, User } from 'lucide-react';

interface Session {
  id: string;
  skillTitle: string;
  otherUser: string;
  otherUserAvatar: string;
  date: string;
  time: string;
  status: string;
  type: 'teaching' | 'learning';
}

export function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch('/api/sessions/mine', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setSessions(Array.isArray(data) ? data : []));
  }, []);

  const upcoming  = sessions.filter((s) => s.status === 'upcoming');
  const completed = sessions.filter((s) => s.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Sessions
        </h1>
        <p className="text-lg text-gray-600">
          Manage your teaching and learning sessions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{upcoming.length}</div>
          <div className="text-blue-100">Upcoming Sessions</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <User className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{upcoming.filter((s) => s.type === 'teaching').length}</div>
          <div className="text-purple-100">Teaching Sessions</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <User className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{upcoming.filter((s) => s.type === 'learning').length}</div>
          <div className="text-pink-100">Learning Sessions</div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-transform font-semibold">
            Schedule New
          </button>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No upcoming sessions</p>
            <p className="text-gray-400 mt-2">Book a session to start learning or teaching!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((session) => (
              <div
                key={session.id}
                className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center space-x-4 flex-1">
                    <img
                      src={session.otherUserAvatar}
                      alt={session.otherUser}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-200"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{session.skillTitle}</h3>
                      <p className="text-gray-600 mb-2">with {session.otherUser}</p>
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                        session.type === 'teaching'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {session.type === 'teaching' ? 'Teaching' : 'Learning'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 md:min-w-[200px]">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">{session.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">{session.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Video className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Online</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform font-semibold whitespace-nowrap">
                      <Video className="w-4 h-4" />
                      <span>Join</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors font-semibold whitespace-nowrap">
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Sessions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Sessions</h2>

        {completed.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No past sessions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <img
                      src={session.otherUserAvatar}
                      alt={session.otherUser}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-200"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{session.skillTitle}</h3>
                      <p className="text-sm text-gray-600">with {session.otherUser}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{session.date}</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      session.type === 'teaching'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {session.type === 'teaching' ? 'Taught' : 'Learned'}
                    </span>
                  </div>

                  <button className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-sm font-semibold whitespace-nowrap">
                    Leave Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
