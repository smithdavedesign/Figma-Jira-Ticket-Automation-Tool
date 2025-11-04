#!/usr/bin/env node

/**
 * Test New Architecture CLI
 *
 * Quick way to test the new architecture:
 * Figma API → Context Layer → YAML Templates → Docs
 */

import { validateNewArchitecture, runArchitectureTests } from './architecture/new-architecture-test.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'validate';

  console.log('🏗️ NEW ARCHITECTURE TEST TOOL\n');

  switch (command) {
  case 'validate': {
    console.log('Running quick validation...\n');
    const isValid = await validateNewArchitecture();
    process.exit(isValid ? 0 : 1);
    break;
  }

  case 'test': {
    console.log('Running comprehensive tests...\n');
    const results = await runArchitectureTests();
    const success = results.summary.passed === results.summary.total;
    process.exit(success ? 0 : 1);
    break;
  }

  case 'help':
  default:
    console.log('Usage:');
    console.log('  node test-new-architecture.js validate  # Quick validation');
    console.log('  node test-new-architecture.js test      # Full test suite');
    console.log('  node test-new-architecture.js help      # Show this help');
    console.log('');
    console.log('Architecture:');
    console.log('  Primary:  Figma API → Context Layer → YAML Templates → Docs');
    console.log('  Optional: Context Layer → MCP Adapter → Multi-agent → Enhanced');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});