import { Router, Request, Response } from 'express';
import authController from '../controllers/AuthController.js';

export const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
  authController.login(req, res);
});

authRouter.post('/logout', (req: Request, res: Response) => {
  authController.logout(req, res);
});

authRouter.get('/me', (req: Request, res: Response) => {
  authController.me(req, res);
});
