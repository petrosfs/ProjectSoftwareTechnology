import bcrypt from 'bcryptjs';
import { getDb } from './database.js';

const SEED_USERS = [
  { id: 'user-1', name: 'Alice Costa',           email: 'alice@skillus.com',    password: 'alice123',    avatar: 'https://i.pravatar.cc/150?img=1',  bio: 'Web developer & musician' },
  { id: 'user-2', name: 'Bob Marin',              email: 'bob@skillus.com',      password: 'bob123',      avatar: 'https://i.pravatar.cc/150?img=3',  bio: 'Data scientist & cook' },
  { id: 'user-3', name: 'Carla Santos',           email: 'carla@skillus.com',    password: 'carla123',    avatar: 'https://i.pravatar.cc/150?img=5',  bio: 'Photographer & yoga teacher' },
  { id: 'user-4', name: 'Dimitris Papadopoulos',  email: 'dimitris@skillus.com', password: 'dimitris123', avatar: 'https://i.pravatar.cc/150?img=7',  bio: 'Software engineer & chess player' },
  { id: 'user-5', name: 'Elena Vasileiou',        email: 'elena@skillus.com',    password: 'elena123',    avatar: 'https://i.pravatar.cc/150?img=9',  bio: 'Marketing expert & painter' },
  { id: 'user-6', name: 'Fanis Georgiadis',       email: 'fanis@skillus.com',    password: 'fanis123',    avatar: 'https://i.pravatar.cc/150?img=11', bio: 'Guitar player & English teacher' },
];

const SEED_SKILLS = [
  { id: 'sk-u1-1', user_id: 'user-1', name: 'Web Development',   level: 'Expert',       years: 5 },
  { id: 'sk-u1-2', user_id: 'user-1', name: 'JavaScript',        level: 'Expert',       years: 4 },
  { id: 'sk-u1-3', user_id: 'user-1', name: 'Music Theory',      level: 'Intermediate', years: 3 },
  { id: 'sk-u1-4', user_id: 'user-1', name: 'Guitar',            level: 'Beginner',     years: 1 },

  { id: 'sk-u2-1', user_id: 'user-2', name: 'Python',            level: 'Expert',       years: 6 },
  { id: 'sk-u2-2', user_id: 'user-2', name: 'Machine Learning',  level: 'Expert',       years: 4 },
  { id: 'sk-u2-3', user_id: 'user-2', name: 'Data Analysis',     level: 'Expert',       years: 5 },
  { id: 'sk-u2-4', user_id: 'user-2', name: 'Cooking',           level: 'Intermediate', years: 3 },

  { id: 'sk-u3-1', user_id: 'user-3', name: 'Photography',       level: 'Expert',       years: 7 },
  { id: 'sk-u3-2', user_id: 'user-3', name: 'Photo Editing',     level: 'Expert',       years: 6 },
  { id: 'sk-u3-3', user_id: 'user-3', name: 'Yoga',              level: 'Expert',       years: 5 },
  { id: 'sk-u3-4', user_id: 'user-3', name: 'Meditation',        level: 'Intermediate', years: 3 },

  { id: 'sk-u4-1', user_id: 'user-4', name: 'Java',              level: 'Expert',       years: 8 },
  { id: 'sk-u4-2', user_id: 'user-4', name: 'System Design',     level: 'Expert',       years: 5 },
  { id: 'sk-u4-3', user_id: 'user-4', name: 'Chess',             level: 'Expert',       years: 10 },
  { id: 'sk-u4-4', user_id: 'user-4', name: 'C++',               level: 'Intermediate', years: 3 },

  { id: 'sk-u5-1', user_id: 'user-5', name: 'Digital Marketing', level: 'Expert',       years: 6 },
  { id: 'sk-u5-2', user_id: 'user-5', name: 'SEO',               level: 'Expert',       years: 5 },
  { id: 'sk-u5-3', user_id: 'user-5', name: 'Painting',          level: 'Intermediate', years: 4 },
  { id: 'sk-u5-4', user_id: 'user-5', name: 'Graphic Design',    level: 'Intermediate', years: 3 },

  { id: 'sk-u6-1', user_id: 'user-6', name: 'Guitar',            level: 'Expert',       years: 8 },
  { id: 'sk-u6-2', user_id: 'user-6', name: 'Music Production',  level: 'Intermediate', years: 3 },
  { id: 'sk-u6-3', user_id: 'user-6', name: 'English Teaching',  level: 'Expert',       years: 5 },
  { id: 'sk-u6-4', user_id: 'user-6', name: 'Piano',             level: 'Beginner',     years: 1 },
];

