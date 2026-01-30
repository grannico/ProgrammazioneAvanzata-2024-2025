// La base per tutti i nostri errori
export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errore per conflitti (es: email duplicata) -> 409
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// Errore per mancanza autorizzazione (es: login fallito) -> 401
export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}