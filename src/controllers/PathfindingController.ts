import { Request, Response, NextFunction } from 'express';
import { PathfindingService } from '../services/PathfindingService';
import { BadRequestError } from '../errors/AppError';

export class PathfindingController {
  public static async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; 
      const { start, end } = req.body; 
      
      // 1. Piccola validazione preventiva nel Controller
      // Se l'utente dimentica di inviare start o end, lo fermiamo subito qui.
      if (!start || !end) {
        throw new BadRequestError('Coordinate di partenza e arrivo obbligatorie');
      }

      // 2. req.user!.id è sicuro perché la rotta sarà protetta da isAuth
      const userId = req.user!.id;

      // 3. Delegiamo tutta la logica (e il lancio di errori specifici) al Service
      const result = await PathfindingService.findPath(
        userId,
        Number(id),
        start,
        end
      );

      // 4. Se arriviamo qui, il Service ha avuto successo. 
      // Non dobbiamo preoccuparci di gestire gli errori, ci pensa il catch(error) -> next(error)
      res.status(200).json({
        status: 'SUCCESS',
        message: 'Percorso calcolato con successo',
        data: result
      });
    } catch (error) {
      // Questo invia l'errore (che sia un AppError o un errore di Sequelize) 
      // direttamente al tuo errorMiddleware.
      next(error);
    }
  }
}