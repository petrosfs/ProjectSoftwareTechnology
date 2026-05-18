import { Router, Request, Response } from 'express';
import reviewController from '../controllers/ReviewController.js';

export const reviewsRouter = Router();

// UC-REV-02: submit a review for a completed session
reviewsRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }

  try {
    const { sessionId, revieweeId, rating, comment, skillTitle } = req.body;
    if (!sessionId || !revieweeId || !rating) {
      res.status(400).json({ error: 'sessionId, revieweeId and rating are required' }); return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' }); return;
    }
    const review = await reviewController.submitReview({
      sessionId,
      reviewerId: userId,
      revieweeId,
      rating: Number(rating),
      comment: comment ?? '',
      skillTitle,
    });
    res.status(201).json(review);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// UC-REV-02: check if user is permitted to review a session
reviewsRouter.get('/permission/:sessionId', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const result = await reviewController.checkPermission(req.params.sessionId, userId);
  res.json(result);
});
