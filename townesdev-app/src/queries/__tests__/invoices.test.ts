import { getInvoicesByClient, getAllInvoices } from '../invoices'
import { runQueryNoCache } from '../../lib/client'

// Mock the client module
jest.mock('../../lib/client', () => ({
  runQueryNoCache: jest.fn(),
}))

const mockRunQueryNoCache = runQueryNoCache as jest.MockedFunction<typeof runQueryNoCache>

describe('invoices queries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getInvoicesByClient', () => {
    it('calls runQueryNoCache with clientId parameter', async () => {
      const clientId = 'client-123'
      const mockInvoices = [
        {
          _id: 'invoice-1',
          issueDate: '2024-01-01',
          amount: 150,
          status: 'paid'
        }
      ]
      mockRunQueryNoCache.mockResolvedValue(mockInvoices)

      const result = await getInvoicesByClient(clientId)

      expect(mockRunQueryNoCache).toHaveBeenCalledWith(
        expect.any(String), // qInvoicesByClient query
        { clientId }
      )
      expect(result).toEqual(mockInvoices)
    })

    it('handles empty results for client', async () => {
      mockRunQueryNoCache.mockResolvedValue([])

      const result = await getInvoicesByClient('nonexistent-client')

      expect(result).toEqual([])
    })
  })

  describe('getAllInvoices', () => {
    it('calls runQueryNoCache for all invoices', async () => {
      const mockInvoices = [
        {
          _id: 'invoice-1',
          issueDate: '2024-01-01',
          amount: 150,
          status: 'paid',
          client: { name: 'Client A' }
        },
        {
          _id: 'invoice-2',
          issueDate: '2024-01-02',
          amount: 200,
          status: 'pending',
          client: { name: 'Client B' }
        }
      ]
      mockRunQueryNoCache.mockResolvedValue(mockInvoices)

      const result = await getAllInvoices()

      expect(mockRunQueryNoCache).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockInvoices)
    })

    it('propagates query errors', async () => {
      const error = new Error('Database connection failed')
      mockRunQueryNoCache.mockRejectedValue(error)

      await expect(getAllInvoices()).rejects.toThrow('Database connection failed')
    })
  })
})