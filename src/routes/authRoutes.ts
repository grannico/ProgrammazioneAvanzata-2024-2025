// src/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// Solo login e registrazione
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;