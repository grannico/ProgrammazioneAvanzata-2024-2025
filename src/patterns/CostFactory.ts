// src/patterns/CostFactory.ts

export enum OperationType {
  CREATION = 'CREATION',
  UPDATE = 'UPDATE',
  EXECUTION = 'EXECUTION'
}

export class CostFactory {
  // Definiamo i costi come da specifiche
  private static readonly RATES = {
    [OperationType.CREATION]: 0.05, // 0.05 * numero celle
    [OperationType.UPDATE]: 0.35,   // 0.35 per cella aggiornata
    [OperationType.EXECUTION]: 0.05 // Costa come la creazione
  };

  /**
   * Calcola il costo totale di un'operazione
   * @param type Tipo di operazione (CREATION, UPDATE, EXECUTION)
   * @param units Numero di unità (celle totali o celle modificate)
   */
  public static calculate(type: OperationType, units: number): number {
    const rate = this.RATES[type];
    // Arrotondiamo a 2 decimali per evitare problemi di precisione dei float
    return Math.round((units * rate) * 100) / 100;
  }
}