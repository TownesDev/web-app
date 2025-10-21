import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from '@/lib/auth'

// Mock the client module to avoid Sanity dependencies
jest.mock('@/lib/client', () => ({
  sanityWrite: jest.fn(),
}))

describe('auth', () => {
  describe('hashPassword', () => {
    it('hashes password correctly', async () => {
      const password = 'testpassword'
      const hash = await hashPassword(password)
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(typeof hash).toBe('string')
    })

    it('generates different hashes for same password', async () => {
      const password = 'testpassword'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('verifies correct password', async () => {
      const password = 'testpassword'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('rejects incorrect password', async () => {
      const password = 'testpassword'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('wrongpassword', hash)
      expect(isValid).toBe(false)
    })
  })

  describe('generateToken and verifyToken', () => {
    it('generates and verifies token correctly', () => {
      const user = { id: '123', email: 'test@example.com', name: 'Test User' }
      const token = generateToken(user)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const decoded = verifyToken(token)
      expect(decoded).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      })
    })

    it('returns null for invalid token', () => {
      const decoded = verifyToken('invalid-token')
      expect(decoded).toBeNull()
    })
  })
})
