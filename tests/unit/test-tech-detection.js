#!/usr/bin/env node

/**
 * Test script to verify tech stack detection logic
 */

function detectTechStackPlatform(techStack, defaultPlatform) {
  if (!techStack) return defaultPlatform;
  
  const techStackString = Array.isArray(techStack) 
    ? techStack.join(' ').toLowerCase()
    : techStack.toLowerCase();
  
  console.log(`🔍 Analyzing tech stack: ${techStackString}`);
  
  // AEM detection patterns
  if (techStackString.includes('aem') || 
      techStackString.includes('htl') ||
      techStackString.includes('sling') ||
      techStackString.includes('osgi') ||
      techStackString.includes('jcr')) {
    console.log('✅ AEM tech stack detected!');
    return 'AEM';
  }
  
  // React/Next.js detection
  if (techStackString.includes('react') || techStackString.includes('next')) {
    console.log('⚛️ React/Next.js tech stack detected!');
    return 'jira'; // Could be 'react' if we had React-specific templates
  }
  
  // Vue detection
  if (techStackString.includes('vue')) {
    console.log('💚 Vue tech stack detected!');
    return 'jira'; // Could be 'vue' if we had Vue-specific templates
  }
  
  // Angular detection
  if (techStackString.includes('angular')) {
    console.log('🅰️ Angular tech stack detected!');
    return 'jira'; // Could be 'angular' if we had Angular-specific templates
  }
  
  console.log(`🔄 Using default platform: ${defaultPlatform}`);
  return defaultPlatform;
}

console.log('🧪 Testing Tech Stack Detection Logic\n');

// Test cases
const testCases = [
  {
    name: 'AEM with HTL',
    techStack: ['AEM 6.5', 'HTL templates', 'Sling Model development'],
    expected: 'AEM'
  },
  {
    name: 'Manual AEM input (string)',
    techStack: 'AEM 6.5 with HTL (HTML Template Language), Apache Sling framework, OSGi bundles, JCR repository, Touch UI components',
    expected: 'AEM'
  },
  {
    name: 'React TypeScript',
    techStack: ['React 18', 'TypeScript', 'Material-UI'],
    expected: 'jira'
  },
  {
    name: 'Vue.js',
    techStack: 'Vue 3 with Composition API, Pinia for state, Vite build tool',
    expected: 'jira'
  },
  {
    name: 'Angular',
    techStack: ['Angular 15', 'NgRx', 'Angular Material'],
    expected: 'jira'
  },
  {
    name: 'Next.js',
    techStack: 'Next.js 13 with App Router, TailwindCSS, Prisma ORM, PostgreSQL',
    expected: 'jira'
  },
  {
    name: 'Empty tech stack',
    techStack: null,
    expected: 'jira'
  },
  {
    name: 'JCR Repository focus',
    techStack: ['Java', 'JCR repository', 'Apache Jackrabbit'],
    expected: 'AEM'
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Testing: ${testCase.name}`);
  console.log(`   Input: ${JSON.stringify(testCase.techStack)}`);
  
  const result = detectTechStackPlatform(testCase.techStack, 'jira');
  const passed = result === testCase.expected;
  
  console.log(`   Expected: ${testCase.expected}`);
  console.log(`   Got: ${result}`);
  console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n🎯 Testing Summary:');
console.log('- AEM detection works for: "aem", "htl", "sling", "osgi", "jcr" keywords');
console.log('- Other frameworks default to "jira" platform');
console.log('- Manual input (strings) and button input (arrays) both supported');
console.log('- Case-insensitive detection');