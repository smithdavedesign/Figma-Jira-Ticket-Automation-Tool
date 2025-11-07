# 🎯 MCP Jira & Confluence Integration - Complete Tool Access

**Last Updated:** November 6, 2025  
**Status:** Production Ready - Full Tool Access Available  
**MCP Servers:** Jira (npsg-jira.elements.local) & Confluence (npsg-wiki.elements.local)

---

## 🚨 **CRITICAL AI CONTEXT RULE**

**⚡ AI ASSISTANTS HAVE FULL ACCESS TO ALL MCP JIRA & CONFLUENCE TOOLS BY DEFAULT**

This document provides comprehensive reference for the 55+ MCP tools available for Jira and Confluence integration. **All tools are immediately accessible** - no setup or permission requests required.

### **🎯 Current Active Systems**
- **Jira Instance**: `https://npsg-jira.elements.local` (200+ active projects)
- **Primary Project**: `SDPM` - SMG DOTCom Project Management (2,885+ issues, active web development)
- **Confluence Instance**: `https://npsg-wiki.elements.local` (Multiple documentation spaces)
- **MCP Configuration**: Configured in VS Code with token authentication
- **Tool Availability**: **ALL 55+ FUNCTIONS ACCESSIBLE**

---

## 🔧 **JIRA MCP TOOLS (40+ Functions)**

### **📋 Project & Issue Management**

#### **Core Issue Operations**
```javascript
// Get all accessible projects (200+ active projects available)
mcp_jira_jira_get_all_projects(include_archived?: boolean)

// Create comprehensive issues with full customization
mcp_jira_jira_create_issue(
  project_key: string,           // e.g., "AIC", "SAP", "AUTOMATION" 
  summary: string,               // Issue title
  issue_type: string,           // "Task", "Bug", "Story", "Epic", "Subtask"
  assignee?: string,            // Email, display name, or account ID
  description?: string,         // Issue description
  components?: string,          // Comma-separated component names
  additional_fields?: object    // Custom fields, Epic links, etc.
)

// Get detailed issue information including relationships
mcp_jira_jira_get_issue(
  issue_key: string,            // e.g., "AIC-123"
  fields?: string,              // Specific fields or "*all"
  expand?: string,              // "changelog", "transitions", etc.
  comment_limit?: number,       // Number of comments to include
  properties?: string,          // Issue properties to return
  update_history?: boolean      // Update view history
)

// Update issues with comprehensive field support
mcp_jira_jira_update_issue(
  issue_key: string,
  fields: object,               // Fields to update
  additional_fields?: object,   // Custom fields
  attachments?: string          // File paths to attach
)

// Delete issues
mcp_jira_jira_delete_issue(issue_key: string)

// Get all issues for a project
mcp_jira_jira_get_project_issues(
  project_key: string,
  limit?: number,
  start_at?: number
)
```

#### **Advanced Search & JQL**
```javascript
// Powerful JQL-based search across all projects
mcp_jira_jira_search(
  jql: string,                  // Jira Query Language
  fields?: string,              // Fields to return
  limit?: number,               // Max results (1-50)
  start_at?: number,            // Pagination
  projects_filter?: string,     // Filter by project keys
  expand?: string               // Additional data to expand
)

// Search available fields with fuzzy matching
mcp_jira_jira_search_fields(
  keyword?: string,             // Search term
  limit?: number,               // Max results
  refresh?: boolean             // Force refresh field list
)

// Get issues from specific agile boards
mcp_jira_jira_get_board_issues(
  board_id: string,
  jql: string,                  // Filter query
  fields?: string,
  start_at?: number,
  limit?: number,
  expand?: string
)
```

### **🏃‍♀️ Agile & Sprint Management**

