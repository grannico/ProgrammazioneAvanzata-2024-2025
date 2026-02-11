import { PathfindingService } from '../src/services/PathfindingService';
import { UserDAO } from '../src/dao/UserDAO';
import { GridDAO } from '../src/dao/GridDAO';
import { BadRequestError, UnauthorizedError } from '../src/errors/AppError';
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

describe('PathfindingService - Logica Token, Ostacoli e Limiti', () => {
  
  const mockGrid = {
    id: 1,
    versions: [{ 
      id: 1, 
      versionNumber: 1, 
      data: [
        [0, 1, 0], // Ostacolo in [0, 1]
        [0, 0, 0],
        [0, 0, 0]
      ] 
    }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (GridDAO.findById as jest.Mock).mockResolvedValue(mockGrid);
  });

  // --- 1. TEST LOGICA TOKEN (Sempre necessari) ---
  it('Dovrebbe lanciare UnauthorizedError (401) se i token sono insufficienti', async () => {
    (UserDAO.findById as jest.Mock).mockResolvedValue({ id: 1, tokenBalance: 0.10 });

    await expect(
      PathfindingService.findPath(1, 1, [0, 0], [2, 2])
    ).rejects.toThrow(UnauthorizedError);

    expect(UserDAO.deductTokens).not.toHaveBeenCalled();
  });

  it('Dovrebbe scalare i token correttamente se il saldo è sufficiente', async () => {
    (UserDAO.findById as jest.Mock).mockResolvedValue({ id: 1, tokenBalance: 10.0 });

    const result = await PathfindingService.findPath(1, 1, [0, 0], [2, 2]);

    expect(result.tokenCostApplied).toBe(0.45); // 9 celle * 0.05
    expect(UserDAO.deductTokens).toHaveBeenCalledWith(1, 0.45, expect.anything());
  });

  // --- 2. TEST OSTACOLI (Richiesta Prof) ---
  it('Dovrebbe fallire se il punto di partenza o di arrivo è un ostacolo', async () => {
    (UserDAO.findById as jest.Mock).mockResolvedValue({ id: 1, tokenBalance: 100.0 });

    await expect(
      PathfindingService.findPath(1, 1, [0, 1], [2, 2]) // [0, 1] è un muro nel mock
    ).rejects.toThrow('Il punto di partenza o di arrivo è un ostacolo');
  });

  // --- 3. TEST LIMITI E INDICI NEGATIVI (Richiesta Prof) ---
  it('Dovrebbe fallire se si inserisce un indice negativo', async () => {
    (UserDAO.findById as jest.Mock).mockResolvedValue({ id: 1, tokenBalance: 100.0 });

    await expect(
      PathfindingService.findPath(1, 1, [-1, 0], [2, 2])
    ).rejects.toThrow(/fuori dai limiti/);
  });

  it('Dovrebbe fallire se le coordinate sono oltre i confini della griglia', async () => {
    (UserDAO.findById as jest.Mock).mockResolvedValue({ id: 1, tokenBalance: 100.0 });

    await expect(
      PathfindingService.findPath(1, 1, [0, 0], [3, 3]) // Griglia 3x3, indice 3 è out
    ).rejects.toThrow(/fuori dai limiti/);
  });
});