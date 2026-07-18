# Permbridge Web - Project Documentation

## Branching Strategy

This project uses **Git Flow** — a professional branching model designed for releases and production stability.

### Branch Structure

- **`main`** — Production-ready code. Every commit is tagged with a version (e.g., `v1.0.0`). Deployments happen from here.
- **`develop`** — Integration branch for the next release. Receives feature branches and is the default branch for new work.
- **`feature/*`** — Feature branches. Branch off `develop` and merge back via PR when complete.
  - Naming: `feature/user-auth`, `feature/payment-integration`, `feature/api-v2`
- **`release/*`** — Prepare a release. Branch from `develop` to stabilize, bump version, tag, then merge to both `main` and back to `develop`.
  - Naming: `release/1.0.0`, `release/2.1.0`
- **`hotfix/*`** — Emergency fixes for production. Branch from `main`, fix, tag, merge back to both `main` and `develop`.
  - Naming: `hotfix/critical-auth-bug`, `hotfix/payment-timeout`

### Typical Workflow

#### Starting a Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# make changes, commit, push
git push -u origin feature/my-feature
# open PR to merge back into develop
```

#### Releasing (When Ready)
```bash
git checkout -b release/X.Y.Z develop
# bump version numbers, update CHANGELOG
git commit -am "Bump version to X.Y.Z"
git push -u origin release/X.Y.Z
# PR → develop, merge with merge commit
# Create git tag: git tag -a vX.Y.Z -m "Release X.Y.Z"
# Merge to main, tag, deploy
```

#### Emergency Hotfix
```bash
git checkout -b hotfix/issue-name main
# fix the bug
git commit -am "Fix: critical issue"
git push -u origin hotfix/issue-name
# PR → main, merge, tag
# Cherry-pick back to develop
```

### Solo Development Guidelines

Since you're building alone, focus on discipline:

1. **Use `develop` as your daily branch** — never commit directly to `main`
2. **Create feature branches even for small work** — maintains clean history and practiced workflows
3. **Review your own PRs before merging** — self-review catches issues and documents intent
4. **Tag releases on `main`** — makes it easy to rollback or reference past versions
5. **Keep commit messages clear** — "why" not just "what" (past tense, concise)

### When You Add Team Members

As you grow:
- Require branch protection on `main` (no direct pushes, require PR review)
- Require branch protection on `develop` (PRs preferred, one approval)
- Use PR templates for consistent code review
- Establish commit message conventions
- Consider automated checks (linting, tests, security scans)

---

## Version Numbering

Use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- `MAJOR`: Breaking changes
- `MINOR`: New features (backward-compatible)
- `PATCH`: Bug fixes

Example: `v1.2.5` → next minor release is `v1.3.0`
