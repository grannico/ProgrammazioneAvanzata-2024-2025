import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  public static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id; 
      const user = await UserService.getUserProfile(userId);
      
      res.status(200).json({
        status: 'SUCCESS',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}