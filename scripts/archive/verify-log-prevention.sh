#!/bin/bash

# Log File Prevention Verification Script
# Verifies that all logging is properly configured to use the logs directory

echo "🔍 LOG FILE PREVENTION SYSTEM VERIFICATION"
echo "==========================================="
echo

# Check 1: Verify no log files in root
echo "📋 Check 1: Root Directory Cleanliness"
echo "--------------------------------------"
ROOT_LOG_COUNT=$(ls -1 *.log *.txt 2>/dev/null | wc -l)
if [ $ROOT_LOG_COUNT -eq 0 ]; then
    echo "✅ PASSED: No log or txt files found in project root"
else
    echo "❌ FAILED: Found $ROOT_LOG_COUNT log/txt files in root:"
    ls -la *.log *.txt 2>/dev/null
fi
echo

# Check 2: Verify logs directory structure
echo "📋 Check 2: Logs Directory Structure"
echo "------------------------------------"
if [ -d "logs" ]; then
    echo "✅ PASSED: logs/ directory exists"
    LOG_FILE_COUNT=$(ls -1 logs/ 2>/dev/null | wc -l)
    echo "📊 Found $LOG_FILE_COUNT files in logs directory:"
    ls -la logs/ | tail -n +2 | while read line; do
        echo "  📄 $line"
    done
else
    echo "❌ FAILED: logs/ directory does not exist"
fi
echo

# Check 3: Verify shell scripts use proper log paths
echo "📋 Check 3: Shell Script Configuration"
echo "--------------------------------------"
SHELL_SCRIPT_ISSUES=0

# Check validate-ultimate-test-suite.sh
if grep -q "logs/test_results_" scripts/validate-ultimate-test-suite.sh; then
    echo "✅ PASSED: validate-ultimate-test-suite.sh uses logs/ directory"
else
    echo "❌ FAILED: validate-ultimate-test-suite.sh not using logs/ directory"
    SHELL_SCRIPT_ISSUES=$((SHELL_SCRIPT_ISSUES + 1))
fi

# Check ui-figma-integration-test.sh
if grep -q "logs/server.log" scripts/ui-figma-integration-test.sh; then
    echo "✅ PASSED: ui-figma-integration-test.sh uses logs/ directory"
else
    echo "❌ FAILED: ui-figma-integration-test.sh not using logs/ directory"
    SHELL_SCRIPT_ISSUES=$((SHELL_SCRIPT_ISSUES + 1))
fi

if [ $SHELL_SCRIPT_ISSUES -eq 0 ]; then
    echo "🎉 All shell scripts properly configured!"
fi
echo

# Check 4: Verify logger classes use proper paths
echo "📋 Check 4: Logger Class Configuration"
echo "-------------------------------------"
LOGGER_ISSUES=0

# Check core/logging/logger.js
if grep -q "path.join(__dirname, '../../logs/" core/logging/logger.js; then
    echo "✅ PASSED: core/logging/logger.js uses proper path resolution"
else
    echo "❌ FAILED: core/logging/logger.js path issue"
    LOGGER_ISSUES=$((LOGGER_ISSUES + 1))
fi

# Check core/utils/logger.js
if grep -q "join(process.cwd(), 'logs')" core/utils/logger.js; then
    echo "✅ PASSED: core/utils/logger.js uses proper log directory"
else
    echo "❌ FAILED: core/utils/logger.js path issue"
    LOGGER_ISSUES=$((LOGGER_ISSUES + 1))
fi

if [ $LOGGER_ISSUES -eq 0 ]; then
    echo "🎉 All logger classes properly configured!"
fi
echo

# Check 5: Verify prevention utilities exist
echo "📋 Check 5: Prevention Utilities"
echo "--------------------------------"
UTIL_ISSUES=0

if [ -f "scripts/log-utils.sh" ]; then
    echo "✅ PASSED: log-utils.sh utility script exists"
else
    echo "❌ FAILED: log-utils.sh utility script missing"
    UTIL_ISSUES=$((UTIL_ISSUES + 1))
fi

if [ -f "scripts/monitor-log-files.sh" ]; then
    echo "✅ PASSED: monitor-log-files.sh monitoring script exists"
else
    echo "❌ FAILED: monitor-log-files.sh monitoring script missing"
    UTIL_ISSUES=$((UTIL_ISSUES + 1))
fi

if [ -f "docs/implementation/LOG_FILE_PREVENTION_SYSTEM.md" ]; then
    echo "✅ PASSED: LOG_FILE_PREVENTION_SYSTEM.md documentation exists"
else
    echo "❌ FAILED: LOG_FILE_PREVENTION_SYSTEM.md documentation missing"
    UTIL_ISSUES=$((UTIL_ISSUES + 1))
fi

if [ $UTIL_ISSUES -eq 0 ]; then
    echo "🎉 All prevention utilities in place!"
fi
echo

# Check 6: Test log creation (safe test)
echo "📋 Check 6: Log System Functionality Test"
echo "-----------------------------------------"
TEST_LOG_FILE="logs/verification_test_$(date +%s).log"
echo "Testing log creation at $(date)" > "$TEST_LOG_FILE"

if [ -f "$TEST_LOG_FILE" ]; then
    echo "✅ PASSED: Can create log files in logs/ directory"
    rm "$TEST_LOG_FILE"  # Clean up test file
    echo "🧹 Test file cleaned up"
else
    echo "❌ FAILED: Cannot create log files in logs/ directory"
fi
echo

# Final Summary
echo "📊 FINAL VERIFICATION SUMMARY"
echo "============================="
TOTAL_ISSUES=$((SHELL_SCRIPT_ISSUES + LOGGER_ISSUES + UTIL_ISSUES))

if [ $ROOT_LOG_COUNT -eq 0 ] && [ $TOTAL_ISSUES -eq 0 ]; then
    echo "🎉 ✅ ALL CHECKS PASSED!"
    echo "   🛡️  Log file prevention system is fully operational"
    echo "   📁 All logs will be created in logs/ directory"
    echo "   🔧 Prevention utilities are installed and ready"
    echo
    echo "🚀 SYSTEM STATUS: PROTECTED"
else
    echo "⚠️  ❌ ISSUES DETECTED!"
    echo "   📊 Root log files: $ROOT_LOG_COUNT"
    echo "   🔧 Configuration issues: $TOTAL_ISSUES"
    echo
    echo "🚨 SYSTEM STATUS: NEEDS ATTENTION"
fi
echo

echo "📚 For more information, see: docs/implementation/LOG_FILE_PREVENTION_SYSTEM.md"
echo "🔍 To monitor for new log files: ./scripts/monitor-log-files.sh"