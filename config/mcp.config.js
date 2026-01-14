// Helper to format auth tokens
const formatToken = (token) => {
    if (!token) return token;
    if (token.startsWith('Token ') || token.startsWith('Bearer ')) return token;
    // Default to Token prefix if just a raw key is provided
    return `Token ${token}`;
};

export default {
    servers: {
        jira: {
            url: process.env.MCP_JIRA_URL || "https://mcp-jira.usm-cpr.corp.nandps.com/mcp/",
            auth: process.env.MCP_JIRA_KEY ? formatToken(process.env.MCP_JIRA_KEY) : "Token ${input:jira-key}"
        },
        confluence: {
            url: process.env.MCP_CONFLUENCE_URL || "https://mcp-confluence.usm-cpr.corp.nandps.com/mcp/",
            auth: process.env.MCP_WIKI_KEY ? formatToken(process.env.MCP_WIKI_KEY) : "Token ${input:wiki-key}"
        },
        default: {
            url: process.env.MCP_SERVER_URL || "http://localhost:3000/api/mcp", 
            auth: null
        }
    },
    // Map specific methods/tools to specific servers
    routes: {
        "jira_create_issue": "jira",
        "jira_get_all_projects": "jira",
        "jira_link_to_epic": "jira", // Added missing route
        "jira_search": "jira",
        "jira_get_issue": "jira",
        "jira_search_fields": "jira",
        "jira_update_issue": "jira",
        "jira_create_remote_issue_link": "jira",
        "confluence_create_page": "confluence",
        "confluence_create_attachment": "confluence", // Added route for attachments
        "confluence_update_page": "confluence",
        "confluence_search": "confluence",
        "confluence_get_page": "confluence",
        "git_create_branch": "default" // or 'git' if we add a git server later
    },
    defaults: {
        jiraProjectKey: process.env.JIRA_PROJECT_KEY || 'DS',
        confluenceSpaceKey: process.env.CONFLUENCE_SPACE_KEY || 'DCUX', // Updated default space
        wikiParentId: process.env.CONFLUENCE_PARENT_ID || '857702482', // Updated parent page ID
        repoPath: process.env.GIT_REPO_PATH || process.cwd()
    }
};