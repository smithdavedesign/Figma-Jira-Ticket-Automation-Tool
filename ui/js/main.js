/**
 * Main UI controller
 * Coordinates all UI modules and handles plugin communication
 */

console.log('🔧 main.js execution started');

/**
 * Initialize the application
 */
function initializeApp() {
  console.log('🚀 Figma AI Ticket Generator UI starting...');
  
  // Initialize health metrics directly here for now
  console.log('🔄 Starting health metrics...');
  
  // Auto-trigger compliance analysis on load
  setTimeout(() => {
    console.log('🔄 Triggering compliance calculation...');
    // Send compliance calculation request to plugin
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({ pluginMessage: { type: 'calculate-compliance' } }, '*');
    }
  }, 2000);
  
  console.log('✅ UI initialized successfully');
}

/**
 * Handle messages from Figma plugin
 * @param {MessageEvent} event - Message event from plugin
 */
function handlePluginMessage(event) {
  const msg = event.data.pluginMessage;
  if (!msg) return;
  
  console.log('📨 Received message:', msg.type);
  
  switch (msg.type) {
    case 'compliance-results':
      console.log('📊 Compliance results received:', msg.compliance);
      displayHealthMetrics(msg.compliance);
      break;
      
    case 'compliance-error':
      console.log('❌ Compliance error:', msg.message);
      break;
      
    default:
      console.log('⚠️ Unknown message type:', msg.type);
  }
}

/**
 * Display health metrics in the UI
 */
function displayHealthMetrics(compliance) {
  console.log('🎯 Displaying health metrics:', compliance);
  
  // Update overall score
  const overallScoreEl = document.querySelector('.overall-score');
  if (overallScoreEl) {
    overallScoreEl.textContent = compliance.overall + '%';
    console.log('✅ Updated overall score');
  }
  
  // Update category scores
  const categories = ['colors', 'typography', 'components', 'spacing'];
  categories.forEach(category => {
    const scoreEl = document.querySelector(`[data-category="${category}"] .metric-value`);
    if (scoreEl && compliance.breakdown[category]) {
      scoreEl.textContent = compliance.breakdown[category].score + '%';
      console.log(`✅ Updated ${category} score`);
    }
  });
  
  // Update recommendations
  const recommendationsEl = document.querySelector('.recommendations-list');
  if (recommendationsEl && compliance.recommendations) {
    recommendationsEl.innerHTML = '';
    compliance.recommendations.forEach(rec => {
      const recEl = document.createElement('div');
      recEl.className = 'recommendation-item';
      recEl.innerHTML = `
        <div class="rec-priority ${rec.priority}">${rec.priority}</div>
        <div class="rec-content">
          <div class="rec-title">${rec.category}</div>
          <div class="rec-description">${rec.description}</div>
          <div class="rec-action">${rec.action}</div>
        </div>
      `;
      recommendationsEl.appendChild(recEl);
    });
    console.log('✅ Updated recommendations');
  }
}

/**
 * Set up global message listener
 */
function setupMessageListener() {
  window.onmessage = handlePluginMessage;
}

/**
 * Initialize when DOM is ready
 */
function initializeWhenReady() {
  console.log('🔄 initializeWhenReady called, document.readyState:', document.readyState);
  
  if (document.readyState === 'loading') {
    console.log('📅 DOM still loading, adding event listener...');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📅 DOMContentLoaded fired!');
      initializeApp();
      setupMessageListener();
    });
  } else {
    console.log('📅 DOM already ready, initializing immediately...');
    initializeApp();
    setupMessageListener();
  }
}

// Start the application
console.log('🚀 About to call initializeWhenReady...');
initializeWhenReady();
console.log('✅ initializeWhenReady called');