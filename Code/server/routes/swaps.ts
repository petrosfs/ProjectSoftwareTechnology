import { Router, Request, Response } from 'express';
import swapValidator from '../controllers/SwapValidator.js';

export const swapsRouter = Router();

// UC-SWP-02: list pending swaps received (as responder)
swapsRouter.get('/received', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const swaps = await swapValidator.getReceived(userId);
  res.json(swaps);
});

// UC-SWP-02: accept or reject a swap
swapsRouter.patch('/:id/decision', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const { decision } = req.body;
    if (decision !== 'accepted' && decision !== 'rejected') {
      res.status(400).json({ error: 'decision must be accepted or rejected' }); return;
    }
    const result = await swapValidator.handleDecision(req.params.id, userId, decision);
    res.json(result);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// UC-SWP-02: submit a swap request after validation
swapsRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { responderId, offeredSkillId, targetSkillId, message } = req.body;
    if (!responderId || !offeredSkillId || !targetSkillId) {
      res.status(400).json({ error: 'responderId, offeredSkillId and targetSkillId are required' });
      return;
    }

    const swap = await swapValidator.validateAndSave({
      requesterId: userId,
      responderId,
      offeredSkillId,
      targetSkillId,
      message,
    });
    res.status(201).json(swap);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});
