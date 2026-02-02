import { Grid } from '../models/Grid';
import { GridVersion } from '../models/GridVersion';

export class GridDAO {
  /**
   * Crea la testata della griglia
   */
  public static async create(name: string, creatorId: number, transaction?: any) {
    // Nota: ho usato creatorId (d minuscola) per coerenza con gli altri DAO
    return await Grid.create({ name, creatorId }, { transaction });
  }

  /**
   * Recupera tutte le griglie (per la lista)
   */
  public static async findAll() {
    return await Grid.findAll({
      // Possiamo includere l'ultima versione o solo i dati base
      include: [{ 
        model: GridVersion, 
        as: 'versions',
        attributes: ['versionNumber', 'createdAt'] // Non carichiamo le matrici pesanti qui
      }]
    });
  }

  /**
   * Cerca una griglia per ID con tutte le sue versioni
   */
  public static async findById(id: number, transaction?: any) {
    return await Grid.findByPk(id, {
      include: [{ 
        model: GridVersion, 
        as: 'versions' 
      }],
      order: [
        [{ model: GridVersion, as: 'versions' }, 'versionNumber', 'ASC']
      ],
      transaction
    });
  }

  /**
   * Crea una nuova versione per una griglia esistente
   */
  public static async createVersion(gridId: number, versionNumber: number, data: any, transaction?: any) {
    return await GridVersion.create({
      gridId,
      versionNumber,
      data
    }, { transaction });
  }
}