---
name: Townesdev-agent
description: An agent for TownesDev
---

# AI Agent Guidelines for TownesDev

**Last Updated**: November 4, 2025  
**Purpose**: Safe operation guidelines for AI coding agents working on TownesDev  
**Audience**: AI agents, solo developer, future maintainers

---

## Philosophy

TownesDev is designed to be maintained by a solo developer with AI coding agents for 30-40 years. This requires:

1. **Preserving the Source of Truth (SOT)** at all times
2. **Clear boundaries** for what agents can/can't modify
3. **Systematic verification** before merging agent code
4. **Documentation-first** approach to changes

**Golden Rule**: When in doubt, ask the human. Better to clarify than to break the SOT.

---

## Source of Truth (SOT) Hierarchy

### Level 1: Architecture Docs (NEVER modify without human review)

These define the system's core patterns and must be preserved:

- `docs/architecture/overview.md`
- `docs/architecture/route-groups.md`
- `docs/architecture/data-layer.md`
- `docs/architecture/caching.md`
- `docs/architecture/auth.md`
- `docs/architecture/payments.md`
- `.github/copilot-instructions.md`

**Agent Rule**: READ ONLY. If you need to change these, create a proposal doc instead.

### Level 2: Schema & Core Logic (Modify with caution)

Changes here can break the entire system:

- `src/sanity/schemaTypes/index.ts`
- `src/lib/client.ts`
- `src/lib/session.ts`
- `src/lib/auth.ts`
- `src/lib/rbac/guards.ts`
- `src/app/api/stripe/webhook/route.ts`

**Agent Rule**: Only modify if explicitly instructed. Always run full test suite before committing.

### Level 3: Features & UI (Safe to modify with tests)

These can be updated more freely:

- `src/app/(portal)/**/*` (client portal)
- `src/app/(admin)/**/*` (admin portal)
- `src/app/(public)/**/*` (public pages)
- `src/components/**/*` (UI components)
- `src/queries/**/*` (Sanity queries)

**Agent Rule**: Modify freely but follow standards. Add tests for new features.

### Level 4: Docs & Examples (Safest to modify)

Documentation and guides:

- `docs/guides/**/*`
- `docs/development/**/*`
- `docs/setup/**/*`
- `README.md` files

**Agent Rule**: Keep docs in sync with code. Update "Last Updated" dates.

---

## Safe Modification Zones

### ✅ GREEN ZONE: Safe for Agents

You can work independently in these areas:

1. **UI Components** (`src/components/**`)
   - Add new components
   - Improve accessibility
   - Fix styling issues
   - Add loading states

2. **Portal Pages** (`src/app/(portal)/**`)
   - Add new portal features
   - Improve UX
   - Fix bugs in existing pages

3. **Admin Pages** (`src/app/(admin)/**`)
   - Add admin tools
   - Improve admin UX
   - Add data visualizations

4. **Documentation** (`docs/**`)
   - Update guides
   - Add examples
   - Fix broken links
   - Improve clarity

5. **Tests** (`**/*.test.ts`, `**/*.spec.ts`)
   - Add new tests
   - Improve coverage
   - Fix flaky tests

**Requirements**:

- Follow existing patterns
- Add TypeScript types
- Include tests for new features
- Run `npm run typecheck` and `npm run lint`

### ⚠️ YELLOW ZONE: Modify with Verification

Need extra care, but agents can work here:

1. **API Routes** (`src/app/api/**`)
   - Must include error handling
   - Must add structured logging
   - Must include input validation (Zod)
   - Must update related docs

2. **Sanity Queries** (`src/queries/**`)
   - Must follow GROQ patterns
   - Must use type-safe helpers
   - Must document complex queries

3. **Utilities** (`src/lib/**`)
   - Must include unit tests
   - Must maintain backward compatibility
   - Must document breaking changes

**Verification Checklist**:

- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Manual testing in browser
- [ ] Documentation updated

### 🔴 RED ZONE: Human Review Required

These require explicit human approval:

1. **Architecture Changes**
   - Route group modifications
   - Auth/RBAC changes
   - Payment flow alterations
   - Caching strategy updates

2. **Schema Changes** (`src/sanity/schemaTypes/index.ts`)
   - Adding/removing document types
   - Changing field names
   - Altering validation rules

3. **Core Libraries**
   - `src/lib/client.ts` (Sanity client)
   - `src/lib/session.ts` (auth sessions)
   - `src/lib/stripe.ts` (payments)

4. **Environment/Config**
   - `.env.local` changes
   - `next.config.ts` modifications
   - `tsconfig.json` updates

