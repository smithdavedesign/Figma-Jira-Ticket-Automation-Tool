import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Construct absolute path for dynamic import to avoid resolution issues
const adapterPath = path.join(__dirname, '../core/adapters/MCPAdapter.js');

async function testConnection() {
    console.log("🔌 Testing MCP Connectivity...");
    console.log("--------------------------------");

    // Dynamic import allows env vars to likely be loaded (though usually ES modules are evaluated async, 
    // simply moving to dynamic import ensures dotenv.config() has run in this script body first).
    const { default: MCPAdapter } = await import(adapterPath);
    
    // Initialize Adapter
    const adapter = new MCPAdapter();

    
    // Check Configuration
    console.log("Configuration Loaded:");
    const servers = adapter.config.servers;
    for (const [name, config] of Object.entries(servers)) {
        const isAuthSet = config.auth && !config.auth.includes('${input');
        console.log(`- ${name.toUpperCase()}:`);
        console.log(`  URL:  ${config.url}`);
        console.log(`  Auth: ${isAuthSet ? '✅ Set (Hidden)' : '❌ Not Set (Placeholder present)'}`);
    }
    console.log("--------------------------------");

    // Run Initialization (Pings servers)
    await adapter.initialize();

    console.log("\n--------------------------------");
    console.log("📊 Status Report:");
    
    if (adapter.isAvailable) {
        console.log("✅ MCP Adapter is marked as AVAILABLE");
    } else {
        console.log("❌ MCP Adapter is UNAVAILABLE");
    }

    console.log("\nNote: HTTP 406/405 on 'initialize' is often okay for simple pings.");
    console.log("Real authentication is tested when you try to create a ticket.");
}

testConnection().catch(console.error);
