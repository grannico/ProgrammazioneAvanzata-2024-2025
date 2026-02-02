import app from './app';
import { sequelize } from './config/database';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Sincronizzazione Database
    await sequelize.sync();
    console.log('📦 Database sincronizzato');
    
    // Accensione Server
    app.listen(PORT, () => {
      console.log(`📡 Server in ascolto sulla porta ${PORT}`);
      console.log(`🚀 Ambiente pronto per il pathfinding!`);
    });
  } catch (error) {
    console.error('❌ Errore critico all\'avvio del server:', error);
    process.exit(1); // Chiude il processo in caso di errore grave
  }
};

startServer();