// src/services/AuthService.ts
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { ConflictError, UnauthorizedError } from '../errors/AppError'; // Aggiunto UnauthorizedError
import { AuthHelper } from '../helpers/auth.helper'; // Importiamo l'helper che genera il token

export class AuthService {
  
  // --- REGISTRAZIONE ---
  public static async register(email: string, password: string) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email già registrata'); 
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await User.create({ 
      email,
      password: hashedPassword,
      role: 'USER',
      tokenBalance: 100 
    });
  }

  // --- LOGIN ---
  public static async login(email: string, password: string) {
    // 1. Cerchiamo l'utente tramite email
    const user = await User.findOne({ where: { email } });
    
    // 2. Se l'utente non esiste o la password è sbagliata, lanciamo UnauthorizedError
    // Nota: usiamo lo stesso errore per entrambi i casi per non dare indizi a eventuali malintenzionati
    if (!user) {
      throw new UnauthorizedError('Credenziali non valide');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenziali non valide');
    }

    // 3. Se è tutto corretto, generiamo il Token JWT usando il nostro Helper
    const token = AuthHelper.generateToken(user.id, user.email);

    // 4. Restituiamo il token e i dati base dell'utente
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tokenBalance: user.tokenBalance
      }
    };
  }
}