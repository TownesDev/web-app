import { getIncidentsByClient, getAllIncidents } from '../incidents'
import { runQueryNoCache } from '../../lib/client'

// Mock the client module
jest.mock('../../lib/client', () => ({
  runQueryNoCache: jest.fn(),
}))

const mockRunQueryNoCache = runQueryNoCache as jest.MockedFunction<typeof runQueryNoCache>

describe('incidents queries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getIncidentsByClient', () => {
    it('calls runQueryNoCache with clientId parameter', async () => {
      const clientId = 'client-123'
      const mockIncidents = [
        {
          _id: 'incident-1',
          title: 'Server Down',
          priority: 'high',
          status: 'resolved',
          reportedAt: '2024-01-01T10:00:00Z'
        }
      ]
      mockRunQueryNoCache.mockResolvedValue(mockIncidents)

      const result = await getIncidentsByClient(clientId)

      expect(mockRunQueryNoCache).toHaveBeenCalledWith(
        expect.any(String), // qIncidentsByClient query
        { clientId }
      )
      expect(result).toEqual(mockIncidents)
    })

    it('handles empty results for client with no incidents', async () => {
      mockRunQueryNoCache.mockResolvedValue([])

      const result = await getIncidentsByClient('client-no-incidents')

      expect(result).toEqual([])
    })
  })

  describe('getAllIncidents', () => {
    it('calls runQueryNoCache for all incidents', async () => {
      const mockIncidents = [
        {
          _id: 'incident-1',
          title: 'Database Slow',
          priority: 'medium',
          status: 'investigating',
          reportedAt: '2024-01-01T10:00:00Z',
          client: { name: 'Client A', _id: 'client-1' }
        },
        {
          _id: 'incident-2',
          title: 'Feature Request',
          priority: 'low',
          status: 'planned',
          reportedAt: '2024-01-02T15:30:00Z',
          client: { name: 'Client B', _id: 'client-2' }
        }
      ]
      mockRunQueryNoCache.mockResolvedValue(mockIncidents)

      const result = await getAllIncidents()

      expect(mockRunQueryNoCache).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockIncidents)
    })

    it('handles query failures gracefully', async () => {
      const error = new Error('Sanity query timeout')
      mockRunQueryNoCache.mockRejectedValue(error)

      await expect(getAllIncidents()).rejects.toThrow('Sanity query timeout')
    })
  })
})