import { sequelize } from './config/database';

const startServer = async () => {
  try {
    // Sincronizza il database (crea le tabelle se non esistono)
    await sequelize.sync({ force: false }); 
    console.log('🚀 Database sincronizzato correttamente.');
    
    console.log('Il server è pronto per essere implementato!');
  } catch (error) {
    console.error('❌ Errore durante l\'avvio:', error);
  }
};

startServer();