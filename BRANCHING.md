# PermBridge Git Branching Strategy

## Branch Structure

```
main (production-ready releases)
  ↓
develop (integration branch for all features)
  ├── feature/phase-2-data-display
  ├── feature/phase-3-converter
  ├── feature/phase-4-summarizer
  ├── feature/phase-5-matrix
  ├── feature/phase-6-export
  ├── feature/phase-7-billing
  └── ...
```

## Workflow

### Starting Work on a Phase

```bash
# Update develop to latest
git checkout develop
git pull origin develop

# Create/checkout the feature branch for that phase
git checkout feature/phase-X-name

# Make your changes, commit, push
git add .
git commit -m "your message"
git push origin feature/phase-X-name
```

### Switching Between Phases

```bash
# Switch to a different phase
git checkout feature/phase-3-converter
git pull origin feature/phase-3-converter

# Work...
git add .
git commit -m "your message"
git push origin feature/phase-3-converter
```

### Merging to Develop (When Phase is Done)

```bash
# Create a Pull Request on GitHub
# Merge when ready → Delete feature branch

# Or merge locally:
git checkout develop
git pull origin develop
git merge --no-ff feature/phase-3-converter
git push origin develop
```

### Merging to Main (Release)

Only when ready to deploy to production:

```bash
git checkout main
git pull origin main
git merge --no-ff develop
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin main --tags
```

## Phase Breakdown

| Phase | Branch | Focus | PR to Develop |
|-------|--------|-------|---------------|
| **Phase 1** | `main` | ✅ Foundation (done) | - |
| **Phase 2** | `feature/phase-2-data-display` | Display synced data in pages | After this phase |
| **Phase 3** | `feature/phase-3-converter` | Profile → PermSet converter logic | After Phase 2 |
| **Phase 4** | `feature/phase-4-summarizer` | Permission lookup & details | After Phase 2 |
| **Phase 5** | `feature/phase-5-matrix` | Cross-comparison matrix | After Phase 2 |
| **Phase 6** | `feature/phase-6-export` | PDF/CSV export | After Phase 4/5 |
| **Phase 7** | `feature/phase-7-billing` | Stripe, subscriptions, payments | After Phase 3 |

## Tips

- **Keep branches focused** - Each phase is one concern
- **Commit often** - Small, logical commits make reviews easier
- **Pull before push** - Avoid conflicts: `git pull origin feature-name` before pushing
- **Use PRs** - Create PR on GitHub for visibility
- **Don't work on main** - Always use feature branches

## Current Status

- ✅ Phase 1: Foundation complete (on `main`)
- ⏸️ Phase 2-7: Ready to start (feature branches created)

Next: Check out `feature/phase-2-data-display` to begin Phase 2!
