# 🤖 AGENT_CONTEXT.md - Required Reading for AI Agents

**⚠️ CRITICAL: All AI agents MUST read this file before making any changes to the repository.**

**🎉 STATUS UPDATE**: **UI SIMPLIFIED & E2E TESTING READY** - Comprehensive testing infrastructure operational (Oct 15, 2025)

**🔄 LATEST UPDATE**: Unified UI structure, fixed E2E test architecture, and standardized element IDs for consistent testing (Oct 15, 2025)

## 🎯 Project Context

This is the **Enhanced Figma → Jira Automation Tool** with **WORKING** AI integration and comprehensive documentation. 

### **✅ VERIFIED WORKING CONFIGURATION:**
- **Primary AI Service**: Google Gemini 2.5 Flash (FREE tier) - **OPERATIONAL**
- **API Key**: Configured in `.env` file (see .env.example for setup) - **VALID & TESTED**
- **MCP Server**: Running at `localhost:3000` with 6 strategic tools - **ACTIVE**
- **Test Results**: **100% SUCCESS RATE** (4/4 tests passed)
- **Status**: **PRODUCTION-READY** with enterprise AI features

### **🧪 LATEST ACHIEVEMENTS** (Oct 15, 2025)
```
🎯 UI STRUCTURE SIMPLIFICATION
✅ Unified: Cleaned up confusing multiple UI locations
✅ Created: /ui/plugin/ for main Figma plugin (production)
✅ Created: /ui/standalone/ for E2E testing (simplified but compatible)
✅ Fixed: All E2E test 404 errors and path resolution
✅ Standardized: Element IDs across UIs (#generate, #generateBtn)

📊 E2E TEST STATUS
✅ UI Loading Tests: PASSING 
✅ Element Validation: PASSING
❌ MCP Integration: Needs server connection fixes
❌ Content Generation: Needs fallback handling
```

## 📁 **CRITICAL: Documentation Structure**

**🚨 NEVER delete or move the `docs/` folder or its contents without explicit user request!**

```
docs/
├── User Guides/           # User-facing documentation
├── Strategic Planning/    # Business strategy & agent automation roadmap
├── Technical Implementation/  # MCP server & technical details  
├── Implementation Details/    # Bug fixes & technical improvements
└── [Root level files]     # Project status & organization docs
```

### **Most Important Files:**
- `docs/Strategic Planning/AI-AGENT-AUTOMATION-ROADMAP.md` - **PRIMARY AGENT CONTEXT**
- `docs/Strategic Planning/FIGMA-MCP-STRATEGIC-ANALYSIS.md` - Strategic analysis
- `docs/PRODUCTION-READINESS.md` - Current production status

## 🛡️ **Preservation Rules**

### **ALWAYS PRESERVE:**
1. **Documentation folder structure** - Never reorganize without permission
2. **Agent context files** - Essential for maintaining project continuity  
3. **Environment configuration** - `.env` and related config files
4. **MCP server architecture** - Core business logic
5. **Git history** - All commits and branch information

### **BEFORE ANY MAJOR CHANGES:**
1. **Read the primary context file**: `docs/Strategic Planning/AI-AGENT-AUTOMATION-ROADMAP.md`
2. **Check current status**: `docs/PRODUCTION-READINESS.md`
3. **Verify git status**: Ensure no important changes will be lost
4. **Ask permission** for any structural reorganization

## 🔒 **Security Guidelines**

- **Never commit real API keys** to any tracked files
- **Use `.env.example`** for templates only  
- **Keep actual keys** in `.env` (gitignored)
- **Reference .env in documentation** instead of showing actual keys
- **Protect sensitive configuration** files
- **Sanitize all examples** to use placeholder values

## 🤖 **AGENT CONTEXT MANAGEMENT PROTOCOLS**

### **📖 Context File Reading Requirements**
**MANDATORY: Read this AGENT_CONTEXT.md file in these situations:**
- ✅ **Session Start**: ALWAYS read at the beginning of any new conversation
- ✅ **Major Features**: Before implementing significant changes or new features  
- ✅ **Pre-Commit**: Before any git commit or push operations
- ✅ **Status Queries**: When user asks about project capabilities or current state
- ✅ **Architecture Changes**: Before modifying core systems or dependencies

### **🔄 Context Update Triggers**
**UPDATE this context file when:**
- ✅ **Starting new session** - Verify current project state
- ✅ **Completing major features** - Document new capabilities
- ✅ **Before git commits** - Ensure status accuracy
- ✅ **After test execution** - Update test results and success rates
- ✅ **Status changes** - Production ready, new integrations, etc.
- ✅ **AI provider changes** - Adding/removing AI services
- ✅ **Architecture updates** - Core system modifications
- ✅ **Security updates** - API changes, configuration updates

### **📋 Context Management Workflow**
1. **🎯 Session Initialization**:
   - Read AGENT_CONTEXT.md immediately
   - Verify working directory and project structure
   - Check current git status and recent commits

2. **🔧 During Development**:
   - Update relevant sections as changes are made
   - Document new capabilities or resolved issues
   - Maintain accuracy of status and test results

3. **📝 Pre-Commit Protocol**:
   - Update project status and recent achievements
   - Verify test results are current
   - Remove any accidentally included sensitive data
   - Confirm context reflects repository state

4. **🚀 Post-Implementation**:
   - Update production readiness status
   - Document any new dependencies or requirements
   - Record performance metrics and success rates

### **✅ Context Validation Checklist**
Before any major action, verify:
- [ ] Current project status accurately reflected
- [ ] All working integrations properly documented
- [ ] Test results and success rates are current
- [ ] No API keys or sensitive data in documentation
- [ ] Recent changes and achievements recorded
- [ ] Security guidelines followed throughout
- [ ] Documentation structure preserved

## 📊 **Current Project Status**

- ✅ **AI Integration Ready**: Gemini API operational with MCP server
- ✅ **UI Structure Simplified**: Clean /ui/ structure with plugin & standalone versions
- ✅ **E2E Testing Infrastructure**: Playwright tests with proper path resolution
- ✅ **Documentation**: Comprehensively organized and maintained
- 🔄 **In Progress**: MCP server integration fixes and fallback handling

## 🎯 **Next Priorities**

1. **Fix MCP server connection issues** - Resolve E2E test failures
2. **Add proper fallback handling** - For when MCP is unavailable  
3. **Clean up remaining old UI files** - Complete structure simplification
4. **Maintain working features** - Preserve existing functionality

---

**Last Updated**: October 15, 2025  
**Status**: UI Simplified & E2E Testing Infrastructure Complete  
**Priority**: Fix MCP integration, add fallback handling, complete UI cleanup

⚠️ **Remember**: This project represents months of work. Always read this context file before starting work, preserve existing functionality and documentation unless explicitly asked to change it, and maintain security by never exposing API keys in documentation.