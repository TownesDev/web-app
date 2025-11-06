# TownesDev Documentation Audit & Cleanup Plan

**Date**: November 4, 2025  
**Auditor**: GitHub Copilot  
**Purpose**: Production-ready documentation for a 1-person SaaS operation with AI agents

---

## Executive Summary

Your documentation is **surprisingly solid** for someone new to this. You have 43 markdown files covering architecture, setup, testing, and operations. However, there are some duplications, gaps, and organizational issues that need cleaning up before you can confidently run this for 30-40 years.

**Current State**: 7/10 - Good foundation, needs refinement  
**Target State**: 9/10 - Production-ready, maintainable SOT

---

## Critical Issues Found

### 1. **DUPLICATE: Stripe Webhooks Runbook** 🔴

**Files**:

- `docs/guides/stripe-webhooks-runbook.md` (49 lines)
- `docs/setup/stripe-webhooks-runbook.md` (49 lines)

**Action**: DELETE `docs/setup/stripe-webhooks-runbook.md` (wrong location)  
**Reason**: Runbooks belong in `guides/`, not `setup/`

### 2. **DUPLICATE: Testing Documentation** 🔴

**Files**:

- `docs/guides/testing.md` (401 lines - comprehensive)
- `docs/development-guides/testing-guide.md` (64 lines - specific to PDF/Email)

**Action**:

- RENAME `testing-guide.md` → `testing-pdf-email.md`
- UPDATE `testing.md` to reference it
- FIX cross-references

**Reason**: They serve different purposes but naming is confusing

### 3. **Missing: Email Handling Strategies** ⚠️

**Reference**: `docs/audit/docs-audit.md` mentions `email-handling-strategies.md`  
**Reality**: File doesn't exist (already deleted or never created)

**Action**: VERIFY then remove reference from `docs-audit.md`

---

## Structural Issues

### 4. **Inconsistent Folder Organization** ⚠️

Current structure has overlap:

```
docs/
├── guides/           # Mix of user guides AND dev guides
├── development-guides/  # Should be THE place for dev guides
├── setup/            # Mix of setup AND runbooks
└── architecture/     # Clean ✓
```

**Recommended Structure**:

```
docs/
├── architecture/     # System design (KEEP AS-IS) ✓
├── setup/            # Getting started, environment, deployment
├── guides/           # Operational runbooks, workflows, standards
├── development/      # Dev-specific: testing, performance, advanced features
├── audit/            # Historical checkpoints, issue tracking
└── accessibility/    # A11y-specific docs
```

**Migration Plan**:

1. Move `development-guides/*` → `development/*`
2. Move operational guides from `setup/` to `guides/` (like stripe runbook)
3. Keep `setup/` ONLY for initial setup tasks

### 5. **Audit Folder Proliferation** ⚠️

**Current**:

- `audit/checkpoint-review.md`
- `audit/docs-audit.md`
- `audit/refs-cleanup-analysis.md`
- `audit/refs-folder-migration.md`
- `audit/repo-issues.md`
- `audit/updates-oct-2025.md`

**Issue**: Most of these are **historical artifacts**, not living documents

**Action**: Create `audit/_archived/` and move completed audits there  
**Keep Active**:

- `checkpoint-review.md` (current task tracker)
- `repo-issues.md` (actionable items)

**Archive**:

- `docs-audit.md` (completed Oct 31)
- `refs-cleanup-analysis.md` (completed Nov 4)
- `refs-folder-migration.md` (completed Nov 4)
- `updates-oct-2025.md` (historical)

---

## Documentation Gaps

### 6. **Missing: Onboarding Flow Implementation Status** 🟡

**Issue**: `checkpoint-review.md` lists many unchecked onboarding tasks, but there's no clear "this is done" vs "this is TODO"

**Action**: Create `docs/development/onboarding-status.md` with:

- ✅ What's implemented (wizard UI, validation)
- ❌ What's missing (checkout integration, portal gating)
- 🔄 What's partial (provisioning API exists but no UI feedback)

### 7. **Missing: Quick Start for New Devs** 🟡

**Issue**: `docs/README.md` exists but doesn't have a "first 30 minutes" path

**Action**: Add section to `docs/README.md`:

```markdown
## First Time Here?

1. **Setup** (30 min): [Local Development](./setup/local-development.md)
2. **Architecture** (20 min): [Overview](./architecture/overview.md) → [Route Groups](./architecture/route-groups.md)
3. **First Task** (10 min): [Development Workflow](./guides/workflow.md)
4. **Current Priorities**: [Checkpoint Review](./audit/checkpoint-review.md)
```

### 8. **Missing: AI Agent Guidelines** 🟡

**Issue**: You want to run AI coding agents, but there's no documentation on:

- What agents can/can't modify
- How to preserve SOT
- Agent-specific workflows

**Action**: Create `docs/development/ai-agents.md`:

