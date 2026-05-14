import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status ?? 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(status).json({ error: message });
}
