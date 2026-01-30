// src/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

/**
 * Rotta per la registrazione
 * Quando qualcuno invia una POST a /register, 
 * eseguiamo il metodo register del nostro AuthController
 */
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;