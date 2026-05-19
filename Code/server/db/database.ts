import pg from 'pg';
const { Pool } = pg;
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toPostgres(sql: string, params?: unknown[]): { text: string; values: unknown[] } {
  let i = 0;
  return {
    text: sql.replace(/\?/g, () => `$${++i}`),
    values: params ?? [],
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NODE_ENV === 'production' && { ssl: { rejectUnauthorized: false } }),
});

export const db = {
  async get<T = any>(sql: string, params?: unknown[]): Promise<T | null> {
    const { rows } = await pool.query(toPostgres(sql, params));
    return (rows[0] ?? null) as T | null;
  },
  async all<T = any>(sql: string, params?: unknown[]): Promise<T[]> {
    const { rows } = await pool.query(toPostgres(sql, params));
    return rows as T[];
  },
  async run(sql: string, params?: unknown[]): Promise<void> {
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

export async function initDb(): Promise<void> {
  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(schema);
  const { seedUsers, seedData } = await import('./seed.js');
  await seedUsers();
  await seedData();
}
