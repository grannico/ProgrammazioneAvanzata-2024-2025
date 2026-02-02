import { AStarFinder } from 'astar-typescript';
import { GridDAO } from '../dao/GridDAO';
import { UserDAO } from '../dao/UserDAO';
import { PathHelper } from '../helpers/path.helper'; // Import dell'helper
import { CostFactory, OperationType } from '../patterns/CostFactory';
import { 
  NotFoundError, 
  BadRequestError, 
  PaymentRequiredError 
} from '../errors/AppError';
import { sequelize } from '../config/database';

export class PathfindingService {
  public static async findPath(userId: number, gridId: number, start: [number, number], end: [number, number]) {
    // 1. Recupero Dati
    const grid = await GridDAO.findById(gridId);
    if (!grid) throw new NotFoundError('Griglia non trovata');

    const lastVersion = grid.versions[grid.versions.length - 1];
    const matrix = lastVersion.data as number[][];
    const rows = matrix.length;
    const cols = matrix[0].length;

    // 2. Validazioni Spaziali (tramite Helper)
    PathHelper.validateBounds(start, rows, cols, 'partenza');
    PathHelper.validateBounds(end, rows, cols, 'destinazione');

    if (PathHelper.isObstacle(start, matrix) || PathHelper.isObstacle(end, matrix)) {
      throw new BadRequestError('Il punto di partenza o di arrivo è un ostacolo');
    }

    // 3. Calcolo Costo
    const totalCells = rows * cols;
    const totalCost = CostFactory.calculate(OperationType.CREATION, totalCells);

    const transaction = await sequelize.transaction();

    try {
      // 4. Gestione Token (Atomica)
      const user = await UserDAO.findById(userId, transaction);
      if (!user) throw new NotFoundError('Utente non trovato');
      
      if (user.tokenBalance < totalCost) {
        throw new PaymentRequiredError(`Saldo insufficiente. Richiesti: ${totalCost}`);
      }

      await UserDAO.deductTokens(userId, totalCost, transaction);

      // 5. Caso limite: Partenza = Destinazione
      if (start[0] === end[0] && start[1] === end[1]) {
        await transaction.commit();
        const updatedUser = await UserDAO.findById(userId);
        return {
          path: [start], 
          cost: totalCost,
          remainingBalance: updatedUser?.tokenBalance,
          versionUsed: lastVersion.versionNumber
        };
      }

      // 6. Esecuzione Algoritmo
      const astarInstance = new AStarFinder({
        grid: { matrix },
        diagonalAllowed: false, 
        heuristic: 'Manhattan'  
      });

      // Nota: A* usa x (colonne) e y (righe)
      const rawPath = astarInstance.findPath(
        { x: start[1], y: start[0] }, 
        { x: end[1], y: end[0] }
      );

      // 7. Gestione Risultato
      if (rawPath.length === 0) {
        // Rollback: se il percorso è impossibile, non facciamo pagare l'utente
        await transaction.rollback(); 
        throw new NotFoundError('Percorso non trovato: la destinazione è irraggiungibile');
      }
      
      // Trasformazione coordinate tramite Helper
      const formattedPath = PathHelper.formatPathForClient(rawPath);

      await transaction.commit();

      const updatedUser = await UserDAO.findById(userId);
      return {
        path: formattedPath,
        cost: totalCost,
        remainingBalance: updatedUser?.tokenBalance,
        versionUsed: lastVersion.versionNumber
      };

    } catch (error) {
      if (transaction) {
        try { await transaction.rollback(); } catch(e) {}
      }
      throw error;
    }
  }
}