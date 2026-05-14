import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  db = await open({
    filename: process.env.DATABASE_PATH || './skillus.db',
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');

  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await db.exec(schema);

  return db;
}