const SEED_LISTINGS = [
  { id: 'list-1',  user_id: 'user-1', title: 'Web Development for Beginners',       description: 'Learn HTML, CSS, JavaScript and React from scratch. Build real projects from day one.', category: 'Programming',     price: 40,   swap: 1, type: 'offer',   created: '2026-04-20' },
  { id: 'list-2',  user_id: 'user-2', title: 'Python & Data Science Fundamentals',  description: 'Master Python programming, pandas, NumPy and introductory machine learning with hands-on projects.', category: 'Programming', price: 45, swap: 0, type: 'offer', created: '2026-04-22' },
  { id: 'list-3',  user_id: 'user-3', title: 'Photography Masterclass',             description: 'Master DSLR photography, composition, lighting and Adobe Lightroom editing. All skill levels welcome.', category: 'Creative',  price: 50, swap: 0, type: 'offer', created: '2026-04-25' },
  { id: 'list-4',  user_id: 'user-3', title: 'Yoga & Meditation Classes',           description: 'Hatha yoga, breathwork and mindfulness meditation for all levels. Reduce stress and improve flexibility.', category: 'Health & Fitness', price: 25, swap: 1, type: 'offer', created: '2026-04-28' },
  { id: 'list-5',  user_id: 'user-4', title: 'Java Development Course',             description: 'From Java basics to advanced OOP, design patterns and Spring Boot. Perfect for aspiring backend developers.', category: 'Programming', price: 40, swap: 1, type: 'offer', created: '2026-05-01' },
  { id: 'list-6',  user_id: 'user-4', title: 'Chess Strategy for All Levels',       description: 'Opening theory, middlegame tactics and endgame techniques. From beginner to club player.', category: 'Creative', price: 20, swap: 1, type: 'offer', created: '2026-05-03' },
  { id: 'list-7',  user_id: 'user-5', title: 'Digital Marketing & SEO Strategy',   description: 'Social media marketing, Google Ads, SEO optimization and content strategy. Grow your online presence.', category: 'Business', price: 35, swap: 1, type: 'offer', created: '2026-05-05' },
  { id: 'list-8',  user_id: 'user-6', title: 'Guitar Lessons – All Levels',        description: 'Acoustic and electric guitar from beginner chords to advanced techniques. 8 years of teaching experience.', category: 'Music', price: 30, swap: 1, type: 'offer', created: '2026-05-08' },
  { id: 'list-9',  user_id: 'user-6', title: 'English Language Teaching',           description: 'Conversational English, grammar and business English. Native-level proficiency and certified teacher.', category: 'Languages', price: 25, swap: 0, type: 'offer', created: '2026-05-10' },
  { id: 'list-10', user_id: 'user-5', title: 'Looking for Guitar Teacher',          description: 'Complete beginner wanting to learn acoustic guitar. Can offer digital marketing or SEO lessons in exchange.', category: 'Music', price: null, swap: 1, type: 'request', created: '2026-05-12' },
  { id: 'list-11', user_id: 'user-2', title: 'Looking for Yoga or Pilates Teacher', description: 'Interested in learning yoga or pilates. Happy to swap with Python, data science or cooking lessons.', category: 'Health & Fitness', price: null, swap: 1, type: 'request', created: '2026-05-14' },
];

