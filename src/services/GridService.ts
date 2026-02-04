import { UserDAO } from '../dao/UserDAO';
import { GridDAO } from '../dao/GridDAO';
import { GridHelper } from '../helpers/grid.helper';
import { 
  NotFoundError, 
  UnauthorizedError 
} from '../errors/AppError';
import { CostFactory, OperationType } from '../patterns/CostFactory';
import { sequelize } from '../config/database';

export class GridService {
  
  /**
   * Creazione di una nuova griglia
   */
  public static async createGrid(userId: number, name: string, rows: number, cols: number, data: any) {
    GridHelper.validateStructure(data, rows, cols);

    const totalCells = rows * cols;
    const totalCost = CostFactory.calculate(OperationType.CREATION, totalCells);

    const transaction = await sequelize.transaction();
    try {
      const user = await UserDAO.findById(userId, transaction);
      if (!user) throw new NotFoundError('Utente non trovato');

      // Controllo credito con errore 401 come da specifiche
      if (user.tokenBalance < totalCost) {
        throw new UnauthorizedError(`Token insufficienti. Richiesti: ${totalCost}, Disponibili: ${user.tokenBalance}`);
      }

      await UserDAO.deductTokens(userId, totalCost, transaction);

      const grid = await GridDAO.create(name, userId, transaction);
      await GridDAO.createVersion(grid.id, 1, data, transaction);

      await transaction.commit();
      
      const updatedUser = await UserDAO.findById(userId);
      
      // Arrotondamento decimale per coerenza con AdminService
      const cleanBalance = updatedUser ? Math.round(updatedUser.tokenBalance * 100) / 100 : 0;

      return { 
        gridId: grid.id, 
        cost: totalCost, 
        remainingBalance: cleanBalance 
      };
    } catch (error) {
      if (transaction) await transaction.rollback().catch(() => {});
      throw error;
    }
  }

  /**
   * Recupera tutte le griglie (Lista base)
   */
  public static async getAllGrids() {
    return await GridDAO.findAll();
  }

  /**
   * Recupera i dettagli di una griglia specifica
   */
  public static async getGridDetails(gridId: number) {
    const grid = await GridDAO.findById(gridId);
    if (!grid) throw new NotFoundError(`Griglia con ID ${gridId} non trovata`);
    return grid;
  }
}