import { Router, Request, Response } from 'express';
import sessionController from '../controllers/SessionController.js';

export const sessionsRouter = Router();

sessionsRouter.get('/mine', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const sessions = await sessionController.getSessionsForUser(userId);
  res.json(sessions);
});