const SEED_SESSIONS = [
  { id: 'sess-c1', listing_id: 'list-8', teacher_id: 'user-6', learner_id: 'user-1', skill_title: 'Guitar for Beginners',          scheduled_at: '2026-05-01T14:00:00', status: 'completed' },
  { id: 'sess-c2', listing_id: 'list-2', teacher_id: 'user-2', learner_id: 'user-5', skill_title: 'Python Basics',                  scheduled_at: '2026-05-03T10:00:00', status: 'completed' },
  { id: 'sess-c3', listing_id: 'list-4', teacher_id: 'user-3', learner_id: 'user-4', skill_title: 'Yoga Introduction',              scheduled_at: '2026-05-05T09:00:00', status: 'completed' },
  { id: 'sess-c4', listing_id: 'list-7', teacher_id: 'user-5', learner_id: 'user-3', skill_title: 'Digital Marketing Fundamentals', scheduled_at: '2026-05-07T11:00:00', status: 'completed' },
  { id: 'sess-c5', listing_id: 'list-1', teacher_id: 'user-1', learner_id: 'user-2', skill_title: 'Web Development Basics',         scheduled_at: '2026-05-09T16:00:00', status: 'completed' },
  { id: 'sess-c6', listing_id: 'list-6', teacher_id: 'user-4', learner_id: 'user-6', skill_title: 'Chess Opening Strategy',         scheduled_at: '2026-05-11T17:00:00', status: 'completed' },
  { id: 'sess-u1', listing_id: 'list-1', teacher_id: 'user-1', learner_id: 'user-3', skill_title: 'Web Development Fundamentals',   scheduled_at: '2026-05-22T10:00:00', status: 'upcoming' },
  { id: 'sess-u2', listing_id: 'list-2', teacher_id: 'user-2', learner_id: 'user-6', skill_title: 'Python for Beginners',           scheduled_at: '2026-05-21T11:00:00', status: 'upcoming' },
  { id: 'sess-u3', listing_id: 'list-3', teacher_id: 'user-3', learner_id: 'user-2', skill_title: 'Portrait Photography',           scheduled_at: '2026-05-23T15:00:00', status: 'upcoming' },
  { id: 'sess-u4', listing_id: 'list-6', teacher_id: 'user-4', learner_id: 'user-5', skill_title: 'Chess Opening Strategies',       scheduled_at: '2026-05-24T17:00:00', status: 'upcoming' },
  { id: 'sess-u5', listing_id: 'list-7', teacher_id: 'user-5', learner_id: 'user-4', skill_title: 'SEO Strategy Basics',            scheduled_at: '2026-05-21T10:00:00', status: 'upcoming' },
  { id: 'sess-u6', listing_id: 'list-8', teacher_id: 'user-6', learner_id: 'user-1', skill_title: 'Guitar Intermediate Techniques', scheduled_at: '2026-05-20T16:00:00', status: 'upcoming' },
];

// 8 conversations linking the 6 users via their sessions
const SEED_CONVERSATIONS = [
  { id: 'conv-1-6', user1_id: 'user-1', user2_id: 'user-6', last_at: '2026-05-19T16:30:00' }, // Alice ↔ Fanis  (guitar)
  { id: 'conv-1-3', user1_id: 'user-1', user2_id: 'user-3', last_at: '2026-05-18T11:20:00' }, // Alice ↔ Carla  (web dev)
  { id: 'conv-2-5', user1_id: 'user-2', user2_id: 'user-5', last_at: '2026-05-19T09:15:00' }, // Bob   ↔ Elena  (Python)
  { id: 'conv-2-3', user1_id: 'user-2', user2_id: 'user-3', last_at: '2026-05-17T14:50:00' }, // Bob   ↔ Carla  (photography)
  { id: 'conv-3-4', user1_id: 'user-3', user2_id: 'user-4', last_at: '2026-05-16T10:00:00' }, // Carla ↔ Dimitris (yoga)
  { id: 'conv-4-6', user1_id: 'user-4', user2_id: 'user-6', last_at: '2026-05-15T18:30:00' }, // Dimitris ↔ Fanis (chess)
  { id: 'conv-5-4', user1_id: 'user-5', user2_id: 'user-4', last_at: '2026-05-18T15:45:00' }, // Elena ↔ Dimitris (SEO)
  { id: 'conv-6-2', user1_id: 'user-6', user2_id: 'user-2', last_at: '2026-05-17T12:00:00' }, // Fanis ↔ Bob (Python)
];

