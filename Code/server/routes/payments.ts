import { Router, Request, Response } from 'express';
import paymentController from '../controllers/PaymentController.js';

export const paymentsRouter = Router();

// UC-PAY-02: retrieve skill info and price for confirmation screen
paymentsRouter.get('/listing/:listingId', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const data = await paymentController.retrieveSkillData(req.params.listingId, userId);
    if (!data.available) {
      res.status(409).json({ available: false, reason: data.reason });
      return;
    }
    res.json(data);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// UC-PAY-02: process payment and unlock access
paymentsRouter.post('/pay', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { listingId, amount, paymentMethod } = req.body;
    if (!listingId || !amount || !paymentMethod) {
      res.status(400).json({ error: 'listingId, amount and paymentMethod are required' });
      return;
    }

    const payment = paymentController.processPayment(Number(amount), paymentMethod);
    if (!payment.success) {
      res.status(402).json({ error: 'Payment failed' });
      return;
    }

    const result = await paymentController.unlockAccess(listingId, userId, payment.transactionRef);
    res.status(201).json({ ...result, success: true });
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});
