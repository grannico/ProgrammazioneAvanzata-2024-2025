import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  public static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id; // Preso dal token via isAuth
      const user = await UserService.getUserProfile(userId);
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}