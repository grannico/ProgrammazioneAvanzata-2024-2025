import { Grid } from '../models/Grid';
import { User } from '../models/User';
import { GridVersion } from '../models/GridVersion';
import { AppError, UnauthorizedError } from '../errors/AppError';
import { CostFactory, OperationType } from '../patterns/CostFactory';
import { sequelize } from '../config/database';

export class GridService {
  public static async createGrid(userId: number, name: string, rows: number, cols: number, data: any) {
    // 1. Calcolo del costo tramite la Factory
    const totalCells = rows * cols;
    const totalCost = CostFactory.calculate(OperationType.CREATION, totalCells);

    // Iniziamo la transazione
    const transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction });
      if (!user) throw new AppError('Utente non trovato', 404);

      // 2. Controllo Saldo (Il prof vuole 401 se i token sono finiti)
      if (user.tokenBalance < totalCost) {
        throw new UnauthorizedError(`Token insufficienti. Necessari: ${totalCost}, Disponibili: ${user.tokenBalance}`);
      }

      // 3. Addebito Token
      user.tokenBalance -= totalCost;
      await user.save({ transaction });

      // 4. Creazione Modello (Grid)
      const grid = await Grid.create({ 
        name, 
        ownerId: userId 
      }, { transaction });

      // 5. Creazione Versione Iniziale (v1) con i dati della griglia
      await GridVersion.create({
        gridId: grid.id,
        versionNumber: 1,
        data: data // Qui salviamo la matrice [[0,1],[1,0]]
      }, { transaction });

      // Se tutto è andato bene, confermiamo le modifiche sul DB
      await transaction.commit();

      return {
        gridId: grid.id,
        cost: totalCost,
        remainingBalance: user.tokenBalance
      };

    } catch (error) {
      // In caso di errore (es. crash DB), annulliamo tutto: i token tornano all'utente
      await transaction.rollback();
      throw error;
    }
  }
}