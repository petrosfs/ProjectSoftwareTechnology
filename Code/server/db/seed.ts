import bcrypt from 'bcryptjs';
import { getDb } from './database.js';

const SEED_USERS = [
  { id: 'user-1', name: 'Alice Costa', email: 'alice@skillus.com', password: 'alice123', avatar: 'https://i.pravatar.cc/150?img=1', bio: 'Web developer & musician' },
  { id: 'user-2', name: 'Bob Marin', email: 'bob@skillus.com', password: 'bob123', avatar: 'https://i.pravatar.cc/150?img=3', bio: 'Data scientist & cook' },
  { id: 'user-3', name: 'Carla Santos', email: 'carla@skillus.com', password: 'carla123', avatar: 'https://i.pravatar.cc/150?img=5', bio: 'Photographer & yoga teacher' },
  { id: 'user-4', name: 'Dimitris Papadopoulos', email: 'dimitris@skillus.com', password: 'dimitris123', avatar: 'https://i.pravatar.cc/150?img=7', bio: 'Software engineer & chess player' },
  { id: 'user-5', name: 'Elena Vasileiou', email: 'elena@skillus.com', password: 'elena123', avatar: 'https://i.pravatar.cc/150?img=9', bio: 'Marketing expert & painter' },
  { id: 'user-6', name: 'Fanis Georgiadis', email: 'fanis@skillus.com', password: 'fanis123', avatar: 'https://i.pravatar.cc/150?img=11', bio: 'Guitar player & English teacher' },
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
      console.log(`Seeded: ${user.email}`);
    }
  }
}
