import bcrypt from 'bcrypt';

export class HashHelper {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Cripta una stringa (password)
   */
  public static async encrypt(data: string): Promise<string> {
    return await bcrypt.hash(data, this.SALT_ROUNDS);
  }

  /**
   * Confronta una stringa con un hash esistente
   */
  public static async compare(data: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(data, hash);
  }
}