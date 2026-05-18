import { Router, Request, Response } from 'express';
import connectionController from '../controllers/ConnectionController.js';

export const connectionsRouter = Router();

connectionsRouter.get('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const connections = await connectionController.getForUser(userId);
  res.json(connections);
});

connectionsRouter.delete('/:id', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  await connectionController.dismiss(req.params.id, userId);
  res.json({ ok: true });
});
