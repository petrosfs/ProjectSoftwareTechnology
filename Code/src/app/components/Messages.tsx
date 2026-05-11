import { Search, Send, MoreVertical, Star } from 'lucide-react';
import { useState } from 'react';

const conversations = [
  {
    id: '1',
    user: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzczODM2NjU3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    lastMessage: 'Great! Looking forward to our session tomorrow.',
    time: '10 min ago',
    unread: 2,
    rating: 4.9,
  },
  {
    id: '2',
    user: 'Michael Torres',
    avatar: 'https://images.unsplash.com/photo-1605298046196-e205d0d699d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MXx8fHwxNzczOTMyNjIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    lastMessage: 'Thanks for the guitar lesson! Can we schedule another one?',
    time: '1 hour ago',
    unread: 0,
    rating: 4.7,
  },
  {
    id: '3',
    user: 'Emma Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1687575635557-a3f3ed535b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGNyZWF0aXZlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3Mzg0MDg4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    lastMessage: 'I have some questions about Python classes',
    time: '2 hours ago',
    unread: 1,
    rating: 4.6,
  },
  {
    id: '4',
    user: 'James Kim',
    avatar: 'https://images.unsplash.com/photo-1738566061688-47e66a008254?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHByb2Zlc3Npb25hbCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MzkzMzMzMHww&ixlib=rb-4.1.0&q=80&w=1080',
    lastMessage: 'The photography tips were super helpful!',
    time: '1 day ago',
    unread: 0,
    rating: 5.0,
  },
];

const messages = [
  {
    id: '1',
    sender: 'Sarah Chen',
    text: 'Hi Alex! I\'m really excited about learning React from you.',
    time: '2:30 PM',
    isMe: false,
  },
  {
    id: '2',
    sender: 'Me',
    text: 'Hi Sarah! I\'m excited too. I\'ve prepared a great curriculum for you.',
    time: '2:32 PM',
    isMe: true,
  },
  {
    id: '3',
    sender: 'Sarah Chen',
    text: 'That sounds perfect! What should I prepare for our first session?',
    time: '2:35 PM',
    isMe: false,
  },
  {
    id: '4',
    sender: 'Me',
    text: 'Just make sure you have Node.js installed and a code editor ready. We\'ll start with the basics.',
    time: '2:40 PM',
    isMe: true,
  },
  {
    id: '5',
    sender: 'Sarah Chen',
    text: 'Great! Looking forward to our session tomorrow.',
    time: '2:42 PM',
    isMe: false,
  },
];

export function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-lg text-gray-600">
          Connect with your learning partners
        </p>
      </div>

      {/* Messages Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 overflow-hidden h-[600px] flex">
        {/* Conversations List */}
        <div className="w-full md:w-1/3 border-r border-purple-100 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-purple-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 flex items-start space-x-3 hover:bg-purple-50 transition-colors border-b border-purple-50 ${
                  selectedConversation.id === conv.id ? 'bg-purple-50' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={conv.avatar}
                    alt={conv.user}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
                  />
                  {conv.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {conv.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conv.user}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">{conv.rating}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex md:flex-col flex-1">
          {/* Chat Header */}
          <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center space-x-3">
              <img
                src={selectedConversation.avatar}
                alt={selectedConversation.user}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.user}
                </h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">
                    {selectedConversation.rating}
                  </span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.isMe
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.isMe ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-purple-100 bg-white">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && messageText.trim()) {
                    setMessageText('');
                  }
                }}
              />
              <button className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-transform">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