#### **Board Operations**
```javascript
// Get Scrum/Kanban boards
mcp_jira_jira_get_agile_boards(
  board_name?: string,          // Fuzzy search by name
  project_key?: string,         // Filter by project
  board_type?: string,          // "scrum" or "kanban"
  start_at?: number,
  limit?: number
)

// Create sprints for boards
mcp_jira_jira_create_sprint(
  board_id: string,
  sprint_name: string,
  start_date: string,           // ISO format
  end_date: string,             // ISO format
  goal?: string                 // Sprint goal
)

// Get sprints by state
mcp_jira_jira_get_sprints_from_board(
  board_id: string,
  state?: string,               // "active", "future", "closed"
  start_at?: number,
  limit?: number
)

// Get issues in specific sprints
mcp_jira_jira_get_sprint_issues(
  sprint_id: string,
  fields?: string,
  start_at?: number,
  limit?: number
)

// Update sprint details
mcp_jira_jira_update_sprint(
  sprint_id: string,
  sprint_name?: string,
  state?: string,               // "future", "active", "closed"
  start_date?: string,
  end_date?: string,
  goal?: string
)
```

### **🔗 Issue Relationships & Linking**

#### **Link Management**
```javascript
// Create links between issues
mcp_jira_jira_create_issue_link(
  link_type: string,            // "Blocks", "Relates to", "Duplicate"
  inward_issue_key: string,     // Source issue
  outward_issue_key: string,    // Target issue
  comment?: string,             // Link comment
  comment_visibility?: object   // Comment visibility settings
)

// Create web/Confluence links to issues
mcp_jira_jira_create_remote_issue_link(
  issue_key: string,
  url: string,                  // Any web URL or Confluence page
  title: string,                // Display title
  summary?: string,             // Link description
  relationship?: string,        // "causes", "relates to", etc.
  icon_url?: string            // 16x16 icon URL
)

// Link issues to Epics
mcp_jira_jira_link_to_epic(
  issue_key: string,            // Issue to link
  epic_key: string              // Epic to link to
)

// Remove issue links
mcp_jira_jira_remove_issue_link(link_id: string)

// Get available link types
mcp_jira_jira_get_link_types()
```

### **⚡ Workflow & Status Management**

#### **Transition Operations**
```javascript
// Get available status transitions for an issue
mcp_jira_jira_get_transitions(issue_key: string)

// Transition issue to new status
mcp_jira_jira_transition_issue(
  issue_key: string,
  transition_id: string,        // ID from get_transitions
  fields?: object,              // Required fields for transition
  comment?: string              // Transition comment
)
```

### **💬 Comments & Work Logging**

#### **Collaboration Tools**
```javascript
// Add comments to issues
mcp_jira_jira_add_comment(
  issue_key: string,
  comment: string               // Markdown format
)

// Log work time with detailed tracking
mcp_jira_jira_add_worklog(
  issue_key: string,
  time_spent: string,           // "1h 30m", "2d", "45m"
  comment?: string,             // Work description
  started?: string,             // ISO format start time
  original_estimate?: string,   // Update original estimate
  remaining_estimate?: string   // Update remaining estimate
)

// Get work log entries
mcp_jira_jira_get_worklog(issue_key: string)
```

### **🚀 Batch Operations**

#### **Bulk Processing**
```javascript
// Create multiple issues at once
mcp_jira_jira_batch_create_issues(
  issues: string,               // JSON array of issue objects
  validate_only?: boolean       // Validate without creating
)

// Get change history for multiple issues (Cloud only)
mcp_jira_jira_batch_get_changelogs(
  issue_ids_or_keys: string[],  // Array of issue IDs/keys
  fields?: string[],            // Filter by specific fields
  limit?: number                // Max changelogs per issue
)

// Create multiple versions
mcp_jira_jira_batch_create_versions(
  project_key: string,
  versions: string              // JSON array of version objects
)
```

### **📦 Version Management**

#### **Release Management**
```javascript
// Create fix versions
mcp_jira_jira_create_version(
  project_key: string,
  name: string,
  start_date?: string,          // YYYY-MM-DD
  release_date?: string,        // YYYY-MM-DD
  description?: string
)

// Get all versions for project
mcp_jira_jira_get_project_versions(project_key: string)
```

