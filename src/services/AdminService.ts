import { UserDAO } from '../dao/UserDAO';
import { HashHelper } from '../helpers/hash.helper';
import { ConflictError, NotFoundError } from '../errors/AppError'; // Usiamo gli errori specifici

export class AdminService {

  /**
   * Crea un nuovo amministratore nel sistema
   */
  public static async createAdmin(email: string, password: string) {
    // 1. Controllo esistenza (Usa ConflictError invece di AppError generico)
    const existingUser = await UserDAO.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email già registrata nel sistema');
    }

    // 2. Criptazione
    const hashedPassword = await HashHelper.encrypt(password);

    // 3. Creazione tramite DAO
    return await UserDAO.create({
      email,
      password: hashedPassword,
      role: 'ADMIN',
      tokenBalance: 1000 // Bonus iniziale per gli admin
    });
  }

  /**
   * Ricarica il bilancio token di un utente (Addizione)
   */
  public static async rechargeUser(email: string, amount: number) {
    // 1. Cerchiamo l'utente
    const user = await UserDAO.findByEmail(email);

    if (!user) {
      throw new NotFoundError(`Utente con email ${email} non trovato`);
    }

    // 2. Usiamo il metodo ATOMICO addTokens (fa Balance + Amount nel DB)
    // Questo evita i problemi di concorrenza!
    await UserDAO.addTokens(user.id, amount);

    // 3. Recuperiamo l'utente aggiornato per mostrare il nuovo saldo
    const updatedUser = await UserDAO.findById(user.id);
    
    // Non dovrebbe mai essere null dato che lo abbiamo appena aggiornato, 
    // ma lo gestiamo per far felice TypeScript
    if (!updatedUser) throw new NotFoundError('Errore nel recupero dell\'utente aggiornato');

    return updatedUser;
  }
}