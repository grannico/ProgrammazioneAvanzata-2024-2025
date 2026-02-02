import { UpdateRequest } from '../models/UpdateRequest';
import { User } from '../models/User';

export class UpdateDAO {
  /**
   * Crea una nuova richiesta di modifica cella
   */
  public static async createRequest(data: any, transaction?: any) {
    return await UpdateRequest.create(data, { transaction });
  }

  /**
   * Trova una richiesta specifica per ID
   */
  public static async findById(id: number) {
    return await UpdateRequest.findByPk(id);
  }

  /**
   * Recupera tutte le richieste PENDING per una specifica griglia
   * Utile per il proprietario che deve revisionarle
   */
  public static async findPendingByGrid(gridId: number) {
    return await UpdateRequest.findAll({
      where: { gridId, status: 'PENDING' },
      include: [{ model: User, as: 'requester', attributes: ['email'] }]
    });
  }

  /**
   * Aggiorna lo stato di una richiesta (ACCEPTED / REJECTED)
   */
  public static async updateStatus(id: number, status: 'ACCEPTED' | 'REJECTED', transaction?: any) {
    return await UpdateRequest.update({ status }, { where: { id }, transaction });
  }
}