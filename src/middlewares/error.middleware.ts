import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Errore interno del server';

  // Gestione specifica per errori di Sequelize (es: email duplicata)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Dato già esistente nel database (conflitto)';
  }

  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e: any) => e.message).join(', ');
  }

  // Log degli errori 500 (quelli imprevisti) per il debugging sul terminale
  if (statusCode === 500) {
    console.error('ERRORE IMPREVISTO:', err);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    statusCode: statusCode,
    message: message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
};