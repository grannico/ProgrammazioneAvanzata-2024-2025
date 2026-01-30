import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.register(email, password);
      
      res.status(201).json({
        message: 'Utente creato',
        user: { id: user.id, email: user.email }
      });
    } catch (error) {
      // Fondamentale: passa l'errore al middleware globale!
      next(error); 
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);
      
      res.status(200).json({
        message: 'Login effettuato con successo',
        ...result
      });
    } catch (error) {
      next(error); // Passa l'errore al middleware globale
    }
  }
}