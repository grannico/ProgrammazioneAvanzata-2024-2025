import { CollaborationRequest } from '../models/CollaborationRequest';
import { Grid } from '../models/Grid';
import { Op } from 'sequelize';

export class CollaborationRequestDAO { // Rinominato da UpdateDAO

  /**
   * SALVATAGGIO NUOVA PROPOSTA (Metodo necessario per CollaborationRequestService)
   */
  public static async createRequest(data: any, transaction?: any) {
    return await CollaborationRequest.create(data, { transaction });
  }

  /**
   * Recupera aggiornamenti filtrati per GRID, STATO e DATE
   */
  public static async findByGridWithFilters(
    gridId: number, 
    status?: string | string[], 
    startDate?: Date, // Accettiamo Date già processate dall'helper
    endDate?: Date
  ) {
    const whereCondition: any = { gridId };

    // Filtro per stato (Accettato/Rigettato)
    if (status) {
      // Sequelize gestirà automaticamente:
      // - Se stringa: WHERE status = 'ACCEPTED'
      // - Se array: WHERE status IN ('ACCEPTED', 'PENDING')
      whereCondition.status = status;
    }

    // Filtro per data (inferiore, superiore, compresa)
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) {
        whereCondition.createdAt[Op.gte] = startDate; 
      }
      if (endDate) {
        // Creiamo una nuova istanza della data per non modificare l'originale
        const endOfRange = new Date(endDate);
        // Impostiamo l'orario alla fine del giorno (23:59:59.999)
        // per includere tutte le modifiche avvenute durante la giornata
        endOfRange.setHours(23, 59, 59, 999);
        
        whereCondition.createdAt[Op.lte] = endOfRange;   
      }
    }

    return await CollaborationRequest.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Verifica se esiste almeno una richiesta PENDING per una griglia
   */
  public static async hasPendingRequests(gridId: number): Promise<boolean> {
    const count = await CollaborationRequest.count({
      where: {
        gridId,
        status: 'PENDING'
      }
    });
    return count > 0;
  }

  /**
   * Tutte le richieste PENDING per i modelli di un certo PROPRIETARIO
   */
  public static async findPendingByOwner(ownerId: number) {
    return await CollaborationRequest.findAll({
      where: { status: 'PENDING' },
      include: [{
        model: Grid,
        as: 'grid',
        where: { creatorId: ownerId } // Filtriamo le griglie che appartengono all'utente
      }],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Aggiornamento in BULK di più richieste (Approva/Rigetta)
   */
  public static async bulkUpdateStatus(ids: number[], newStatus: 'ACCEPTED' | 'REJECTED', transaction?: any) {
    return await CollaborationRequest.update(
      { status: newStatus },
      { 
        where: { id: ids },
        transaction 
      }
    );
  }

  /**
   * Trova richieste specifiche per ID (utile per validazione prima del bulk)
   */
  public static async findByIds(ids: number[]) {
    return await CollaborationRequest.findAll({
      where: { id: ids },
      include: ['grid'] // Includiamo la griglia per controllare il proprietario nel Service
    });
  }

  /**
   * Aggiornamento status singola richiesta (utile per il loop di approvazione)
   */
  public static async updateStatus(id: number, status: string, transaction?: any) {
    return await CollaborationRequest.update({ status }, { where: { id }, transaction });
  }
}