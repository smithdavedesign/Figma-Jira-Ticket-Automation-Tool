#!/bin/bash

# 🚀 Comprehensive Test Runner for Figma AI Ticket Generator
# Runs all critical tests in sequence with detailed reporting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Test results tracking
PASSED_TESTS=()
FAILED_TESTS=()
SKIPPED_TESTS=()
START_TIME=$(date +%s)

# Utility functions
log_header() {
    echo -e "\n${BOLD}${BLUE}╔══════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${BLUE}║${NC} $1"
    echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════╝${NC}\n"
}

log_test() {
    echo -e "${CYAN}🧪 $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    PASSED_TESTS+=("$1")
}

log_failure() {
    echo -e "${RED}❌ $1${NC}"
    FAILED_TESTS+=("$1")
}

log_skip() {
    echo -e "${YELLOW}⏭️  $1${NC}"
    SKIPPED_TESTS+=("$1")
}

# Check if MCP server is running
check_mcp_server() {
    if lsof -i :3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ MCP Server is running on port 3000${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  MCP Server not running, starting it...${NC}"
        npm run start:mvc &
        MCP_PID=$!
        sleep 5
        if lsof -i :3000 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ MCP Server started successfully${NC}"
            return 0
        else
            echo -e "${RED}❌ Failed to start MCP Server${NC}"
            return 1
        fi
    fi
}

# Cleanup function
cleanup() {
    if [ ! -z "$MCP_PID" ]; then
        echo -e "\n${YELLOW}🛑 Stopping MCP server...${NC}"
        kill $MCP_PID 2>/dev/null || true
    fi
}

# Set up cleanup on exit
trap cleanup EXIT

# Main test execution
main() {
    log_header "🚀 COMPREHENSIVE TEST SUITE - Figma AI Ticket Generator"
    
    echo -e "${BOLD}Running all critical tests to achieve 100% validation...${NC}\n"
    
    # Check environment
    echo -e "${BLUE}🔧 Environment Check:${NC}"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "Working Directory: $(pwd)"
    echo ""
    
    # Ensure MCP server is running
    if ! check_mcp_server; then
        log_failure "MCP Server startup failed - aborting test suite"
        exit 1
    fi
    
    # 1. ESLint - Code Quality
    log_header "1. 📋 ESLint - Code Quality Analysis"
    log_test "Running ESLint with automatic fixes..."
    if npm run lint; then
        log_success "ESLint: 0 errors (warnings acceptable)"
    else
        log_failure "ESLint: Code quality issues found"
    fi
    
    # 2. Unit Tests - Core Logic
    log_header "2. 🧪 Unit Tests - Core Logic Validation"
    log_test "Running Vitest unit tests..."
    if npm run test:run; then
        log_success "Unit Tests: All tests passed"
    else
        log_failure "Unit Tests: Some tests failed"
    fi
    
    # 3. Build Tests - TypeScript Compilation
    log_header "3. 🏗️  Build Tests - TypeScript Compilation"
    log_test "Running TypeScript compilation..."
    if npm run build; then
        log_success "Build Tests: TypeScript compilation successful"
    else
        log_failure "Build Tests: Compilation errors found"
    fi
    
    # 4. MCP Integration Tests - AI Functionality
    log_header "4. 🤖 MCP Integration Tests - AI Functionality"
    log_test "Running MCP server integration tests..."
    if npm run test:mcp; then
        log_success "MCP Integration: AI functionality working"
    else
        log_failure "MCP Integration: AI integration issues"
    fi
    
    # 5. E2E Tests - Complete Workflow
    log_header "5. 🔄 E2E Tests - Complete Workflow Validation"
    log_test "Running end-to-end workflow tests..."
    if ./scripts/test-e2e.sh; then
        log_success "E2E Tests: Complete workflow validated"
    else
        log_failure "E2E Tests: Workflow issues found"
    fi
    
    # 6. Playwright Browser Tests - UI Validation
    log_header "6. 🖥️  Playwright Browser Tests - UI Validation"
    log_test "Running Playwright smoke tests..."
    if npm run test:browser:smoke; then
        log_success "Playwright Browser Tests: UI validation passed"
    else
        log_failure "Playwright Browser Tests: UI issues found"
    fi
    
    # 7. Health Checks - System Status
    log_header "7. 🏥 Health Checks - System Status"
    log_test "Running comprehensive health checks..."
    if npm run health; then
        log_success "Health Checks: All systems operational"
    else
        log_failure "Health Checks: System issues detected"
    fi
    
    # 8. Production Validation - Deployment Readiness
    log_header "8. 🚀 Production Validation - Deployment Readiness"
    log_test "Running production validation..."
    if ./scripts/validate-production.sh; then
        log_success "Production Validation: Ready for deployment"
    else
        log_failure "Production Validation: Deployment issues"
    fi
    
    # Optional: Performance Tests (if available)
    log_header "9. ⚡ Performance Tests - System Benchmarks (Optional)"
    if [ -f "tests/performance/test-performance-benchmarking.mjs" ]; then
        log_test "Running performance benchmarks..."
        if node tests/performance/test-performance-benchmarking.mjs; then
            log_success "Performance Tests: Benchmarks passed"
        else
            log_failure "Performance Tests: Performance issues detected"
        fi
    else
        log_skip "Performance Tests: Test file not found"
    fi
    
    # Optional: Additional Integration Tests
    log_header "10. 🔗 Additional Integration Tests (Optional)"
    if [ -f "tests/integration/design-system-compliance-tests.mjs" ]; then
        log_test "Running design system compliance tests..."
        if node tests/integration/design-system-compliance-tests.mjs; then
            log_success "Design System Tests: Compliance validated"
        else
            log_failure "Design System Tests: Compliance issues found"
        fi
    else
        log_skip "Design System Tests: Test file not found"
    fi
    
    # Final Results Summary
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo ""
    log_header "📊 COMPREHENSIVE TEST RESULTS SUMMARY"
    
    echo -e "${BOLD}Total Test Duration: ${DURATION}s${NC}\n"
    
    if [ ${#PASSED_TESTS[@]} -gt 0 ]; then
        echo -e "${GREEN}${BOLD}✅ PASSED TESTS (${#PASSED_TESTS[@]}):${NC}"
        for test in "${PASSED_TESTS[@]}"; do
            echo -e "${GREEN}  ✅ $test${NC}"
        done
        echo ""
    fi
    
    if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
        echo -e "${RED}${BOLD}❌ FAILED TESTS (${#FAILED_TESTS[@]}):${NC}"
        for test in "${FAILED_TESTS[@]}"; do
            echo -e "${RED}  ❌ $test${NC}"
        done
        echo ""
    fi
    
    if [ ${#SKIPPED_TESTS[@]} -gt 0 ]; then
        echo -e "${YELLOW}${BOLD}⏭️  SKIPPED TESTS (${#SKIPPED_TESTS[@]}):${NC}"
        for test in "${SKIPPED_TESTS[@]}"; do
            echo -e "${YELLOW}  ⏭️  $test${NC}"
        done
        echo ""
    fi
    
    # Overall Result
    if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
        echo -e "${GREEN}${BOLD}🎉 ALL CRITICAL TESTS PASSED! System is 100% validated and ready for production.${NC}"
        echo -e "${GREEN}${BOLD}✅ Achievement: 100% Test Success Rate${NC}"
        exit 0
    else
        echo -e "${RED}${BOLD}⚠️  ${#FAILED_TESTS[@]} test(s) failed. Please review and fix issues before deployment.${NC}"
        exit 1
    fi
}

# Execute main function
main "$@"