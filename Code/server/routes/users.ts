import { Router, Request, Response } from 'express';
import profileController from '../controllers/ProfileController.js';
import reviewController from '../controllers/ReviewController.js';

export const usersRouter = Router();

usersRouter.get('/:id', (req: Request, res: Response) => {
  const profile = profileController.getProfile(req.params.id);
  if (!profile) return res.status(404).json({ error: 'User not found' });
  res.json(profile);
});

usersRouter.put('/:id', (req: Request, res: Response) => {
  const updated = profileController.updateProfile(req.params.id, req.body);
  res.json(updated);
});

usersRouter.get('/:id/reviews', (req: Request, res: Response) => {
  const reviews = reviewController.getReviews(req.params.id);
  res.json(reviews);
});

usersRouter.post('/:id/reviews', (req: Request, res: Response) => {
  const review = reviewController.addReview(req.params.id, req.body);
  res.status(201).json(review);
});
