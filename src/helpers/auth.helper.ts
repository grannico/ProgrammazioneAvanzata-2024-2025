// src/helpers/auth.helper.ts
import jwt from 'jsonwebtoken';

export class AuthHelper {
  private static readonly SECRET = process.env.JWT_SECRET || 'secret_chiave_esame';

  public static generateToken(userId: number, email: string, role: string): string {
    return jwt.sign(
      { id: userId, email, role }, // <--- Aggiungiamo il ruolo qui
      this.SECRET,
      { expiresIn: '24h' }
    );
  }

  public static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.SECRET);
    } catch (error) {
      return null;
    }
  }
}