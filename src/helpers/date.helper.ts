import { BadRequestError } from '../errors/AppError';

export class DateHelper {
  
  /**
   * Converte una stringa GG/MM/AAAA in un oggetto Date di JS
   */
  public static parseItalianDate(dateStr: string): Date {
    // Regex per verificare il formato GG/MM/AAAA
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);

    if (!match) {
      throw new BadRequestError(`Formato data non valido: ${dateStr}. Usa GG/MM/AAAA`);
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // I mesi in JS vanno da 0 a 11
    const year = parseInt(match[3], 10);

    const date = new Date(year, month, day);

    // Verifica se la data è semanticamente valida (es. no 31/02)
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      throw new BadRequestError(`Data inesistente: ${dateStr}`);
    }

    return date;
  }

  /**
   * Valida che il range di date sia logicamente corretto
   */
  public static validateRange(startDate?: string, endDate?: string): { start?: Date, end?: Date } {
    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) start = this.parseItalianDate(startDate);
    if (endDate) end = this.parseItalianDate(endDate);

    if (start && end && start > end) {
      throw new BadRequestError('La data di inizio non può essere successiva alla data di fine');
    }

    return { start, end };
  }
}