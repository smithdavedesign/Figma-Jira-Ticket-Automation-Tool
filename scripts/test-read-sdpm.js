
import 'dotenv/config';
import { MCPAdapter } from '../core/adapters/MCPAdapter.js';

async function testReadSDPM() {
  console.log('🔍 Testing Read Access for Project: SDPM');
  
  const adapter = new MCPAdapter();

  try {
    await adapter.initialize();
    
    console.log('\n📡 Executing JQL Search: "project = SDPM ORDER BY created DESC" (Limit 1)...');
    
    // First, find a key (we know SDPM-3192 exists from previous run)
    // But let's keep search generic in case that key is deleted
    const searchResult = await adapter._callMCP('jira_search', {
        jql: 'project = SDPM ORDER BY created DESC',
        limit: 1
    });

    if (searchResult && searchResult.issues && searchResult.issues.length > 0) {
        const key = searchResult.issues[0].key;
        console.log(`\n✅ Read Access CONFIRMED. Found latest issue: ${key}`);
        
        console.log('🔍 Fetching full details via jira_get_issue...');
        const issue = await adapter._callMCP('jira_get_issue', {
            issue_key: key,
            fields: '*all'
        });

        const fields = issue.fields || {};
        console.log(`\n--- Issue Report: ${key} ---`);
        console.log('Fields keys available:', Object.keys(fields).join(', '));
        console.log(`Summary: ${fields.summary || 'N/A'}`);
        console.log(`Type: ${fields.issuetype?.name || 'N/A'}`);
        console.log(`Priority: ${fields.priority?.name || 'N/A'}`);
        
        console.log('\n🧐 Potential Required Fields Analysis:');
        console.log('Scanning for commonly required fields that are populated on this ticket...');
        
        const importantFields = [];
        const knownStandards = ['summary', 'description', 'issuetype', 'project', 'reporter', 'priority', 'status', 'created', 'updated', 'creator', 'watches', 'worklog', 'attachment', 'comment', 'votes', 'subtasks', 'issuelinks'];

        for (const [k, v] of Object.entries(fields)) {
            if (v !== null && !knownStandards.includes(k)) {
                // Formatting for readability
                let displayVal = JSON.stringify(v);
                if (displayVal.length > 50) displayVal = displayVal.substring(0, 50) + '...';
                importantFields.push(`${k}: ${displayVal}`);
            }
        }
        
        if (importantFields.length > 0) {
            console.log(importantFields.join('\n'));
        } else {
            console.log('No unusual custom fields found populated. Requires manual check.');
        }

    } else {
        console.log('\n✅ Read Success! But no issues found in SDPM.');
    }

  } catch (error) {
    console.error('\n❌ Read Failed. You might not have browse permissions for SDPM.');
    console.error(error);
  }
}

testReadSDPM();
