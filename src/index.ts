import express from 'express';
import { sequelize } from './config/database';
import authRoutes from './routes/authRoutes';
import { errorMiddleware } from './middlewares/error.middleware'; // Importiamo il "paracadute"

const app = express();

// 1. MIDDLEWARE DI BASE
// Serve a far capire a Express come leggere i dati JSON che invii con Postman
app.use(express.json());

// 2. LE ROTTE
// Qui diciamo: "Tutto quello che inizia con /api/auth, passalo al file authRoutes"
app.use('/api/auth', authRoutes);

// 3. IL MIDDLEWARE DI ERRORE (IL "PARACADUTE")
// ATTENZIONE: Deve essere sempre l'ultima cosa prima di far partire il server.
// Se un errore accade nelle rotte sopra, "cade" qui dentro e viene gestito.
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Sincronizziamo il database (Singleton)
    await sequelize.sync();
    console.log('🚀 Database sincronizzato correttamente');
    
    app.listen(PORT, () => {
      console.log(`📡 Server in ascolto sulla porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Errore critico all\'avvio:', error);
  }
};

startServer();