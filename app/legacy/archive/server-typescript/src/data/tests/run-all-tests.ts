#!/usr/bin/env node

/**
 * Test Runner for Data Layer Components
 * 
 * Executes all test suites and provides comprehensive reporting
 */

import { DataLayerTestRunner } from './test-all-components.js';
import { runSimplifiedComponentTests } from './test-simplified-components.js';

/**
 * Main test runner function
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 Starting Data Layer Test Suite');
  console.log('='.repeat(80));
  console.log();

  const startTime = Date.now();
  let totalErrors = 0;

  // Run simplified component tests first
  console.log('📋 Phase 1: Simplified Component Tests');
  console.log('-'.repeat(80));
  try {
    await runSimplifiedComponentTests();
    console.log('✅ Simplified tests completed\n');
  } catch (error) {
    console.error('❌ Simplified tests failed:', error);
    totalErrors++;
    console.log();
  }

  // Run comprehensive component tests
  console.log('📋 Phase 2: Comprehensive Component Tests');
  console.log('-'.repeat(80));
  try {
    const testRunner = new DataLayerTestRunner();
    await testRunner.runAllTests();
    console.log('✅ Comprehensive tests completed\n');
  } catch (error) {
    console.error('❌ Comprehensive tests failed:', error);
    totalErrors++;
    console.log();
  }

  const totalTime = Date.now() - startTime;

  // Final summary
  console.log('='.repeat(80));
  console.log('🏁 Final Test Results Summary');
  console.log('='.repeat(80));
  console.log(`   Total Duration: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(`   Test Phases: 2`);
  console.log(`   Errors: ${totalErrors}`);
  
  if (totalErrors === 0) {
    console.log('   Status: 🎉 ALL TESTS PASSED!');
    console.log('   The data layer is functioning correctly.');
  } else {
    console.log(`   Status: ⚠️  ${totalErrors} PHASE(S) HAD ERRORS`);
    console.log('   Review the output above for details.');
  }
  
  console.log('='.repeat(80));
  console.log();

  // Exit with appropriate code
  process.exit(totalErrors === 0 ? 0 : 1);
}

// Execute if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch((error) => {
    console.error('Fatal error in test runner:', error);
    process.exit(1);
  });
}

export { runAllTests };