# Playwright CI × TestRail Showcase

> **A production-grade Playwright E2E framework** integrated with GitHub Actions CI, TestRail test management, and Slack reporting — built to the same patterns used in real multi-package monorepos.

---

## What this repository demonstrates

| Skill                                          | Where                                          |
| ---------------------------------------------- | ---------------------------------------------- |
| Playwright Page Object Model                   | `packages/*/pw-tests/pages/`                   |
| Custom test fixtures                           | `packages/*/pw-tests/fixtures/index.ts`        |
| API testing with `APIRequestContext`           | `packages/api-service/pw-tests/`               |
| Parallel test execution across packages        | `playwright-scheduled.yml` matrix strategy     |
| Smoke vs regression tag strategy               | `--grep "@smoke"` / `--grep-invert @prd-smoke` |
| Automatic test retry (`--last-failed`)         | Second run step in scheduled workflow          |
| TestRail Test Plan + Run creation via REST API | `initialize_test_plan` job                     |
| JUnit XML upload via `trcli`                   | `parse_junit` steps                            |
| Test Run ID extraction with `jq`               | `fetch_run_id` step                            |
| Expected failure management                    | `.github/actions/mark-expected-failure`        |
| Composite GitHub Actions                       | `.github/actions/playwright-setup`             |
| Browser cache across CI runs                   | `actions/cache` in `playwright-setup`          |
| Slack Block Kit notifications                  | `Send Slack notification` step                 |

---

## Repository structure

```
playwright-ci-testrail-showcase/
├── .github/
│   ├── actions/
│   │   ├── playwright-setup/          # Composite: install deps + cache browsers
│   │   └── mark-expected-failure/     # Composite: patch JUnit XML with known failures
│   └── workflows/
│       ├── playwright-scheduled.yml   # Nightly cron + manual dispatch
│       └── playwright-pr.yml          # PR smoke gate (path-filtered)
├── packages/
│   ├── web-app/                       # UI tests — Playwright TodoMVC demo
│   │   └── pw-tests/
│   │       ├── pages/                 # BasePage, TodoPage (POM)
│   │       ├── fixtures/              # Custom test fixtures
│   │       └── tests/
│   │           ├── smoke/             # @smoke tagged — fast critical path
│   │           └── regression/        # Full regression suite
│   └── api-service/                   # API tests — JSONPlaceholder REST API
│       └── pw-tests/
│           ├── client/                # ApiClient wrapper
│           ├── fixtures/
│           └── tests/
│               ├── smoke/
│               └── regression/
├── package.json                       # Yarn workspaces root
└── tsconfig.base.json
```

---

## CI pipeline architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Trigger                    │
│              cron (06:30 UTC) │ workflow_dispatch            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│         Job: initialize_test_plan                │
│  POST /api/v2/add_plan → creates dated plan      │
│  Outputs: test_plan_id                           │
└──────────────────────┬───────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │  Matrix: fail-fast: false│
          ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  web-app        │       │  api-service    │
│  (parallel)     │       │  (parallel)     │
└────────┬────────┘       └────────┬────────┘
         │                         │
         └──────────┬──────────────┘
                    │  Each package runs the same steps:
                    ▼
         ┌─────────────────────────┐
         │  1. Playwright first run │
         │     (smoke or regression)│
         ├─────────────────────────┤
         │  2. Mark expected fails  │
         ├─────────────────────────┤
         │  3. trcli upload → TR   │
         │     Creates Test Run     │
         ├─────────────────────────┤
         │  4. Extract Run ID (jq)  │
         ├─────────────────────────┤
         │  5. --last-failed rerun  │
         ├─────────────────────────┤
         │  6. trcli re-upload      │
         │     Same Run ID (merge)  │
         ├─────────────────────────┤
         │  7. Upload HTML artifact │
         ├─────────────────────────┤
         │  8. Slack Block Kit      │
         │     notification         │
         └─────────────────────────┘
