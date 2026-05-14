import { Router, Request, Response } from 'express';
import sessionController from '../controllers/SessionController.js';

export const sessionsRouter = Router();

sessionsRouter.get('/', (_req: Request, res: Response) => {
  const sessions = sessionController.getSessions();
  res.json(sessions);
});

sessionsRouter.post('/', (req: Request, res: Response) => {
  const session = sessionController.createSession(req.body);
  res.status(201).json(session);
});

sessionsRouter.patch('/:id/status', (req: Request, res: Response) => {
  const updated = sessionController.updateStatus(req.params.id, req.body.status);
  res.json(updated);
});
