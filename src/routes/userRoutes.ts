// src/routes/userRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
// Nota: qui non serve mettere isAuth perché lo metteremo nel file index.ts 
// per proteggere TUTTE queste rotte in un colpo solo.

const router = Router();

router.get('/me', UserController.getProfile);

export default router;