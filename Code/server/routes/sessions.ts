import { Router, Request, Response } from 'express';
import sessionController from '../controllers/SessionController.js';

export const sessionsRouter = Router();

// existing: my sessions
sessionsRouter.get('/mine', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const sessions = await sessionController.getSessionsForUser(userId);
  res.json(sessions);
});

// UC-SCH-02: schedule a new teaching session
sessionsRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { learnerId, skillTitle, scheduledAt, durationMinutes, deliveryMode, listingId } = req.body;
    const session = await sessionController.scheduleSession({
      teacherId: userId,
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

// UC-SCH-02: ActorB responds to a session request (accept/reject)
sessionsRouter.patch('/:id/response', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { response } = req.body;
    if (response !== 'accepted' && response !== 'rejected') {
      res.status(400).json({ error: 'response must be accepted or rejected' });
      return;
    }
    const result = await sessionController.handleResponse(req.params.id, userId, response);
    res.json(result);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// UC-SCH-02: check availability for a time slot
sessionsRouter.post('/availability', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { targetUserId, scheduledAt, durationMinutes } = req.body;
  const available = await sessionController.checkAvailability(targetUserId, scheduledAt, durationMinutes);
  res.json({ available });
});
