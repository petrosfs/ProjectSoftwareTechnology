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
    console.log('Seeded reviews');
  }
}
