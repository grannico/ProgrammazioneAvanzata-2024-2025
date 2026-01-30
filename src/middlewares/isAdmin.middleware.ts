// src/middlewares/isAdmin.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next(); // È un admin, può passare
  } else {
    // Il prof ha chiesto 401 se non autorizzato
    throw new UnauthorizedError('Accesso riservato agli amministratori');
  }
};