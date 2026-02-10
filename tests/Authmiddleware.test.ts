import { isAuth } from '../src/middlewares/auth.middleware';
import { AuthHelper } from '../src/helpers/auth.helper';
import { UnauthorizedError } from '../src/errors/AppError';
import { Request, Response } from 'express';

// Mock dell'helper (il "finto" verificatore di token)
jest.mock('../src/helpers/auth.helper');

describe('AuthMiddleware - isAuth', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {};
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('Dovrebbe popolare req.user e chiamare next() se il token è valido', () => {
    // 1. Setup: Simuliamo un header corretto
    mockRequest.headers = { authorization: 'Bearer token-valido' };
    const mockUserData = { id: 1, email: 'test@test.it', role: 'USER' as const };
    
    // Configura l'helper per restituire i dati dell'utente
    (AuthHelper.verifyToken as jest.Mock).mockReturnValue(mockUserData);

    // 2. Esecuzione
    isAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    // 3. Verifiche
    expect(AuthHelper.verifyToken).toHaveBeenCalledWith('token-valido');
    expect(mockRequest.user).toEqual(mockUserData);
    expect(nextFunction).toHaveBeenCalledWith(); // Chiamato senza errori
  });

  it('Dovrebbe passare un UnauthorizedError a next() se il token manca', () => {
    // Header vuoto
    isAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(nextFunction.mock.calls[0][0].message).toBe('Token mancante');
  });

  it('Dovrebbe passare un UnauthorizedError a next() se il token non è valido', () => {
    // Header presente ma token che l'helper non riconosce (restituisce null)
    mockRequest.headers = { authorization: 'Bearer token-scaduto' };
    (AuthHelper.verifyToken as jest.Mock).mockReturnValue(null);

    isAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(nextFunction.mock.calls[0][0].message).toBe('Token non valido o scaduto');
  });

  it('Dovrebbe fallire se l\'header non inizia con Bearer', () => {
    mockRequest.headers = { authorization: 'Basic credentials123' };

    isAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});