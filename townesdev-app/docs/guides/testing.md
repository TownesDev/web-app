# Testing Guide

## Overview

TownesDev uses a comprehensive testing strategy with unit tests (Jest) and end-to-end tests (Playwright) to ensure platform reliability and quality.

## Testing Stack

- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end browser testing
- **TypeScript** - Type safety in tests

## Running Tests

### Unit Tests

Run Jest unit tests:

```bash
npm test                    # Run all unit tests
npm run test:watch         # Run in watch mode
npm run test:coverage      # Run with coverage report
```

### End-to-End Tests

Run Playwright E2E tests:

```bash
npm run test:e2e           # Run all E2E tests
npm run test:e2e:headed    # Run with browser visible
npm run test:e2e:debug     # Run in debug mode
```

### Test Coverage

Generate coverage reports:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

**Coverage Targets:**

- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## Test Structure

### Unit Tests

Unit tests are located alongside source files:

```
src/
├── queries/
│   ├── clients.ts
│   └── clients.test.ts     # Unit test
├── lib/
│   ├── auth.ts
│   └── auth.test.ts        # Unit test
└── components/
    ├── Header.tsx
    └── Header.test.tsx     # Component test
```

### E2E Tests

E2E tests are in the `e2e/` directory:

```
e2e/
├── smoke.spec.ts           # Basic functionality
├── auth.spec.ts           # Authentication flows
├── portal.spec.ts         # Client portal features
├── admin.spec.ts          # Admin functionality
└── maintenance.spec.ts    # System maintenance
```

## Writing Tests

### Unit Test Example

```typescript
// src/queries/clients.test.ts
import { qClientsByStatus } from './clients'

describe('Client Queries', () => {
  it('should filter clients by status', () => {
    const query = qClientsByStatus
    expect(query).toContain('status==$status')
  })
})
```

### Component Test Example

```typescript
// src/components/Header.test.tsx
import { render, screen } from '@testing-library/react'
import Header from './Header'

describe('Header Component', () => {
  it('renders navigation links', () => {
    render(<Header variant="portal" />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'TownesDev' })).toBeVisible()
})
```

## Test Configuration

### Jest Configuration

Configuration in `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
}
```

### Playwright Configuration

Configuration in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
})
```

## Testing Patterns

### Authentication Testing

Mock authentication in tests:

```typescript
import { jest } from '@jest/globals'
import * as auth from '../lib/auth'

jest.mock('../lib/auth')
const mockAuth = auth as jest.Mocked<typeof auth>

beforeEach(() => {
  mockAuth.getCurrentClient.mockResolvedValue({
    _id: 'client-1',
    name: 'Test Client',
    email: 'test@example.com',
  })
})
```

### API Testing

Mock Sanity queries:

```typescript
import { runQuery } from '../lib/client'

jest.mock('../lib/client')
const mockRunQuery = runQuery as jest.MockedFunction<typeof runQuery>

it('fetches client data', async () => {
  mockRunQuery.mockResolvedValue([{ _id: '1', name: 'Test' }])
  // Test component that uses the query
})
```

### Component Testing

Test user interactions:

```typescript
import { fireEvent, waitFor } from '@testing-library/react'

it('handles form submission', async () => {
  render(<ContactForm />)

  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' }
  })

  fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

## Continuous Integration

### GitHub Actions

Tests run automatically on PRs:

```yaml
# .github/workflows/ci.yml
- name: Run unit tests
  run: npm test -- --coverage

- name: Run E2E tests
  run: npm run test:e2e
```

### Test Requirements

All PRs must:

- Pass unit tests
- Pass E2E smoke tests
- Maintain coverage thresholds
- Pass TypeScript checks

## Testing Best Practices

### Unit Tests

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Mock external dependencies**
4. **Test edge cases and error conditions**
5. **Keep tests isolated and independent**

### E2E Tests

1. **Test critical user journeys**
2. **Use page object patterns for complex interactions**
3. **Test in multiple browsers**
4. **Include accessibility testing**
5. **Keep tests stable and reliable**

### General

1. **Write tests first (TDD) when possible**
2. **Maintain high test coverage**
3. **Review test failures carefully**
4. **Update tests when changing functionality**
5. **Document complex test scenarios**

## Debugging Tests

### Jest Debugging

Debug with Node.js inspector:

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging

Debug E2E tests:

```bash
npx playwright test --debug
npx playwright show-trace trace.zip
```

## Performance Testing

### Bundle Analysis

Test bundle size impact:

```bash
npm run build
npm run analyze
```

### Lighthouse Testing

Automated performance testing:

```bash
npm run lighthouse
```

## Accessibility Testing

### Automated A11y Tests

Include accessibility checks:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should not have accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing

Follow the [accessibility testing checklist](../ACCESSIBILITY_TESTING.md).

## Test Data Management

### Fixtures

Use test fixtures for consistent data:

```typescript
// e2e/fixtures/clients.ts
export const testClient = {
  _id: 'test-client-1',
  name: 'Test Client',
  email: 'test@example.com',
  status: 'Active',
}
```

### Database Seeding

Seed test data for E2E tests:

```typescript
import { sanity } from '../lib/client'

beforeAll(async () => {
  await sanity.create(testClient)
})

afterAll(async () => {
  await sanity.delete(testClient._id)
})
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout values
   - Check for unresolved promises
   - Verify network requests

2. **Flaky tests**
   - Add proper wait conditions
   - Check for race conditions
   - Ensure test isolation

3. **Coverage gaps**
   - Identify untested code paths
   - Add edge case tests
   - Test error conditions

### Debug Commands

```bash
# Verbose test output
npm test -- --verbose

# Run specific test file
npm test -- clients.test.ts

# Debug E2E test
npx playwright test --debug smoke.spec.ts
```
