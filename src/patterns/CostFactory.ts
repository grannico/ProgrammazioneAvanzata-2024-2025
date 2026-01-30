export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  EXECUTE = 'EXECUTE'
}

export class CostFactory {
  /**
   * Restituisce il costo per cella in base al tipo di operazione.
   * Pattern: Factory Method (variante semplice)
   */
  private static getRate(type: OperationType): number {
    switch (type) {
      case OperationType.CREATE:
        return 0.05;
      case OperationType.UPDATE:
        return 0.35;
      case OperationType.EXECUTE:
        return 0.05;
      default:
        throw new Error('Tipo di operazione non riconosciuto');
    }
  }

  /**
   * Calcola il costo totale arrotondato a 2 decimali.
   */
  public static calculate(type: OperationType, cellCount: number): number {
    const rate = this.getRate(type);
    return parseFloat((rate * cellCount).toFixed(2));
  }
}