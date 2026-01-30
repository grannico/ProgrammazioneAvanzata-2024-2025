// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthHelper } from '../helpers/auth.helper';
import { UnauthorizedError } from '../errors/AppError';

declare global {
  namespace Express {
    interface Request {
      // Definiamo bene la struttura dell'utente nel token
      user?: { id: number; email: string; role: 'USER' | 'ADMIN' };
    }
  }
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token mancante');
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthHelper.verifyToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Token non valido o scaduto');
    }

    // Salviamo i dati decodificati (inclusi id, email e role)
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};