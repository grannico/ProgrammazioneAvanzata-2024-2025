import { BadRequestError } from '../errors/AppError';

export class PathHelper {
  /**
   * Verifica che le coordinate siano entro i limiti della griglia
   */
  public static validateBounds(point: [number, number], rows: number, cols: number, label: string): void {
    const [r, c] = point;
    if (r < 0 || r >= rows || c < 0 || c >= cols) {
      throw new BadRequestError(`Coordinate di ${label} [${r}, ${c}] fuori dai limiti (${rows}x${cols}).`);
    }
  }

  /**
   * Verifica se un punto è un ostacolo
   */
  public static isObstacle(point: [number, number], matrix: number[][]): boolean {
    return matrix[point[0]][point[1]] === 1;
  }

  /**
   * Converte il percorso da formato libreria [x, y] a formato nostro [riga, colonna]
   */
  public static formatPathForClient(path: number[][]): number[][] {
    return path.map(([x, y]) => [y, x]);
  }
}