import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Errore interno del server';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: message
  });
};