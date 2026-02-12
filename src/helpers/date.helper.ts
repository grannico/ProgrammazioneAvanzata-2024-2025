import { BadRequestError } from '../errors/AppError';

export class DateHelper {
  
  /**
   * Converte una stringa GG/MM/AAAA o GG-MM-AAAA in un oggetto Date di JS
   */
  public static parseItalianDate(dateStr: string): Date {
    // Regex aggiornata: [/-] permette sia la slash che il trattino come separatore
    const regex = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
    const match = dateStr.match(regex);

    if (!match) {
      // Se non combacia, diamo un errore che suggerisce entrambi i formati
      throw new BadRequestError(`Formato data non valido: ${dateStr}. Usa GG/MM/AAAA oppure GG-MM-AAAA`);
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; 
    const year = parseInt(match[3], 10);

    const date = new Date(year, month, day);

    // Verifica semantica (es. no 31/02)
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