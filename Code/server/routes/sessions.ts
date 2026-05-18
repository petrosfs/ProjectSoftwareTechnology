import { Router, Request, Response } from 'express';
import sessionController from '../controllers/SessionController.js';

export const sessionsRouter = Router();

// GET /api/sessions/mine — sessions for the logged-in user
sessionsRouter.get('/mine', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const sessions = await sessionController.getSessionsForUser(userId);
  res.json(sessions);
});

// POST /api/sessions — schedule a new session
sessionsRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const { otherUserId, myRole, skillTitle, scheduledAt, durationMinutes, deliveryMode, listingId } = req.body;
    if (!otherUserId) { res.status(400).json({ error: 'otherUserId is required' }); return; }
    const teacherId = myRole === 'learning' ? otherUserId : userId;
    const learnerId = myRole === 'learning' ? userId : otherUserId;
    const session = await sessionController.scheduleSession({
      initiatedById: userId,
      teacherId,
      learnerId,
      skillTitle,
      scheduledAt,
      durationMinutes,
      deliveryMode,
      listingId,
    });
    res.status(201).json(session);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// PATCH /api/sessions/:id/response — accept or reject a pending session
sessionsRouter.patch('/:id/response', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const { response } = req.body;
    if (response !== 'accepted' && response !== 'rejected') {
      res.status(400).json({ error: 'response must be accepted or rejected' }); return;
    }
    const result = await sessionController.handleResponse(req.params.id, userId, response);
    res.json(result);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// PATCH /api/sessions/:id/cancel — cancel a session
sessionsRouter.patch('/:id/cancel', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const result = await sessionController.cancelSession(req.params.id, userId);
    res.json(result);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// POST /api/sessions/availability — check a time slot
sessionsRouter.post('/availability', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const { targetUserId, scheduledAt, durationMinutes } = req.body;
  const available = await sessionController.checkAvailability(targetUserId, scheduledAt, durationMinutes);
  res.json({ available });
});
