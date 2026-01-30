import { User } from '../models/User';
import { AppError } from '../errors/AppError';

export class UserService {
  public static async getUserProfile(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'role', 'tokenBalance']
    });

    if (!user) throw new AppError('Utente non trovato', 404);
    return user;
  }
}