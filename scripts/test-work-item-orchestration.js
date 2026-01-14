
import 'dotenv/config';
import { ServiceContainer } from '../app/controllers/ServiceContainer.js';
import { WorkItemOrchestrator } from '../core/orchestration/WorkItemOrchestrator.js';
import { TicketGenerationService } from '../app/services/TicketGenerationService.js';
import { MCPAdapter } from '../core/adapters/MCPAdapter.js';
import { Logger } from '../core/utils/logger.js';
import { UnifiedContextBuilder } from '../core/data/unified-context-builder.js';
import { TemplateGuidedAIService } from '../core/ai/template-guided-ai-service.js';
import { ConfigurationService } from '../app/services/ConfigurationService.js';
import { TemplateManager } from '../core/data/template-manager.js';
import { VisualEnhancedAIService }  from '../core/ai/visual-enhanced-ai-service.js';
import { AIOrchestrator } from '../core/ai/orchestrator.js';
import { RedisClient } from '../core/data/redis-client.js';

async function testOrchestrator() {
  console.log('🎼 Testing Complete WorkItem Orchestration (Figma -> Jira/Confluence)...');
  
  // 1. Mock minimal Service Container
  const container = new ServiceContainer();
  const logger = new Logger('TestOrchestrator');
  
  // Config & Data
  const redis = new RedisClient() // Mock or real, strictly for this test might pass null if resilient
  const configService = new ConfigurationService(redis);

  // Core Services
  const mcpAdapter = new MCPAdapter();
  await mcpAdapter.initialize(); // Explicit init
  container.register('mcpAdapter', () => mcpAdapter);

  // AI Services
  const visualAIService = new VisualEnhancedAIService(process.env.GEMINI_API_KEY || 'AIzaSy_MOCK_KEY');
  const aiOrchestrator = new AIOrchestrator(redis, configService);
  const templateManager = new TemplateManager({ redis, configService });
  
  // Inject mcpAdapter into TicketGenerationService (even though it doesn't use it directly yet, consistent with server.js)
  const ticketService = new TicketGenerationService(
      templateManager, 
      visualAIService, 
      aiOrchestrator, 
      redis,
      mcpAdapter
  );
  await ticketService.initialize();
  container.register('ticketService', () => ticketService);
  
  // MOCK SCREENSHOT SERVICE (Required dependency)
  container.register('screenshotService', () => ({
      processScreenshot: async () => 'https://via.placeholder.com/800x600.png',
      uploadScreenshot: async () => 'https://via.placeholder.com/800x600.png'
  }));

  // Orchestrator
  const orchestrator = new WorkItemOrchestrator(container);

  // 2. Synthesize Figma Context (Simulating Frontend Payload)
  const mockContext = {
      fileKey: 'BioUSVD6t51ZNeG0g9AcNz', // TRIGGER HOTFIX logic
      componentName: 'Unified Search Bar',
      projectKey: process.env.JIRA_PROJECT_KEY || 'AUTOMATION', // Use our working project
      wikiSpace: process.env.CONFLUENCE_SPACE_KEY || 'DCUX', // Use our working space
      frameData: [
          { name: 'Unified Search Bar', type: 'COMPONENT', id: '1:1' },
          { name: 'Input Field', type: 'INSTANCE', id: '1:2' },
          { name: 'Search Icon', type: 'VECTOR', id: '1:3' }
      ],
      techStack: 'React, TypeScript, TailwindCSS',
      description: 'A global search bar component with autocomplete functionality.'
  };

  // 3. Run Orchestration
  console.log('\n🚀 Starting Orchestration Run...');
  try {
      const result = await orchestrator.run(mockContext, {
          enableActiveCreation: true,
          repoPath: '/tmp/test-repo'
      });

      console.log('\n✅ Orchestration Complete!');
      console.log('------------------------------------------------');
      
      const jira = result.results.jira;
      console.log(`🎫 Jira Ticket: [${jira.status}]`);
      if (jira.status === 'created') {
          console.log(`   Key: ${jira.issue.key}`);
          console.log(`   URL: ${jira.issue.url}`);
      } else {
          console.log(`   Error: ${jira.error}`);
      }

      const wiki = result.results.wiki;
      console.log(`\nDOCS Wiki Page: [${wiki.status}]`);
      if (wiki.status === 'created') {
        console.log(`   Title: ${wiki.page.title}`);
        console.log(`   URL: ${wiki.page.url}`); // This assumes response structure
      } else {
         console.log(`   Error: ${wiki.error}`);
      }

      console.log('------------------------------------------------');

  } catch (err) {
      console.error('❌ Orchestration Failed:', err);
  }
}

testOrchestrator().catch(console.error);
