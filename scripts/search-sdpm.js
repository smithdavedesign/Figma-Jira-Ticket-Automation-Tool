
import 'dotenv/config';
import { MCPAdapter } from '../core/adapters/MCPAdapter.js';

async function searchSDPM() {
  console.log('🔍 Searching SDPM Backlog...');
  
  const adapter = new MCPAdapter();
  await adapter.initialize();

  const queries = [
      // Trying "Unrefined" again, but maybe catch error or check if status exists
      { name: 'SDPM Unresolved', jql: 'project = SDPM AND resolution = Unresolved ORDER BY created DESC' }
  ];

  for (const q of queries) {
      console.log(`\n--- Query: ${q.name} ---`);
      console.log(`JQL: ${q.jql}`);
      try {
          const result = await adapter._callMCP('jira_search', {
              jql: q.jql,
              limit: 5,
              fields: 'summary,status,assignee'
          });

          if (result && result.issues && result.issues.length > 0) {
              console.log(`✅ Found ${result.total} issues.`);
              result.issues.forEach(issue => {
                  const summary = issue.fields?.summary || 'N/A (Hidden)';
                  const status = issue.fields?.status?.name || 'Unknown';
                  console.log(`- [${issue.key}] ${summary} (Status: ${status})`);
              });
          } else {
              console.log('0 issues found.');
          }
      } catch (e) {
          console.log(`❌ Search failed: ${e.message}`);
      }
  }
}

searchSDPM();
