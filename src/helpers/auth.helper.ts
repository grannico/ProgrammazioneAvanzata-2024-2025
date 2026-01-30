import jwt from 'jsonwebtoken';

export class AuthHelper {
  private static readonly SECRET = process.env.JWT_SECRET || 'secret_chiave';

  public static generateToken(userId: number, email: string): string {
    return jwt.sign({ id: userId, email }, this.SECRET, { expiresIn: '24h' });
  }
}