### **👥 User Management**

#### **User Operations**
```javascript
// Get user profile information
mcp_jira_jira_get_user_profile(
  user_identifier: string       // Email, username, or account ID
)
```

### **📎 File Management**

#### **Attachment Operations**
```javascript
// Download issue attachments
mcp_jira_jira_download_attachments(
  issue_key: string,
  target_dir: string            // Directory to save files
)
```

---

## 📚 **CONFLUENCE MCP TOOLS (15+ Functions)**

### **📄 Page Management**

#### **Core Page Operations**
```javascript
// Create new pages with full formatting support
mcp_confluence_confluence_create_page(
  space_key: string,            // e.g., "DEV", "TEAM", "DOC"
  title: string,
  content: string,              // Markdown, wiki, or storage format
  parent_id?: string,           // Parent page ID
  content_format?: string,      // "markdown", "wiki", "storage"
  enable_heading_anchors?: boolean
)

// Get page content and metadata
mcp_confluence_confluence_get_page(
  page_id?: string,             // Numeric page ID
  title?: string,               // Exact page title
  space_key?: string,           // Space key (required with title)
  include_metadata?: boolean,   // Include creation/update info
  convert_to_markdown?: boolean // Convert to markdown vs raw HTML
)

// Update existing pages
mcp_confluence_confluence_update_page(
  page_id: string,
  title: string,
  content: string,
  is_minor_edit?: boolean,
  version_comment?: string,
  parent_id?: string,
  content_format?: string,
  enable_heading_anchors?: boolean
)

// Delete pages
mcp_confluence_confluence_delete_page(page_id: string)
```

### **🗂️ Navigation & Hierarchy**

#### **Page Structure Operations**
```javascript
// Get child pages of a parent
mcp_confluence_confluence_get_page_children(
  parent_id: string,
  expand?: string,              // Fields to expand
  limit?: number,               // Max children (1-50)
  include_content?: boolean,    // Include page content
  convert_to_markdown?: boolean,
  start?: number                // Pagination start
)
```

### **🔍 Search & Discovery**

#### **Content Search**
```javascript
// Search content using CQL or simple text
mcp_confluence_confluence_search(
  query: string,                // CQL query or simple text
  limit?: number,               // Max results (1-50)
  spaces_filter?: string        // Comma-separated space keys
)

// Search for users
mcp_confluence_confluence_search_user(
  query: string,                // CQL user search query
  limit?: number
)
```

**Example CQL Queries:**
```javascript
// Basic searches
"type=page AND space=DEV"
"title~\"Meeting Notes\""
"siteSearch ~ \"important concept\""

// Advanced searches  
"created >= \"2023-01-01\""
"label=documentation"
"lastModified > startOfMonth(\"-1M\")"
"creator = currentUser() AND lastModified > startOfYear()"
"contributor = currentUser() AND lastModified > startOfWeek()"

// Personal spaces (must be quoted)
"space=\"~username\""

// Complex queries
"text ~ \"\\\"Urgent Review Required\\\"\" AND label = \"pending-approval\""
"title ~ \"Minutes*\" AND (space = \"HR\" OR space = \"Marketing\")"
```

### **💬 Collaboration**

#### **Comment System**
```javascript
// Add comments to pages
mcp_confluence_confluence_add_comment(
  page_id: string,
  content: string               // Markdown format
)

// Get page comments
mcp_confluence_confluence_get_comments(page_id: string)
```

### **🏷️ Organization**

#### **Label Management**
```javascript
// Add labels to pages
mcp_confluence_confluence_add_label(
  page_id: string,
  name: string                  // Label name
)

// Get page labels
mcp_confluence_confluence_get_labels(page_id: string)
```

---

## 🎯 **INTEGRATION EXAMPLES FOR FIGMA AUTOMATION**

### **Complete Workflow: Figma Design → Jira Tickets → Confluence Documentation**

