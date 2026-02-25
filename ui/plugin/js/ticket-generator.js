/**
 * Ticket Generator functionality
 * Handles AI-powered ticket generation from Figma frames
 */

// State management
let frameDataList = [];
let isGenerating = false;
let hasGeneratedTicket = false; // Track if ticket was generated for current selection
let currentSelectionHash = ''; // Hash of current selection to detect changes
// Global variables
let globalFileKey = '';
let globalFileName = '';
let globalTeamParam = ''; // Store team parameter for URL generation
let currentFrameData = [];
let contextData = null;

/**
 * Initialize ticket generator
 */
function initializeTicketGenerator() {
  if (!elements.generateBtn) return;
  
  // Event listeners
  elements.generateBtn.onclick = generateTicket;
  elements.copyBtn.onclick = handleCopyToClipboard;
  elements.apiKeyInput.onchange = saveSettings;
  elements.modelSelect.onchange = saveSettings;
  elements.templateSelect.onchange = saveSettings;
  
  // Load saved settings
  loadSettings();
  
  console.log('🎫 Ticket Generator initialized');
}

/**
 * Generate ticket from selected frames
 */
function generateTicket() {
  if (isGenerating) return;
  
  // Check if ticket was already generated for current selection
  if (hasGeneratedTicket && currentSelectionHash) {
    showStatus('Ticket already generated for this selection. Change selection to generate a new ticket.', 'error');
    return;
  }

  setGenerating(true);
  showStatus('Reading selected frames...', 'loading');
  
  // Request frame data from Figma
  sendToPlugin({ type: 'generate-ticket' });
}

/**
 * Handle frame data received from plugin
 * @param {Array} data - Frame data array
 */
function handleFrameData(data) {
  frameDataList = data;
  
  // Create hash of current selection to detect changes
  const newSelectionHash = createSelectionHash(data);
  
  // Check if selection changed - reset ticket generation state
  if (newSelectionHash !== currentSelectionHash) {
    currentSelectionHash = newSelectionHash;
    hasGeneratedTicket = false;
    resetGenerateButton();
    elements.output.value = ''; // Clear previous output
    elements.copyBtn.disabled = true;
  }
  
  displayFrameInfo(frameDataList);
  displayComplianceInfo(frameDataList);
  generateAITicket();
}

/**
 * Generate AI ticket using comprehensive plugin intelligence layer
 */
