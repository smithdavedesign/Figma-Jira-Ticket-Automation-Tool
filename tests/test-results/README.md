# Test Results Directory

This directory contains organized test artifacts and reports from various testing frameworks.

## 📁 Directory Structure

```
tests/test-results/
├── README.md                      # This file - explains organization
├── playwright-reports/            # HTML test reports organized by test type
│   ├── smoke-report/              # Smoke test reports (quick validation)
│   ├── regression-report/         # Regression test reports (full workflows)
│   ├── visual-report/             # Visual diff test reports (UI consistency)
│   ├── ci-report/                 # CI test reports (automation optimized)
│   ├── smoke-results.json         # JSON results for smoke tests
│   ├── regression-results.json    # JSON results for regression tests
│   ├── visual-results.json        # JSON results for visual tests
│   └── ci-results.json            # JSON results for CI tests
├── playwright-screenshots/        # Test failure screenshots organized by type
│   ├── smoke-screenshots/         # Screenshots from smoke test failures
│   ├── regression-screenshots/    # Screenshots from regression test failures
│   ├── visual-screenshots/        # Screenshots from visual test failures
│   └── ci-screenshots/            # Screenshots from CI test failures
└── vitest-report.html             # Unit test HTML report
```

## 🎯 **Test Types**

### **Smoke Tests** (`smoke-*`)
- **Purpose:** Quick validation of core functionality
- **Duration:** <2 minutes
- **Command:** `npm run test:browser:smoke`
- **Report:** `npm run test:artifacts:smoke`

### **Regression Tests** (`regression-*`)
- **Purpose:** Comprehensive workflow validation
- **Duration:** <10 minutes
- **Command:** `npm run test:browser:regression`
- **Report:** `npm run test:artifacts:regression`

### **Visual Tests** (`visual-*`)
- **Purpose:** UI consistency and screenshot comparison
- **Duration:** <5 minutes
- **Command:** `npm run test:browser:visual`
- **Report:** `npm run test:artifacts:visual`

### **CI Tests** (`ci-*`)
- **Purpose:** Optimized for continuous integration
- **Duration:** <5 minutes (parallel execution)
- **Command:** `npm run test:ci`
- **Report:** `npm run test:artifacts:ci`

## 🔧 **Report Access**

### **Command Line**
```bash
# View specific report types
npm run test:artifacts:smoke      # Smoke test report
npm run test:artifacts:regression # Regression test report
npm run test:artifacts:visual     # Visual test report
npm run test:artifacts:ci         # CI test report

# Default (opens smoke report)
npm run test:artifacts
```

### **Test UI Suite**
Open `tests/integration/test-consolidated-suite.html` and navigate to the "🎭 Playwright" tab:
- **📊 View Report** - Opens most recent report
- **💨 Smoke** - Opens smoke test report specifically
- **🔄 Regression** - Opens regression test report specifically  
- **👁️ Visual** - Opens visual test report specifically
- **🤖 CI** - Opens CI test report specifically

### **Direct Access**
Reports can be opened directly in a browser:
- Smoke: `tests/test-results/playwright-reports/smoke-report/index.html`
- Regression: `tests/test-results/playwright-reports/regression-report/index.html`
- Visual: `tests/test-results/playwright-reports/visual-report/index.html`
- CI: `tests/test-results/playwright-reports/ci-report/index.html`

## 📊 **CI Integration**

The reports are structured for easy integration with CI/CD systems:
- **HTML Reports:** Rich interactive reports with filtering and search
- **JSON Results:** Machine-readable test results for automation
- **JUnit XML:** Compatible with most CI/CD platforms (CI tests only)
- **Screenshots:** Automatic capture on test failures for debugging

## 🗂️ **File Management**

- **Automatic Creation:** Directories are created automatically during test runs
- **Overwrite Behavior:** Each test run overwrites previous reports of the same type
- **Cleanup:** Reports can be manually deleted or use `git clean -fd` to remove all
- **Version Control:** Reports are gitignored and not committed to the repository

---

**💡 Tip:** Use the Test UI Suite (`npm run test:suite`) for the best experience managing and viewing test reports.