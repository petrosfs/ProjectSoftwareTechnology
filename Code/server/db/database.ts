import pg from 'pg';
const { Pool } = pg;
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toPostgres(sql: string, params?: unknown | unknown[]): { text: string; values: unknown[] } {
  let i = 0;
  const values =
    params === undefined || params === null ? [] :
    Array.isArray(params) ? params : [params];
  return {
    text: sql.replace(/\?/g, () => `$${++i}`),
    values,
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NODE_ENV === 'production' && { ssl: { rejectUnauthorized: false } }),
});

export const db = {
  async get<T = any>(sql: string, params?: unknown | unknown[]): Promise<T | null> {
    const { rows } = await pool.query(toPostgres(sql, params));
    return (rows[0] ?? null) as T | null;
  },
  async all<T = any>(sql: string, params?: unknown | unknown[]): Promise<T[]> {
    const { rows } = await pool.query(toPostgres(sql, params));
    return rows as T[];
  },
  async run(sql: string, params?: unknown | unknown[]): Promise<void> {
    await pool.query(toPostgres(sql, params));
  },
  async exec(sql: string): Promise<void> {
    await pool.query(sql);
  },
};

export type DbWrapper = typeof db;

export async function getDb(): Promise<DbWrapper> {
  return db;
}

async function runMigrations(): Promise<void> {
  await pool.query(`
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS
      last_message_at TEXT DEFAULT (TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
  `);
  // Recalculate rating/reviews_count for all users from actual review data
  await pool.query(`
    UPDATE users u
    SET
      rating = COALESCE(agg.avg_rating, 0),
      reviews_count = COALESCE(agg.cnt, 0)
    FROM (
      SELECT to_user_id, AVG(rating)::NUMERIC(4,2) AS avg_rating, COUNT(*)::INTEGER AS cnt
      FROM reviews
      GROUP BY to_user_id
    ) agg
    WHERE u.id = agg.to_user_id
  `);
}

export async function initDb(): Promise<void> {
  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(schema);
  await runMigrations();
  const { seedUsers, seedData } = await import('./seed.js');
  await seedUsers();
  await seedData();
}