async function generateAITicket() {
  if (!frameDataList.length) {
    showStatus('No frame data received', 'error');
    setGenerating(false);
    return;
  }

  console.log('🚀 Starting comprehensive intelligence ticket generation...');

  try {
    showStatus('🧠 Analyzing with comprehensive intelligence layer...', 'loading');
    
    // Step 1: Get comprehensive context analysis
    const comprehensiveAnalysis = await callPluginIntelligence('comprehensive-context', {
      frameData: frameDataList,
      template: elements.templateSelect.value,
      projectName: globalFileName || 'Figma Design',
      fileKey: globalFileKey,
      fileName: globalFileName
    });
    
    console.log('🧠 Comprehensive analysis received:', comprehensiveAnalysis);
    
    if (comprehensiveAnalysis && comprehensiveAnalysis.success) {
      showStatus('🎫 Generating AI ticket with intelligence context...', 'loading');
      
      // Step 2: Generate ticket using the comprehensive context
      // Get Active Creation checkbox state
      const activeCreationCheckbox = document.getElementById('activeCreation');
      const enableActiveCreation = activeCreationCheckbox ? activeCreationCheckbox.checked : false;
      const projectKeyInput = document.getElementById('projectKey'); // Optional: if we add this input later
      
      const ticketResponse = await callPluginGenerate({
        frameData: frameDataList,
        comprehensiveContext: comprehensiveAnalysis,
        template: elements.templateSelect.value,
        projectName: globalFileName || 'Figma Design',
        documentType: 'component',
        format: 'jira',
        enableActiveCreation: enableActiveCreation,
        // Optional params if inputs exist
        // projectKey: projectKeyInput?.value 
      });
      
      console.log('🎫 Ticket generation response:', ticketResponse);
      
      if (ticketResponse && ticketResponse.success && ticketResponse.content) {
        elements.output.value = ticketResponse.content;
        
        // Handle Orchestration Results (Jira/Wiki/Git)
        if (ticketResponse.orchestration) {
          const orch = ticketResponse.orchestration;
          let orchMsg = "\n\n## 🚀 Active Orchestration Results\n";
          
          if (orch.jira && orch.jira.status !== 'pending') {
              if (orch.jira.key) orchMsg += `- **Jira Ticket:** [${orch.jira.key}](${orch.jira.url}) (${orch.jira.status})\n`;
              else if (orch.jira.error) orchMsg += `- **Jira Ticket:** ❌ Failed (${orch.jira.error})\n`;
              else orchMsg += `- **Jira Ticket:** ${orch.jira.status}\n`;
          }
          
          if (orch.wiki && orch.wiki.status !== 'pending') {
               if (orch.wiki.url) orchMsg += `- **Wiki Page:** [${orch.wiki.title}](${orch.wiki.url}) (${orch.wiki.status})\n`;
               else if (orch.wiki.error) orchMsg += `- **Wiki Page:** ❌ Failed (${orch.wiki.error})\n`;
               else orchMsg += `- **Wiki Page:** ${orch.wiki.status}\n`;
          }
          
          if (orch.git && orch.git.status !== 'pending') {
               if (orch.git.branch) orchMsg += `- **Git Branch:** \`${orch.git.branch}\` (${orch.git.status})\n`;
               else if (orch.git.error) orchMsg += `- **Git Branch:** ❌ Failed (${orch.git.error})\n`;
               else orchMsg += `- **Git Branch:** ${orch.git.status}\n`;
          }
          
          if (orchMsg !== "\n\n## 🚀 Active Orchestration Results\n") {
             elements.output.value += orchMsg;
          }
        }

        elements.copyBtn.disabled = false;
        hasGeneratedTicket = true;
        setGeneratingComplete();
        showStatus('✅ Comprehensive intelligence ticket generated!', 'success');
        return;
      }
    }
    
    // Fallback to basic analysis if comprehensive fails
    console.log('🔄 Comprehensive analysis failed, trying basic analysis...');
    showStatus('🔍 Trying basic intelligence analysis...', 'loading');
    
    const basicAnalysis = await callPluginIntelligence('analyze', {
      frameData: frameDataList,
      analysisType: 'basic',
      template: elements.templateSelect.value
    });
    
    if (basicAnalysis && basicAnalysis.success) {
      const basicTicket = generateBasicTicketFromAnalysis(basicAnalysis, frameDataList);
      elements.output.value = basicTicket;
      elements.copyBtn.disabled = false;
      hasGeneratedTicket = true;
      setGeneratingComplete();
      showStatus('✅ Basic intelligence ticket generated!', 'success');
      return;
    }
    
    // Final fallback ticket generation
    console.log('🔄 Intelligence layers failed, generating fallback ticket');
    showStatus('⚠️ Using fallback generation...', 'loading');
    
    const fallbackTicket = `# Generated Ticket (Fallback)

## ${frameDataList[0]?.name || 'Component'} Implementation

### Description
Implement the ${frameDataList[0]?.name || 'selected component'} based on Figma design specifications.

### Acceptance Criteria
- [ ] Component matches design specifications
- [ ] Component is responsive across all devices  
- [ ] Component passes accessibility testing
- [ ] Unit tests provide adequate coverage

### Technical Notes
- Based on ${frameDataList.length} selected frame(s)
- Generated with fallback (intelligence layer unavailable)
- Node count: ${frameDataList[0]?.nodeCount || 'Unknown'}
- Dimensions: ${frameDataList[0]?.dimensions?.width || 0}x${frameDataList[0]?.dimensions?.height || 0}px

### Priority
Medium

### Story Points
${Math.max(3, Math.min(8, Math.ceil((frameDataList[0]?.nodeCount || 0) / 5)))}

---
*Generated at ${new Date().toISOString()}*`;
    
    elements.output.value = fallbackTicket;
    elements.copyBtn.disabled = false;
    hasGeneratedTicket = true;
    setGeneratingComplete();
    showStatus('⚠️ Fallback ticket generated (intelligence layer unavailable)', 'error');
    
  } catch (error) {
    console.error('❌ Error in ticket generation:', error);
    
    // Final fallback
    const simpleTicket = `# Simple Ticket

## Component Implementation

### Description  
Implement the selected component based on Figma design.

### Acceptance Criteria
- [ ] Match design specifications
- [ ] Ensure responsiveness
- [ ] Pass accessibility tests

---
*Generated at ${new Date().toISOString()}*`;
    
    elements.output.value = simpleTicket;
    elements.copyBtn.disabled = false;
    hasGeneratedTicket = true;
    setGeneratingComplete();
    showStatus('⚠️ Simple ticket generated (errors occurred)', 'error');
  } finally {
    setGenerating(false);
  }
}

