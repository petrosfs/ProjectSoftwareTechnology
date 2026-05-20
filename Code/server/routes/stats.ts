import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';

export const statsRouter = Router();

statsRouter.get('/', async (_req: Request, res: Response) => {
  const db = await getDb();
  const [skills, users, sessions, agg] = await Promise.all([
    db.get("SELECT COUNT(*) AS cnt FROM listings WHERE type = 'offer'"),
    db.get('SELECT COUNT(*) AS cnt FROM users'),
    db.get("SELECT COUNT(*) AS cnt FROM sessions WHERE status = 'completed'"),
    db.get('SELECT AVG(rating) AS avg FROM reviews'),
  ]);
  res.json({
    activeSkills:        Number(skills?.cnt   ?? 0),
    activeUsers:         Number(users?.cnt    ?? 0),
    completedSessions:   Number(sessions?.cnt ?? 0),
    avgRating: agg?.avg != null ? Number(Number(agg.avg).toFixed(1)) : 0,
  });
});
