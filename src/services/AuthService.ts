import { UserDAO } from '../dao/UserDAO';
import { HashHelper } from '../helpers/hash.helper';
import { AuthHelper } from '../helpers/auth.helper';
import { 
  UnauthorizedError, 
  ConflictError, 
  BadRequestError 
} from '../errors/AppError';

export class AuthService {
  /**
   * Registrazione nuovo utente (USER)
   */
  public static async register(email: string, pass: string) {
    // 1. Validazione base (Il "pelo nell'uovo" del prof)
    if (!email || !email.includes('@')) {
      throw new BadRequestError('Formato email non valido');
    }
    if (!pass || pass.length < 6) {
      throw new BadRequestError('La password deve avere almeno 6 caratteri');
    }

    // 2. Controllo se l'utente esiste già
    const existingUser = await UserDAO.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email già registrata nel sistema');
    }

    // 3. Criptazione password
    const hashedPassword = await HashHelper.encrypt(pass);

    // 4. Creazione tramite DAO con saldo iniziale omaggio
    const newUser = await UserDAO.create({
      email,
      password: hashedPassword,
      role: 'USER',
      tokenBalance: 100 // Bonus di benvenuto
    });

    return newUser;
  }

  /**
   * Login utente
   */
  public static async login(email: string, pass: string) {
    const user = await UserDAO.findByEmail(email);

    // Sicurezza: Non specifichiamo se è sbagliata l'email o la pass
    if (!user || !(await HashHelper.compare(pass, user.password))) {
      throw new UnauthorizedError('Credenziali non valide');
    }

    const token = AuthHelper.generateToken(user.id, user.email, user.role);

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