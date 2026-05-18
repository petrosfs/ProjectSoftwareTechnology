import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const db = await getDb();
  const rows = await db.all(
    `SELECT id, body, is_read, created_at
     FROM notifications
     WHERE user_id = ? AND type = 'in-app'
     ORDER BY created_at DESC
     LIMIT 30`,
    userId
  );
  res.json(rows.map((r: any) => ({
    id: r.id,
    body: r.body,
    isRead: !!r.is_read,
    createdAt: r.created_at,
  })));
});

notificationsRouter.patch('/read-all', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const db = await getDb();
  await db.run("UPDATE notifications SET is_read = 1 WHERE user_id = ?", userId);
  res.json({ ok: true });
});