const SEED_MESSAGES = [
  // Alice ↔ Fanis — guitar sessions
  { id: 'msg-1-6-1', conv: 'conv-1-6', sender: 'user-6', text: "Hey Alice! Have you been practicing the chord transitions I showed you?",                           at: '2026-05-19T15:00:00', read: 1 },
  { id: 'msg-1-6-2', conv: 'conv-1-6', sender: 'user-1', text: "Hi Fanis! Yes, every evening. The G to C transition is finally getting smooth!",                     at: '2026-05-19T15:10:00', read: 1 },
  { id: 'msg-1-6-3', conv: 'conv-1-6', sender: 'user-6', text: "Great progress! This session we'll add the D chord and learn your first full song.",                   at: '2026-05-19T15:15:00', read: 1 },
  { id: 'msg-1-6-4', conv: 'conv-1-6', sender: 'user-1', text: "A full song already? That's amazing! Which one?",                                                       at: '2026-05-19T15:20:00', read: 1 },
  { id: 'msg-1-6-5', conv: 'conv-1-6', sender: 'user-6', text: "Knockin' on Heaven's Door — only 3 chords and it sounds fantastic. Perfect for beginners.",            at: '2026-05-19T15:25:00', read: 1 },
  { id: 'msg-1-6-6', conv: 'conv-1-6', sender: 'user-1', text: "I love that song! See you tomorrow at 4PM then.",                                                       at: '2026-05-19T15:30:00', read: 1 },
  { id: 'msg-1-6-7', conv: 'conv-1-6', sender: 'user-6', text: "See you then! Bring your guitar and a pick.",                                                           at: '2026-05-19T16:30:00', read: 0 },

  // Alice ↔ Carla — upcoming web dev session
  { id: 'msg-1-3-1', conv: 'conv-1-3', sender: 'user-1', text: "Hi Carla! I'm Alice, your web development instructor for our session on May 22nd.",                    at: '2026-05-17T10:00:00', read: 1 },
  { id: 'msg-1-3-2', conv: 'conv-1-3', sender: 'user-3', text: "Hi Alice! I've heard great things about you. Really excited to start!",                                 at: '2026-05-17T10:15:00', read: 1 },
  { id: 'msg-1-3-3', conv: 'conv-1-3', sender: 'user-1', text: "Happy to have you! Do you have any coding experience at all?",                                          at: '2026-05-17T10:20:00', read: 1 },
  { id: 'msg-1-3-4', conv: 'conv-1-3', sender: 'user-3', text: "Just a little HTML from years ago, nothing with JavaScript yet.",                                       at: '2026-05-17T10:30:00', read: 1 },
  { id: 'msg-1-3-5', conv: 'conv-1-3', sender: 'user-1', text: "Perfect starting point! Please install VS Code before the session — code.visualstudio.com",             at: '2026-05-18T09:00:00', read: 1 },
  { id: 'msg-1-3-6', conv: 'conv-1-3', sender: 'user-3', text: "Done! Just installed it. Should I prepare anything else?",                                              at: '2026-05-18T09:45:00', read: 1 },
  { id: 'msg-1-3-7', conv: 'conv-1-3', sender: 'user-1', text: "Just bring your laptop and curiosity. We'll build something real from day one!",                        at: '2026-05-18T11:20:00', read: 0 },

  // Bob ↔ Elena — Python (completed) + photography chat
  { id: 'msg-2-5-1', conv: 'conv-2-5', sender: 'user-2', text: "Hey Elena! Ready for the Python class this morning? We're writing our first script today.",             at: '2026-05-03T08:00:00', read: 1 },
  { id: 'msg-2-5-2', conv: 'conv-2-5', sender: 'user-5', text: "Hi Bob! Yes, I went through the intro material. Feeling nervous but excited!",                          at: '2026-05-03T08:20:00', read: 1 },
  { id: 'msg-2-5-3', conv: 'conv-2-5', sender: 'user-2', text: "No need to be nervous! We'll take it step by step. See you at 10AM.",                                   at: '2026-05-03T08:30:00', read: 1 },
  { id: 'msg-2-5-4', conv: 'conv-2-5', sender: 'user-5', text: "That session was incredible! I can't believe I built a data analysis script on my very first day.",     at: '2026-05-03T12:00:00', read: 1 },
  { id: 'msg-2-5-5', conv: 'conv-2-5', sender: 'user-2', text: "You picked it up super fast! Keen to do a follow-up session soon?",                                     at: '2026-05-03T12:15:00', read: 1 },
  { id: 'msg-2-5-6', conv: 'conv-2-5', sender: 'user-5', text: "Definitely! By the way, I saw you signed up for Carla's photography class too.",                        at: '2026-05-19T08:00:00', read: 1 },
  { id: 'msg-2-5-7', conv: 'conv-2-5', sender: 'user-2', text: "Yes! I've always wanted to learn photography. Any tips?",                                               at: '2026-05-19T08:10:00', read: 1 },
  { id: 'msg-2-5-8', conv: 'conv-2-5', sender: 'user-5', text: "Just enjoy it! Carla is an amazing instructor. You're going to love it.",                               at: '2026-05-19T09:15:00', read: 0 },

  // Bob ↔ Carla — upcoming photography session
  { id: 'msg-2-3-1', conv: 'conv-2-3', sender: 'user-3', text: "Hi Bob! I'm Carla, your photography instructor. Our session is on May 23rd at 3PM.",                   at: '2026-05-15T11:00:00', read: 1 },
  { id: 'msg-2-3-2', conv: 'conv-2-3', sender: 'user-2', text: "Hi Carla! Really looking forward to it. I only have a smartphone — is that OK?",                       at: '2026-05-15T11:30:00', read: 1 },
  { id: 'msg-2-3-3', conv: 'conv-2-3', sender: 'user-3', text: "Absolutely fine! We'll focus on composition and lighting which work on any camera.",                    at: '2026-05-15T12:00:00', read: 1 },
  { id: 'msg-2-3-4', conv: 'conv-2-3', sender: 'user-2', text: "Great! Should I prepare anything?",                                                                    at: '2026-05-16T09:00:00', read: 1 },
  { id: 'msg-2-3-5', conv: 'conv-2-3', sender: 'user-3', text: "Just come ready to walk around outdoors and experiment. Oh, and charge your phone!",                   at: '2026-05-17T14:50:00', read: 0 },

  // Carla ↔ Dimitris — yoga (completed)
  { id: 'msg-3-4-1', conv: 'conv-3-4', sender: 'user-3', text: "Hi Dimitris! Hope you enjoyed the yoga session. How are you feeling?",                                  at: '2026-05-12T10:00:00', read: 1 },
  { id: 'msg-3-4-2', conv: 'conv-3-4', sender: 'user-4', text: "Hi Carla! It was fantastic — my back pain has almost completely disappeared!",                          at: '2026-05-12T10:30:00', read: 1 },
  { id: 'msg-3-4-3', conv: 'conv-3-4', sender: 'user-3', text: "That's wonderful to hear! Are you keeping up with the morning stretch routine?",                        at: '2026-05-12T10:45:00', read: 1 },
  { id: 'msg-3-4-4', conv: 'conv-3-4', sender: 'user-4', text: "Every single morning. It only takes 10 minutes but the difference is huge.",                            at: '2026-05-13T08:00:00', read: 1 },
  { id: 'msg-3-4-5', conv: 'conv-3-4', sender: 'user-3', text: "Consistency is everything with yoga. Keep it up!",                                                     at: '2026-05-14T09:00:00', read: 1 },
  { id: 'msg-3-4-6', conv: 'conv-3-4', sender: 'user-4', text: "Would you be available for another session? I'd like to start intermediate poses.",                     at: '2026-05-16T10:00:00', read: 0 },

  // Dimitris ↔ Fanis — chess (completed)
  { id: 'msg-4-6-1', conv: 'conv-4-6', sender: 'user-4', text: "Hey Fanis! How are you finding the chess openings we worked on?",                                       at: '2026-05-13T17:00:00', read: 1 },
  { id: 'msg-4-6-2', conv: 'conv-4-6', sender: 'user-6', text: "Hi Dimitris! The Sicilian Defence is brilliant. I've been winning more games online!",                  at: '2026-05-13T17:20:00', read: 1 },
  { id: 'msg-4-6-3', conv: 'conv-4-6', sender: 'user-4', text: "Excellent! The Najdorf variation is one of the sharpest responses to 1.e4.",                            at: '2026-05-13T17:30:00', read: 1 },
  { id: 'msg-4-6-4', conv: 'conv-4-6', sender: 'user-6', text: "I even beat a 1200-rated player yesterday! Can we do a follow-up on middlegame tactics?",               at: '2026-05-14T10:00:00', read: 1 },
  { id: 'msg-4-6-5', conv: 'conv-4-6', sender: 'user-4', text: "Of course! Middlegame is where most games are decided. I'll prepare a set of puzzle positions.",        at: '2026-05-15T18:30:00', read: 0 },

  // Elena ↔ Dimitris — upcoming SEO session
  { id: 'msg-5-4-1', conv: 'conv-5-4', sender: 'user-5', text: "Hi Dimitris! I'm Elena, your SEO instructor for May 24th. Looking forward to working with you!",        at: '2026-05-17T14:00:00', read: 1 },
  { id: 'msg-5-4-2', conv: 'conv-5-4', sender: 'user-4', text: "Hi Elena! Same here. I actually have a chess blog we could use as a real case study.",                  at: '2026-05-17T14:20:00', read: 1 },
  { id: 'msg-5-4-3', conv: 'conv-5-4', sender: 'user-5', text: "That's perfect! A niche blog is one of the best use cases for SEO. Can you send me the URL?",          at: '2026-05-17T14:35:00', read: 1 },
  { id: 'msg-5-4-4', conv: 'conv-5-4', sender: 'user-4', text: "Will do. Is there any reading material I should go through beforehand?",                                at: '2026-05-18T09:00:00', read: 1 },
  { id: 'msg-5-4-5', conv: 'conv-5-4', sender: 'user-5', text: "Not required, but Google's SEO Starter Guide is worth a quick read. It's free online.",                 at: '2026-05-18T15:45:00', read: 0 },

  // Fanis ↔ Bob — upcoming Python session
  { id: 'msg-6-2-1', conv: 'conv-6-2', sender: 'user-6', text: "Hi Bob! I'm Fanis, registered for your Python course on May 21st. Just wanted to say hello!",          at: '2026-05-16T11:00:00', read: 1 },
  { id: 'msg-6-2-2', conv: 'conv-6-2', sender: 'user-2', text: "Hey Fanis! Great to meet you. Any prior programming experience?",                                       at: '2026-05-16T11:20:00', read: 1 },
  { id: 'msg-6-2-3', conv: 'conv-6-2', sender: 'user-6', text: "None at all — complete beginner. I hope that's not a problem!",                                         at: '2026-05-16T11:35:00', read: 1 },
  { id: 'msg-6-2-4', conv: 'conv-6-2', sender: 'user-2', text: "Not a problem at all! I actually prefer teaching from scratch. What's drawing you to Python?",          at: '2026-05-16T11:45:00', read: 1 },
  { id: 'msg-6-2-5', conv: 'conv-6-2', sender: 'user-6', text: "I do music production and I've heard Python can automate a lot of audio processing tasks.",              at: '2026-05-16T12:00:00', read: 1 },
  { id: 'msg-6-2-6', conv: 'conv-6-2', sender: 'user-2', text: "That's a brilliant use case! We'll start with the basics and build towards audio automation as a project.", at: '2026-05-17T12:00:00', read: 0 },
];

