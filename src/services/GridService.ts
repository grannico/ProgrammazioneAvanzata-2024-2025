import { UserDAO } from '../dao/UserDAO';
import { GridDAO } from '../dao/GridDAO';
import { UpdateDAO } from '../dao/UpdateDAO';
import { GridHelper } from '../helpers/grid.helper';
import { 
  NotFoundError, 
  BadRequestError, 
  PaymentRequiredError, 
  ForbiddenError 
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

      if (user.tokenBalance < totalCost) {
        throw new PaymentRequiredError(`Token insufficienti. Richiesti: ${totalCost}, Disponibili: ${user.tokenBalance}`);
      }

      await UserDAO.deductTokens(userId, totalCost, transaction);

      const grid = await GridDAO.create(name, userId, transaction);
      await GridDAO.createVersion(grid.id, 1, data, transaction);

      await transaction.commit();
      
      const updatedUser = await UserDAO.findById(userId);
      return { 
        gridId: grid.id, 
        cost: totalCost, 
        remainingBalance: updatedUser?.tokenBalance 
      };
    } catch (error) {
      if (transaction) await transaction.rollback().catch(() => {});
      throw error;
    }
  }

  /**
   * Aggiornamento o proposta di modifica
   */
  public static async updateGrid(userId: number, gridId: number, newData: number[][]) {
    const grid = await GridDAO.findById(gridId);
    if (!grid) throw new NotFoundError('Griglia non trovata');

    const lastVersion = grid.versions[grid.versions.length - 1];
    const oldData = lastVersion.data as number[][];
    
    const rows = oldData.length;
    const cols = oldData[0].length;

    GridHelper.validateStructure(newData, rows, cols);
    const changedCells = GridHelper.countDifferences(oldData, newData);

    if (changedCells === 0) {
      throw new BadRequestError('Nessuna modifica rilevata rispetto alla versione attuale');
    }

    const totalCost = CostFactory.calculate(OperationType.UPDATE, changedCells);
    const transaction = await sequelize.transaction();

    try {
      const user = await UserDAO.findById(userId, transaction);
      if (!user || user.tokenBalance < totalCost) throw new PaymentRequiredError('Token insufficienti');

      await UserDAO.deductTokens(userId, totalCost, transaction);

      if (grid.creatorId === userId) {
        const nextVersionNum = grid.versions.length + 1;
        await GridDAO.createVersion(gridId, nextVersionNum, newData, transaction);
        await transaction.commit();
        
        const updatedUser = await UserDAO.findById(userId);
        return { status: 'UPDATED', cost: totalCost, remainingBalance: updatedUser?.tokenBalance, newVersion: nextVersionNum };
      } else {
        await UpdateDAO.createRequest({
          gridId: gridId,
          requesterId: userId,
          baseVersionId: lastVersion.id,
          proposedData: newData,
          tokenCost: totalCost,
          status: 'PENDING'
        }, transaction);

        await transaction.commit();
        const updatedUser = await UserDAO.findById(userId);
        return { status: 'PENDING_APPROVAL', cost: totalCost, remainingBalance: updatedUser?.tokenBalance };
      }
    } catch (error) {
      if (transaction) await transaction.rollback().catch(() => {});
      throw error;
    }
  }

  /**
   * Approvazione modifica
   */
  public static async approveUpdate(userId: number, requestId: number) {
    const request = await UpdateDAO.findById(requestId);
    if (!request) throw new NotFoundError('Richiesta non trovata');
    if (request.status !== 'PENDING') throw new BadRequestError('Richiesta già processata');

    const grid = await GridDAO.findById(request.gridId);
    if (!grid) throw new NotFoundError('Griglia non trovata');

    if (grid.creatorId !== userId) throw new ForbiddenError('Solo il proprietario può approvare');

    const lastVersion = grid.versions[grid.versions.length - 1];
    if (request.baseVersionId !== lastVersion.id) {
      throw new BadRequestError('La proposta è obsoleta (la griglia è stata già aggiornata).');
    }

    const transaction = await sequelize.transaction();
    try {
      await UpdateDAO.updateStatus(requestId, 'ACCEPTED', transaction);
      const nextVersionNum = grid.versions.length + 1;
      await GridDAO.createVersion(grid.id, nextVersionNum, request.proposedData, transaction);

      await transaction.commit();
      return { status: 'SUCCESS', version: nextVersionNum };
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