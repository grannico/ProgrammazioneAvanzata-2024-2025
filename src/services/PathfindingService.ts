import { AStarFinder } from 'astar-typescript';
import { GridDAO } from '../dao/GridDAO';
import { UserDAO } from '../dao/UserDAO';
import { PathHelper } from '../helpers/path.helper';
import { CostFactory, OperationType } from '../patterns/CostFactory';
import { 
  NotFoundError, 
  BadRequestError, 
  UnauthorizedError // Usiamo 401 come richiesto esplicitamente per i token terminati
} from '../errors/AppError';
import { sequelize } from '../config/database';
import { performance } from 'perf_hooks'; // Necessario per il calcolo del tempo

export class PathfindingService {
  public static async findPath(userId: number, gridId: number, start: [number, number], end: [number, number]) {
    // 1. Recupero Dati
    const grid = await GridDAO.findById(gridId);
    if (!grid) throw new NotFoundError('Griglia non trovata');

    const lastVersion = grid.versions[grid.versions.length - 1];
    const matrix = lastVersion.data as number[][];
    const rows = matrix.length;
    const cols = matrix[0].length;

    // 2. Validazioni Spaziali
    PathHelper.validateBounds(start, rows, cols, 'partenza');
    PathHelper.validateBounds(end, rows, cols, 'destinazione');

    if (PathHelper.isObstacle(start, matrix) || PathHelper.isObstacle(end, matrix)) {
      throw new BadRequestError('Il punto di partenza o di arrivo è un ostacolo');
    }

    // 3. Calcolo Costo in Token
    const totalCells = rows * cols;
    const tokenCost = CostFactory.calculate(OperationType.CREATION, totalCells);

    const transaction = await sequelize.transaction();

    try {
      // 4. Gestione Token (Specifica prof: 401 se terminati)
      const user = await UserDAO.findById(userId, transaction);
      if (!user) throw new NotFoundError('Utente non trovato');
      
      if (user.tokenBalance < tokenCost) {
        // La traccia chiede specificamente 401 Unauthorized se i token sono finiti
        throw new UnauthorizedError('Token terminati: credito insufficiente per l\'esecuzione');
      }

      await UserDAO.deductTokens(userId, tokenCost, transaction);

      // --- INIZIO LOGICA DI ESECUZIONE MODELLO ---
      // Usiamo performance.now() per la precisione millimetrica richiesta
      const startTime = performance.now();

      const astarInstance = new AStarFinder({
        grid: { matrix },
        diagonalAllowed: false, 
        heuristic: 'Manhattan'  
      });

      const rawPath = astarInstance.findPath(
        { x: start[1], y: start[0] }, 
        { x: end[1], y: end[0] }
      );

      const endTime = performance.now();
      // --- FINE LOGICA DI ESECUZIONE MODELLO ---

      // 5. Gestione Risultato e Costo Percorso
      if (rawPath.length === 0 && !(start[0] === end[0] && start[1] === end[1])) {
        await transaction.rollback(); 
        throw new NotFoundError('Percorso non trovato: la destinazione è irraggiungibile');
      }

      // Calcolo del costo ottimo sul grafo (numero di passi)
      // Se start == end, il costo è 0, altrimenti è il numero di celle nel percorso meno la partenza
      const pathWeight = rawPath.length > 0 ? rawPath.length - 1 : 0;
      
      // Calcolo tempo impiegato in millisecondi
      const executionTime = parseFloat((endTime - startTime).toFixed(4));

      const formattedPath = PathHelper.formatPathForClient(rawPath);

      await transaction.commit();

      const updatedUser = await UserDAO.findById(userId);

      // Pulizia del saldo
      const cleanBalance = updatedUser ? Math.round(updatedUser.tokenBalance * 100) / 100 : 0;

      return {
        path: formattedPath,
        pathCost: pathWeight,        // Richiesto: costo ottimo sul grafo
        executionTimeMs: executionTime, // Richiesto: tempo impiegato per l'esecuzione
        tokenCostApplied: tokenCost,    // Per trasparenza nel JSON
        remainingBalance: cleanBalance,
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