5. **Dependencies**
   - Adding new npm packages
   - Upgrading major versions
   - Removing dependencies

**Process**:

1. Create proposal document in `docs/proposals/`
2. Explain rationale and alternatives
3. Outline migration path
4. Wait for human approval
5. Implement with full test coverage

---

## Agent Task Templates

### Template 1: Adding a New Feature

```markdown
## Feature: [Feature Name]

**Location**: `src/app/(portal)/app/[feature]/`
**Type**: Green Zone
**Estimated Time**: [X hours]

### Changes:

1. Create new route: `page.tsx`
2. Add components: `[ComponentName].tsx`
3. Create query: `src/queries/[feature].ts`
4. Add tests: `__tests__/[feature].test.ts`

### Checklist:

- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Accessibility verified

### Testing:

- Manual: [Steps to test]
- Automated: `npm test src/app/(portal)/app/[feature]`
```

### Template 2: Fixing a Bug

```markdown
## Bug Fix: [Bug Description]

**Location**: `[file path]`
**Type**: [Green/Yellow/Red] Zone
**Root Cause**: [Brief explanation]

### Changes:

1. [Change description]
2. [Change description]

### Testing:

- Reproduces bug: [Steps]
- Verifies fix: [Steps]
- Regression tests: [What else to check]

### Checklist:

- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Tests added to prevent regression
- [ ] Related code reviewed for similar issues
```

### Template 3: Documentation Update

```markdown
## Docs Update: [Topic]

**Files**: `docs/[path]`
**Type**: Green Zone
**Reason**: [Why updating]

### Changes:

1. Update: [What's changing]
2. Add: [What's new]
3. Remove: [What's obsolete]

### Verification:

- [ ] Links work
- [ ] Code examples tested
- [ ] "Last Updated" date changed
- [ ] Cross-references updated
```

---

## Quality Gates

Before any agent-generated code is merged:

### Automated Checks (Required)

```bash
# Run all quality gates
npm run typecheck  # TypeScript compilation
npm run lint       # ESLint validation
npm run format     # Prettier formatting
npm test           # Unit tests
npm run test:e2e   # E2E tests (for significant changes)
npm run build      # Production build
```

**All must pass before merge.**

### Manual Checks (Human Responsibility)

- [ ] Code follows TownesDev patterns
- [ ] Changes align with architecture docs
- [ ] Security implications considered
- [ ] Performance impact acceptable
- [ ] Breaking changes documented
- [ ] Migration path provided (if needed)

---

## Common Agent Tasks

### Task: Add New Portal Page

**Zone**: ✅ Green  
**Process**:

1. Create route: `src/app/(portal)/app/[page]/page.tsx`
2. Add to sidebar: Update `src/components/ClientSidebar.tsx`
3. Create query (if needed): `src/queries/[resource].ts`
4. Add tests: `src/app/(portal)/app/[page]/__tests__/page.test.tsx`
5. Update docs: `docs/guides/portal-flow.md`

### Task: Add Sanity Query

**Zone**: ⚠️ Yellow  
**Process**:

1. Create in `src/queries/[resource].ts`
2. Use type-safe helpers from `src/lib/client.ts`
3. Add JSDoc comments
4. Export with proper TypeScript types
5. Add usage example in comments

```typescript
/**
 * Get all active clients with their assets
 * @returns Array of clients with populated asset references
 */
export const qActiveClientsWithAssets = `
  *[_type=="client" && status=="active"]{
    _id,
    name,
    email,
    "assets": *[_type=="serviceAsset" && references(^._id)]{
      _id,
      type,
      name,
      status
    }
  }
`
```

### Task: Fix TypeScript Error

**Zone**: ⚠️ Yellow  
**Process**:

1. Run `npm run typecheck` to identify error
2. Check `tsconfig.json` settings (strict mode enabled)
3. Fix with proper types (avoid `any`)
4. Verify no new errors introduced
5. Document complex type definitions

### Task: Update Environment Variable

**Zone**: 🔴 Red (requires human approval)  
**Process**:

1. Document new variable in `docs/setup/environment.md`
2. Add to `.env.example` with example value
3. Update runtime checks if required
4. Add to deployment checklist
5. Notify human for Vercel/production update

---

## Anti-Patterns to Avoid

### ❌ Don't Do This

1. **Ignoring TypeScript errors**

   ```typescript
   // @ts-ignore
   const data = await someFunction()
   ```

   Instead: Fix the types properly

2. **Using `any` type**

   ```typescript
   const data: any = await fetch()
   ```

   Instead: Define proper interface

3. **Skipping error handling**

   ```typescript
   const client = await runQuery(query)
   return client.name
   ```

   Instead: Handle null/undefined cases