/**
 * Call Plugin Intelligence Layer for comprehensive analysis
 */
async function callPluginIntelligence(endpoint, params) {
  try {
    console.log(`🧠 Calling plugin intelligence: /plugin/${endpoint}`, params);
    
    const response = await fetch(`http://localhost:3000/plugin/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    console.log(`📡 Plugin ${endpoint} response status:`, response.status);
    
    if (!response.ok) {
      throw new Error(`Plugin Intelligence error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📦 Plugin ${endpoint} response data:`, data);
    return data;
  } catch (error) {
    console.warn(`Plugin Intelligence ${endpoint} not available:`, error);
    return null;
  }
}

/**
 * Call Plugin Generate endpoint for AI-powered ticket creation
 */
async function callPluginGenerate(params) {
  try {
    console.log('🎫 Calling plugin generate:', params);
    
    const response = await fetch('http://localhost:3000/plugin/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    console.log('📡 Plugin generate response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Plugin Generate error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Plugin generate response data:', data);
    return data;
  } catch (error) {
    console.warn('Plugin Generate not available:', error);
    return null;
  }
}

/**
 * Generate basic ticket from intelligence analysis
 */
function generateBasicTicketFromAnalysis(analysis, frameDataList) {
  const frameName = frameDataList[0]?.name || 'Component';
  const intelligence = analysis.intelligence || {};
  const semantic = intelligence.semantic || {};
  const accessibility = intelligence.accessibility || {};
  const designTokens = intelligence.designTokens || {};
  
  let ticket = `# ${frameName} Implementation

## Description
Implement the ${frameName} component based on Figma design analysis.

`;

  // Add semantic analysis if available
  if (semantic.elements && semantic.elements.length > 0) {
    ticket += `### Component Analysis
Based on semantic analysis, this component contains:
`;
    semantic.elements.forEach(element => {
      ticket += `- ${element.type}: ${element.description}\n`;
    });
    ticket += '\n';
  }

  // Add accessibility information
  if (accessibility.level) {
    ticket += `### Accessibility Requirements
- Target compliance level: ${accessibility.level}
- Estimated accessibility score: ${Math.round((accessibility.score || 0.8) * 100)}%
`;
    if (accessibility.recommendations && accessibility.recommendations.length > 0) {
      ticket += '- Key accessibility considerations:\n';
      accessibility.recommendations.slice(0, 3).forEach(rec => {
        ticket += `  - ${rec}\n`;
      });
    }
    ticket += '\n';
  }

  // Add design token information
  if (designTokens.colors && designTokens.colors.length > 0) {
    ticket += `### Design Tokens
- Colors: ${designTokens.colors.join(', ')}
`;
    if (designTokens.typography && designTokens.typography.length > 0) {
      ticket += `- Typography: ${designTokens.typography.join(', ')}\n`;
    }
    if (designTokens.spacing && designTokens.spacing.length > 0) {
      ticket += `- Spacing: ${designTokens.spacing.join(', ')}\n`;
    }
    ticket += '\n';
  }

  ticket += `### Acceptance Criteria
- [ ] Component matches design specifications from Figma
- [ ] Component is responsive across all devices
- [ ] Component passes accessibility testing (${accessibility.level || 'WCAG AA'})
- [ ] Component uses proper design tokens for consistency
- [ ] Unit tests provide adequate coverage

### Technical Notes
- Based on ${frameDataList.length} selected frame(s) with intelligence analysis
- Analysis confidence: ${Math.round((analysis.confidence || 0.8) * 100)}%
- Node count: ${frameDataList[0]?.nodeCount || 'Unknown'}
- Dimensions: ${frameDataList[0]?.dimensions?.width || 0}x${frameDataList[0]?.dimensions?.height || 0}px

### Priority
Medium

### Story Points
${Math.max(3, Math.min(8, Math.ceil((frameDataList[0]?.nodeCount || 0) / 5)))}

---
*Generated with Intelligence Layer Analysis at ${new Date().toISOString()}*`;

  return ticket;
}

/**
 * Create prompt for AI ticket generation
 * @param {Array} frameDataList - Array of frame data
 * @returns {string} Generated prompt
 */
function createPrompt(frameDataList) {
  const template = elements.templateSelect.value;
  const customInstructions = elements.customPromptInput.value.trim();
  
  let basePrompt = '';
  
  switch (template) {
    case 'component':
      basePrompt = 'Generate a Jira ticket for implementing a UI component based on the following Figma design:';
      break;
    case 'feature':
      basePrompt = 'Generate a Jira ticket for implementing a new feature based on the following Figma design:';
      break;
    case 'bug':
      basePrompt = 'Generate a Jira ticket for fixing a UI/UX issue based on the following Figma design:';
      break;
    case 'page':
      basePrompt = 'Generate a Jira ticket for implementing a page/screen based on the following Figma design:';
      break;
    default:
      basePrompt = 'Generate a Jira ticket based on the following Figma design:';
  }

  let prompt = basePrompt + '\\n\\n';

  frameDataList.forEach((frame, index) => {
    prompt += `**Frame ${index + 1}: ${frame.name}**\\n`;
    prompt += `- Page: ${frame.pageName}\\n`;
    prompt += `- Type: ${frame.type}\\n`;
    prompt += `- Dimensions: ${frame.dimensions.width}x${frame.dimensions.height}px\\n`;
    prompt += `- Child elements: ${frame.nodeCount}\\n`;
    
    if (frame.textContent.length > 0) {
      prompt += `- Text content: ${frame.textContent.map(t => `"${t.content}"`).join(', ')}\\n`;
    }
    
    if (frame.components.length > 0) {
      prompt += `- Components used: ${frame.components.map(c => c.name || c.componentName || 'Unknown Component').join(', ')}\\n`;
    }
    
    if (frame.colors.length > 0) {
      prompt += `- Colors: ${frame.colors.join(', ')}\\n`;
    }
    
    if (frame.hasPrototype) {
      prompt += `- Has interactive prototype\\n`;
    }

    // Add design system context if available
    if (frame.designSystemContext) {
      const context = frame.designSystemContext;
      
      if (context.designSystem) {
        prompt += `\\n**Design System Information:**\\n`;
        prompt += `- Design System: ${context.designSystem.name}\\n`;
        prompt += `- Detection Confidence: ${Math.round(context.designSystem.detectionConfidence * 100)}%\\n`;
      }

      if (context.complianceReport) {
        const report = context.complianceReport;
        prompt += `\\n**Design System Compliance:**\\n`;
        prompt += `- Overall Score: ${report.overallScore}%\\n`;
        prompt += `- Color Compliance: ${report.colorCompliance.score}% (${report.colorCompliance.tokenizedColors}/${report.colorCompliance.totalColors} using tokens)\\n`;
        prompt += `- Typography Compliance: ${report.typographyCompliance.score}% (${report.typographyCompliance.tokenizedText}/${report.typographyCompliance.totalTextElements} using styles)\\n`;
        prompt += `- Component Compliance: ${report.componentCompliance.score}% (${report.componentCompliance.standardComponents}/${report.componentCompliance.totalComponents} standard components)\\n`;
      }

      if (context.usedTokens && context.usedTokens.length > 0) {
        prompt += `\\n**Design Tokens Used:**\\n`;
        context.usedTokens.forEach(token => {
          prompt += `- ${token.name} (${token.type})\\n`;
        });
      }

      if (context.violations && context.violations.length > 0) {
        prompt += `\\n**Design System Violations:**\\n`;
        context.violations.forEach(violation => {
          prompt += `- ${violation.description}\\n`;
          prompt += `  Suggested Fix: ${violation.suggestedFix}\\n`;
        });
      }

      if (context.recommendations && context.recommendations.length > 0) {
        prompt += `\\n**Design System Recommendations:**\\n`;
        context.recommendations.slice(0, 3).forEach(rec => { // Limit to top 3
          prompt += `- [${rec.severity.toUpperCase()}] ${rec.message}\\n`;
          prompt += `  Suggestion: ${rec.suggestion}\\n`;
        });
      }
    }
    
    // Create proper Figma deep link with team parameter preservation
    const fileKey = frame.fileKey || globalFileKey || '';
    const nodeId = frame.id.replace(':', '-'); // Convert colon to hyphen format
    const fileName = globalFileName ? `/${encodeURIComponent(globalFileName)}` : '';
    
    // Build URL with team parameter if available, otherwise use timestamp
    let figmaLink = `https://www.figma.com/design/${fileKey}${fileName}?node-id=${nodeId}`;
    if (globalTeamParam && globalTeamParam.trim()) {
      figmaLink += `&t=${globalTeamParam}`;
    } else {
      figmaLink += `&t=${Date.now()}`;
    }
    
    prompt += `\\n- Figma link: ${figmaLink}\\n`;
    prompt += `- Frame ID: ${frame.id} (for developer reference)\\n\\n`;
  });

  if (customInstructions) {
    prompt += `**Additional Requirements:**\\n${customInstructions}\\n\\n`;
  }

  prompt += `Please format the response as:\\n\\n`;
  prompt += `**Title:** [Concise ticket title]\\n\\n`;
  prompt += `**Description:**\\n[Detailed description with context and requirements]\\n\\n`;
  prompt += `**Figma Reference:**\\n[Include the Figma link and frame details for easy access]\\n\\n`;
  prompt += `**Acceptance Criteria:**\\n1. [Specific, testable criteria]\\n2. [Another criteria]\\n3. [etc.]\\n\\n`;
  prompt += `**Technical Notes:**\\n[Any implementation details, dependencies, or considerations]\\n\\n`;
  prompt += `**Design Specs:**\\n[Key measurements, colors, fonts, and visual requirements from the Figma frame]\\n\\n`;
  
  // Add design system specific instructions if we have design system data
  const hasDesignSystemData = frameDataList.some(frame => frame.designSystemContext);
  if (hasDesignSystemData) {
    prompt += `**Design System Compliance:**\\n[Address any violations mentioned above and ensure implementation follows the design system standards. Reference specific tokens and components where applicable.]\\n\\n`;
    prompt += `**Design System Notes:**\\n[Include specific design token names, component variants, and compliance recommendations to maintain consistency with the established design system.]`;
  }

  return prompt;
}

