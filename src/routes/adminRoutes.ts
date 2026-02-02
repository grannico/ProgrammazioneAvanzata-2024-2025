import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { isAuth } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/isAdmin.middleware';

const router = Router();

/**
 * 1. Registrazione Admin
 * Ora è protetta: solo un Admin esistente può creare un nuovo Admin.
 * Flusso: Token Valido (isAuth) -> Ruolo Admin (isAdmin) -> Esecuzione della registrazione (AdminController.registerAdmin)
 */
router.post('/register-admin', AdminController.registerAdmin);

/**
 * 2. Ricarica Token Utente
 * Solo un Admin può aggiungere fondi agli account degli utenti.
 */
router.post('/recharge', AdminController.recharge);

export default router;