- Safe modification zones
- SOT preservation rules
- Agent task templates
- Quality gates before merging agent code

---

## Content Quality Issues

### 9. **Outdated Claims in checkpoint-review.md** 🔴

**Issue**: The checkpoint says:

> "Stripe webhook handler currently writes entitlements but does not guard against duplicate deliveries"

**Reality**: Code inspection shows:

- ✅ Duplicate suppression IS implemented (using `stripeEvent` docs)
- ✅ Structured logging IS present
- ✅ Correlation IDs exist

**Action**: UPDATE `checkpoint-review.md` to reflect actual implementation status

### 10. **README Links Not Validated** ⚠️

**Issue**: `docs/README.md` references files that may not exist

**Action**: Run link validator and update dead links

---

## Recommended File Deletions

### Immediate Deletions

1. ❌ `docs/setup/stripe-webhooks-runbook.md` (duplicate)
2. ❌ `docs/setup/ts-server-deploy.md` (if not relevant - need to check)

### Archive to `audit/_archived/`

1. 📦 `docs/audit/docs-audit.md`
2. 📦 `docs/audit/refs-cleanup-analysis.md`
3. 📦 `docs/audit/refs-folder-migration.md`
4. 📦 `docs/audit/updates-oct-2025.md`

---

## Action Plan (Prioritized)

### Phase 1: Critical Cleanup (30 min)

1. ✅ Delete duplicate stripe runbook
2. ✅ Rename testing-guide.md → testing-pdf-email.md
3. ✅ Create `audit/_archived/` folder
4. ✅ Move completed audits to archive
5. ✅ Update `checkpoint-review.md` with actual webhook status

### Phase 2: Structure Refinement (1 hour)

6. ✅ Create `development/` folder
7. ✅ Move `development-guides/*` → `development/*`
8. ✅ Update all cross-references
9. ✅ Add "First Time Here?" section to README
10. ✅ Validate all links in README

### Phase 3: Fill Gaps (2-3 hours)

11. ✅ Create `development/onboarding-status.md`
12. ✅ Create `development/ai-agents.md`
13. ✅ Update `guides/README.md` with clear categories
14. ✅ Add deployment checklist to `setup/deployment.md`

### Phase 4: SOT Hardening (1-2 hours)

15. ✅ Create `docs/SOT.md` - Single source of truth document
16. ✅ Add version/date stamps to all architecture docs
17. ✅ Create docs update workflow (how to keep docs fresh)
18. ✅ Add "Last Verified" dates to critical docs

---

## Long-Term Maintainability Recommendations

### For Your 1-Man + AI Setup

**1. Documentation Workflow**

```markdown
## Every Sprint

- [ ] Update checkpoint-review.md with completed items
- [ ] Archive completed audit docs
- [ ] Update onboarding-status.md if features shipped
- [ ] Verify README links still work

## Every Quarter

- [ ] Review all architecture docs for accuracy
- [ ] Update "Last Verified" dates
- [ ] Archive old audit docs
- [ ] Clean up TODO comments in docs
```

**2. AI Agent Safety Rails**

- Never let agents modify `architecture/` without review
- Always verify agent changes against SOT docs
- Use `development/ai-agents.md` as guardrails
- Keep checkpoint-review.md as the north star

**3. Documentation Standards**

```markdown
## Every Doc Should Have

- **Date**: When last updated
- **Purpose**: Why this doc exists
- **Audience**: Who reads this (dev, ops, agent)
- **Related Docs**: Links to connected docs
- **Status**: Current | Archived | Deprecated
```

---

## Metrics for Success

### Before Cleanup

- 43 total docs
- 2 duplicates
- 6+ audit docs (4 should be archived)
- No clear onboarding status
- Missing AI agent guidelines

### After Cleanup

- ~40 organized docs
- 0 duplicates
- 2 active audit docs
- Clear onboarding status
- AI agent guidelines in place
- All links validated
- Clear "first 30 minutes" path

---

## Your Next Steps

Would you like me to:

1. **Execute Phase 1** (Critical Cleanup) - Delete duplicates, archive old audits
2. **Create the missing docs** (onboarding-status.md, ai-agents.md, SOT.md)
3. **Restructure folders** (development-guides → development)
4. **All of the above** in sequence

I can do this systematically and give you a clean, production-ready docs structure within the next hour.

---

## Final Thoughts

Your docs are **better than 90% of new SaaS projects**. The fact that you have:

- Comprehensive architecture docs
- Operational runbooks
- Audit trails
- Testing guides

...means you're thinking like a maintainer, not just a builder. That's rare and valuable.

The issues are mostly organizational (duplicates, folder structure) rather than missing content. With 2-3 hours of focused cleanup, you'll have a rock-solid documentation foundation that can serve you for decades.

**You're not far from production-ready. Let's get you there.**