/**
 * Extract team parameter from Figma URL
 * @param {string} figmaUrl - Full Figma URL
 * @returns {string} Team parameter or empty string
 */
function extractTeamParamFromUrl(figmaUrl) {
  if (!figmaUrl || typeof figmaUrl !== 'string') return '';
  const match = figmaUrl.match(/[?&]t=([^&]+)/);
  return match ? match[1] : '';
}

/**
 * Set team parameter for URL generation (can be called from UI)
 * @param {string} teamParam - Team parameter value
 */
function setTeamParam(teamParam) {
  globalTeamParam = teamParam || '';
  console.log('🔗 Team parameter updated:', globalTeamParam ? '✅ Set' : '❌ Cleared');
}

/**
 * Handle team parameter input from UI
 * @param {string} input - User input (can be full URL or just team parameter)
 */
function handleTeamParamInput(input) {
  if (!input || !input.trim()) {
    setTeamParam('');
    return;
  }
  
  // If input looks like a URL, extract team parameter
  if (input.includes('figma.com')) {
    const teamParam = extractTeamParamFromUrl(input);
    setTeamParam(teamParam);
    
    // Update the input field to show just the extracted parameter
    const inputField = document.getElementById('teamParam');
    if (inputField && teamParam) {
      inputField.value = teamParam;
      inputField.title = `Extracted from URL: ${teamParam}`;
    }
  } else {
    // Assume it's already a team parameter
    setTeamParam(input.trim());
  }
}

