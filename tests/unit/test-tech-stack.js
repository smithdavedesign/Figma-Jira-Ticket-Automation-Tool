// Test tech stack detection logic
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
  
  return defaultPlatform;
}

// Test cases
const testCases = [
  {
    name: "AEM Button Click",
    techStack: ["AEM 6.5 with HTL (HTML Template Language)", "Apache Sling framework", "OSGi bundles", "JCR repository", "Touch UI components"],
    expected: "AEM"
  },
  {
    name: "React Button Click", 
    techStack: ["React 18 with TypeScript", "Material-UI v5", "React Query for state management"],
    expected: "jira"
  },
  {
    name: "Single AEM String",
    techStack: "AEM 6.5 with HTL",
    expected: "AEM"
  }
];

console.log("🧪 Testing Tech Stack Detection Logic\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: ${JSON.stringify(testCase.techStack)}`);
  const result = detectTechStackPlatform(testCase.techStack, 'jira');
  console.log(`Expected: ${testCase.expected}, Got: ${result}`);
  console.log(`✅ ${result === testCase.expected ? 'PASS' : 'FAIL'}\n`);
});