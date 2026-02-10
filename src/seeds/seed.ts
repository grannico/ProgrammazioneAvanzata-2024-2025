import { User } from '../models/User';
import { Grid } from '../models/Grid';
import { UpdateRequest } from '../models/UpdateRequest'; // Importato per gestire la cronologia
import { GridDAO } from '../dao/GridDAO'; 
import { HashHelper } from '../helpers/hash.helper';
import { sequelize } from '../config/database';

export const runSeed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('--- 🚀 Database resettato e sincronizzato ---');

    // 1. Creazione Utenti
    const hashedAdminPassword = await HashHelper.encrypt('admin123');
    const hashedUserPassword = await HashHelper.encrypt('user123');

    const admin = await User.create({
      email: 'admin@test.com', password: hashedAdminPassword, role: 'ADMIN', tokenBalance: 1000
    });

    const user1 = await User.create({
      email: 'niccolo@test.com', password: hashedUserPassword, role: 'USER', tokenBalance: 100
    });

    const user2 = await User.create({
      email: 'collaboratore@test.com', password: hashedUserPassword, role: 'USER', tokenBalance: 100
    });

    console.log('--- 👥 Utenti creati ---');

    // 2. Creazione Griglie e Versioni (Almeno 3 modelli con 2 versioni ciascuno)

    // --- MODELLO 1: Mappa Industriale (Admin) ---
    const gridAdmin = await Grid.create({ name: 'Mappa Industriale', creatorId: admin.id });
    // Versione 1
    await GridDAO.createVersion(gridAdmin.id, 1, [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 0, 0]
    ]);
    // Versione 2 (Aggiunto un ostacolo in fondo a destra)
    const dataV2_Admin = [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 1, 1] 
    ];
    await GridDAO.createVersion(gridAdmin.id, 2, dataV2_Admin);

    // Registriamo l'aggiornamento nella cronologia come ACCEPTED
    await UpdateRequest.create({
      gridId: gridAdmin.id,
      requesterId: admin.id,
      status: 'ACCEPTED',
      proposedData: dataV2_Admin,
      tokenCost: 0,
      baseVersionId: 1 // Punta alla V1 della prima griglia
    });

    // --- MODELLO 2: Mappa Centro (Niccolo) ---
    const gridNiccolo = await Grid.create({ name: 'Mappa Centro', creatorId: user1.id });
    // Versione 1
    await GridDAO.createVersion(gridNiccolo.id, 1, [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ]);
    // Versione 2 (Il centro ora è libero)
    const dataV2_Niccolo = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    await GridDAO.createVersion(gridNiccolo.id, 2, dataV2_Niccolo);

    // Registriamo l'aggiornamento nella cronologia come ACCEPTED
    await UpdateRequest.create({
      gridId: gridNiccolo.id,
      requesterId: user1.id,
      status: 'ACCEPTED',
      proposedData: dataV2_Niccolo,
      tokenCost: 0,
      baseVersionId: 3 // Punta alla V1 della seconda griglia
    });

    // --- MODELLO 3: Mappa Periferia (Collaboratore) ---
    const gridCollab = await Grid.create({ name: 'Mappa Periferia', creatorId: user2.id });
    const empty5x5 = Array(5).fill(0).map(() => Array(5).fill(0));
    const obstacle5x5 = Array(5).fill(0).map((_, i) => (i === 2 ? [1, 1, 1, 1, 1] : Array(5).fill(0)));

    // Versione 1: Vuota
    await GridDAO.createVersion(gridCollab.id, 1, empty5x5);
    // Versione 2: Muro centrale
    await GridDAO.createVersion(gridCollab.id, 2, obstacle5x5);

    // Registriamo questo aggiornamento come PENDING per testare i filtri di ricerca
    await UpdateRequest.create({
      gridId: gridCollab.id,
      requesterId: user2.id,
      status: 'PENDING',
      proposedData: obstacle5x5,
      tokenCost: 0.5,
      baseVersionId: 5 // Punta alla V1 della terza griglia
    });

    console.log('--- 🗺️ Creati 3 modelli con 2 versioni e relativi record di Update ---');
    console.log('--- ✅ Seeding completato con successo! ---');
    process.exit(0);
  } catch (error) {
    console.error('--- ❌ Errore durante il seeding:', error);
    process.exit(1);
  }
};

runSeed();