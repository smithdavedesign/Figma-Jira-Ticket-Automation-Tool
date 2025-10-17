#!/bin/bash

# Enhanced Figma Plugin - E2E Test Suite Runner
# Comprehensive testing with multiple environments and reporting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Enhanced Figma Plugin - E2E Test Suite${NC}"
echo -e "${BLUE}==========================================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must be run from browser-tests directory${NC}"
    exit 1
fi

# Function to print status
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check dependencies
print_status "Checking dependencies..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Install Playwright browsers if needed
print_status "Installing Playwright browsers..."
npx playwright install
print_success "Playwright browsers installed"

# Check if servers are running
print_status "Checking required servers..."

# Check HTTP server (port 8101)
if ! curl -s http://localhost:8101 > /dev/null; then
    print_warning "HTTP server not running on port 8101"
    print_status "Starting HTTP server..."
    cd .. && python3 -m http.server 8101 > /dev/null 2>&1 &
    HTTP_PID=$!
    cd browser-tests
    sleep 2
    
    if curl -s http://localhost:8101 > /dev/null; then
        print_success "HTTP server started (PID: $HTTP_PID)"
    else
        print_error "Failed to start HTTP server"
        exit 1
    fi
else
    print_success "HTTP server is running on port 8101"
fi

# Check MCP server (port 3000)
if ! curl -s http://localhost:3000 > /dev/null; then
    print_warning "MCP server not running on port 3000"
    print_status "Starting MCP server..."
    cd ../server && npm start > /dev/null 2>&1 &
    MCP_PID=$!
    cd ../browser-tests
    sleep 3
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "MCP server started (PID: $MCP_PID)"
    else
        print_error "Failed to start MCP server"
        exit 1
    fi
else
    print_success "MCP server is running on port 3000"
fi

# Parse command line arguments
TEST_TYPE=${1:-"all"}
BROWSER=${2:-"chromium"}
HEADED=${3:-"false"}

print_status "Test Configuration:"
echo "  - Test Type: $TEST_TYPE"
echo "  - Browser: $BROWSER"
echo "  - Headed: $HEADED"
echo ""

# Function to run tests
run_tests() {
    local test_command="$1"
    local test_name="$2"
    
    print_status "Running $test_name..."
    
    if [ "$HEADED" = "true" ]; then
        test_command="$test_command --headed"
    fi
    
    if eval $test_command; then
        print_success "$test_name completed successfully"
        return 0
    else
        print_error "$test_name failed"
        return 1
    fi
}

# Main test execution
FAILED_TESTS=0
TOTAL_TESTS=0

case $TEST_TYPE in
    "smoke")
        print_status "🚀 Running smoke tests..."
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test --grep @smoke --project=$BROWSER" "Smoke Tests"; then
            ((FAILED_TESTS++))
        fi
        ;;
        
    "critical")
        print_status "🔥 Running critical path tests..."
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test --grep @critical --project=$BROWSER" "Critical Tests"; then
            ((FAILED_TESTS++))
        fi
        ;;
        
    "ui")
        print_status "🎨 Running UI/UX tests..."
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test tests/ui-ux-experience.spec.js --project=$BROWSER" "UI/UX Tests"; then
            ((FAILED_TESTS++))
        fi
        ;;
        
    "mcp")
        print_status "🔌 Running MCP integration tests..."
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test tests/mcp-integration.spec.js --project=$BROWSER" "MCP Integration Tests"; then
            ((FAILED_TESTS++))
        fi
        ;;
        
    "cross-browser")
        print_status "🌐 Running cross-browser tests..."
        browsers=("chromium" "firefox" "webkit")
        for browser in "${browsers[@]}"; do
            ((TOTAL_TESTS++))
            if ! run_tests "npx playwright test tests/cross-browser-performance.spec.js --project=$browser" "Cross-Browser Tests ($browser)"; then
                ((FAILED_TESTS++))
            fi
        done
        ;;
        
    "accessibility")
        print_status "♿ Running accessibility tests..."
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test tests/accessibility-edge-cases.spec.js --project=$BROWSER" "Accessibility Tests"; then
            ((FAILED_TESTS++))
        fi
        ;;
        
    "performance")
        print_status "⚡ Running performance tests..."
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test tests/cross-browser-performance.spec.js --grep 'Performance and Load Testing' --project=$BROWSER" "Performance Tests"; then
            ((FAILED_TESTS++))
        fi
        ;;
        
    "all"|*)
        print_status "🎯 Running complete E2E test suite..."
        
        # Core functionality tests
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test tests/core-functionality.spec.js --project=$BROWSER" "Core Functionality Tests"; then
            ((FAILED_TESTS++))
        fi
        
        # UI/UX tests
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test tests/ui-ux-experience.spec.js --project=$BROWSER" "UI/UX Experience Tests"; then
            ((FAILED_TESTS++))
        fi
        
        # MCP integration tests
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test tests/mcp-integration.spec.js --project=$BROWSER" "MCP Integration Tests"; then
            ((FAILED_TESTS++))
        fi
        
        # Cross-browser tests (only on chromium for "all" to save time)
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test tests/cross-browser-performance.spec.js --project=chromium" "Cross-Browser Tests"; then
            ((FAILED_TESTS++))
        fi
        
        # Accessibility tests
        ((TOTAL_TESTS++))
        if ! run_tests "npx playwright test tests/accessibility-edge-cases.spec.js --project=$BROWSER" "Accessibility Tests"; then
            ((FAILED_TESTS++))
        fi
        ;;
esac

# Generate test report
print_status "Generating test report..."
if npx playwright show-report --no-open; then
    print_success "Test report generated successfully"
else
    print_warning "Test report generation had issues"
fi

# Final results
echo ""
echo -e "${BLUE}📊 E2E Test Results Summary${NC}"
echo -e "${BLUE}============================${NC}"
echo "Total test suites: $TOTAL_TESTS"
echo "Failed test suites: $FAILED_TESTS"
echo "Success rate: $(( (TOTAL_TESTS - FAILED_TESTS) * 100 / TOTAL_TESTS ))%"

if [ $FAILED_TESTS -eq 0 ]; then
    print_success "🎉 All E2E tests passed successfully!"
    echo ""
    echo -e "${GREEN}✨ The Enhanced Figma Plugin is ready for production deployment!${NC}"
    exit 0
else
    print_error "❌ $FAILED_TESTS test suite(s) failed"
    echo ""
    echo -e "${RED}🔧 Please review the test report and fix failing tests before deployment${NC}"
    exit 1
fi