import { Request, Response, NextFunction } from 'express';
import { GridService } from '../services/GridService';
import { BadRequestError, UnauthorizedError } from '../errors/AppError';

export class GridController {
  
  /**
   * Recupera la lista di tutte le griglie (Sommario)
   */
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const grids = await GridService.getAllGrids();
      
      res.status(200).json({
        status: 'SUCCESS',
        message: 'Elenco griglie recuperato con successo',
        data: grids
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recupera i dettagli di una singola griglia (Inclusa matrice e versioni)
   */
  public static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (!id) throw new BadRequestError('ID griglia mancante');
      
      const grid = await GridService.getGridDetails(Number(id));

      res.status(200).json({
        status: 'SUCCESS',
        message: 'Dettagli griglia recuperati',
        data: grid
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creazione di un nuovo modello di griglia
   */
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, rows, cols, data } = req.body;

      if (!name || typeof name !== 'string') throw new BadRequestError('Il nome della griglia è obbligatorio');
      if (!rows || !cols || rows <= 0 || cols <= 0) throw new BadRequestError('Dimensioni non valide');
      if (!Array.isArray(data) || data.length !== rows) throw new BadRequestError('I dati non corrispondono alle righe');

      if (!req.user) throw new UnauthorizedError();
      const userId = req.user.id;
      
      const result = await GridService.createGrid(userId, name, rows, cols, data);

      res.status(201).json({
        status: 'SUCCESS',
        message: 'Modello creato con successo',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aggiornamento o proposta di modifica
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
      
      const result = await GridService.updateGrid(userId, Number(id), newData);

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

  /**
   * Approvazione modifica (Solo proprietario)
   */
  public static async approveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      
      if (!req.user) throw new UnauthorizedError();
      const userId = req.user.id;

      const result = await GridService.approveUpdate(userId, Number(requestId));

      res.status(200).json({
        status: 'SUCCESS',
        message: 'Modifica approvata e applicata alla griglia',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}