const SEED_REVIEWS = [
  { id: 'rev-1', session_id: 'sess-c1', from_user_id: 'user-1', to_user_id: 'user-6', rating: 5, comment: 'Fanis is an incredibly talented guitarist and a wonderful teacher. My playing improved dramatically after just one session!', skill_title: 'Guitar Lessons', created_at: '2026-05-01' },
  { id: 'rev-2', session_id: 'sess-c2', from_user_id: 'user-5', to_user_id: 'user-2', rating: 5, comment: "Bob's Python classes are world-class. Very clear explanations and excellent practical examples. Highly recommended!", skill_title: 'Python', created_at: '2026-05-03' },
  { id: 'rev-3', session_id: 'sess-c3', from_user_id: 'user-4', to_user_id: 'user-3', rating: 5, comment: 'Carla made yoga feel accessible and enjoyable. A truly exceptional instructor who tailors the session to your level!', skill_title: 'Yoga', created_at: '2026-05-05' },
  { id: 'rev-4', session_id: 'sess-c4', from_user_id: 'user-3', to_user_id: 'user-5', rating: 5, comment: "Elena's digital marketing insights are cutting-edge and immediately actionable. My project's online visibility doubled after her class!", skill_title: 'Digital Marketing', created_at: '2026-05-07' },
  { id: 'rev-5', session_id: 'sess-c5', from_user_id: 'user-2', to_user_id: 'user-1', rating: 5, comment: 'Alice is an amazing web development teacher — very patient, knowledgeable, and great at explaining complex concepts simply!', skill_title: 'Web Development', created_at: '2026-05-09' },
  { id: 'rev-6', session_id: 'sess-c6', from_user_id: 'user-6', to_user_id: 'user-4', rating: 4, comment: 'Dimitris makes chess strategy approachable and engaging. Learned more in one session than months of self-study!', skill_title: 'Chess Strategy', created_at: '2026-05-11' },
];

