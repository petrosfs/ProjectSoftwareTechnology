import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { getDb } from '../db/database.js';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email και κωδικός είναι υποχρεωτικά' });
      return;
    }

    const db = await getDb();
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      String(email).toLowerCase().trim()
    );

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Λανθασμένα στοιχεία εισόδου' });
      return;
    }

    req.session.userId = user.id;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      rating: user.rating,
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  }

  async me(req: Request, res: Response): Promise<void> {
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const db = await getDb();
    const user = await db.get(
      'SELECT id, name, email, avatar, bio, rating FROM users WHERE id = ?',
      userId
    );

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  }
}

export default new AuthController();
