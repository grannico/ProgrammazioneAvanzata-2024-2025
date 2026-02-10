import { PathfindingService } from '../src/services/PathfindingService';
import { UserDAO } from '../src/dao/UserDAO';
import { GridDAO } from '../src/dao/GridDAO';
import { UnauthorizedError } from '../src/errors/AppError';
import { sequelize } from '../src/config/database';

// Mock dei DAO e di Sequelize
jest.mock('../src/dao/UserDAO');
jest.mock('../src/dao/GridDAO');
jest.mock('../src/config/database', () => ({
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
  },
}));

describe('PathfindingService - findPath (Token Logic)', () => {
  
  const mockGrid = {
    id: 1,
    versions: [{ 
      id: 1, 
      versionNumber: 1, 
      data: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] // Griglia 3x3 (9 celle)
    }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Dovrebbe lanciare UnauthorizedError (401) se i token sono insufficienti', async () => {
    // 1. MOCK: Griglia trovata
    (GridDAO.findById as jest.Mock).mockResolvedValue(mockGrid);
    
    // 2. MOCK: Utente con SOLI 0.10 token (il costo per 9 celle a 0.05 è 0.45)
    (UserDAO.findById as jest.Mock).mockResolvedValue({ id: 1, tokenBalance: 0.10 });

    // 3. ESECUZIONE E VERIFICA
    await expect(
      PathfindingService.findPath(1, 1, [0, 0], [2, 2])
    ).rejects.toThrow(UnauthorizedError);

    // Verifichiamo che non sia mai stato chiamato lo scalo dei token
    expect(UserDAO.deductTokens).not.toHaveBeenCalled();
  });

  it('Dovrebbe permettere l\'esecuzione se i token sono sufficienti', async () => {
    (GridDAO.findById as jest.Mock).mockResolvedValue(mockGrid);
    (UserDAO.findById as jest.Mock).mockResolvedValue({ id: 1, tokenBalance: 10.0 });

    const result = await PathfindingService.findPath(1, 1, [0, 0], [2, 2]);

    // VERIFICHE
    expect(result).toHaveProperty('path');
    expect(result.tokenCostApplied).toBe(0.45); // 9 celle * 0.05
    expect(UserDAO.deductTokens).toHaveBeenCalledWith(1, 0.45, expect.anything());
  });
});