export async function seedUsers(): Promise<void> {
  const db = await getDb();
  for (const user of SEED_USERS) {
    const existing = await db.get('SELECT id FROM users WHERE id = ?', user.id);
    if (!existing) {
      const hash = await bcrypt.hash(user.password, 10);
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, user.name, user.email, hash, user.avatar, user.bio]
      );
      console.log(`Seeded user: ${user.email}`);
    }
  }
}

export async function seedData(): Promise<void> {
  const db = await getDb();

  const anySkill = await db.get('SELECT id FROM skills LIMIT 1');
  if (!anySkill) {
    for (const s of SEED_SKILLS) {
      await db.run(
        'INSERT INTO skills (id, user_id, name, level, years_of_experience) VALUES (?, ?, ?, ?, ?)',
        [s.id, s.user_id, s.name, s.level, s.years]
      );
    }
    console.log('Seeded skills');
  }

  const anyListing = await db.get('SELECT id FROM listings LIMIT 1');
  if (!anyListing) {
    for (const l of SEED_LISTINGS) {
      await db.run(
        'INSERT INTO listings (id, user_id, title, description, category, price, swap_available, type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [l.id, l.user_id, l.title, l.description, l.category, l.price, l.swap, l.type, l.created]
      );
    }
    console.log('Seeded listings');
  }

  const anySession = await db.get('SELECT id FROM sessions LIMIT 1');
  if (!anySession) {
    for (const s of SEED_SESSIONS) {
      await db.run(
        'INSERT INTO sessions (id, listing_id, teacher_id, learner_id, skill_title, scheduled_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.listing_id, s.teacher_id, s.learner_id, s.skill_title, s.scheduled_at, s.status]
      );
    }
    console.log('Seeded sessions');
  }

  const anyReview = await db.get('SELECT id FROM reviews LIMIT 1');
  if (!anyReview) {
    for (const r of SEED_REVIEWS) {
      await db.run(
        'INSERT INTO reviews (id, session_id, from_user_id, to_user_id, rating, comment, skill_title, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [r.id, r.session_id, r.from_user_id, r.to_user_id, r.rating, r.comment, r.skill_title, r.created_at]
      );
    }
    // Recalculate ratings for each reviewed user so profile pages show correct stars
    const reviewedIds = [...new Set(SEED_REVIEWS.map(r => r.to_user_id))];
    for (const uid of reviewedIds) {
      const agg = await db.get(
        'SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE to_user_id = ?',
        uid
      );
      if (agg && agg.avg_rating !== null) {
        await db.run(
          'UPDATE users SET rating = ?, reviews_count = ? WHERE id = ?',
          [Number(Number(agg.avg_rating).toFixed(2)), Number(agg.cnt), uid]
        );
      }
    }
    console.log('Seeded reviews');
  }

  const anyConv = await db.get('SELECT id FROM conversations LIMIT 1');
  if (!anyConv) {
    for (const c of SEED_CONVERSATIONS) {
      await db.run(
        'INSERT INTO conversations (id, user1_id, user2_id, last_message_at) VALUES (?, ?, ?, ?)',
        [c.id, c.user1_id, c.user2_id, c.last_at]
      );
    }
    console.log('Seeded conversations');
  }

  // Seed messages independently so they are restored even if only conversations existed
  const anyMsg = await db.get('SELECT id FROM messages LIMIT 1');
  if (!anyMsg) {
    for (const m of SEED_MESSAGES) {
      await db.run(
        'INSERT INTO messages (id, conversation_id, sender_id, text, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [m.id, m.conv, m.sender, m.text, m.read, m.at]
      );
    }
    console.log('Seeded messages');
  }
}
