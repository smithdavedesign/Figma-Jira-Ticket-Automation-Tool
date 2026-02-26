/**
 * MCP Adapter for Advanced Multi-Agent Workflows
 *
 * Optional adapter that provides MCP server integration when advanced features are needed:
 * - Multi-agent reasoning workflows
 * - Cross-tool integrations
 * - Complex AI orchestration
 * - External system connections
 *
 * Architecture:
 * Primary: Figma API → Context Layer → YAML Templates → Docs
 * Advanced: Context Layer → MCP Adapter → Multi-agent reasoning → Enhanced outputs
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import fs from 'fs';
import path from 'path';
import mcpConfig from '../../config/mcp.config.js'; // Import the new config

export class MCPAdapter {
  constructor(config = {}) {
    this.logger = new Logger('MCPAdapter');
    this.errorHandler = new ErrorHandler('MCPAdapter');

    // Merge provided config with file-based config
    this.config = {
      servers: mcpConfig.servers,
      routes: mcpConfig.routes,
      enableMultiAgent: config.enableMultiAgent || false,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      ...config
    };

    this.isAvailable = false;
    this.capabilities = new Set();
    this.connectedTools = new Map();
    this.sessions = new Map(); // Store session IDs per server key
  }

  /**
   * Helper to get server config for a specific method
   */
  _getServerForMethod(method) {
    const serverKey = this.config.routes[method] || 'default';
    const serverConfig = this.config.servers[serverKey];
    
    if (!serverConfig) {
        this.logger.warn(`No server configured for method '${method}' or key '${serverKey}', falling back to default`);
        return this.config.servers['default'];
    }
    return serverConfig;
  }

  /**
   * Connect to MCP Server (Initialize Handshake)
   */
  async _connect(serverKey) {
      if (this.sessions.has(serverKey)) {
          return this.sessions.get(serverKey);
      }

      this.logger.info(`🔌 Connecting to MCP Server: ${serverKey}...`);
      const server = this.config.servers[serverKey];
      if (!server) throw new Error(`Server configuration not found for key: ${serverKey}`);

      const baseUrl = server.url.endsWith('/') ? server.url : server.url + '/';
      
      const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      };
      if (server.auth && !server.auth.includes('${input')) {
          headers['Authorization'] = server.auth;
      }

      // Step 1: Initialize
      // Use a temporary ID for the init call, but expect the server to assign one
      const tempId = 'init-' + Date.now();
      const initPayload = {
        jsonrpc: "2.0",
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: { roots: { listChanged: true } },
            clientInfo: { name: "figma-ticket-generator", version: "1.0.0" }
        },
        id: 1
      };
      
      const initUrl = new URL(baseUrl);
      initUrl.searchParams.append('sessionId', tempId);

      const initRes = await fetch(initUrl.toString(), {
          method: 'POST',
          headers: { ...headers, 'X-Session-ID': tempId },
          body: JSON.stringify(initPayload),
          timeout: this.config.timeout
      });

      if (!initRes.ok) {
        // Attempt to read body for more context
        const errorBody = await initRes.text().catch(() => 'No body');
        this.logger.warn(`⚠️ MCP Initialize Failed (${serverKey}): ${initRes.status} ${initRes.statusText}`);
        this.logger.debug(`❌ Error Body: ${errorBody}`);
        
        // Strategy: Proceed optimistically. 
        // Some stateless MCP proxies or older implementations might failing on 'initialize' but still accept tool calls.
        this.logger.warn(`⚠️ Proceeding optimistically without session handshake for ${serverKey}`);
        this.sessions.set(serverKey, tempId);
        return tempId;
      }

      // Capture Server-Assigned Session ID
      const serverSessionId = initRes.headers.get('mcp-session-id');
      const activeSessionId = serverSessionId || tempId;
      
      if (serverSessionId) {
          this.logger.info(`🔑 Server Assigned Session ID (${serverKey}): ${serverSessionId}`);
      } else {
          this.logger.warn(`⚠️ No mcp-session-id header received from ${serverKey}, using client ID: ${activeSessionId}`);
      }

      this.sessions.set(serverKey, activeSessionId);

      // Step 2: Send initialized notification
      const notifyUrl = new URL(baseUrl);
      notifyUrl.searchParams.append('sessionId', activeSessionId);
      
      // Update headers with the correct session ID
      const sessionHeaders = { 
          ...headers, 
          'X-Session-ID': activeSessionId,
          'mcp-session-id': activeSessionId
      };

      await fetch(notifyUrl.toString(), {
          method: 'POST',
          headers: sessionHeaders,
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "notifications/initialized",
            params: {}
          })
      });

      this.logger.info(`✅ MCP Connection Established (${serverKey})`);
      return activeSessionId;
  }

  /**
   * Helper to parse MCP response (handles JSON and SSE)
   */
  async _parseResponse(response) {
      const text = await response.text();
      if (!text) return null;

      let json;
      // Handle SSE Format
      if (text.includes('data: ')) {
          const match = text.match(/data: (.+)/);
          if (match && match[1]) {
              try {
                  json = JSON.parse(match[1]);
              } catch(e) { /* ignore */ }
          }
      }

      if (!json) {
          try {
             json = JSON.parse(text);
          } catch (e) {
             throw new Error(`Invalid JSON Response: ${text.substring(0, 100)}...`);
          }
      }
      
      if (json.error) {
          throw new Error(`MCP Error: ${json.error.message} (Code: ${json.error.code})`);
      }
      return json.result;
  }

  /**
   * Generic MCP Call helper
   */
  async _callMCP(method, params) {
      // Determine which server handles this method
      const serverKey = this.config.routes[method] || 'default';
      const serverConfig = this.config.servers[serverKey];

      if (!serverConfig || !serverConfig.url) {
          throw new Error(`No server URL configured for method: ${method}`);
      }

      // Ensure connection & get active Session ID
      const sessionId = await this._connect(serverKey);

      const baseUrl = serverConfig.url.endsWith('/') ? serverConfig.url : serverConfig.url + '/';
      
      // WRAP IN tools/call format for standard MCP
      const jsonRpcPayload = {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
              name: method,
              arguments: params
          },
          id: Date.now(),
          sessionId 
      };

      const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'X-Session-ID': sessionId,
        'mcp-session-id': sessionId
      };
      if (serverConfig.auth && !serverConfig.auth.includes('${input')) {
          headers['Authorization'] = serverConfig.auth;
      }
      
      this.logger.debug(`📡 calling MCP: tools/call (${method}) [${sessionId}]`);
      this.logger.info(`📝 MCP Payload (${method}):`, JSON.stringify(params, null, 2));

      // Using Root Endpoint for all calls (standard MCP over HTTP)
      const rootUrl = new URL(baseUrl);
      rootUrl.searchParams.append('sessionId', sessionId);

      try {
          const response = await fetch(rootUrl.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify(jsonRpcPayload),
            timeout: this.config.timeout
          });

          if (!response.ok) {
               const errorText = await response.text();
               throw new Error(`MCP Call failed: ${response.status} - ${errorText}`);
          }
          
          const result = await this._parseResponse(response);
          
          // Check for Tool Execution Error (inside the result)
          if (result && result.isError) {
             // Collect ALL content items for a full error message
             const allErrorText = (result.content || [])
               .map(c => c.text || '')
               .filter(Boolean)
               .join(' | ');
             const errorMessage = allErrorText || 'Unknown Tool Error';
             this.logger.error(`❌ MCP Tool Execution Failed (${method}): ${errorMessage}`, { response: JSON.stringify(result, null, 2) });
             throw new Error(`Tool Execution Error: ${errorMessage}`);
          }
           // Some tools return text content that is JSON stringified
           if (result && result.content && result.content[0] && result.content[0].text) {
               try {
                   return JSON.parse(result.content[0].text);
               } catch(e) {
                   return result.content[0].text;
               }
           }

          return result;

      } catch(e) {
          throw e; // Propagate up
      }
  }

  /**
   * Initialize MCP adapter and check server availability
   */
  async initialize() {
    this.logger.info('🔌 Initializing MCP Adapter (Multi-Server Mode)...');
    
    // In multi-server mode, we assume "available" if at least default is reachable
    // or just mark available and fail lazily on specific calls.
    this.isAvailable = true; 
    
    // Optional: Check default server
    try {
        await this._checkMCPServerAvailability();
    } catch(e) {
        this.logger.warn("Default MCP server unreachable, but continuing for other servers.");
    }
  }

  /**
   * Check if MCP server is available for advanced workflows
   */
  async _checkMCPServerAvailability() {
      const servers = this.config.servers;
      const checks = [];
      
      for (const [key, config] of Object.entries(servers)) {
          if (!config.url) continue;
          
          const checkPromise = (async () => {
              try {
                  // Attempt a lightweight call - usually GET / or a list_tools call if possible
                  // Since we are Generic, we might just check if the URL is reachable via a simple fetch
                  // Many MCP servers expose a health endpoint or just respond to GET
                  const url = config.url.endsWith('/') ? config.url : config.url + '/';
                  
                  // Use a short timeout for health checks
                  const response = await fetch(url, { method: 'GET', timeout: 3000 });
                  
                  if (response.ok) {
                      this.logger.info(`✅ MCP Server '${key}' is reachable`);
                      return true;
                  } else {
                      // 404 might be fine if it's a JSON-RPC endpoint only, but 
                      // usually indicates the server exists but endpoint is wrong.
                      // For now, we consider 200-299 as "healthy".
                      this.logger.warn(`⚠️ MCP Server '${key}' responded with ${response.status}`);
                      return false;
                  }
              } catch (e) {
                  this.logger.warn(`❌ MCP Server '${key}' unreachable: ${e.message}`);
                  return false;
              }
          })();
          checks.push(checkPromise);
      }
      
      await Promise.all(checks);
      // We are "available" if the config is valid, even if servers are currently down 
      // (retry logic handles per-request failure).
      this.isAvailable = true;
  }

  // ... (rest of methods)

  /**
   * Create a Jira ticket via MCP
   */
  async createJiraTicket(ticketData) {
    this.logger.info('🎫 Creating Jira ticket via MCP...', { summary: ticketData.summary });

    try {
       // Use new generic caller logic
       const result = await this._callMCP('jira_create_issue', {
            project_key: ticketData.projectKey,
            summary: ticketData.summary,
            description: ticketData.description,
            issue_type: ticketData.issueType || 'Task',
            assignee: ticketData.assignee,
            components: ticketData.components ? ticketData.components.join(',') : undefined,
            additional_fields: ticketData.additionalFields || {}
       });
       
       this.logger.info('✅ Jira ticket created', result);
       return result;

    } catch (error) {
      this.logger.error('❌ Failed to create Jira ticket', { message: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Search Jira Issues
   * @param {string} jql - JQL query
   * @param {number} limit - Results limit
   */
  async searchJiraIssues(jql, limit = 10) {
      if (!this.isAvailable) throw new Error('MCP Adapter unavailable');
      
      return this._callMCP('jira_search', {
          jql: jql,
          limit: limit,
          fields: 'summary,status,priority,assignee'
      });
  }

  async getProjects() {
    return this._callMCP('jira_get_all_projects', {});
  }

  /**
   * Get Wiki Page by Title
   * @param {string} title 
   * @param {string} spaceKey 
   */
  async getWikiPage(title, spaceKey) {
      this.logger.info(`🔍 Searching for Wiki Page '${title}' in ${spaceKey}...`);
      try {
          const result = await this._callMCP('confluence_get_page', {
              title,
              space_key: spaceKey
          });
          return result;
      } catch (error) {
          this.logger.debug('ℹ️ Wiki page not found or search failed', error.message);
          return null;
      }
  }

  /**
   * Update Wiki Page
   * @param {string} pageId 
   * @param {string} title 
   * @param {string} content 
   * @param {number} version - Current page version number (Confluence requires this for optimistic locking)
   */
  async updateWikiPage(pageId, title, content, version) {
      this.logger.info(`📝 Updating Wiki Page ${pageId}...`);
      // Note: confluence_update_page schema does NOT accept a 'version' param —
      // the server auto-increments it. content_format defaults to 'markdown'.
      return this._callMCP('confluence_update_page', {
          page_id: pageId,
          title,
          content
      });
  }

  /**
   * Create a Confluence Wiki page via MCP.
   *
   * Strategy:
   * 1. Try creating with full content (fast for small pages).
   * 2. If that fails (Confluence MCP times out on large payloads), create a
   *    minimal stub page first (always fast), then immediately update it with
   *    the full content via a second call.  updateWikiPage is more tolerant of
   *    large payloads than the create endpoint.
   */
  async createWikiPage(title, content, spaceKey, parentId) {
    this.logger.info('📄 Creating Wiki page via MCP...', { title, spaceKey, parentId, contentLength: content?.length });
    this.logger.debug('📄 Wiki content preview:', content?.substring(0, 300));

    // --- Attempt 1: create with full content ---
    try {
      const result = await this._callMCP('confluence_create_page', {
            title,
            space_key: spaceKey || 'DCUX',
            content,
            parent_id: parentId,
            content_format: 'markdown'
      });
      this.logger.info('✅ Wiki page created (full content)', result);
      return result;
    } catch (firstError) {
      this.logger.warn(`⚠️ Full-content creation failed (${firstError.message}). Falling back to stub-then-update strategy...`);
    }

    // --- Attempt 2: create stub, then update with full content ---
    // The create endpoint in the Confluence MCP can time out on large payloads.
    // Creating a tiny stub always succeeds, and updateWikiPage handles large
    // content reliably because it goes through the update (PUT) code path.
    const stubContent = `# ${title}\n\n_Generating content — please wait…_\n`;
    this.logger.info('📄 Creating stub Wiki page...', { title });
    let stubResult;
    try {
      stubResult = await this._callMCP('confluence_create_page', {
            title,
            space_key: spaceKey || 'DCUX',
            content: stubContent,
            parent_id: parentId,
            content_format: 'markdown'
      });
      this.logger.info('✅ Stub page created', stubResult);
    } catch (stubError) {
      // Both strategies failed — surface the original error so the retry loop can handle it
      this.logger.error('❌ Failed to create Wiki page (both strategies failed)', { message: stubError.message, stack: stubError.stack });
      throw stubError;
    }

    // Extract page ID from response (handle multiple response shapes)
    const pageId = stubResult?.id || stubResult?.page?.id || null;
    const pageVersion = stubResult?.version?.number ?? stubResult?.page?.version?.number ?? 1;

    if (!pageId) {
      this.logger.warn('⚠️ Stub created but no page ID returned — skipping content update');
      return stubResult;
    }

    // Update the stub with full content
    this.logger.info(`📝 Updating stub page ${pageId} with full content...`);
    try {
      await this._callMCP('confluence_update_page', {
          page_id: pageId,
          title,
          content
      });
      this.logger.info(`✅ Wiki page ${pageId} updated with full content`);
    } catch (updateError) {
      // Update failed — return the stub result so the caller still gets a usable page
      this.logger.warn(`⚠️ Content update failed (${updateError.message}). Page exists as stub.`);
    }

    return stubResult;
  }

  /**
   * Add attachment to Wiki Page
   * @param {string} pageId - Confluence Page ID
   * @param {string} filePath - Path to file to attach
   * @param {string} [pageSelfUrl] - Optional full REST API URL for the page (optimizes upload)
   */
  async addWikiAttachment(pageId, filePath, pageSelfUrl) {
     this.logger.info(`📎 Adding attachment to Wiki Page ${pageId}...`);
     
     // Strategy: Try Direct REST API first (reliable for local files), then MCP fallback
     try {
         await this._uploadToConfluenceDirect(pageId, filePath, pageSelfUrl);
         this.logger.info('✅ Attachment added to Wiki (Direct)');
         return { success: true };
     } catch (directError) {
         this.logger.warn(`⚠️ Direct Wiki upload failed: ${directError.message}. Trying MCP tool...`);
         
         try {
             const result = await this._callMCP('confluence_create_attachment', {
                 page_id: pageId,
                 file_path: filePath
             });
             this.logger.info('✅ Attachment added to Wiki (MCP)');
             return result;
         } catch (mcpError) {
             this.logger.error('❌ Failed to add attachment to Wiki (All methods)', { message: mcpError.message, stack: mcpError.stack });
             return null;
         }
     }
  }

  /**
   * Add attachment to Jira Issue.
   * Returns { success, filenames } where filenames is an array of uploaded basenames.
   * @param {string} issueKey - Jira Issue Key
   * @param {string|string[]} filePaths - Path(s) to files to attach
   * @param {string} [issueSelfUrl] - Optional full REST API URL for the issue (optimizes upload)
   */
  async addJiraAttachment(issueKey, filePaths, issueSelfUrl) {
     this.logger.info(`📎 Adding attachment to Jira ${issueKey}...`);
     const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
     const filenames = paths.map(p => path.basename(p));

     // Strategy: Direct REST API first (multipart/form-data – the only way Jira accepts file uploads).
     // jira_update_issue does NOT support binary file uploads; removed as primary strategy.
     try {
         for (const filePath of paths) {
             await this._uploadToJiraDirect(issueKey, filePath, issueSelfUrl);
         }
         this.logger.info(`✅ Attachment(s) added to Jira (Direct): ${filenames.join(', ')}`);
         return { success: true, filenames };
     } catch (directError) {
         this.logger.warn(`⚠️ Direct Jira upload failed: ${directError.message}. Trying MCP fallback...`);
         // Fallback: some on-prem MCP servers expose a jira_add_attachment tool
         try {
             const result = await this._callMCP('jira_add_attachment', {
                 issue_key: issueKey,
                 file_path: paths[0]
             });
             this.logger.info('✅ Attachment(s) added to Jira (MCP fallback)');
             return { success: true, filenames, mcpResult: result };
         } catch (mcpError) {
             this.logger.error('❌ Failed to add attachment to Jira (all methods)', {
                 directError: directError.message,
                 mcpError: mcpError.message
             });
             return null;
         }
     }
  }

  /**
   * Patch a Jira issue description to embed an uploaded image using Jira Wiki Markup.
   * Call this AFTER a successful addJiraAttachment to complete the two-step process.
   * @param {string} issueKey - Jira Issue Key
   * @param {string} currentDescription - The existing description body
   * @param {string} filename - Basename of the already-uploaded attachment (e.g. "preview-nav.png")
   */
  async updateJiraDescription(issueKey, currentDescription, filename) {
     // filename may be either an uploaded attachment name or a full URL (Figma CDN fallback)
     const isUrl = /^https?:\/\//i.test(filename);
     const imageMarkup = isUrl
         ? `\n\n![Design Preview](${filename})`   // markdown for external URL
         : `\n\n!${filename}|thumbnail!`;           // Jira wiki markup for attachment
     this.logger.info(`🖼️  Embedding image in Jira ${issueKey} description (${isUrl ? 'URL' : 'attachment'})`);
     const updatedDescription = (currentDescription || '') + imageMarkup;
     try {
         await this._callMCP('jira_update_issue', {
             issue_key: issueKey,
             fields: { description: updatedDescription }
         });
         this.logger.info(`✅ Jira description updated with image reference !${filename}!`);
         return { success: true };
     } catch (error) {
         this.logger.warn(`⚠️ Failed to update Jira description with image: ${error.message}`);
         return null;
     }
  }

  /**
   * Direct Upload to Jira REST API
   */
  async _uploadToJiraDirect(issueKey, filePath, issueSelfUrl) {
      const serverConfig = this.config.servers['jira'];
      if (!serverConfig || !serverConfig.url) throw new Error('Jira server not configured');

      if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

      let uploadUrl;

      // 1. Try to use explicit Self URL from previous creation step (Most Reliable)
      if (issueSelfUrl) {
           uploadUrl = `${issueSelfUrl}/attachments`;
      } 
      // 2. Try configured Base URL
      else {
          const jiraUrl = process.env.JIRA_BASE_URL || process.env.JIRA_URL;
          if (!jiraUrl) {
              throw new Error('JIRA_BASE_URL environment variable is missing and no self-link provided - cannot perform direct upload');
          }
           uploadUrl = `${jiraUrl.replace(/\/$/, '')}/rest/api/2/issue/${issueKey}/attachments`;
      }
      
      // Build FormData
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(filePath);
      const filename = path.basename(filePath);
      const blob = new Blob([fileBuffer]); 
      formData.append('file', blob, filename);

      const headers = {
          'X-Atlassian-Token': 'no-check'
          // Content-Type is set automatically by fetch with FormData
      };

      // Auth
      const auth = serverConfig.auth || process.env.JIRA_API_TOKEN;
      if (auth) {
           headers['Authorization'] = auth;
      }

      this.logger.debug(`📤 Uploading to Jira: ${uploadUrl}`);
      
      const response = await fetch(uploadUrl, {
          method: 'POST',
          headers,
          body: formData
      });

      if (!response.ok) {
          const text = await response.text();
          throw new Error(`Jira Upload Failed: ${response.status} ${text}`);
      }
      return true;
  }

  /**
   * Direct Upload to Confluence REST API
   */
  async _uploadToConfluenceDirect(pageId, filePath, pageSelfUrl) {
      const serverConfig = this.config.servers['confluence'];
      if (!serverConfig) throw new Error('Confluence server not configured');

      if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

      let uploadUrl;

      // 1. Try to use explicit Self URL (Most Reliable)
      if (pageSelfUrl) {
          // Confluence 'self' usually points to content/{id}. 
          // We need {id}/child/attachment
          uploadUrl = `${pageSelfUrl}/child/attachment`;
      }
      // 2. Try configured Base URL
      else {
          const confluenceUrl = process.env.CONFLUENCE_BASE_URL || process.env.CONFLUENCE_URL;
          if (!confluenceUrl) {
              throw new Error('CONFLUENCE_BASE_URL environment variable is missing and no self-link provided - cannot perform direct upload');
          }
          uploadUrl = `${confluenceUrl.replace(/\/$/, '')}/rest/api/content/${pageId}/child/attachment`;
      }

       // Build FormData
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(filePath);
      const filename = path.basename(filePath);
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob, filename);

      const headers = {
          'X-Atlassian-Token': 'no-check'
      };

      // Auth
      const auth = serverConfig.auth || process.env.CONFLUENCE_API_TOKEN;
      if (auth) {
           headers['Authorization'] = auth;
      }

      this.logger.debug(`📤 Uploading to Confluence: ${uploadUrl}`);

      const response = await fetch(uploadUrl, {
          method: 'POST',
          headers,
          body: formData
      });

      if (!response.ok) {
           const text = await response.text();
           throw new Error(`Confluence Upload Failed: ${response.status} ${text}`);
      }
      return true;
  }

  /**
   * Create a remote link on Jira Issue (e.g. to Confluence)
   * @param {string} issueKey - Jira Issue Key
   * @param {string} url - Target URL
   * @param {string} title - Link Title
   */
  async createRemoteLink(issueKey, url, title, relationship = 'Wiki Page') {
      this.logger.info(`🔗 Linking Jira ${issueKey} to ${title}...`);
      try {
          const result = await this._callMCP('jira_create_remote_issue_link', {
              issue_key: issueKey,
              url: url,
              title: title,
              relationship
          });
          this.logger.info('✅ Remote link created');
          return result;
      } catch (error) {
          this.logger.error('❌ Failed to create remote link', error);
          return null;
      }
  }

  /**
   * Create a Git branch via MCP
   * @param {string} branchName - Name of branch
   * @param {string} repoPath - Optional repo path
   * @returns {Object} Operation result
   */
  async createGitBranch(branchName, repoPath) {
    if (!this.isAvailable) {
      throw new Error('MCP Adapter unavailable');
    }

    this.logger.info('🌿 Creating Git branch via MCP...', { branchName });

    try {
      // Use generic caller, route to 'git_create_branch' (defaults to 'default' server)
      const result = await this._callMCP('git_create_branch', {
            name: branchName,
            repository_path: repoPath
      });
      
      this.logger.info('✅ Git branch created', { branch: branchName });
      return result;

    } catch (error) {
      this.logger.error('❌ Failed to create Git branch', { message: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Link an issue to an Epic
   * @param {string} issueKey - The child issue key
   * @param {string} epicKey - The parent epic key
   */
  async linkIssueToEpic(issueKey, epicKey) {
    this.logger.info(`🔗 Linking issue ${issueKey} to epic ${epicKey}...`);
    try {
        const result = await this._callMCP('jira_link_to_epic', {
            issue_key: issueKey,
            epic_key: epicKey
        });
        this.logger.info('✅ Issue linked to epic');
        return result;
    } catch (error) {
        this.logger.error('❌ Failed to link issue to epic', error);
        return null;
    }
  }

  /**
   * Disable MCP adapter (switch to direct Context-Template flow only)
   */
  disable() {
    this.isAvailable = false;
    this.capabilities.clear();
    this.connectedTools.clear();
    this.logger.info('🔇 MCP Adapter disabled - using direct Context-Template flow only');
  }

  /**
   * Enable MCP adapter and reinitialize
   */
  async enable() {
    this.logger.info('🔊 Enabling MCP Adapter...');
    await this.initialize();
  }
}

export default MCPAdapter;