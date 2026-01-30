// src/controllers/GridController.ts
import { Request, Response, NextFunction } from 'express';
import { GridService } from '../services/GridService';
import { AppError } from '../errors/AppError';

export class GridController {
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, rows, cols, data } = req.body;

      if (!name || typeof name !== 'string') {
        throw new AppError('Il nome della griglia è obbligatorio', 400);
      }

      if (!rows || !cols || rows <= 0 || cols <= 0) {
        throw new AppError('Le dimensioni della griglia devono essere numeri positivi', 400);
      }

      // Validiamo che i dati (la matrice) esistano e corrispondano alle dimensioni
      if (!Array.isArray(data) || data.length !== rows) {
        throw new AppError('I dati della griglia non corrispondono al numero di righe specificato', 400);
      }

      // Estraiamo l'ID dell'utente dal token (iniettato dal middleware isAuth)
      const userId = req.user!.id;

      // Chiamata al Service per la logica di business e calcolo costi
      const result = await GridService.createGrid(userId, name, rows, cols, data);

      res.status(201).json({
        message: 'Modello creato con successo e token addebitati',
        details: {
          gridId: result.gridId,
          cost: result.cost,
          remainingBalance: result.remainingBalance
        }
      });
    } catch (error) {
      next(error); // Passa l'errore (incluso il 401 se i token sono finiti) al middleware globale
    }
  }
}