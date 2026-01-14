
import 'dotenv/config';
import { MCPAdapter } from '../core/adapters/MCPAdapter.js';
import { Logger } from '../core/utils/logger.js';

async function listAutomationTickets() {
    const logger = new Logger('ListAutomation');
    const mcpAdapter = new MCPAdapter();
    await mcpAdapter.initialize();

    const projectKey = process.env.JIRA_PROJECT_KEY || 'AUTOMATION';
    console.log(`🔍 Fetching tickets for project: ${projectKey}...`);

    try {
        // Use JQL to search
        const jql = `project = ${projectKey} ORDER BY created DESC`;
        const result = await mcpAdapter.searchJiraIssues(jql, 5); // Get last 5

        // Adjust for typical Jira API response structure where link handling might differ
        // We'll trust the searchJiraIssues returns a standard structure or whatever the MCP returns
        
        console.log('\n✅ Recent Tickets in AUTOMATION Project:');
        console.log('------------------------------------------------');
        
        if (result.issues && result.issues.length > 0) {
            result.issues.forEach(issue => {
                console.log(`🎫 [${issue.key}] ${issue.fields?.summary || issue.summary}`);
                const status = issue.fields?.status?.name || issue.status?.name || 'Unknown';
                console.log(`   Status: ${status}`);
                // Construct a clickable link if possible
                const selfUrl = issue.self || ''; // e.g. https://jira.domain/rest/api/2/issue/123
                // Try to derive browsable URL from self URL or config
                const browserUrl = selfUrl.replace('/rest/api/2/issue/', '/browse/').replace('/rest/api/latest/issue/', '/browse/');
                console.log(`   Link: ${browserUrl}`);
                console.log('---');
            });
            console.log(`\nFound ${result.issues.length} recent issues.`);
        } else {
            console.log('No tickets found.');
        }

    } catch (error) {
        console.error('❌ Failed to list tickets:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

listAutomationTickets();
