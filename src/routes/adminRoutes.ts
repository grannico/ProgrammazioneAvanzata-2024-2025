// src/routes/adminRoutes.ts
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { isAuth } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/isAdmin.middleware';

const router = Router();

// 1. Rotta per creare altri admin (Momentaneamente protetta solo da isAuth per il primo test)
// Poi diventerà: router.post('/register-admin', isAuth, isAdmin, AdminController.registerAdmin);
router.post('/register-admin', isAuth, AdminController.registerAdmin);

// 2. Rotta ricarica (già protetta)
router.post('/recharge', isAuth, isAdmin, AdminController.recharge);

export default router;