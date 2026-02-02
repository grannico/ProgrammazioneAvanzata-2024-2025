import { User } from '../models/User';
import { Grid } from '../models/Grid';
import { GridVersion } from '../models/GridVersion';
import { HashHelper } from '../helpers/hash.helper';
import { sequelize } from '../config/database';

export const runSeed = async () => {
  try {
    // 1. Sincronizzazione e pulizia (ATTENZIONE: cancella i dati esistenti)
    await sequelize.sync({ force: true });
    console.log('--- Database resettato con successo ---');

    // 2. Creazione Utenti
    const hashedAdminPassword = await HashHelper.encrypt('admin123');
    const hashedUserPassword = await HashHelper.encrypt('user123');

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

    console.log('--- Utenti Creati: Admin, Niccolo, Collaboratore ---');

    // 3. Creazione Mappe (una per ogni utente)
    
    // Mappa dell'Admin (4x4)
    const gridAdmin = await Grid.create({ name: 'Mappa Industriale', creatorId: admin.id });
    await GridVersion.create({
      gridId: gridAdmin.id,
      versionNumber: 1,
      data: [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 0, 0]
      ]
    });

    // Mappa di Niccolo (3x3)
    const gridNiccolo = await Grid.create({ name: 'Mappa Centro', creatorId: user1.id });
    await GridVersion.create({
      gridId: gridNiccolo.id,
      versionNumber: 1,
      data: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ]
    });

    // Mappa del Collaboratore (5x5)
    const gridCollab = await Grid.create({ name: 'Mappa Periferia', creatorId: user2.id });
    await GridVersion.create({
      gridId: gridCollab.id,
      versionNumber: 1,
      data: Array(5).fill(0).map(() => Array(5).fill(0)) // Una 5x5 tutta vuota
    });

    console.log('--- Griglie e Versioni v1 create con successo ---');
    process.exit(0);
  } catch (error) {
    console.error('Errore durante il seeding:', error);
    process.exit(1);
  }
};

runSeed();