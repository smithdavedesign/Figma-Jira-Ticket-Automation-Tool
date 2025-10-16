# 🧪 NPM Test Commands Reference

## Quick Commands for Development

```bash
# Health & System Checks
npm run health                    # Check system health without starting servers
npm run health:start             # Check health and auto-start servers if needed

# Unit & Integration Tests (Fast - under 10 seconds)
npm test                         # Run unit tests only (default)
npm run test:unit               # Core tech stack parsing tests (~2 seconds)
npm run test:integration        # UI integration tests (~5 seconds)
npm run test:all:quick          # Unit + quick browser test (~30 seconds)

# Browser Tests (Slow - 2-10 minutes)
npm run test:browser:quick      # Single UI load test with pre-validation (~30 seconds)
npm run test:browser:smoke      # Essential functionality only (~2 minutes)
npm run test:browser:critical   # Critical path validation (~3 minutes)
npm run test:browser:core       # Core functionality tests (~5 minutes)
npm run test:browser            # Full cross-browser suite (~10 minutes)

# Browser Test Variants
npm run test:browser:headed     # Visual debugging mode (see tests run)
npm run test:browser:ui         # Interactive test explorer
npm run test:browser:unsafe     # Skip pre-validation (use when endpoints are known good)

# Comprehensive Testing
npm run test:all                # Unit + Integration + System + Browser Smoke (~5 minutes)
npm run test:all:verbose        # Full test suite with detailed output (~15 minutes)
npm run validate                # Complete validation: tests + build (~7 minutes)
npm run validate:quick          # Quick validation for CI (~3 minutes)
```

## Pre-Test Validation

All browser tests now include automatic endpoint validation to prevent wasting time on broken tests:

- ✅ **UI endpoint check**: Validates localhost:8101/ui/standalone/index.html responds
- ✅ **Content validation**: Ensures UI contains expected elements
- ✅ **MCP server check**: Validates localhost:3000 is responding (optional)
- ✅ **Fast failure**: Exits immediately if critical endpoints are down

## Test Categories

### Unit Tests (`npm run test:unit`)
- **Runtime**: ~2 seconds
- **Purpose**: Core algorithm validation
- **Coverage**: Tech stack parsing, confidence calculation
- **Dependencies**: None (pure JavaScript)

### Integration Tests (`npm run test:integration`)  
- **Runtime**: ~5 seconds
- **Purpose**: Feature integration validation
- **Coverage**: UI components, MCP fallbacks, document generation
- **Dependencies**: Node.js modules

### Browser Tests (`npm run test:browser:*`)
- **Runtime**: 30 seconds - 10 minutes (depending on variant)
- **Purpose**: Cross-browser UI validation
- **Coverage**: 330+ tests across Chrome, Firefox, Safari, Mobile
- **Dependencies**: UI server (port 8101), optional MCP server (port 3000)

## Development Workflow

```bash
# 1. Quick development check
npm run test:all:quick

# 2. Before committing changes
npm run test:all

# 3. Full validation before release
npm run validate

# 4. Debug browser issues
npm run health:start                    # Start servers
npm run test:browser:headed             # Visual debugging
npm run test:browser:ui                 # Interactive explorer

# 5. CI/CD pipeline
npm run validate:quick                  # Fast CI validation
```

## Troubleshooting

### "UI endpoint failed" error
```bash
npm run health:start                    # Auto-start servers
# OR manually:
python3 -m http.server 8101            # Terminal 1
cd mcp-server && npm run dev           # Terminal 2
```

### "Browser tests taking too long"
```bash
npm run test:browser:quick              # Single test for validation
npm run test:browser:smoke              # Essential tests only
```

### "MCP server not responding"
```bash
cd mcp-server
npm install                            # Install dependencies
npm run build                          # Build TypeScript
npm run dev                            # Start development server
```

## Security Notes

⚠️ **Enhanced .gitignore**: Automatically excludes API keys, secrets, and security files
⚠️ **Pre-commit validation**: Always run `npm run test:all` before committing
⚠️ **Environment isolation**: Tests use local servers, no external API calls required