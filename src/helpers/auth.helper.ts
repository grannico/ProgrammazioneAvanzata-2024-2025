// src/helpers/auth.helper.ts
import jwt from 'jsonwebtoken';
import { InternalServerError } from '../errors/AppError';

export class AuthHelper {
  // Recuperiamo la chiave dal file .env
  private static readonly SECRET = process.env.JWT_SECRET;

  public static generateToken(userId: number, email: string, role: string): string {
    if (!this.SECRET) {
      // Usiamo l'errore 500 che abbiamo appena creato
      throw new InternalServerError('Configurazione mancante: JWT_SECRET non trovata nel file .env');
    }

    return jwt.sign(
      { id: userId, email, role }, 
      this.SECRET,
      { expiresIn: '24h' }
    );
  }

  public static verifyToken(token: string): any {
    // Se la chiave manca, non possiamo verificare nulla
    if (!this.SECRET) {
      return null;
    }

    try {
      return jwt.verify(token, this.SECRET);
    } catch (error) {
      // Se il token è scaduto o manomesso, ritorniamo null
      // Il middleware si occuperà di lanciare l'UnauthorizedError (401)
      return null;
    }
  }
}