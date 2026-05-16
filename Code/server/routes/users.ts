import { Router, Request, Response } from 'express';
import skillController from '../controllers/SkillController.js';
import reviewController from '../controllers/ReviewController.js';

export const usersRouter = Router();

usersRouter.get('/:id/skills', async (req: Request, res: Response) => {
  const skills = await skillController.getUserSkills(req.params.id);
  res.json(skills);
});

usersRouter.get('/:id/reviews', async (req: Request, res: Response) => {
  const reviews = await reviewController.getReviews(req.params.id);
  res.json(reviews);
});
