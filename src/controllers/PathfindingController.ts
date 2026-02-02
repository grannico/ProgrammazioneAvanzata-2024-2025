import { Request, Response, NextFunction } from 'express';
import { PathfindingService } from '../services/PathfindingService';
import { BadRequestError } from '../errors/AppError';

export class PathfindingController {
  public static async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; 
      const { start, end } = req.body; 
      
      if (start === undefined || end === undefined) {
        throw new BadRequestError('Coordinate [riga, colonna] obbligatorie');
      }

      const userId = req.user!.id;

      const result = await PathfindingService.findPath(
        userId,
        Number(id),
        start,
        end
      );

      // Sincronizziamo i nomi delle proprietà con il return del Service
      res.status(200).json({
        status: 'SUCCESS',
        message: 'Modello eseguito con successo',
        data: {
          path: result.path,
          cost: result.pathCost,              // Lunghezza percorso (grafo)
          executionTime: result.executionTimeMs, // Tempo in ms
          tokenCharge: result.tokenCostApplied, // <--- CORRETTO (era tokenCost)
          balance: result.remainingBalance,
          version: result.versionUsed
        }
      });
    } catch (error) {
      next(error);
    }
  }
}