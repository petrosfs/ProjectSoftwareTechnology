import { Router, Request, Response } from 'express';
import authController from '../controllers/AuthController.js';

export const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
  const { userId } = req.body;
  const isLoggedIn = authController.checkLogin(userId);
  res.json({ success: isLoggedIn });
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  authController.redirectToLogin();
  res.json({ success: true });
});
