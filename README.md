# Module 8.6.3 — Reusable Workflows & Modular CI/CD Architecture

Educational GitHub Actions demo. This module evolves the previous matrix-CI demo (8.6.2) into a **modular, enterprise-style CI/CD architecture** built on **Reusable Workflows**.

> The application itself (React + Vite + Vitest + ESLint) is intentionally unchanged from 8.6.2. **All complexity lives inside `.github/workflows/`.** The lesson is workflow architecture, not feature work.

---

## What you'll learn

1. **Why reusable workflows exist** — duplication is the #1 maintenance burden in CI/CD. Real platform teams centralize build/test/deploy logic so 50 product repos share one source of truth.
2. **`on: workflow_call`** — the trigger that makes a workflow callable from another workflow (and *only* from another workflow).
3. **`inputs`** — typed parameters callers must (or may) pass.
4. **`secrets`** — the security contract between caller and reusable workflow. Cannot have defaults.
5. **`outputs`** — values reusable workflows return to their caller; consumed via `needs.<job>.outputs.<name>`.
6. **Output chaining** — gating one workflow's execution on the output of another. The headline pattern.
7. **Matrix + reusable** — scaling centralized logic across many configurations.
8. **Safe secret handling** — what GitHub masks for you and what it doesn't.

---

## Architecture

```
.github/workflows/
├── ci.yml                  ← Orchestrator. The only file with real triggers.
├── reusable-build.yml      ← workflow_call only. Build + upload artifact.
├── reusable-test.yml       ← workflow_call only. Test + (optional) report.
└── reusable-deploy.yml     ← workflow_call only. Download artifact + simulated deploy.
```

Job graph inside `ci.yml`:

```
lint  ─►  test-matrix (node 18, 20, 22)  ─►  build  ─►  deploy-staging  ─►  deploy-production
                                                              (output-gated)         (main only)

report  ◄── runs if anything above failed (if: failure())
```

---

## How a reusable workflow is called

```yaml
jobs:
  build:
    uses: ./.github/workflows/reusable-build.yml   # path-based (same repo)
    with:
      node-version: '20'
      artifact-name: dist
    secrets:
      deploy-token: ${{ secrets.MY_DEPLOY_SECRET }}
```

You can also reference reusable workflows in **other repos** (the real platform-engineering pattern):

```yaml
uses: my-org/ci-templates/.github/workflows/reusable-build.yml@v3
```

---

## Output chaining (the headline lesson)

`reusable-build.yml` declares:

```yaml
outputs:
  build-status:
    value: ${{ jobs.build.outputs.build-status }}
```

`ci.yml` consumes it:

```yaml
deploy-staging:
  needs: build
  if: needs.build.outputs.build-status == 'success'
```

This is how workflows **communicate**. Without it, every consumer has to re-derive state. With it, you have a real pipeline DSL.

---

## Required setup: `MY_DEPLOY_SECRET`

The deploy workflow expects a repository secret named **`MY_DEPLOY_SECRET`**.

Create it once:

1. Go to **Settings → Secrets and variables → Actions**.
2. Click **New repository secret**.
3. Name: `MY_DEPLOY_SECRET`. Value: any string (this is a simulated deploy — the value isn't validated against a real service).

### Why does `secrets:` have no `default:`?

GitHub forbids it on purpose. A reusable workflow's secret contract is a **security boundary**. If defaults were allowed, a caller could accidentally pick up a server-side default they didn't intend to use, bypassing the review that explicit secret-passing forces.

### Secret scopes (good to know)

| Scope          | Where                                                                 | When to use                                       |
| -------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| Repository     | `Settings → Secrets → Actions`                                        | Default — single-repo CI                          |
| Environment    | `Settings → Environments → <env> → Secrets`                           | Production-only secrets, with required reviewers  |
| Organization   | `Org Settings → Secrets → Actions`                                    | Shared across many repos (the platform pattern)   |

### `secrets: inherit` vs explicit pass-through

```yaml
# Convenient but blunt — passes ALL caller secrets to the reusable workflow:
secrets: inherit

# Explicit — pass only what's needed (principle of least privilege):
secrets:
  deploy-token: ${{ secrets.MY_DEPLOY_SECRET }}
```

Prefer explicit. Real platforms enforce it.

---

## Live demo: force a failure

Use the `workflow_dispatch` trigger on `ci.yml`:

1. **Actions → CI — Orchestrator → Run workflow**
2. Set **force_test_failure** to `true`.
3. Watch:
   - All three matrix test runs fail.
   - `build`, `deploy-staging`, `deploy-production` are SKIPPED (output gate).
   - The `report` job runs and prints the full failure summary.

---

## How real companies structure reusable pipelines

The pattern you just built is what platform teams ship to their org:

- A central **`ci-templates`** repository owned by the platform/DevOps team.
- Reusable workflows for `build`, `test`, `deploy`, `scan`, `release` — each versioned with tags (e.g. `@v3`).
- Product repos consume them with **one-line `uses:` references** — no copy-pasted YAML.
- Updating the platform's deploy logic = bump one tag = the whole company gets the change.
- Security review focuses on the platform repo, not every product repo.

This is **DRY CI**. It's the difference between maintaining 1 pipeline and 50.

---

## Running locally

```bash
npm install
npm run lint
npm test
npm run build
```

The app is the same React + Vite app from 8.6.2 — keep it simple on purpose.

---

## File-by-file reference

| File                                                              | Purpose                                                                                |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`ci.yml`](.github/workflows/ci.yml)                              | Orchestrator. Only file with `push` / `pull_request` / `workflow_dispatch` triggers.   |
| [`reusable-build.yml`](.github/workflows/reusable-build.yml)      | Reusable. `workflow_call` only. Builds dist and uploads artifact.                      |
| [`reusable-test.yml`](.github/workflows/reusable-test.yml)        | Reusable. `workflow_call` only. Tests + conditional failure report.                    |
| [`reusable-deploy.yml`](.github/workflows/reusable-deploy.yml)    | Reusable. `workflow_call` only. Downloads artifact + simulated deploy with secret.     |