// Make functions and variables available globally for HTML usage
window.handleTeamParamInput = handleTeamParamInput;
window.setTeamParam = setTeamParam;
window.getTeamParam = () => globalTeamParam;

/**
 * Display frame information
 * @param {Array} frameDataList - Array of frame data
 */
function displayFrameInfo(frameDataList) {
  if (!frameDataList.length) {
    elements.frameInfoDiv.classList.add('hidden');
    return;
  }

  let html = '';
  frameDataList.forEach((frame, index) => {
    html += `
      <div class="frame-info">
        <div class="frame-name">${frame.name}</div>
        <div class="frame-details">
          ${frame.type} • ${frame.dimensions.width}x${frame.dimensions.height}px • ${frame.nodeCount} elements
        </div>
      </div>
    `;
  });

  elements.frameInfoDiv.innerHTML = html;
  elements.frameInfoDiv.classList.remove('hidden');
}

/**
 * Display compliance information for ticket panel
 * @param {Array} frameDataList - Array of frame data
 */
function displayComplianceInfo(frameDataList) {
  if (!elements.complianceInfo) return;
  
  // Find frames with design system context
  const framesWithContext = frameDataList.filter(frame => 
    frame.designSystemContext && frame.designSystemContext.complianceReport
  );

  if (framesWithContext.length === 0) {
    elements.complianceInfo.classList.add('hidden');
    return;
  }

  // Calculate average scores
  let totalOverall = 0;
  let totalColor = 0;
  let totalTypography = 0;
  let totalComponent = 0;
  let allRecommendations = [];

  framesWithContext.forEach(frame => {
    const report = frame.designSystemContext.complianceReport;
    totalOverall += report.overallScore;
    totalColor += report.colorCompliance.score;
    totalTypography += report.typographyCompliance.score;
    totalComponent += report.componentCompliance.score;
    allRecommendations = allRecommendations.concat(report.recommendations);
  });

  const count = framesWithContext.length;
  const avgOverall = Math.round(totalOverall / count);
  const avgColor = Math.round(totalColor / count);
  const avgTypography = Math.round(totalTypography / count);
  const avgComponent = Math.round(totalComponent / count);

  if (elements.complianceScore) {
    elements.complianceScore.textContent = `${avgOverall}%`;
    elements.complianceScore.style.background = getScoreColor(avgOverall);
  }
  
  if (elements.colorScore) {
    elements.colorScore.textContent = `${avgColor}%`;
    elements.colorScore.style.background = getScoreColor(avgColor);
  }
  
  if (elements.typographyScore) {
    elements.typographyScore.textContent = `${avgTypography}%`;
    elements.typographyScore.style.background = getScoreColor(avgTypography);
  }
  
  if (elements.componentScore) {
    elements.componentScore.textContent = `${avgComponent}%`;
    elements.componentScore.style.background = getScoreColor(avgComponent);
  }

  // Display recommendations
  if (allRecommendations.length > 0 && elements.recList) {
    let recHtml = '';
    allRecommendations.slice(0, 3).forEach(rec => { // Show max 3 recommendations
      recHtml += `
        <div class="rec-item ${rec.severity}">
          <div class="rec-message">${rec.message}</div>
          <div class="rec-suggestion">${rec.suggestion}</div>
        </div>
      `;
    });
    elements.recList.innerHTML = recHtml;
    elements.recommendations.classList.remove('hidden');
  } else if (elements.recommendations) {
    elements.recommendations.classList.add('hidden');
  }

  elements.complianceInfo.classList.remove('hidden');
}