4. **Modifying architecture docs directly**
   Instead: Create proposal in `docs/proposals/`

5. **Adding dependencies without review**
   Instead: Document need and get approval

6. **Hardcoding values**

   ```typescript
   if (planId === 'plan.base-retainer') {
   ```

   Instead: Use constants or env variables

7. **Bypassing RBAC**
   ```typescript
   // Directly accessing admin data without permission check
   ```
   Instead: Use `requireCapability()` guards

### ✅ Do This Instead

1. **Proper error handling**

   ```typescript
   try {
     const client = await runQuery(query)
     if (!client) {
       return { error: 'Client not found' }
     }
     return { data: client }
   } catch (error) {
     logError('client.fetch_failed', { error })
     return { error: 'Failed to fetch client' }
   }
   ```

2. **Type-safe queries**

   ```typescript
   interface Client {
     _id: string
     name: string
     email: string
   }

   const client = await runQuery<Client>(qClientById, { id })
   ```

3. **Documentation alongside code**
   ```typescript
   /**
    * Creates a new client with onboarding defaults.
    *
    * @param data - Client registration data
    * @returns Created client document
    * @throws {ValidationError} If data fails schema validation
    */
   export async function createClient(data: ClientInput): Promise<Client>
   ```

---

## Emergency Procedures

### If Agent Breaks Something

1. **Stop immediately** - Don't try to fix by making more changes
2. **Document what happened** - What change caused the issue?
3. **Revert changes** - Use git to restore working state
4. **Alert human** - Explain what broke and what was attempted
5. **Learn** - Update these guidelines to prevent recurrence

### If Tests Fail

1. **Don't bypass tests** - Failing tests indicate real problems
2. **Understand the failure** - Read error messages carefully
3. **Fix root cause** - Don't just make tests pass
4. **Add regression test** - Ensure it doesn't break again

### If Build Fails in Production

1. **Immediate rollback** - Revert to last known good version
2. **Test locally** - Reproduce build failure
3. **Fix with tests** - Ensure fix prevents recurrence
4. **Deploy with monitoring** - Watch for new issues

---

## Success Metrics for Agents

### Good Agent Work

- ✅ All tests pass
- ✅ TypeScript strict mode satisfied
- ✅ Documentation updated
- ✅ Follows existing patterns
- ✅ No breaking changes without migration path
- ✅ Performance maintained or improved
- ✅ Accessibility not degraded

### Excellent Agent Work

All of the above, plus:

- ✨ Improves code quality
- ✨ Adds helpful comments
- ✨ Increases test coverage
- ✨ Enhances documentation
- ✨ Proactively identifies edge cases
- ✨ Suggests architecture improvements (without implementing)

---

## Working with the Human

### Communication Style

- **Be specific**: "The login form validation fails when..." not "Something's wrong"
- **Show your work**: Include relevant code snippets in explanations
- **Admit limitations**: "I'm not sure about X, recommend human review"
- **Suggest alternatives**: Provide 2-3 options when possible

### When to Ask for Help

1. Architecture decision needed
2. Multiple valid approaches exist
3. Security implications unclear
4. Breaking change required
5. Existing pattern doesn't fit new requirement
6. Documentation contradicts code

### How to Ask for Help

**Bad**: "Should I add a new field?"  
**Good**: "I need to track X. Options: 1) Add field to client schema, 2) Create new document type, 3) Use existing retainer field. Recommend #2 because..."

---

## Continuous Improvement

### After Each Task

1. Did I follow these guidelines?
2. Did I update relevant documentation?
3. Did I add sufficient tests?
4. Could a future agent understand my changes?
5. Is the SOT still intact?

### Quarterly Review

Human should review and update:

- Agent success rate
- Common failure patterns
- Guidelines effectiveness
- New patterns to codify

---

## Quick Reference Card

```
✅ SAFE TO DO:
- Add UI components
- Fix styling
- Update docs
- Add tests
- Improve error messages

⚠️ NEEDS CARE:
- API routes (add logging + validation)
- Sanity queries (follow patterns)
- Utilities (add tests)

🔴 NEEDS APPROVAL:
- Schema changes
- Auth/RBAC changes
- Payment logic
- Architecture updates
- New dependencies

🔒 NEVER DO:
- Bypass TypeScript
- Skip tests
- Hardcode secrets
- Modify architecture docs
- Commit directly to main
```

---

**Remember**: You're building a 30-40 year system. Every change should make it easier for the next developer (human or AI) to understand and maintain the codebase.

**When in doubt, preserve the SOT.**
