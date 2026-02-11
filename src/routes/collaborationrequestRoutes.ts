import { Router } from 'express';
import { CollaborationRequestController } from '../controllers/CollaborationRequestController'; // Rinominato da UpdateController

const router = Router();

// Gestisce sia l'update diretto (owner) che la proposta di collaborazione (collaboratore)
router.post('/grid/:id', CollaborationRequestController.updateGrid);

// Tutte le richieste di collaborazione in sospeso per le griglie dell'utente loggato
// GET /api/collaboration-requests/my-pending
router.get('/my-pending', CollaborationRequestController.getMyPendingRequests);

// Approva o Rigetta le richieste di collaborazione in modalità BULK
// POST /api/collaboration-requests/bulk
router.post('/bulk', CollaborationRequestController.bulkAction);

// Verifica se un modello specifico ha richieste di collaborazione pending
// GET /api/collaboration-requests/grid/:id/status
router.get('/grid/:id/status', CollaborationRequestController.getStatus);

// Elenco storico delle richieste di collaborazione con filtri per data e stato
// GET /api/collaboration-requests/grid/:id/history
router.get('/grid/:id/history', CollaborationRequestController.getHistory);

export default router;