import { User } from '../models/User';
import { Grid } from '../models/Grid';
import { GridDAO } from '../dao/GridDAO'; // Importante: usiamo il DAO per la logica di collegamento
import { HashHelper } from '../helpers/hash.helper';
import { sequelize } from '../config/database';

export const runSeed = async () => {
  try {
    // 1. Sincronizzazione e pulizia totale del database
    // force: true cancella le tabelle e le ricrea da zero
    await sequelize.sync({ force: true });
    console.log('--- 🚀 Database resettato e sincronizzato ---');

    // 2. Creazione Password Hashate
    const hashedAdminPassword = await HashHelper.encrypt('admin123');
    const hashedUserPassword = await HashHelper.encrypt('user123');

    // 3. Creazione Utenti
    const admin = await User.create({
      email: 'admin@test.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
      tokenBalance: 1000
    });

    const user1 = await User.create({
      email: 'niccolo@test.com',
      password: hashedUserPassword,
      role: 'USER',
      tokenBalance: 100
    });

    const user2 = await User.create({
      email: 'collaboratore@test.com',
      password: hashedUserPassword,
      role: 'USER',
      tokenBalance: 100
    });

    console.log('--- 👥 Utenti creati: Admin, Niccolo, Collaboratore ---');

    // 4. Creazione Griglie e Versioni (usando GridDAO per aggiornare currentVersionId)
    
    // --- MAPPA ADMIN (4x4) ---
    const gridAdmin = await Grid.create({ 
      name: 'Mappa Industriale', 
      creatorId: admin.id 
    });
    await GridDAO.createVersion(gridAdmin.id, 1, [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 0, 0]
    ]);

    // --- MAPPA NICCOLO (3x3) ---
    const gridNiccolo = await Grid.create({ 
      name: 'Mappa Centro', 
      creatorId: user1.id 
    });
    await GridDAO.createVersion(gridNiccolo.id, 1, [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ]);

    // --- MAPPA COLLABORATORE (5x5) ---
    const gridCollab = await Grid.create({ 
      name: 'Mappa Periferia', 
      creatorId: user2.id 
    });
    // Creiamo una 5x5 vuota (tutti 0)
    const empty5x5 = Array(5).fill(0).map(() => Array(5).fill(0));
    await GridDAO.createVersion(gridCollab.id, 1, empty5x5);

    console.log('--- 🗺️ Griglie create e collegate correttamente alle versioni ---');
    
    console.log('--- ✅ Seeding completato con successo! ---');
    process.exit(0);
  } catch (error) {
    console.error('--- ❌ Errore durante il seeding:', error);
    process.exit(1);
  }
};

// Esecuzione immediata dello script
runSeed();