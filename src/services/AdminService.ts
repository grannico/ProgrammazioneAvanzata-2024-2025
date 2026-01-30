import { User } from '../models/User';
import { AppError } from '../errors/AppError';
import bcrypt from 'bcrypt';;

export class AdminService {

  public static async createAdmin(email: string, password: string) {
    // 1. Controlliamo se l'utente esiste già
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email già registrata', 400);
    }

    // 2. Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Creazione dell'utente con ruolo ADMIN
    const admin = await User.create({
      email,
      password: hashedPassword,
      role: 'ADMIN',
      tokenBalance: 1000 // Magari diamo un budget iniziale più alto agli admin
    });

    return admin;
  }

  public static async rechargeUser(email: string, amount: number) {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new AppError('Utente non trovato con questa email', 404);

    user.tokenBalance = amount;
    await user.save();

    return user;
  }
}