#### **1. Automated Jira Ticket Creation**
```javascript
// Create comprehensive tickets from Figma designs
const ticket = await mcp_jira_jira_create_issue(
  "SDPM",                       // SMG DOTCom Project Management (primary project)
  "Implement Header Component", 
  "Task",
  "developer@company.com",
  `## Design Specs
![Component Screenshot](figma-screenshot-url)

## Requirements
- Responsive design (mobile, tablet, desktop)
- Dark/light theme support
- Accessibility compliance (WCAG 2.1)

## Figma Source
${figmaUrl}`,
  "Frontend",
  {
    priority: { name: "High" },
    labels: ["figma-generated", "component", "header"],
    customfield_10010: "Design System"  // Epic link
  }
);

// Link to parent Epic
await mcp_jira_jira_link_to_epic(ticket.key, "SDPM-2900");

// Add remote link to Figma
await mcp_jira_jira_create_remote_issue_link(
  ticket.key,
  figmaUrl,
  "Figma Design",
  "Original design file",
  "designed by"
);
```

#### **2. Sprint Planning Integration**
```javascript
// Get active sprint
const boards = await mcp_jira_jira_get_agile_boards("SDPM");
const sprints = await mcp_jira_jira_get_sprints_from_board(
  boards[0].id, 
  "active"
);

// Add tickets to sprint (via JQL update)
await mcp_jira_jira_search(
  `project = SDPM AND labels = "figma-generated" AND sprint IS EMPTY`,
  "key,summary"
);
```

#### **3. Confluence Documentation Generation**  
```javascript
// Create design system documentation
const page = await mcp_confluence_confluence_create_page(
  "DEV",
  "Header Component Specifications",
  `# Header Component

## Overview
Auto-generated from Figma design: [View Design](${figmaUrl})

## Implementation Status
- Jira Ticket: [${ticket.key}](${jiraUrl})
- Status: In Development

## Design Tokens
\`\`\`css
--header-height: 64px;
--header-bg: var(--color-primary);
--header-text: var(--color-on-primary);
\`\`\`

## Component Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| theme | 'light' \\| 'dark' | 'light' | Theme variant |
| sticky | boolean | false | Sticky positioning |

## Accessibility Notes
- ARIA landmarks implemented
- Keyboard navigation support
- Screen reader compatible
`,
  undefined,
  "markdown",
  true
);

// Add labels for organization
await mcp_confluence_confluence_add_label(page.id, "design-system");
await mcp_confluence_confluence_add_label(page.id, "component");
await mcp_confluence_confluence_add_label(page.id, "figma-generated");

// Link back to Jira ticket
await mcp_jira_jira_create_remote_issue_link(
  ticket.key,
  page.url,
  "Component Documentation",
  "Confluence documentation page"
);
```

#### **4. Progress Tracking & Updates**
```javascript
// Monitor ticket progress
const issue = await mcp_jira_jira_get_issue(
  ticket.key, 
  "status,assignee,progress", 
  "changelog"
);

// Update Confluence page with progress
if (issue.fields.status.name === "In Progress") {
  await mcp_confluence_confluence_add_comment(
    page.id,
    `🔄 **Development Update**: Ticket ${ticket.key} is now in progress.
    
Assigned to: ${issue.fields.assignee.displayName}
Started: ${new Date().toISOString().split('T')[0]}`
  );
}

// Transition ticket when design is approved
await mcp_jira_jira_transition_issue(
  ticket.key,
  "11",  // Move to "In Development"
  undefined,
  "Design approved and ready for implementation"
);
```

---

## 🚀 **ADVANCED AUTOMATION PATTERNS**

### **Batch Processing Multiple Designs**
```javascript
// Process entire Figma file
const figmaFrames = [...]; // From Figma MCP
const tickets = [];