/**
 * Handle copy to clipboard button click
 */
function handleCopyToClipboard() {
  if (elements.output.value.trim()) {
    copyToClipboard(
      elements.output.value,
      () => showStatus('Copied to clipboard!', 'success'),
      (error) => showStatus(error, 'error')
    );
  }
}

/**
 * Handle file context from plugin
 * @param {string} fileKey - Figma file key
 * @param {string} fileName - Figma file name
 */
function handleFileContext(fileKey, fileName) {
  globalFileKey = fileKey || '';
  globalFileName = fileName || '';
  console.log('📁 File context received:', { fileKey: globalFileKey, fileName: globalFileName });
}

/**
 * Display design system information
 * @param {Object} designSystem - Design system data
 */
function displayDesignSystemInfo(designSystem) {
  if (!elements.designSystemSection) return;

  if (elements.dsName) elements.dsName.textContent = designSystem.name;
  if (elements.dsConfidence) elements.dsConfidence.textContent = `${Math.round(designSystem.detectionConfidence * 100)}%`;
  if (elements.dsColors) elements.dsColors.textContent = `${designSystem.colors.length} colors`;
  if (elements.dsTypography) elements.dsTypography.textContent = `${designSystem.typography.length} text styles`;
  if (elements.dsComponents) elements.dsComponents.textContent = `${designSystem.components.components.length} components`;

  elements.designSystemSection.classList.remove('hidden');
}

