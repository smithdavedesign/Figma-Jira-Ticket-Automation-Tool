// scripts/test-create-ticket.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const adapterPath = path.join(__dirname, '../core/adapters/MCPAdapter.js');

// Import config to check defaults
const configPath = path.join(__dirname, '../config/mcp.config.js');

async function testCreateTicket() {
    console.log("🎫 Testing Jira Ticket Creation...");
    const { default: MCPAdapter } = await import(adapterPath);
    const { default: mcpConfig } = await import(configPath);
    
    const adapter = new MCPAdapter();
    await adapter.initialize();

    console.log("🔍 Configuration Check:");
    console.log(`- Default Project Key: ${mcpConfig.defaults.jiraProjectKey}`);
    console.log(`- Default Space Key: ${mcpConfig.defaults.confluenceSpaceKey}`);
    console.log(`- Default Repo Path: ${mcpConfig.defaults.repoPath}`);

    console.log("\n🔍 Fetching Projects...");
    let projects = [];
    try {
        projects = await adapter.getProjects();
        console.log(`✅ Found ${projects.length} projects:`, projects.map(p => p.key).join(', '));
    } catch(e) {
        console.warn("⚠️ Failed to get projects, proceeding with defaults.", e.message);
    }
    
    // Logic: Use Configured Default first. If that fails (not in list), try 'TEST'.
    // If 'TEST' fails, try 'AIC' (known good from logs), else 1st available.
    let projectKey = mcpConfig.defaults.jiraProjectKey;
    let projectSource = "Configured Default";

    if (projects.length > 0) {
        const isValid = projects.find(p => p.key === projectKey);
        if (!isValid) {
             console.warn(`⚠️ Configured default '${projectKey}' not found in available projects.`);
             // Try Fallbacks
             if (projects.find(p => p.key === 'TEST')) { projectKey = 'TEST'; projectSource = "Fallback (TEST)"; }
             else if (projects.find(p => p.key === 'AIC')) { projectKey = 'AIC'; projectSource = "Fallback (AIC)"; }
             else { projectKey = projects[0].key; projectSource = "Fallback (First Available)"; }
        }
    }
    
    console.log(`🎯 Using Project Key: SDPM (Hardcoded for Test)`);

    const ticketData = {
        projectKey: 'SDPM',
        summary: 'Test Ticket from MCP Test Script (Verification)',
        description: 'This is a test ticket generated to verify MCP connectivity and Adapter Payload Logic.',
        issueType: 'Story',
        assignee: 'David.Smith1@solidigm.com', // Explicit assignee support
        additionalFields: {
            'customfield_10003': 1, // Story Points
            'priority': { 'name': 'P3-Medium' },
            // Removed 'parent' from here as we usually link afterwards or need specific structure
        }
    };

    try {
        const result = await adapter.createJiraTicket(ticketData);
        console.log("✅ Ticket Created:", result);

        // Test Epic Linking
        if (result && result.issue && result.issue.key) {
             const epicKey = 'SDPM-2965';
             console.log(`🔗 Attempting to link ${result.issue.key} to Epic ${epicKey}...`);
             // We need to access the raw adapter for this test or add the helper to the script
             try {
                // Manually call link command since it might not be on the adapter class in this script's context depending on imports
                // But wait, I added linkIssueToEpic to MCPAdapter.js in the previous turn.
                await adapter.linkIssueToEpic(result.issue.key, epicKey);
                console.log("✅ Epic Link Successful");
             } catch(linkErr) {
                 console.log("❌ Epic Link Failed:", linkErr.message);
             }
        }

    } catch (e) {
        console.log("❌ Ticket Creation Failed:");
        console.log(e.message);
    }
}

testCreateTicket();
