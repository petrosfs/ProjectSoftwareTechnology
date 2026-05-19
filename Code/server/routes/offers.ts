import { Router, Request, Response } from 'express';
import offerController from '../controllers/OfferController.js';

export const offersRouter = Router();

// UC-BUY-02: list pending offers received (as seller)
offersRouter.get('/received', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const offers = await offerController.getReceived(userId);
  res.json(offers);
});

// UC-BUY-02: send a purchase offer for a listing
offersRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { listingId, message } = req.body;
    if (!listingId) {
      res.status(400).json({ error: 'listingId is required' });
      return;
    }
    const offer = await offerController.saveOffer({ buyerId: userId, listingId, message });
    res.status(201).json(offer);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// UC-BUY-02: seller accepts or rejects an offer
offersRouter.patch('/:id/decision', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { decision } = req.body;
    if (decision !== 'accepted' && decision !== 'rejected') {
      res.status(400).json({ error: 'decision must be accepted or rejected' });
      return;
    }
    const result = await offerController.handleDecision(req.params.id as string, userId, decision);
    res.json(result);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});
