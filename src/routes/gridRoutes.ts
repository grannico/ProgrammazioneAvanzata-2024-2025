import { Router } from 'express';
import { GridController } from '../controllers/GridController';
import { PathfindingController } from '../controllers/PathfindingController';

const router = Router();

/**
 * --- LETTURA (GET) ---
 * Nota: isAuth è già applicato in app.ts per il prefisso /api/grids
 */

// 1. Lista di tutte le griglie (Sommario)
router.get('/', GridController.list);

// 2. Dettagli di una singola griglia (Matrice e Versioni)
router.get('/:id', GridController.show);

/**
 * --- AZIONI E CREAZIONE (POST) ---
 */

// 3. Creazione di una nuova griglia (Costo: 0.05 * celle)
router.post('/', GridController.create);

// 4. Aggiornamento o proposta di modifica (Costo: 0.35 * celle modificate)
router.post('/:id/update', GridController.updateGrid);

// 5. Calcolo del percorso A* (Costo: 0.05 * celle totali)
router.post('/:id/path', PathfindingController.calculate);

/**
 * --- COLLABORAZIONE (PATCH) ---
 */

// 6. Approvazione di una modifica (Solo proprietario)
router.patch('/requests/:requestId/approve', GridController.approveRequest);

export default router;