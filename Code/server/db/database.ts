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

export async function initDb(): Promise<void> {
  await getDb();
<<<<<<< HEAD
  const { seedUsers } = await import('./seed.js');
  await seedUsers();
=======
  const { seedUsers, seedData } = await import('./seed.js');
  await seedUsers();
  await seedData();
>>>>>>> f67aca91421af639ad70def22bc036f1eb11c90d
}
