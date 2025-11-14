import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Basic test for onboarding success page structure
 * Note: Full integration testing is done via E2E tests
 */

describe('Onboarding Success Page', () => {
  it('exists and exports a default component', async () => {
    const pageModule = await import('../page')
    expect(pageModule.default).toBeDefined()
    expect(typeof pageModule.default).toBe('function')
  })

  it('page file structure matches Next.js requirements', () => {
    // Verify the file exists and is a proper Next.js page
    const pagePath = join(__dirname, '../page.tsx')
    
    expect(existsSync(pagePath)).toBe(true)
    
    const content = readFileSync(pagePath, 'utf-8')
    
    // Verify it has required Next.js patterns
    expect(content).toContain('export default')
    expect(content).toContain('searchParams')
    expect(content).toContain('session_id')
  })

  it('imports necessary dependencies', () => {
    const pagePath = join(__dirname, '../page.tsx')
    const content = readFileSync(pagePath, 'utf-8')
    
    // Check for required imports
    expect(content).toContain("from 'react'")
    expect(content).toContain("from 'next/navigation'")
    expect(content).toContain("from 'next/link'")
  })
})
