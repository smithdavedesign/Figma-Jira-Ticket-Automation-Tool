# 🔧 CI Build Fix - Browser Testing Commands

**Issue**: CI pipeline was failing because it referenced `npm run test:browser:smoke` which was removed during script consolidation.

**Fix Applied**: Updated `.github/workflows/quality-gate.yml` to use the correct consolidated command.

## ✅ Changes Made

### CI Pipeline Fix
```yaml
# BEFORE (broken):
- name: Smoke tests
  run: npm run test:browser:smoke

# AFTER (fixed):
- name: Smoke tests  
  run: npm run test:browser
```

### Current Browser Testing Commands

The consolidated browser test suite supports the following modes:

```bash
# Default smoke tests (CI-compatible)
npm run test:browser

# Explicit smoke tests  
npm run test:browser smoke

# Full regression tests
npm run test:browser regression

# Visual diff tests
npm run test:browser visual

# All browser tests
npm run test:browser all
```

## 🧪 Script Behavior

- **Default mode**: `smoke` (when no argument provided)
- **CI Detection**: Automatically switches to CI-compatible mode when `CI=true`
- **Graceful Fallback**: Continues even if Playwright dependencies are missing

## 📝 Documentation Updates Needed

The following files still reference the old `test:browser:smoke` command and should be updated:

- `docs/MASTER_PROJECT_CONTEXT.md` (2 references)
- `.ai-context-rules.md` (5 references)  
- `README.md` (1 reference)
- Various testing guides in `docs/testing/`
- Test UI files in `tests/integration/`

**Recommendation**: Update these references to use `npm run test:browser` for consistency.

---
**Fixed**: October 31, 2025  
**Impact**: CI builds should now pass successfully