CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  rating REAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT CHECK(level IN ('Beginner', 'Intermediate', 'Expert')) NOT NULL,
  years_of_experience INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL,
  swap_available INTEGER DEFAULT 0,
  type TEXT CHECK(type IN ('offer', 'request')) NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
  teacher_id TEXT NOT NULL REFERENCES users(id),
  learner_id TEXT NOT NULL REFERENCES users(id),
  skill_title TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT CHECK(status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  from_user_id TEXT NOT NULL REFERENCES users(id),
  to_user_id TEXT NOT NULL REFERENCES users(id),
  rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  skill_title TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  from_user_id TEXT NOT NULL REFERENCES users(id),
  message TEXT,
  swap_skill TEXT,
  status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);
