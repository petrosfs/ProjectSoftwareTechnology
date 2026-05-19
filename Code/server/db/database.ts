import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Database | null = null;

async function runMigrations(db: Database): Promise<void> {
  const hasColumn = async (table: string, col: string): Promise<boolean> => {
    const cols = await db.all(`PRAGMA table_info(${table})`);
    return cols.some((c: any) => c.name === col);
  };

  // Add missing columns to existing tables
  if (!(await hasColumn('listings', 'delivery_mode'))) {
    await db.exec(`ALTER TABLE listings ADD COLUMN delivery_mode TEXT DEFAULT 'online'`);
    console.log('Migration: added delivery_mode to listings');
  }
  if (!(await hasColumn('sessions', 'duration_minutes'))) {
    await db.exec(`ALTER TABLE sessions ADD COLUMN duration_minutes INTEGER DEFAULT 60`);
    console.log('Migration: added duration_minutes to sessions');
  }
  if (!(await hasColumn('sessions', 'delivery_mode'))) {
    await db.exec(`ALTER TABLE sessions ADD COLUMN delivery_mode TEXT DEFAULT 'online'`);
    console.log('Migration: added delivery_mode to sessions');
  }
  if (!(await hasColumn('offers', 'to_user_id'))) {
    await db.exec(`ALTER TABLE offers ADD COLUMN to_user_id TEXT REFERENCES users(id)`);
    console.log('Migration: added to_user_id to offers');
  }

  // Recreate sessions table if the old CHECK constraint doesn't include 'pending'/'confirmed'
  const sessionsInfo = await db.get(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='sessions'"
  );
  if (sessionsInfo?.sql && !sessionsInfo.sql.includes("'pending'")) {
    await db.exec('PRAGMA foreign_keys = OFF');
    await db.exec(`
      CREATE TABLE sessions_new (
        id TEXT PRIMARY KEY,
        listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
        teacher_id TEXT NOT NULL REFERENCES users(id),
        learner_id TEXT NOT NULL REFERENCES users(id),
        skill_title TEXT NOT NULL,
        scheduled_at TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        delivery_mode TEXT DEFAULT 'online',
        status TEXT CHECK(status IN ('pending', 'confirmed', 'upcoming', 'completed', 'cancelled')) DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await db.exec(`
      INSERT INTO sessions_new
        (id, listing_id, teacher_id, learner_id, skill_title, scheduled_at,
         duration_minutes, delivery_mode, status, created_at)
      SELECT
        id, listing_id, teacher_id, learner_id, skill_title, scheduled_at,
        COALESCE(duration_minutes, 60),
        COALESCE(delivery_mode, 'online'),
        status, created_at
      FROM sessions
    `);
    await db.exec('DROP TABLE sessions');
    await db.exec('ALTER TABLE sessions_new RENAME TO sessions');
    await db.exec('PRAGMA foreign_keys = ON');
    console.log('Migration: sessions table updated with pending/confirmed statuses');
  }

  if (!(await hasColumn('sessions', 'initiated_by_id'))) {
    await db.exec(`ALTER TABLE sessions ADD COLUMN initiated_by_id TEXT`);
    console.log('Migration: added initiated_by_id to sessions');
  }
  if (!(await hasColumn('sessions', 'meeting_url'))) {
    await db.exec(`ALTER TABLE sessions ADD COLUMN meeting_url TEXT`);
    console.log('Migration: added meeting_url to sessions');
  }

  // Create connections table for existing DBs
  await db.exec(`
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_title TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      status TEXT DEFAULT 'awaiting_schedule',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create conversations + messages tables for existing DBs
  await db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now')),
      last_message_at TEXT DEFAULT (datetime('now'))
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  db = await open({
    filename: process.env.DATABASE_PATH || './skillus.db',
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');

  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await db.exec(schema);

  await runMigrations(db);

  return db;
}

export async function initDb(): Promise<void> {
  await getDb();
  const { seedUsers, seedData } = await import('./seed.js');
  await seedUsers();
  await seedData();
}
