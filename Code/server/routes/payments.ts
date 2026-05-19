import { Router, Request, Response } from 'express';
import paymentController from '../controllers/PaymentController.js';

export const paymentsRouter = Router();

// GET /api/payments/listing/:listingId — check availability and get price details
paymentsRouter.get('/listing/:listingId', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const data = await paymentController.retrieveSkillData(req.params.listingId as string, userId);
    if (!data.available) {
      res.status(409).json({ available: false, reason: data.reason });
      return;
    }
    res.json(data);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// POST /api/payments/hold — hold payment for a listing
paymentsRouter.post('/hold', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const { listingId } = req.body;
  if (!listingId) { res.status(400).json({ error: 'listingId is required' }); return; }
  try {
    const data = await paymentController.retrieveSkillData(listingId, userId);
    if (!data.available) {
      res.status(409).json({ available: false, reason: data.reason });
      return;
    }
    const result = await paymentController.holdPayment(listingId, userId);
    res.status(201).json({ ...result, success: true });
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});
