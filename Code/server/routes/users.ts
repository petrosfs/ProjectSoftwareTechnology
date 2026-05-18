import { Router, Request, Response } from 'express';
import skillController from '../controllers/SkillController.js';
import reviewController from '../controllers/ReviewController.js';
import { getDb } from '../db/database.js';

export const usersRouter = Router();

// Search users by name/email (excluding current user)
usersRouter.get('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const q = String(req.query.q || '');
  const db = await getDb();
  const kw = `%${q}%`;
  const users = await db.all(
    `SELECT id, name, email, avatar, rating FROM users
     WHERE id != ? AND (name LIKE ? OR email LIKE ?)
     ORDER BY name ASC LIMIT 10`,
    [userId, kw, kw]
  );
  res.json(users);
});

// Get single user by id (public info)
usersRouter.get('/:id/skills', async (req: Request, res: Response) => {
  const skills = await skillController.getUserSkills(req.params.id);
  res.json(skills);
});

usersRouter.get('/:id/reviews', async (req: Request, res: Response) => {
  const reviews = await reviewController.getReviews(req.params.id);
  res.json(reviews);
});

usersRouter.get('/:id', async (req: Request, res: Response) => {
  const db = await getDb();
  const user = await db.get(
    'SELECT id, name, email, avatar, rating FROM users WHERE id = ?',
    req.params.id
  );
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
});
