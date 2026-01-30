import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';

export class AdminController {

  public static async registerAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      const admin = await AdminService.createAdmin(email, password);

      res.status(201).json({
        message: "Nuovo Amministratore creato con successo",
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async recharge(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, amount } = req.body;
      const user = await AdminService.rechargeUser(email, amount);

      res.json({
        message: `Credito aggiornato con successo per l'utente ${email}`,
        newBalance: user.tokenBalance
      });
    } catch (error) {
      next(error);
    }
  }
}