import { Request, Response, NextFunction } from 'express';
import { UpdateService } from '../services/UpdateService';
import { BadRequestError, UnauthorizedError } from '../errors/AppError';

export class UpdateController {

  /**
   * Elenco storico con filtri per data e stato
   * GET /api/grids/:id/history?status=ACCEPTED&startDate=01/01/2024
   */
  public static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, startDate, endDate } = req.query;

      const history = await UpdateService.getGridHistory(
        Number(id),
        status as string,
        startDate as string,
        endDate as string
      );

      res.status(200).json({
        status: 'SUCCESS',
        message: 'Cronologia aggiornamenti recuperata con successo',
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica se un modello ha richieste pending
   * GET /api/grids/:id/status
   */
  public static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const status = await UpdateService.checkGridStatus(Number(id));

      res.status(200).json({
        status: 'SUCCESS',
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tutte le richieste PENDING per i modelli dell'utente loggato
   * GET /api/updates/my-pending
   */
  public static async getMyPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      
      const pending = await UpdateService.getPendingForOwner(req.user.id);

      res.status(200).json({
        status: 'SUCCESS',
        message: 'Richieste in attesa per i tuoi modelli recuperate',
        data: pending
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approva o Rigetta in modalità BULK
   * POST /api/updates/bulk
   */
  public static async bulkAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestIds, action } = req.body; // action: 'ACCEPT' o 'REJECT'

      if (!req.user) throw new UnauthorizedError();
      if (!['ACCEPT', 'REJECT'].includes(action)) {
        throw new BadRequestError('L\'azione deve essere ACCEPT o REJECT');
      }

      const result = await UpdateService.processBulkRequests(
        req.user.id,
        requestIds,
        action as 'ACCEPT' | 'REJECT'
      );

      res.status(200).json({
        status: 'SUCCESS',
        message: `Operazione bulk completata: ${result.processedCount} richieste processate`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aggiornamento o proposta di modifica (Spostato da GridController)
   * POST /api/updates/grid/:id
   */
  public static async updateGrid(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newData } = req.body;

      if (!newData || !Array.isArray(newData)) {
        throw new BadRequestError('La nuova matrice dei dati è obbligatoria');
      }

      if (!req.user) throw new UnauthorizedError();
      const userId = req.user.id;
      
      // Chiamiamo il metodo nel Service dedicato agli update
      const result = await UpdateService.proposeOrUpdate(userId, Number(id), newData);

      const message = result.status === 'UPDATED' 
        ? 'Griglia aggiornata istantaneamente (Proprietario)' 
        : 'Richiesta di aggiornamento inviata (Collaboratore)';

      res.status(200).json({
        status: 'SUCCESS',
        message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}