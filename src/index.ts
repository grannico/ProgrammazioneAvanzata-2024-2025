import express from 'express';
import { sequelize } from './config/database';
import { errorMiddleware } from './middlewares/error.middleware';

// 1. Import delle Rotte
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import gridRoutes from './routes/gridRoutes';

// 2. Import dei Middleware di Protezione
import { isAuth } from './middlewares/auth.middleware';
import { isAdmin } from './middlewares/isAdmin.middleware';

const app = express();

// MIDDLEWARE DI BASE
app.use(express.json());

// --- DEFINIZIONE DELLE ROTTE (L'ordine è importante!) ---

// A. Rotte PUBBLICHE (Login e Registrazione)
// Non hanno bisogno di token
app.use('/api/auth', authRoutes);

// B. Rotte UTENTE (Richiedono solo di essere loggati)
// 'isAuth' controllerà il token per tutte le chiamate a questi prefissi
app.use('/api/users', isAuth, userRoutes);
app.use('/api/grids', isAuth, gridRoutes);

// C. Rotte ADMIN (Richiedono di essere loggati E di essere Admin)
// Il traffico deve superare ENTRAMBI i controlli
app.use('/api/admin', isAuth, isAdmin, adminRoutes);

// --- FINE ROTTE ---

// IL "PARACADUTE" PER GLI ERRORI
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.sync();
    console.log('🚀 Database sincronizzato e Rotte configurate');
    
    app.listen(PORT, () => {
      console.log(`📡 Server in ascolto sulla porta ${PORT}`);
      console.log(`🔒 Rotte Admin protette e attive`);
    });
  } catch (error) {
    console.error('❌ Errore critico all\'avvio:', error);
  }
};

startServer();