```

---

## Key design decisions

### Two-pass test execution

Tests run twice: a first pass, then a `--last-failed` rerun of any failures. Both results are uploaded to the **same** TestRail Run, so the final status reflects retried passes rather than flake noise. This pattern significantly reduces false-negative failure rates in scheduled CI without masking real bugs.

### TestRail integration via `trcli`

The [TestRail CLI (`trcli`)](https://github.com/gurock/trcli) parses the JUnit XML report Playwright produces and creates/updates TestRail cases automatically using `--case-matcher name`. No manual case maintenance is required — new tests appear in TestRail the first time they run. The `--plan-id` flag on the first upload and `--run-id` on the rerun ensure results land in the correct hierarchical structure (Plan → Run → Cases).

### Expected failure management

Some tests legitimately fail due to known bugs or environmental flakiness. Rather than suppressing them, the `mark-expected-failure` composite action patches the JUnit XML to add a TestRail property that maps to a custom "Expected Failure" status. This keeps the failure count honest while preventing tracked issues from blocking release dashboards.

### Composite actions as reusable building blocks

`playwright-setup` and `mark-expected-failure` are composite actions — they can be reused across any workflow in the repository without duplicating logic. `playwright-setup` caches both the `node_modules` tree (via `actions/cache` keyed to `yarn.lock`) and the Playwright browser binaries (keyed to `package.json` hash), cutting average setup time from ~3 minutes to ~20 seconds on cache hits.

---

## Local setup

```bash
# Prerequisites: Node 18+, Yarn 1.22+

# 1. Install dependencies
yarn install

# 2. Install Playwright browsers
yarn playwright install --with-deps chromium firefox

# 3. Run smoke tests across all packages
yarn test:smoke

# 4. Run full regression suite
yarn test:regression

# 5. Run a single package interactively
cd packages/web-app
yarn test:e2e:ui
```

---

## Running with TestRail (optional)

To push results to TestRail from your local machine:

```bash
pip install trcli

# Create a test plan first
export TESTRAIL_HOST="https://your-org.testrail.io"
export TESTRAIL_PROJECT_ID=1

PLAN_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -u "$TESTRAIL_USER:$TESTRAIL_KEY" \
  -d '{"name":"Local run","entries":[]}' \
  "$TESTRAIL_HOST/index.php?/api/v2/add_plan/$TESTRAIL_PROJECT_ID" \
  | jq -r '.id')

# Run tests
cd packages/web-app
yarn test:e2e:ci

# Upload results
trcli -y \
  -h "$TESTRAIL_HOST" \
  --project "Playwright Showcase" \
  -u "$TESTRAIL_USER" \
  -k "$TESTRAIL_KEY" \
  parse_junit \
  --case-matcher name \
  --title "Local run — web-app" \
  -f pw-tests/reports/junit-report.xml \
  --plan-id "$PLAN_ID"
```

---

## Required GitHub Actions secrets

| Secret              | Description                             |
| ------------------- | --------------------------------------- |
| `TESTRAIL_USERNAME` | TestRail account e-mail                 |
| `TESTRAIL_KEY`      | TestRail API key (Settings → API Keys)  |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL              |
| `NPM_AUTH_TOKEN`    | _(optional)_ Private npm registry token |

---

## Adapting to your project

1. Replace `web-app` and `api-service` in the matrix with your actual package names.
2. Update `TESTRAIL_HOST` and `TESTRAIL_PROJECT_ID` in the workflow env block.
3. Point `baseURL` in each `playwright.config.ts` at your staging environment.
4. Add any known-flaky test names to `pw-tests/expected-failures.txt` in each package.
5. Push the `.github/` directory to your repository — GitHub Actions will pick it up automatically.

---

## Tech stack

- [Playwright](https://playwright.dev) `^1.44`
- [TypeScript](https://www.typescriptlang.org) `^5.4`
- [GitHub Actions](https://docs.github.com/en/actions)
- [TestRail CLI (`trcli`)](https://github.com/gurock/trcli)
- [Slack GitHub Action](https://github.com/slackapi/slack-github-action) `v2`
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
