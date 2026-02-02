import { User } from '../models/User';

export class UserDAO {
  /**
   * Cerca un utente per ID
   */
  public static async findById(id: number, transaction?: any) {
    return await User.findByPk(id, { transaction });
  }

  /**
   * Cerca un utente per Email
   */
  public static async findByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }

  /**
   * Crea un nuovo record utente
   */
  public static async create(userData: any, transaction?: any) {
    return await User.create(userData, { transaction });
  }

  /**
   * DECREMENTO ATOMICO (Per pagare calcoli/aggiornamenti)
   * Più sicuro di updateBalance perché la sottrazione avviene nel DB
   */
  public static async deductTokens(userId: number, amount: number, transaction?: any) {
    const user = await User.findByPk(userId, { transaction });
    if (!user) return null;
    
    // decrement() è un'operazione atomica: evita errori se due richieste arrivano insieme
    return await user.decrement('tokenBalance', { by: amount, transaction });
  }

  /**
   * INCREMENTO ATOMICO (Per ricariche o rimborsi)
   */
  public static async addTokens(userId: number, amount: number, transaction?: any) {
    const user = await User.findByPk(userId, { transaction });
    if (!user) return null;

    return await user.increment('tokenBalance', { by: amount, transaction });
  }

  /**
   * Recupera tutti gli utenti (Utile per l'Admin)
   */
  public static async findAll() {
    return await User.findAll({
      attributes: { exclude: ['password'] } // Non inviamo mai le password hashate
    });
  }

  /**
   * Aggiornamento generico del profilo
   */
  public static async updateProfile(userId: number, data: any, transaction?: any) {
    return await User.update(data, { 
      where: { id: userId }, 
      transaction 
    });
  }
}