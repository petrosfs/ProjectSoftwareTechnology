import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
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
      reviewsCount: user.reviews_count ?? 0,
    });
  }

  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Όλα τα πεδία είναι υποχρεωτικά' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες' });
      return;
    }

    const db = await getDb();

    const existing = await db.get(
      'SELECT id FROM users WHERE email = ?',
      String(email).toLowerCase().trim()
    );
    if (existing) {
      res.status(409).json({ error: 'Το email χρησιμοποιείται ήδη' });
      return;
    }

    const id = randomUUID();
    const hash = await bcrypt.hash(password, 10);
    const normalizedEmail = String(email).toLowerCase().trim();
    const trimmedName = String(name).trim();

    await db.run(
      'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, trimmedName, normalizedEmail, hash]
    );

    req.session.userId = id;

    res.status(201).json({
      id,
      name: trimmedName,
      email: normalizedEmail,
      avatar: null,
      bio: null,
      rating: 0,
      reviewsCount: 0,
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
      'SELECT id, name, email, avatar, bio, rating, reviews_count FROM users WHERE id = ?',
      userId
    );

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      rating: user.rating,
      reviewsCount: user.reviews_count ?? 0,
    });
  }
}

export default new AuthController();
