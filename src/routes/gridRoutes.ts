// src/routes/gridRoutes.ts
import { Router } from 'express';
import { GridController } from '../controllers/GridController';
import { isAuth } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/grids - Creazione di un nuovo modello
// Passa prima per isAuth per verificare il JWT
router.post('/', isAuth, GridController.create);

export default router;