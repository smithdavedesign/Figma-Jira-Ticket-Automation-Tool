import { Logger } from '../utils/logger.js';
import mcpConfig from '../../config/mcp.config.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class WorkItemOrchestrator {
  constructor(serviceContainer) {
    this.logger = new Logger('WorkItemOrchestrator');
    this.mcpAdapter = serviceContainer.get('mcpAdapter');
    this.ticketGenerator = serviceContainer.get('ticketService');
    this.screenshotService = serviceContainer.get('screenshotService');
  }

  /**
   * Orchestrate the creation of work items (Ticket, Wiki, Branch)
   * @param {Object} context - The gathered context from Figma
   * @param {Object} options - Configuration options (e.g. enableActiveCreation)
   */
  /**
   * Helper to find a unique Wiki page title by appending generic counters (1), (2), etc.
   * This avoids overwriting changes and history.
   */
  async _getUniqueWikiTitle(baseTitle, space) {
      let candidateTitle = baseTitle;
      
      // Ensure title fits Confluence limit (255)
      if (candidateTitle.length > 200) {
          candidateTitle = candidateTitle.substring(0, 200);
      }

      let counter = 0;
      const maxAttempts = 5; // Reduced attempts to prevent timeouts

      while (counter < maxAttempts) {
          try {
              if (counter > 0) {
                  candidateTitle = `${baseTitle} (${counter})`;
              }
              this.logger.info(`🔍 Checking availability for Wiki Title: "${candidateTitle}"`);
              const searchResult = await this.mcpAdapter.getWikiPage(candidateTitle, space);
              
              // Robust check for existence
              // Standard Confluence API returns { results: [...] } or a single page object
              const exists = searchResult && (
                  searchResult.id || 
                  searchResult.page || 
                  (searchResult.metadata && searchResult.metadata.id) || 
                  (searchResult.results && searchResult.results.length > 0) ||
                  (searchResult.size && searchResult.size > 0)
              );

              if (exists) {
                  this.logger.info(`⚠️ Page "${candidateTitle}" exists (ID: ${searchResult.id || 'in results'}). Trying next version...`);
                  counter++;
              } else {
                  // Not found (or error implying not found), so it's free!
                  return candidateTitle;
              }
          } catch (e) {
              // Assume error means not found or permission issue - treat as free to try creating
              this.logger.debug(`Title check failed (assuming safe to create): ${e.message}`);
              return candidateTitle;
          }
      }
      return `${baseTitle} (${Date.now()})`; // Fallback to timestamp if crowded
  }

  async run(context, options) {
    return this.processWorkItem(context, options);
  }

  async processWorkItem(context, options = {}) {
    this.logger.info('🎼 Starting WorkItem Orchestration', { 
      component: context.componentName,
      activeMode: options.enableActiveCreation
    });

    const results = {
      jira: { status: 'pending' },
      wiki: { status: 'pending' },
      git: { status: 'pending' }
    };

    // To prevent UI crash, ensure we capture the content even if creation fails
    let generatedContentForUI = '';

    try {
      // 1. Generate Content — use pre-generated content if available
      let ticketContent;
      if (context.generatedContent) {
        this.logger.info('Using pre-generated content from GeminiService');
        ticketContent = context.generatedContent;
      } else {
        const generatedResult = await this.ticketGenerator.generateTicket({
          frameData: context.frameData,
          ...context
        }, 'enhanced');
        ticketContent = generatedResult.content || generatedResult;
      }

      if (!ticketContent) {
          throw new Error('Ticket generation returned empty content');
      }

      // Handle raw string or object
      let fullDescription = typeof ticketContent === 'string' 
          ? ticketContent 
          : (ticketContent.description || JSON.stringify(ticketContent));
      
      // FIX: Strip triple backticks if the AI wrapped the entire response
      // This is common with some models (e.g. Gemini, GPT-4) returning "```markdown ... ```"
      if (fullDescription.trim().startsWith('```')) {
         fullDescription = fullDescription
             .replace(/^```[a-z]*\n?/i, '') // Remove opening ```markdown or ```
             .replace(/\n?```$/, '');        // Remove closing ```
      }

      generatedContentForUI = fullDescription;

      // A. Prepare Jira Content (User/Product Focused)
      let jiraTitle = `Implement ${context.componentName}`;
      
      // Try to extract title safely if ticketContent is an object
      if (typeof ticketContent === 'object' && ticketContent !== null) {
          if (ticketContent.title) jiraTitle = ticketContent.title;
          else if (ticketContent.content && ticketContent.content.title) jiraTitle = ticketContent.content.title;
      }
      
      const jiraDescription = this._formatForJira(fullDescription);
      
      const projectKey = context.projectKey || options.projectKey || mcpConfig.defaults.jiraProjectKey;
      
      let issueType = 'Task';
      let assignee = undefined;
      let additionalFields = {};
      let epicLink = null;

      // Special handling for SDPM project
      if (projectKey === 'SDPM') {
          issueType = 'Story';
          assignee = 'David.Smith1@solidigm.com'; 
          additionalFields = {
              'customfield_10003': 1, // Story Points
              'priority': { 'name': 'P3-Medium' }
          };
          epicLink = 'SDPM-2965'; // Hardcoded based on current project requirements
      }

      const jiraData = {
        projectKey: projectKey,
        summary: jiraTitle,
        description: jiraDescription,
        issueType: issueType,
        assignee: assignee,
        // Components often cause failure if they don't exist in Jira. 
        // Removing for safety unless we validate them first.
        // components: [context.componentName], 
        additionalFields: additionalFields
      };

      // Sanitize keys in additional_fields for Jira API requirements
      // Specifically ensure numeric values are numbers, etc.
      if (jiraData.additionalFields) {
          for (const key of Object.keys(jiraData.additionalFields)) {
               // Ensure Story Points is a number if it looks like a number string
               if (key === 'customfield_10003' && typeof jiraData.additionalFields[key] === 'string') {
                   jiraData.additionalFields[key] = parseFloat(jiraData.additionalFields[key]);
               }
          }
      }

      // B. Prepare Wiki Content (Technical/Dev Focused)
      // Standard title without timestamp to allow for idempotency (Search-Updates)
      const wikiTitle = `Implementation Plan: ${context.componentName}`; 
      
      // Add extra technical context to Wiki version if available
      const wikiContent = this._formatForWiki(fullDescription, context);
      const wikiSpace = context.wikiSpace || options.wikiSpace || mcpConfig.defaults.confluenceSpaceKey;
      const wikiParentId = options.wikiParentId || mcpConfig.defaults.wikiParentId;

      // C. Prepare Git Content
      const branchName = this._generateBranchName(context.componentName, 'feature');
      const repoPath = options.repoPath || mcpConfig.defaults.repoPath;

      results.jira = { status: 'generated', content: jiraData };
      results.wiki = { status: 'generated', content: wikiContent, title: wikiTitle, space: wikiSpace };
      results.git = { status: 'generated', branch: branchName, repo: repoPath };

      // 2. Execute Artifacts (Active Phase)
      if (options.enableActiveCreation && this.mcpAdapter && this.mcpAdapter.isAvailable) {
        
        let jiraIssueKey = null;
        let jiraWebUrl = null;
        let wikiPageUrl = null;
        
        // Prepare Shared Attachment (once for both Jira and Wiki)
        // Returns { path, filename, cleanup }
        let sharedAttachment = null;
        if (context.screenshot || context.imagePath) {
             sharedAttachment = await this._prepareImage(context, `preview-${context.componentName}`);
             if (!sharedAttachment) {
                this.logger.warn("⚠️ Screenshot image preparation returned null, check logs for details.");
             }
        } else {
             this.logger.warn("⚠️ No screenshot or imagePath found in context. Skipping attachment.");
        }

        try {

        // --- Step A: Create Jira Ticket ---
        try {
          this.logger.info(`🏗️ MCP: Creating Jira Ticket in ${jiraData.projectKey}...`);
          
          // Check for existing tickets to avoid duplicates
          // Format query carefully to match our generated titles
          const checkJql = `project = "${jiraData.projectKey}" AND summary ~ "\\"${jiraData.summary}\\"" AND statusCategory != Done`;
          let existingTicket = null;
          
          try {
             // Only check if we are in active mode
             const searchResult = await this.mcpAdapter.searchJiraIssues(checkJql, 1);
             if (searchResult && searchResult.issues && searchResult.issues.length > 0) {
                 existingTicket = searchResult.issues[0];
                 this.logger.info(`⚠️ Found existing ticket ${existingTicket.key}, skipping creation.`);
             }
          } catch(searchErr) {
             this.logger.warn(`Search check failed, proceeding with creation: ${searchErr.message}`);
          }

          let jiraResult;
          if (existingTicket) {
              jiraResult = { 
                  message: "Ticket already exists", 
                  issue: existingTicket,
                  isExisting: true
              };
          } else {
              jiraResult = await this.mcpAdapter.createJiraTicket(jiraData);
          }
          
          let webUrl = jiraResult.issue?.url || '';
          let issueSelfUrl = jiraResult.issue?.self; // Extract REST API URL for the issue if available

          if (jiraResult.issue?.key) jiraIssueKey = jiraResult.issue.key;

          if (webUrl.includes('/rest/api/')) {
             try {
                const urlObj = new URL(webUrl);
                if (jiraIssueKey) {
                   webUrl = `${urlObj.origin}/browse/${jiraIssueKey}`;
                   // Heuristic: If we don't have self URL but have this, maybe we can guess? 
                   // But usually 'issue.self' is reliable from Jira API.
                }
             } catch(e) { /* ignore */ }
          }
          jiraWebUrl = webUrl;
          
          results.jira = { status: existingTicket ? 'existing' : 'created', ...jiraResult, url: webUrl, content: jiraData };

          // Link to Epic if needed and configured (Only if newly created or link check logic added)
          if (jiraIssueKey && epicLink && !existingTicket) {
             try {
                this.logger.info(`🔗 Linking ${jiraIssueKey} to Epic ${epicLink}...`);
                await this.mcpAdapter.linkIssueToEpic(jiraIssueKey, epicLink);
             } catch (linkError) {
                this.logger.warn(`⚠️ Failed to link epic: ${linkError.message}`);
             }
          }
          
          // Step 1 of 2: Upload attachment to Jira
          if (sharedAttachment && jiraIssueKey && !existingTicket) {
               try {
                   this.logger.info(`📎 [Step 1/2] Uploading screenshot to Jira ${jiraIssueKey}...`);
                   const attResult = await this.mcpAdapter.addJiraAttachment(jiraIssueKey, sharedAttachment.path, issueSelfUrl);
                   // Step 2 of 2: Only after confirmed upload, patch the description with !filename!
                   if (attResult?.success && attResult?.filenames?.length) {
                       const uploadedFilename = attResult.filenames[0];
                       this.logger.info(`📎 [Step 2/2] Embedding !${uploadedFilename}! in Jira description...`);
                       await this.mcpAdapter.updateJiraDescription(
                           jiraIssueKey,
                           jiraData.description || '',
                           uploadedFilename
                       );
                   }
               } catch(attErr) {
                   this.logger.warn('Failed to add Jira attachment', attErr);
               }
          }

        } catch (error) {
          this.logger.error('Failed to create Jira ticket', error);
          results.jira = { status: 'failed', error: error.message };
        }

        // --- Step B: Create Wiki Page ---
        try {
          this.logger.info(`docx MCP: Creating/Updating Wiki Page in ${wikiSpace}...`);

          // Inject Jira Link if available (Wiki -> Jira)
          let finalWikiContent = wikiContent;

          if (jiraWebUrl && jiraIssueKey) {
              // Add Related Work to the top metadata section
              const relatedLink = `**Related Work:** [${jiraIssueKey}](${jiraWebUrl})\n`;
              if (finalWikiContent.includes('**Source:**')) {
                  finalWikiContent = finalWikiContent.replace('**Source:** Figma Component\n', `**Source:** Figma Component\n${relatedLink}`);
              } else {
                  finalWikiContent = relatedLink + '\n' + finalWikiContent;
              }
          }
          
          // Idempotency: Check if page exists OR create unique if needed
          let wikiResult = null;
          let finalWikiTitle = wikiTitle;

          // Optimization: Try to find a free slot using search first (faster than failing creations)
          try {
              finalWikiTitle = await this._getUniqueWikiTitle(wikiTitle, wikiSpace);
              this.logger.info(`📄 Determined potential unique Wiki title: "${finalWikiTitle}"`);
          } catch (e) {
              this.logger.warn(`Failed to predict unique title, falling back to sequential creation`, e);
          }

          // Ensure content is string
          const safeContent = String(finalWikiContent || 'No content generated');
          
          // Robust Creation Loop: Handle race conditions or incorrect predictions
          let created = false;
          let loops = 0;
          const maxLoops = 5;

          while (!created && loops < maxLoops) {
              try {
                  // If we are looping (loops > 0), simple increment logic on top of whatever title we have/started with
                  // Or better: parse the counter from title and increment?
                  // Easier: just append timestamp if we are failing loops, or rely on _getUniqueWikiTitle to have done mostly right job.
                  
                  // Logic: 
                  // 1. Try 'finalWikiTitle' (from prediction).
                  // 2. If fail, derived new title, retry.
                  
                  if (loops > 0) {
                      // Simple collision avoidance: Append random small ID to be sure
                      finalWikiTitle = `${wikiTitle} (${Date.now().toString().slice(-4)})`;
                  }

                  this.logger.info(`🚀 Attempting creation: "${finalWikiTitle}" (Attempt ${loops + 1})`);
                  wikiResult = await this.mcpAdapter.createWikiPage(finalWikiTitle, safeContent, wikiSpace, wikiParentId);
                  created = true;

              } catch (createErr) {
                  const msg = (createErr.message || '').toLowerCase();
                  // Include '500' and 'internal server error' as potential indicators of trash-conflict on some Confluence versions
                  if (msg.includes('exist') || msg.includes('conflict') || msg.includes('unique') || msg.includes('500') || msg.includes('internal server error')) {
                      this.logger.warn(`⚠️ Title "${finalWikiTitle}" unavailable or server error (Conflict/Trash?). Retrying... Error: ${msg}`);
                      loops++;
                  } else {
                      // If it's not a conflict, it's a real error. Rethrow.
                      throw createErr;
                  }
              }
          }

          if (!created) {
              throw new Error(`Failed to create Wiki page after ${maxLoops} attempts due to conflicts.`);
          }
          
          // Two-step image attachment for Confluence:
          // Step 1: Upload file to page. Step 2: Only if upload confirmed, update page body with image reference.
          if (sharedAttachment && wikiResult && !wikiResult.error) {
               // Resolve Page ID and version from diverse possible response shapes
               const pageId = wikiResult.id || wikiResult.page?.id || null;
               const pageVersion = wikiResult.version?.number ?? wikiResult.page?.version?.number ?? 1;
               const pageTitle = finalWikiTitle;

               // Resolve Self Link for direct attachment upload
               let pageSelfLink = wikiResult._links?.self || wikiResult.page?._links?.self || null;

               if (pageId) {
                   try {
                       this.logger.info(`📎 [Step 1/2] Uploading screenshot to Confluence page ${pageId}...`);
                       const wikiAttResult = await this.mcpAdapter.addWikiAttachment(pageId, sharedAttachment.path, pageSelfLink);

                       // Step 2 of 2: Confirmed upload — inject image reference into page body via update
                       if (wikiAttResult?.success !== false) {
                           const imageFilename = sharedAttachment.filename;
                           this.logger.info(`📎 [Step 2/2] Embedding image reference in Confluence page (v${pageVersion} → v${pageVersion + 1}): ![${imageFilename}]`);
                           const imageMarkdown = `\n![Design Preview](${imageFilename})\n`;
                           let updatedContent = finalWikiContent;
                           if (updatedContent.includes('---\n\n')) {
                               updatedContent = updatedContent.replace('---\n\n', `---\n\n${imageMarkdown}\n`);
                           } else {
                               updatedContent = `${imageMarkdown}\n${updatedContent}`;
                           }
                           try {
                               await this.mcpAdapter.updateWikiPage(pageId, pageTitle, updatedContent, pageVersion);
                               this.logger.info('✅ Confluence page updated with image reference');
                           } catch (updateErr) {
                               this.logger.warn(`⚠️ Image injected into page failed (attachment still uploaded): ${updateErr.message}`);
                           }
                       }
                   } catch (attErr) {
                       this.logger.warn(`Failed to attach to wiki: ${attErr.message}`);
                   }
               } else {
                   this.logger.warn('⚠️ Could not determine Page ID for Wiki attachment', wikiResult);
               }
          }

          results.wiki = { status: 'created', ...wikiResult, content: finalWikiContent };
          
          // Improved URL extraction
          if (wikiResult && wikiResult.page) {
             if (wikiResult.page.url) {
                  // Direct URL provided (often from REST API v2 or simplified response)
                  wikiPageUrl = wikiResult.page.url;
             } else if (wikiResult.page._links && wikiResult.page._links.base && wikiResult.page._links.webui) {
                  // Standard REST API v1
                  wikiPageUrl = `${wikiResult.page._links.base}${wikiResult.page._links.webui}`;
             }
          } else if (wikiResult && wikiResult._links && wikiResult._links.base) {
             // Fallback for top-level result
             wikiPageUrl = `${wikiResult._links.base}${wikiResult._links.webui}`;
          }
          
          // Ensure URL is available in the result for UI
          results.wiki.url = wikiPageUrl;

        } catch (e) {
          this.logger.error(`Failed to create Wiki page: ${e.message}`, e);
          results.wiki.error = e.message;
          results.wiki.status = 'failed_creation';
        }

        } finally {
            // Shared Cleanup at the very end
            if (sharedAttachment && sharedAttachment.cleanup) {
                await sharedAttachment.cleanup();
            }
        }

        // --- Step C: Cross-Linking ---
        try {
            if (jiraIssueKey && wikiPageUrl) {
                await this.mcpAdapter.createRemoteLink(jiraIssueKey, wikiPageUrl, `Implementation Plan: ${context.componentName}`);
            }
        } catch (linkError) {
             this.logger.warn(`Cross-linking failed: ${linkError.message}`);
        }

        // --- Step D: Create Git Branch ---
        try {
          this.logger.info(`🌿 MCP: Creating Git Branch ${branchName}...`);
          const gitResult = await this.mcpAdapter.createGitBranch(branchName, repoPath);
          results.git = { status: 'created', ...gitResult, content: { branchName, repoPath } };
        } catch (e) {
          // Log explicitly but don't fail the whole request
          this.logger.error(`Failed to create Git branch: ${e.message}`);
          results.git.error = e.message;
          results.git.status = 'failed_creation';
        }

      } else {
        this.logger.info('⏸️ Active creation disabled or MCP unavailable. Returning generated content only.');
      }

    } catch (error) {
      this.logger.error('❌ Orchestration failed', error);
      // Even on failure, return partial results if available
      return { 
          results, 
          error: error.message,
          content: generatedContentForUI // Return what we generated so far
      };
    }

    // Return combined result for UI
    return { 
        results,
        content: generatedContentForUI 
    };
  }

  async _prepareImage(context, identifier) {
     const safeId = identifier ? identifier.replace(/[^a-zA-Z0-9-_]/g, '') : `img-${Date.now()}`;
     
     // Normalize screenshot data
     let imageSource = context.imagePath || context.screenshot;
     if (typeof imageSource === 'object' && imageSource !== null && !context.imagePath) {
         // Handle object wrapper like { url: '...' } or { content: '...' }
         if (imageSource.url) imageSource = imageSource.url;
         else if (imageSource.dataUrl) imageSource = imageSource.dataUrl;
         else if (imageSource.content) imageSource = imageSource.content;
         else if (imageSource.data) imageSource = imageSource.data;
     }

     if (!imageSource) return null;
     
     // FIX: Check for stringified object in context from some plugins (JSON string in text field)
     if (typeof imageSource === 'string' && imageSource.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(imageSource);
            if (parsed.url) imageSource = parsed.url;
            else if (parsed.dataUrl) imageSource = parsed.dataUrl;
        } catch(e) {}
     }

     this.logger.info(`🖼️ Preparing Image for ${safeId}. Source Type: ${typeof imageSource}, Length: ${imageSource && imageSource.length || 'N/A'}`);

     let tempFilePath = null;
     let shouldCleanup = false;

     try {
         if (context.imagePath) {
             // Local file provided
             tempFilePath = context.imagePath;
         } else if (typeof imageSource === 'string' && (imageSource.startsWith('data:image') || (!imageSource.startsWith('http') && imageSource.length > 200))) {
             // Base64 Data
             let base64Data = imageSource;
             if (imageSource.startsWith('data:image')) {
                 base64Data = imageSource.replace(/^data:image\/\w+;base64,/, "");
             }
             
             const buffer = Buffer.from(base64Data, 'base64');
             tempFilePath = path.join(os.tmpdir(), `figma-${safeId}.png`);
             await fs.writeFile(tempFilePath, buffer);
             shouldCleanup = true;
         } else if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
             // URL Download
             this.logger.info(`Downloading screenshot from URL: ${imageSource.substring(0, 50)}...`);
             const response = await fetch(imageSource);
             if (response.ok) {
                const buffer = Buffer.from(await response.arrayBuffer());
                tempFilePath = path.join(os.tmpdir(), `figma-${safeId}.png`);
                await fs.writeFile(tempFilePath, buffer);
                shouldCleanup = true;
                this.logger.info(`✅ Image downloaded to ${tempFilePath}`);
             } else {
                 this.logger.warn(`❌ Failed to download image: ${response.status} ${response.statusText}`);
             }
         }

         if (tempFilePath) {
             return {
                 path: tempFilePath,
                 filename: `preview-${safeId}.png`, // Ensure png extension for Wiki compatibility
                 cleanup: async () => {
                     if (shouldCleanup && tempFilePath) {
                         try { await fs.unlink(tempFilePath); } catch (e) {}
                     }
                 }
             };
         }
     } catch (e) {
         this.logger.warn('Failed to prepare image', { message: e.message, stack: e.stack });
     }
     return null;
  }

  async _handleAttachments(context, issueKey) {
     if (!issueKey) return;
     const prep = await this._prepareImage(context, issueKey);
     if (prep) {
         await this.mcpAdapter.addJiraAttachment(issueKey, prep.path);
         await prep.cleanup();
     }
  }

  _generateBranchName(componentName, type = 'feature') {
    const sanitized = componentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `${type}/${sanitized}`;
  }

  _formatForJira(markdown) {
      // Jira usually favors having the Acceptance Criteria prominent.
      // We can also ensure it uses proper ADF or text formatting if we had a converter,
      // but standard Markdown is often accepted by modern Jira APIs or converted automatically.
      // We'll leave it mostly as-is but ensuring it fits the 'User Story' vibe.
      return `*Generated by Figma AI Ticket Generator*\n\n${markdown}`;
  }

  _buildFigmaDeepLink(context) {
    const base = context.figmaUrl || null;
    const fileKey = context.fileContext?.fileKey || null;
    if (!base && !fileKey) return null;
    let url = base ? base.split('?')[0] : `https://www.figma.com/design/${fileKey}`;
    const firstFrame = context.enhancedFrameData?.[0] || context.frameData?.[0];
    const nodeId = firstFrame?.id;
    if (nodeId) {
      const encodedNodeId = nodeId.replace(/:/g, '-').replace(/;/g, '%3B');
      url += `?node-id=${encodedNodeId}`;
    }
    return url;
  }

  _formatForWiki(markdown, context) {
      // Wiki should be more detailed.
      // We can prepend metadata or technical specs.
      // Using standard Markdown as Confluence expects 'markdown' format
      let header = `# Technical Design: ${context.componentName}\n\n`;
      header += `**Date:** ${new Date().toLocaleDateString()}\n`;
      header += `**Source:** Figma Component\n`;
      const figmaDeepLink = this._buildFigmaDeepLink(context);
      if (figmaDeepLink) {
        header += `**Figma:** [View Design](${figmaDeepLink})\n`;
      }
      header += `---\n\n`;
      
      // Basic conversion of Jira Markup to Markdown
      // Note: This is a simple regex-based conversion. For full fidelity, a parser is needed.
      let converted = markdown
          .replace(/^h1\. (.*)$/gm, '# $1')      // h1. -> #
          .replace(/^h2\. (.*)$/gm, '## $1')     // h2. -> ##
          .replace(/^h3\. (.*)$/gm, '### $1')    // h3. -> ###
          .replace(/^h4\. (.*)$/gm, '#### $1')   // h4. -> ####
          .replace(/\{code(:[a-z]+)?\}/g, '```') // {code} -> ```
          .replace(/\[(.+)\|(.+)\]/g, '[$1]($2)') // [text|url] -> [text](url)
          .replace(/_(.+)_/g, '*$1*')            // _italic_ -> *italic* (Markdown uses * or _)
          .replace(/\*(.+)\*/g, '**$1**')        // *bold* -> **bold**
          .replace(/^{noformat}/gm, '```')        // {noformat} -> ```
          .replace(/^----/gm, '---');            // ---- -> ---

      return header + converted;
  }

}
