// Tech Stack Parsing Test Suite
console.log('🧪 Testing Enhanced Tech Stack Parsing\n');

function simulateNaturalLanguageParsing(description) {
  const lowerDesc = description.toLowerCase();
  
  // Enhanced Framework Detection with scoring
  const frameworks = [
    { name: 'AEM', keywords: ['aem', 'adobe experience manager', 'htl', 'html template language', 'sling', 'osgi', 'touch ui', 'jcr'], score: 0 },
    { name: 'React Native', keywords: ['react native', 'expo', 'rn'], score: 0 },
    { name: 'Next.js', keywords: ['next.js', 'nextjs', 'next'], score: 0 },
    { name: 'Nuxt.js', keywords: ['nuxt.js', 'nuxtjs', 'nuxt'], score: 0 },
    { name: 'Vue.js', keywords: ['vue', 'vuejs', 'vue 3', 'composition api'], score: 0 },
    { name: 'Angular', keywords: ['angular', 'ng', 'ngrx'], score: 0 },
    { name: 'Svelte', keywords: ['svelte', 'sveltekit'], score: 0 },
    { name: 'Flutter', keywords: ['flutter', 'dart flutter'], score: 0 },
    { name: 'React', keywords: ['react', 'jsx', 'create-react-app'], score: 0 }
  ];

  const languages = [
    { name: 'HTL', keywords: ['htl', 'html template language', 'sightly'], score: 0 },
    { name: 'TypeScript', keywords: ['typescript', 'ts', '.tsx', '.ts'], score: 0 },
    { name: 'Dart', keywords: ['dart', 'flutter dart'], score: 0 },
    { name: 'Kotlin', keywords: ['kotlin', 'android kotlin'], score: 0 },
    { name: 'Swift', keywords: ['swift', 'ios swift'], score: 0 },
    { name: 'JavaScript', keywords: ['javascript', 'js', '.jsx', '.js'], score: 0 }
  ];

  const stylings = [
    { name: 'Touch UI', keywords: ['touch ui', 'touch ui components', 'aem touch ui', 'coral ui'], score: 0 },
    { name: 'Tailwind CSS', keywords: ['tailwind', 'tailwindcss', 'utility-first'], score: 0 },
    { name: 'Material-UI', keywords: ['material-ui', 'mui', 'material design', '@mui'], score: 0 },
    { name: 'Chakra UI', keywords: ['chakra ui', 'chakra', '@chakra-ui'], score: 0 },
    { name: 'Ant Design', keywords: ['ant design', 'antd', 'ant-design'], score: 0 },
    { name: 'Styled Components', keywords: ['styled-components', 'styled components', 'css-in-js'], score: 0 },
    { name: 'SCSS/Sass', keywords: ['scss', 'sass', '.scss', '.sass'], score: 0 },
    { name: 'Bootstrap', keywords: ['bootstrap', 'bs5', 'bootstrap 5'], score: 0 },
    { name: 'CSS Modules', keywords: ['css modules', '.module.css'], score: 0 },
    { name: 'CSS', keywords: ['css', 'vanilla css'], score: 0 }
  ];

  const testings = [
    { name: 'AEM Testing', keywords: ['aem testing', 'osgi testing', 'sling testing', 'aem unit tests'], score: 0 },
    { name: 'Playwright', keywords: ['playwright', 'e2e testing', 'end-to-end'], score: 0 },
    { name: 'Cypress', keywords: ['cypress', 'cypress.io'], score: 0 },
    { name: 'Jest', keywords: ['jest', 'jest testing'], score: 0 },
    { name: 'Vitest', keywords: ['vitest', 'vite testing'], score: 0 },
    { name: 'Testing Library', keywords: ['testing library', '@testing-library', 'react testing library'], score: 0 },
    { name: 'Karma', keywords: ['karma', 'karma jasmine'], score: 0 },
    { name: 'Jasmine', keywords: ['jasmine', 'jasmine testing'], score: 0 },
    { name: 'Manual Testing', keywords: ['manual', 'no testing', 'basic testing'], score: 0 }
  ];

  // Score each category based on keyword matches
  function scoreCategory(items) {
    items.forEach(item => {
      item.keywords.forEach(keyword => {
        if (lowerDesc.includes(keyword)) {
          item.score += keyword.length; // Longer matches get higher scores
        }
      });
    });
    return items.sort((a, b) => b.score - a.score)[0] || items[items.length - 1];
  }

  const framework = scoreCategory([...frameworks]).name;
  const language = scoreCategory([...languages]).name;
  const styling = scoreCategory([...stylings]).name;
  const testing = scoreCategory([...testings]).name;

  // Calculate confidence based on matches and specificity
  const totalMatches = frameworks.concat(languages, stylings, testings)
    .filter(item => item.score > 0).length;
  
  let confidence = Math.min(75 + (totalMatches * 3), 98);
  
  // Bonus points for specific combinations that make sense
  if (framework === 'Flutter' && language === 'Dart') confidence += 5;
  if (framework === 'Next.js' && language === 'TypeScript') confidence += 3;
  if (framework === 'React' && testing === 'Jest') confidence += 2;
  if (framework === 'Vue.js' && testing === 'Vitest') confidence += 3;
  
  // Penalty for unlikely combinations
  if (framework === 'Flutter' && language !== 'Dart') confidence -= 10;
  if (framework === 'Angular' && styling === 'Tailwind CSS') confidence -= 2; // Less common
  
  confidence = Math.max(65, Math.min(98, confidence));
  
  return {
    framework,
    language,
    styling,
    testing,
    confidence: Math.round(confidence),
    description,
    matches: totalMatches
  };
}

// Test Cases
const testCases = [
  "AEM 6.5 with HTL (HTML Template Language), Apache Sling framework, OSGi bundles, JCR repository, Touch UI components",
  "React app with TypeScript, Material-UI for styling, Jest for testing",
  "Vue 3 with Composition API, SCSS, Pinia, and Vitest testing",
  "Next.js with TypeScript, Chakra UI, and Playwright tests",
  "Angular with Material Design, NgRx, and Karma tests",
  "React Native mobile app with Expo and TypeScript",
  "Flutter app with Material Design and Dart",
  "I need a modern web app using React, styled with Tailwind CSS, written in TypeScript, and tested with Jest",
  "Building a Vue.js application with SCSS styling and Cypress testing",
  "Angular project using Bootstrap and Jasmine for unit testing",
  "Simple website with vanilla CSS and manual testing"
];

console.log('📊 Test Results:\n');

testCases.forEach((testCase, index) => {
  const result = simulateNaturalLanguageParsing(testCase);
  console.log(`Test ${index + 1}: ${testCase.substring(0, 50)}...`);
  console.log(`  Framework: ${result.framework}`);
  console.log(`  Language: ${result.language}`);
  console.log(`  Styling: ${result.styling}`);
  console.log(`  Testing: ${result.testing}`);
  console.log(`  Confidence: ${result.confidence}% (${result.matches} matches)`);
  console.log('');
});

console.log('✅ Tech Stack Parsing Test Complete!');