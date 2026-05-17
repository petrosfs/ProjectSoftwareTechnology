import { Router, Request, Response } from 'express';
import authController from '../controllers/AuthController.js';

export const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
  authController.login(req, res);
});

<<<<<<< HEAD
=======
authRouter.post('/register', (req: Request, res: Response) => {
  authController.register(req, res);
});

>>>>>>> f67aca91421af639ad70def22bc036f1eb11c90d
authRouter.post('/logout', (req: Request, res: Response) => {
  authController.logout(req, res);
});

authRouter.get('/me', (req: Request, res: Response) => {
  authController.me(req, res);
});
