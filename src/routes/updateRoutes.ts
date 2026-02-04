import { Router } from 'express';
import { UpdateController } from '../controllers/UpdateController';

const router = Router();

// Gestisce sia l'update diretto (owner) che la proposta (collaboratore)
router.post('/grid/:id', UpdateController.updateGrid);

// Tutte le richieste in sospeso per le griglie dell'utente loggato
// GET /api/updates/my-pending
router.get('/my-pending', UpdateController.getMyPendingRequests);

// Approva o Rigetta in modalità BULK
// POST /api/updates/bulk
router.post('/bulk', UpdateController.bulkAction);

// Verifica se un modello specifico ha richieste pending
// GET /api/updates/grid/:id/status
router.get('/grid/:id/status', UpdateController.getStatus);

// Elenco storico con filtri per data e stato
// GET /api/updates/grid/:id/history
router.get('/grid/:id/history', UpdateController.getHistory);

export default router;