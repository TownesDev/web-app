import { getAllClients } from '../clients'
import { runQueryNoCache } from '../../lib/client'

// Mock the client module
jest.mock('../../lib/client', () => ({
  runQueryNoCache: jest.fn(),
}))

const mockRunQueryNoCache = runQueryNoCache as jest.MockedFunction<typeof runQueryNoCache>

describe('clients queries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllClients', () => {
    it('calls runQueryNoCache with correct query', async () => {
      const mockClients = [
        {
          _id: '1',
          name: 'Test Client',
          email: 'test@example.com',
          selectedPlan: { name: 'Bronze', price: '150' }
        }
      ]
      mockRunQueryNoCache.mockResolvedValue(mockClients)

      const result = await getAllClients()

      expect(mockRunQueryNoCache).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockClients)
    })

    it('handles empty results', async () => {
      mockRunQueryNoCache.mockResolvedValue([])

      const result = await getAllClients()

      expect(result).toEqual([])
    })

    it('propagates errors from runQueryNoCache', async () => {
      const error = new Error('Query failed')
      mockRunQueryNoCache.mockRejectedValue(error)

      await expect(getAllClients()).rejects.toThrow('Query failed')
    })
  })
})