import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';
import { BadRequestError, NotFoundError } from '../errors/AppError';

export class AdminController {

  /**
   * Registrazione di un nuovo amministratore
   */
  public static async registerAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      // Validazione granulare
      if (!email || !email.includes('@')) {
        throw new BadRequestError('Fornire un indirizzo email valido');
      }
      
      if (!password || password.length < 6) {
        throw new BadRequestError('La password deve avere almeno 6 caratteri');
      }

      const admin = await AdminService.createAdmin(email, password);

      if (!admin) {
        throw new BadRequestError('Errore durante la creazione dell\'amministratore');
      }

      res.status(201).json({
        status: 'SUCCESS',
        message: "Nuovo Amministratore creato con successo",
        data: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ricarica token per un utente specifico
   */
  public static async recharge(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, amount } = req.body;

      // 1. Controllo email
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw new BadRequestError('Indirizzo email dell\'utente non valido o mancante');
      }

      // 2. Controllo presenza e tipo dell'importo
      if (amount === undefined || typeof amount !== 'number') {
        throw new BadRequestError('L\'importo della ricarica deve essere un numero');
      }

      // 3. Controllo valore positivo (il "pelo nell'uovo")
      if (amount <= 0) {
        throw new BadRequestError('L\'importo della ricarica deve essere superiore a zero');
      }

      const user = await AdminService.rechargeUser(email, amount);

      // 4. Gestione utente non trovato
      if (!user) {
        throw new NotFoundError(`Nessun utente trovato con l'indirizzo email: ${email}`);
      }

      res.status(200).json({
        status: 'SUCCESS',
        message: `Ricarica di ${amount} token completata per ${email}`,
        data: {
          email: user.email,
          newBalance: user.tokenBalance
        }
      });
    } catch (error) {
      next(error);
    }
  }
}