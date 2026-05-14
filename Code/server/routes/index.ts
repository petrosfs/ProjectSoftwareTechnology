import { Router } from 'express';
import { authRouter } from './auth.js';
import { listingsRouter } from './listings.js';
import { sessionsRouter } from './sessions.js';
import { usersRouter } from './users.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/listings', listingsRouter);
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/users', usersRouter);
