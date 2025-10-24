#!/bin/bash

# Phase 5 Testing Suite Runner
# Comprehensive testing script for all Phase 5 test cases

set -e

echo "🧪 Phase 5 Testing Suite Runner"
echo "==============================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_category="$3"
    
    echo ""
    echo -e "${BLUE}🔬 Running $test_category: $test_name${NC}"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to check if server is running
check_server() {
    local port="$1"
    local service_name="$2"
    
    if curl -s "http://localhost:$port" --max-time 3 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is running on port $port${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $service_name is not running on port $port${NC}"
        return 1
    fi
}

# Pre-test checks
echo ""
echo -e "${BLUE}🔍 Pre-test Environment Checks${NC}"
echo "================================="

check_server 3000 "MCP Server" || echo "Note: MCP Server should be started separately"
check_server 8080 "UI Server" || echo "Note: UI Server should be started separately"

# Phase 5 Test Suite Execution
echo ""
echo -e "${BLUE}🚀 Executing Phase 5 Test Suite${NC}"
echo "=================================="

# 1. Unit Tests
run_test "Visual Context System Validation" \
    "node tests/unit/test-visual-context-validation.mjs" \
    "Unit Tests"

# 2. Performance Tests  
run_test "Performance Benchmarking" \
    "node tests/performance/test-performance-benchmarking.mjs" \
    "Performance Tests"

# 3. Integration Tests
run_test "End-to-End Workflow Testing" \
    "node tests/integration/test-end-to-end-workflow.mjs" \
    "Integration Tests"

# 4. Browser Tests (if available)
if command -v npx &> /dev/null && [ -d "browser-tests" ]; then
    run_test "Critical Browser Tests" \
        "npm run test:browser:critical" \
        "Browser Tests"
fi

# 5. System Integration Tests
run_test "MCP Integration Test" \
    "npm run test:integration:mcp" \
    "System Tests"

# 6. Enhanced Data Layer Tests (if server is running)
if check_server 3000 "MCP Server" > /dev/null; then
    run_test "Enhanced Data Layer Tests" \
        "npm run test:data:simple" \
        "Data Layer Tests"
fi

# Generate Test Report
echo ""
echo -e "${BLUE}📊 Phase 5 Testing Results${NC}"
echo "=========================="
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}   Tests Passed: $TESTS_PASSED/$TOTAL_TESTS${NC}"
    echo ""
    echo -e "${GREEN}✅ Phase 5 Testing Suite: SUCCESSFUL${NC}"
    echo -e "${GREEN}   System is production-ready!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    echo -e "${RED}   Tests Passed: $TESTS_PASSED/$TOTAL_TESTS${NC}"
    echo -e "${RED}   Tests Failed: $TESTS_FAILED/$TOTAL_TESTS${NC}"
    echo ""
    
    if [ $TESTS_PASSED -gt $TESTS_FAILED ]; then
        echo -e "${YELLOW}⚡ Phase 5 Testing Suite: MOSTLY SUCCESSFUL${NC}"
        echo -e "${YELLOW}   System has minor issues but is largely functional${NC}"
        exit 1
    else
        echo -e "${RED}❌ Phase 5 Testing Suite: NEEDS ATTENTION${NC}"
        echo -e "${RED}   System requires fixes before production deployment${NC}"
        exit 2
    fi
fi