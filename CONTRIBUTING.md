# Contributing to AequiVault

## Branch Strategy

```
main         ← Production (Coolify auto-deploys on every push)
develop      ← Integration branch (CI runs full test suite here)
feat/<slug>  ← Feature branches (always created from develop)
fix/<slug>   ← Bug fixes (from develop, or from main for hotfixes)
```

### Rules

- Every **feature** starts from `develop`:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feat/my-feature
  ```
- **PR to `develop`**: CI must be green (all unit + integration tests pass).
- **PR from `develop` to `main`**: marks sprint closure; requires manual review and green CI.
- **Hotfix in production**: branch `fix/<slug>` from `main`, PR directly to `main`, then cherry-pick to `develop`.
- **Never push directly** to `main` or `develop`. Always use pull requests.

---

## Commit Convention (Conventional Commits)

Format: `type(scope): short description in present tense`

### Types
| Type | When to use |
|------|-------------|
| `feat` | New feature or endpoint |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation only changes |
| `chore` | Build, CI, dependencies, tooling |

### Scopes
`backend` · `frontend` · `db` · `security` · `demo` · `ci` · `docker`

### Examples
```
feat(backend): add paginated journal entry list endpoint
fix(frontend): append Z to expiresAt to force UTC parsing
test(backend): add integration tests for draft publish flow
refactor(backend): extract EntryNumberService from JournalEntryService
docs: add CONTRIBUTING.md with git workflow
chore(ci): add integration test stage to backend workflow
```

### Atomic Commit Rule
**One commit = one conceptual change.**
If your commit message needs "and" to describe itself, split it into two commits.

---

## Sprint Closure Checklist

A sprint is closed when:
- [ ] All `feat/*` branch commits are merged into `develop`
- [ ] CI is green on `develop` (unit + integration tests)
- [ ] PR from `develop → main` was reviewed and approved
- [ ] Feature was manually verified in production (Coolify)
- [ ] `CHANGELOG.md` was updated with sprint changes

---

## Local Development

### Backend
```bash
cd aequivault/backend
docker compose -f ../../docker-compose.dev.yml up -d  # start local postgres
./mvnw spring-boot:run
```

### Frontend
```bash
cd aequivault/frontend
npm install
npm run start
```

### Run Tests
```bash
# Backend
./mvnw test

# Frontend
npm run test -- --watch=false --browsers=ChromeHeadless
```
