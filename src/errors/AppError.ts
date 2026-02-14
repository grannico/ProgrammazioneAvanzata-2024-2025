export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 - Bad Request: Usalo per le coordinate fuori limite o dati invalidi
export class BadRequestError extends AppError {
  constructor(message: string = 'Richiesta non valida') {
    super(message, 400);
  }
}

// 401 - Unauthorized: Login fallito o token JWT mancante/scaduto
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autenticato') {
    super(message, 401);
  }
}

// 402 - Payment Required: PERFETTO per quando finiscono i token!
export class PaymentRequiredError extends AppError {
  constructor(message: string = 'Token insufficienti per questa operazione') {
    super(message, 402);
  }
}

// 403 - Forbidden: Quando un User prova a fare cose da Admin (o viceversa)
export class ForbiddenError extends AppError {
  constructor(message: string = 'Non hai i permessi per questa azione') {
    super(message, 403);
  }
}

// 404 - Not Found: Griglia non trovata, percorso non trovato o utente inesistente
export class NotFoundError extends AppError {
  constructor(message: string = 'Risorsa non trovata') {
    super(message, 404);
  }
}

// 409 - Conflict: Email già usata o conflitto di versione della griglia
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// 500 - Internal Server Error: Errori di configurazione o problemi generici del server
export class InternalServerError extends AppError {
  constructor(message: string = 'Errore interno del server') {
    super(message, 500);
  }
}