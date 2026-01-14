
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const adapterPath = path.join(__dirname, '../core/adapters/MCPAdapter.js');
const configPath = path.join(__dirname, '../config/mcp.config.js');

async function testWikiCreation() {
    console.log("docx Testing Confluence Wiki Page Creation...");
    const { default: MCPAdapter } = await import(adapterPath);
    const { default: mcpConfig } = await import(configPath);
    
    const adapter = new MCPAdapter();
    await adapter.initialize();

    const spaceKey = mcpConfig.defaults.confluenceSpaceKey;
    const parentId = mcpConfig.defaults.wikiParentId;
    
    console.log(`🔍 Configuration Check:`);
    console.log(`- Space Key: ${spaceKey}`);
    console.log(`- Parent ID: ${parentId || 'None (Root)'}`);

    const title = `Automation Test Page ${Date.now()}`;
    const content = `
# Automated Test Page
This page was created by the Figma Ticket Generator automation testing script.

## Configuration Used
* **Space:** ${spaceKey}
* **Date:** ${new Date().toISOString()}

## Verification
If you can see this, the MCP connection to Confluence is working correctly.
    `;

    try {
        console.log(`🚀 Creating Page: "${title}"...`);
        // Note: verify if your adapter has createWikiPage or similar
        const result = await adapter.createWikiPage(title, content, spaceKey, parentId);
        console.log("✅ Wiki Page Created!", result);
    } catch (e) {
        console.log("❌ Wiki Creation Failed:");
        console.log(e.message);
    }
}

testWikiCreation();
