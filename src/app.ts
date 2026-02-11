import express from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import gridRoutes from './routes/gridRoutes';
import collaborationrequestRoutes from './routes/collaborationrequestRoutes';
import { isAuth } from './middlewares/auth.middleware';
import { isAdmin } from './middlewares/isAdmin.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

// MIDDLEWARE DI BASE
app.use(express.json());

// --- DEFINIZIONE DELLE ROTTE ---

// A. Rotte PUBBLICHE
app.use('/api/auth', authRoutes);

// B. Rotte UTENTE (isAuth globale per questi prefissi)
app.use('/api/users', isAuth, userRoutes);
app.use('/api/grids', isAuth, gridRoutes);

// C. Rotte COLLABORAZIONE (Nuove rotte Collaboration Requests)
// Proteggiamo tutto il prefisso con isAuth e usiamo il nuovo endpoint semantico
app.use('/api/collaboration-requests', isAuth, collaborationrequestRoutes);

// D. Rotte ADMIN
app.use('/api/admin', isAuth, isAdmin, adminRoutes);

// IL "PARACADUTE" PER GLI ERRORI
app.use(errorMiddleware);

export default app;