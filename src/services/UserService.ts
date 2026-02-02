import { UserDAO } from '../dao/UserDAO';
import { NotFoundError } from '../errors/AppError';

export class UserService {
  /**
   * Recupera i dati del profilo dell'utente loggato
   */
  public static async getUserProfile(userId: number) {
    // Usiamo il DAO per la ricerca
    const user = await UserDAO.findById(userId);

    // Se l'utente non esiste, lanciamo l'errore specifico 404
    if (!user) {
      throw new NotFoundError('Profilo utente non trovato');
    }

    // Restituiamo solo i dati necessari (senza password)
    // Nota: Se il DAO restituisce l'oggetto completo, 
    // qui decidiamo cosa mostrare al controller.
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenBalance: user.tokenBalance,
      createdAt: user.createdAt
    };
  }
}