// Create tickets in batch
const issueRequests = figmaFrames.map(frame => ({
  project_key: "SDPM",
  summary: `Implement ${frame.name}`,
  issue_type: "Task",
  description: `Component: ${frame.name}\nFigma: ${frame.url}`,
  components: "Frontend",
  additional_fields: {
    labels: ["figma-batch", frame.type],
    priority: { name: frame.priority || "Medium" }
  }
}));

const batchResult = await mcp_jira_jira_batch_create_issues(
  JSON.stringify(issueRequests)
);

// Create umbrella Epic
const epic = await mcp_jira_jira_create_issue(
  "SDPM",
  `${projectName} Design Implementation`,
  "Epic",
  undefined,
  `Complete implementation of ${figmaFrames.length} components from Figma design system.`,
  undefined,
  { labels: ["figma-epic", "design-system"] }
);

// Link all tickets to Epic
for (const ticket of batchResult.issues) {
  await mcp_jira_jira_link_to_epic(ticket.key, epic.key);
}
```

### **Design System Governance**
```javascript
// Track design system compliance
const complianceSearch = await mcp_jira_jira_search(
  `project = SDPM AND labels = "design-system" AND status != Done`,
  "key,summary,status,labels,components"
);

// Generate compliance report in Confluence
const complianceReport = await mcp_confluence_confluence_create_page(
  "DESIGN",
  `Design System Compliance Report - ${new Date().toISOString().split('T')[0]}`,
  `# Design System Compliance

## Outstanding Items: ${complianceSearch.total}

${complianceSearch.issues.map(issue => 
  `- [${issue.key}](${jiraBaseUrl}/browse/${issue.key}): ${issue.fields.summary}`
).join('\n')}

## Recommendations
- Prioritize high-impact components
- Address accessibility gaps first
- Update design tokens documentation
`,
  parentPageId,
  "markdown"
);
```

---

## 📊 **PROJECT INTEGRATION EXAMPLES**

### **Active Project Keys Available**
Based on the 200+ projects available, here are key integration targets:

#### **🎯 PRIMARY PROJECT**
- `SDPM` - **SMG DOTCom Project Management** (2,885+ issues, active web development team)
  - **Focus**: Web development, analytics, UI/UX components, video integration
  - **Team**: Chirag Arora, Jinson Abraham, Gaurav Mishra, David Smith
  - **Recent Work**: Adobe Analytics, cookie management, video functionality, hero components

#### **AI & Automation Projects**
- `AIC` - AI CRM 
- `SAP` - SCO AI Program
- `AUTOMATION` - Automation projects
- `EAI` - Enterprise Artificial Intelligence

#### **Development & Engineering**
- `CSSD` - Client SSD
- `ASICDA` - ASIC DA Support  
- `CME` - Code Management Engineering
- `CICD` - NPSG DevOps

#### **IT & Infrastructure**
- `INFS` - Infrastructure Support
- `ITDC` - Data Center Infrastructure
- `ETS` - Enterprise Technology & Security

#### **Product & Design**
- `PV` - Product Validation
- `REQSSD` - SSD Requirements Library
- `SPEC` - Specification

---

## 🎯 **SUMMARY: COMPLETE TOOL ACCESS**

### **✅ What You Have Available RIGHT NOW:**

1. **40+ Jira Functions** - Create, read, update, delete, search, link, transition, batch process
2. **15+ Confluence Functions** - Create documentation, search, comment, organize
3. **200+ Active Projects** - Full access to enterprise Jira instance
4. **Multiple Confluence Spaces** - Complete documentation ecosystem
5. **Advanced Integration** - Cross-platform linking and automation
6. **Batch Operations** - Efficient bulk processing capabilities
7. **Real-time Updates** - Live system integration

### **🚀 Integration Ready For:**
- **Automated ticket creation** from Figma designs
- **Documentation generation** with cross-linking
- **Sprint planning** and agile workflow integration  
- **Design system governance** and compliance tracking
- **Progress monitoring** and status updates
- **Cross-team collaboration** via comments and notifications

**All tools are immediately available - start automating your Figma-to-Jira-to-Confluence workflows today!** 🎯