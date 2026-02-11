import { CollaborationRequestService } from '../src/services/CollaborationRequestService'; // Rinominato da UpdateService
import { GridDAO } from '../src/dao/GridDAO';
import { CollaborationRequestDAO } from '../src/dao/CollaborationRequestDAO'; // Rinominato da UpdateDAO
import { UserDAO } from '../src/dao/UserDAO';
import { sequelize } from '../src/config/database';

// 1. MOCK DEI DAO E DI SEQUELIZE
// Diciamo a Jest di sostituire i moduli reali con versioni "finte"
jest.mock('../src/dao/GridDAO');
jest.mock('../src/dao/CollaborationRequestDAO'); // Aggiornato riferimento
jest.mock('../src/dao/UserDAO');
jest.mock('../src/config/database', () => ({
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
  },
}));

describe('CollaborationRequestService - proposeOrUpdate', () => { // Nome aggiornato
  
  // Dati di esempio per i test
  const mockGrid = {
    id: 1,
    creatorId: 10, // L'ID del proprietario è 10
    versions: [{ id: 1, data: [[0, 0], [0, 0]], versionNumber: 1 }]
  };

  const mockUser = {
    id: 10,
    tokenBalance: 100
  };

  const newData = [[1, 0], [0, 0]]; // Una modifica rispetto alla v1

  beforeEach(() => {
    jest.clearAllMocks(); // Pulisce i test precedenti
  });

  // --- TEST CASO A: IL CREATORE AGGIORNA ---
  it('Dovrebbe aggiornare immediatamente se l\'utente è il CREATORE', async () => {
    // Configuriamo i Mock per questo specifico test
    (GridDAO.findById as jest.Mock).mockResolvedValue(mockGrid);
    (UserDAO.findById as jest.Mock).mockResolvedValue(mockUser);
    (UserDAO.findById as jest.Mock).mockResolvedValueOnce(mockUser) // Per il primo controllo
                                   .mockResolvedValueOnce({ ...mockUser, tokenBalance: 90 }); // Per il bilancio finale

    const result = await CollaborationRequestService.proposeOrUpdate(10, 1, newData); // Usiamo CollaborationRequestService

    // VERIFICHE:
    expect(result.status).toBe('UPDATED');
    expect(GridDAO.createVersion).toHaveBeenCalled(); // Verifichiamo che sia stata creata una versione
    expect(CollaborationRequestDAO.createRequest).not.toHaveBeenCalled(); // Non deve creare una richiesta pendente
  });

  // --- TEST CASO B: UN COLLABORATORE AGGIORNA ---
  it('Dovrebbe creare una richiesta PENDING se l\'utente è un COLLABORATORE', async () => {
    // Configuriamo i Mock: l'utente loggato è il 20, ma il creatore della griglia è il 10
    (GridDAO.findById as jest.Mock).mockResolvedValue(mockGrid);
    (UserDAO.findById as jest.Mock).mockResolvedValue({ id: 20, tokenBalance: 100 });

    const result = await CollaborationRequestService.proposeOrUpdate(20, 1, newData); // Usiamo CollaborationRequestService

    // VERIFICHE:
    expect(result.status).toBe('PENDING_APPROVAL');
    expect(CollaborationRequestDAO.createRequest).toHaveBeenCalled(); // Deve creare la richiesta
    expect(GridDAO.createVersion).not.toHaveBeenCalled(); // NON deve creare la versione subito
  });
});