/**
 * Hide design system section
 */
function hideDesignSystemSection() {
  if (elements.designSystemSection) {
    elements.designSystemSection.classList.add('hidden');
  }
}

/**
 * Create a hash of the current selection to detect changes
 * @param {Array} frameDataList - Array of frame data
 * @returns {string} Hash representing the selection
 */
function createSelectionHash(frameDataList) {
  if (!frameDataList || frameDataList.length === 0) return '';
  
  // Create a simple hash based on frame IDs and names
  const selectionData = frameDataList.map(frame => `${frame.id}:${frame.name}`).join('|');
  return btoa(selectionData).substr(0, 16); // Simple hash using base64
}

/**
 * Reset generate button to initial state
 */
function resetGenerateButton() {
  if (!elements.generateBtn) return;
  
  elements.generateBtn.disabled = false;
  elements.generateBtn.textContent = '📋 Generate Ticket from Selection';
  elements.generateBtn.style.background = ''; // Reset to default
}

/**
 * Set button to "generated" state
 */
function setGeneratingComplete() {
  if (!elements.generateBtn) return;
  
  elements.generateBtn.disabled = true;
  elements.generateBtn.textContent = '✅ Ticket Generated (Change selection for new ticket)';
  elements.generateBtn.style.background = 'var(--figma-color-bg-success)';
}