import { BadRequestError } from '../errors/AppError';

export class GridHelper {
  /**
   * Verifica che la matrice sia coerente e valida (0 e 1)
   */
  public static validateStructure(data: any, rows: number, cols: number): void {
    // 1. Controllo base: è un array? ha il numero giusto di righe?
    if (!Array.isArray(data) || data.length !== rows) {
      throw new BadRequestError(`La matrice dati non è valida o non corrisponde alle ${rows} righe dichiarate.`);
    }

    for (let i = 0; i < data.length; i++) {
      const currentRow = data[i];

      // 2. Controllo colonne per ogni riga
      if (!Array.isArray(currentRow) || currentRow.length !== cols) {
        throw new BadRequestError(`Incoerenza alla riga ${i}: attese ${cols} colonne.`);
      }

      // 3. Controllo valori 
      for (let j = 0; j < currentRow.length; j++) {
        const cell = currentRow[j];
        if (cell !== 0 && cell !== 1) {
          throw new BadRequestError(`Valore non ammesso in [${i},${j}]: ${cell}. Usare solo 0 o 1.`);
        }
      }
    }
  }

  /**
   * Calcola il numero di differenze tra due matrici (per il costo degli update)
   */
  public static countDifferences(oldMatrix: number[][], newMatrix: number[][]): number {
    let differences = 0;
    for (let r = 0; r < oldMatrix.length; r++) {
      for (let c = 0; c < oldMatrix[r].length; c++) {
        if (oldMatrix[r][c] !== newMatrix[r][c]) {
          differences++;
        }
      }
    }
    return differences;
  }
}