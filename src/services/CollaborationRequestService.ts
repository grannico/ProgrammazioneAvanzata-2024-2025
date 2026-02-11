import { CollaborationRequestDAO } from '../dao/CollaborationRequestDAO'; // Rinominato da UpdateDAO
import { GridDAO } from '../dao/GridDAO';
import { UserDAO } from '../dao/UserDAO';
import { GridHelper } from '../helpers/grid.helper';
import { NotFoundError, ForbiddenError, BadRequestError, UnauthorizedError } from '../errors/AppError';
import { sequelize } from '../config/database';
import { DateHelper } from '../helpers/date.helper';
import { CostFactory, OperationType } from '../patterns/CostFactory';

export class CollaborationRequestService { // Rinominato da UpdateService

  /**
   * Recupera tutte le richieste PENDING per le griglie dell'utente loggato
   */
  public static async getPendingForOwner(ownerId: number) {
    return await CollaborationRequestDAO.findPendingByOwner(ownerId);
  }

  /**
   * Verifica se una griglia ha richieste in sospeso
   */
  public static async checkGridStatus(gridId: number) {
    const hasPending = await CollaborationRequestDAO.hasPendingRequests(gridId);
    return {
      gridId,
      hasPendingUpdates: hasPending
    };
  }

  /**
   * Elenco storico aggiornamenti con filtri
   */
  public static async getGridHistory(gridId: number, status?: string, startStr?: string, endStr?: string) {
    // Verifichiamo prima se la griglia esiste
    const grid = await GridDAO.findById(gridId);
    if (!grid) throw new NotFoundError('Griglia non trovata');

    // Validazione e conversione date tramite helper 
    const { start, end } = DateHelper.validateRange(startStr, endStr);

    return await CollaborationRequestDAO.findByGridWithFilters(gridId, status, start as any, end as any);
  }

  /**
   * Aggiornamento istantaneo (Owner) o Proposta di modifica (Collaboratore)
   * Spostato da GridService e rifinito con gestione decimali
   */
  public static async proposeOrUpdate(userId: number, gridId: number, newData: number[][]) {
    const grid = await GridDAO.findById(gridId);
    if (!grid) throw new NotFoundError('Griglia non trovata');

    const lastVersion = grid.versions[grid.versions.length - 1];
    const oldData = lastVersion.data as number[][];
    
    const rows = oldData.length;
    const cols = oldData[0].length;

    // Validazione struttura e calcolo differenze
    GridHelper.validateStructure(newData, rows, cols);
    const changedCells = GridHelper.countDifferences(oldData, newData);

    if (changedCells === 0) {
      throw new BadRequestError('Nessuna modifica rilevata rispetto alla versione attuale');
    }

    // Calcolo costo (0.35 per cella) e arrotondamento
    const totalCost = Math.round(CostFactory.calculate(OperationType.UPDATE, changedCells) * 100) / 100;
    
    const transaction = await sequelize.transaction();

    try {
      const user = await UserDAO.findById(userId, transaction);
      
      // Controllo credito (401 Unauthorized come da specifiche)
      if (!user || user.tokenBalance < totalCost) {
        throw new UnauthorizedError(`Token insufficienti per l'aggiornamento. Richiesti: ${totalCost}`);
      }

      // Addebito token
      await UserDAO.deductTokens(userId, totalCost, transaction);

      if (grid.creatorId === userId) {
        // --- LOGICA PROPRIETARIO: Aggiornamento immediato ---
        const nextVersionNum = grid.versions.length + 1;
        await GridDAO.createVersion(gridId, nextVersionNum, newData, transaction);
        await transaction.commit();
        
        const updatedUser = await UserDAO.findById(userId);
        const cleanBalance = updatedUser ? Math.round(updatedUser.tokenBalance * 100) / 100 : 0;

        return { 
          status: 'UPDATED', 
          cost: totalCost, 
          remainingBalance: cleanBalance, 
          newVersion: nextVersionNum 
        };
      } else {
        // --- LOGICA COLLABORATORE: Creazione richiesta PENDING ---
        await CollaborationRequestDAO.createRequest({
          gridId: gridId,
          requesterId: userId,
          baseVersionId: lastVersion.id,
          proposedData: newData,
          tokenCost: totalCost,
          status: 'PENDING'
        }, transaction);

        await transaction.commit();

        const updatedUser = await UserDAO.findById(userId);
        const cleanBalance = updatedUser ? Math.round(updatedUser.tokenBalance * 100) / 100 : 0;

        return { 
          status: 'PENDING_APPROVAL', 
          cost: totalCost, 
          remainingBalance: cleanBalance 
        };
      }
    } catch (error) {
      if (transaction) await transaction.rollback().catch(() => {});
      throw error;
    }
  }

  /**
   * Approvazione o Rifiuto in BULK
   */
  public static async processBulkRequests(ownerId: number, requestIds: number[], action: 'ACCEPT' | 'REJECT') {
    if (!requestIds || requestIds.length === 0) {
      throw new BadRequestError('Nessun ID richiesta fornito');
    }

    // 1. Recuperiamo le richieste per verificare i permessi
    const requests = await CollaborationRequestDAO.findByIds(requestIds);

    if (requests.length !== requestIds.length) {
      throw new NotFoundError('Una o più richieste non sono state trovate');
    }

    // 2. Controllo sicurezza: l'utente deve essere il proprietario di tutte le griglie coinvolte
    for (const req of requests) {
      if (req.grid.creatorId !== ownerId) {
        throw new ForbiddenError(`Non hai i permessi per gestire la richiesta ID: ${req.id}`);
      }
      if (req.status !== 'PENDING') {
        throw new BadRequestError(`La richiesta ID: ${req.id} è già stata processata`);
      }
    }

    const transaction = await sequelize.transaction();
    try {
      if (action === 'REJECT') {
        // Se rifiutiamo, aggiorniamo solo lo stato in blocco
        await CollaborationRequestDAO.bulkUpdateStatus(requestIds, 'REJECTED', transaction);
      } else {
        // Se accettiamo, per ogni richiesta dobbiamo creare una nuova versione della griglia
        for (const req of requests) {
          const currentGrid = await GridDAO.findById(req.gridId);
          const nextVersion = currentGrid!.versions.length + 1;

          // Creiamo la nuova versione con i dati proposti
          await GridDAO.createVersion(req.gridId, nextVersion, req.proposedData, transaction);
          
          // Aggiorniamo lo stato della singola richiesta
          await CollaborationRequestDAO.bulkUpdateStatus([req.id], 'ACCEPTED', transaction);
        }
      }

      await transaction.commit();
      return { 
        processedCount: requestIds.length, 
        action: action 
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}