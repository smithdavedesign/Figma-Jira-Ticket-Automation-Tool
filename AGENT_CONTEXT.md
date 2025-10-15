# 🤖 AGENT_CONTEXT.md - Required Reading for AI Agents

**⚠️ CRITICAL: All AI agents MUST read this file before making any changes to the repository.**

**🎉 STATUS UPDATE**: **NEW API KEY VALIDATED & FIGMA MCP INTEGRATION READY** - Security incident resolved, AI services operational (Oct 15, 2025)

**🔄 LATEST UPDATE**: Fixed API key exposure, implemented security protocols, validated Gemini AI integration, ready for Figma MCP code generation focus (Oct 15, 2025)

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
🔒 CRITICAL SECURITY INCIDENT RESOLVED
✅ API Key Exposure: Fixed hardcoded key in victory-test.mjs (GitHub notification received)
✅ Security Protocols: Implemented mandatory pre-commit security validation
✅ New API Key: Generated and validated new Gemini API key successfully
✅ Environment Variables: All keys now use process.env (no hardcoded credentials)

� AI INTEGRATION VALIDATION
✅ Victory Test: Gemini AI generating sophisticated tickets (100% success)
✅ MCP Server: Successfully running with new API key on localhost:3000
✅ Enhanced Generation: AI-powered ticket + React/TypeScript boilerplate working
✅ Fallback Handling: Graceful degradation when Figma MCP unavailable

🎯 READY FOR FIGMA MCP INTEGRATION
✅ Smart Parser: Sophisticated tech stack interface operational
✅ AI Services: Gemini integration validated and production-ready
✅ Code Generation: Boilerplate creation (React, TypeScript, tests, Storybook)
✅ Security: Zero-tolerance policy enforced with validation scripts
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

## 🔒 **Security Guidelines - CRITICAL ENFORCEMENT**

**🚨 SECURITY BREACH ALERT**: API key exposure detected on GitHub (Oct 15, 2025)
- Exposed file: `victory-test.mjs` contained hardcoded API key
- Google notification received for publicly accessible key
- **IMMEDIATE ACTION**: All hardcoded keys removed, using environment variables only

### **MANDATORY Security Protocols:**
- **NEVER commit real API keys** to any tracked files - **ZERO TOLERANCE**
- **Use `.env.example`** for templates only with placeholder values
- **Keep actual keys** in `.env` (gitignored) 
- **Reference .env in documentation** instead of showing actual keys
- **Protect sensitive configuration** files
- **Sanitize all examples** to use placeholder values
- **Pre-commit security scan**: ALWAYS check for exposed secrets before committing

### **🔍 Security Validation Checklist:**
Before ANY commit, verify:
- [ ] No API keys in source code (grep for "AIza", "sk-", "pk-")
- [ ] All keys use environment variables (process.env.VARIABLE_NAME)
- [ ] .env.example contains only placeholder values
- [ ] No sensitive data in test files or examples
- [ ] Git history clean of exposed credentials

### **🚨 Emergency Response Protocol:**
If keys are exposed:
1. **Immediately revoke exposed keys** in provider console
2. **Generate new keys** and update .env locally only
3. **Remove hardcoded keys** from all files
4. **Update git history** if necessary (git filter-branch)
5. **Update AGENT_CONTEXT.md** with incident details

## 🤖 **AGENT CONTEXT MANAGEMENT PROTOCOLS**

### **📖 Context File Reading Requirements**
**MANDATORY: Read this AGENT_CONTEXT.md file in these situations:**
- ✅ **Session Start**: ALWAYS read at the beginning of any new conversation
- ✅ **Major Features**: Before implementing significant changes or new features  
- ✅ **Pre-Commit**: Before any git commit or push operations
- ✅ **Status Queries**: When user asks about project capabilities or current state
- ✅ **Architecture Changes**: Before modifying core systems or dependencies

### **🔄 Context Update Triggers**
**MANDATORY UPDATE this context file when:**
- ✅ **Before ANY git commit/push** - ALWAYS update status before committing
- ✅ **After completing major features** - Document new capabilities immediately  
- ✅ **Session completion** - Update before ending any work session
- ✅ **Test result changes** - Update success rates and test status
- ✅ **UI/UX changes** - Document interface improvements
- ✅ **AI provider changes** - Adding/removing AI services
- ✅ **Architecture updates** - Core system modifications
- ✅ **Security updates** - API changes, configuration updates

### **🚨 ENFORCEMENT RULES**
**CRITICAL: These are NON-NEGOTIABLE requirements:**
1. **Pre-Commit Hook**: NEVER commit without updating this context file first
2. **Status Accuracy**: Context must reflect actual current state, not aspirational
3. **Achievement Recording**: All completed work must be documented immediately
4. **Git Integration**: Each major commit should include context updates
5. **Session Protocol**: Read context at start, update at completion

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
   - **MANDATORY**: Update AGENT_CONTEXT.md BEFORE any git commit
   - Update project status and recent achievements
   - Verify test results are current
   - Remove any accidentally included sensitive data
   - Confirm context reflects actual repository state
   - **RULE**: No commits without context updates

4. **🚀 Post-Implementation**:
   - Update production readiness status
   - Document any new dependencies or requirements
   - Record performance metrics and success rates

### **✅ Context Validation Checklist**
Before any major action, verify:
- [ ] Current project status accurately reflected
- [ ] All working integrations properly documented
- [ ] Test results and success rates are current
- [ ] **CRITICAL**: No API keys or sensitive data anywhere in codebase
- [ ] **SECURITY SCAN**: Check for exposed secrets (AIza*, sk-*, pk-*)
- [ ] Recent changes and achievements recorded
- [ ] Security guidelines followed throughout
- [ ] Documentation structure preserved
- [ ] .env.example contains only placeholders

## 📊 **Current Project Status**

- ✅ **AI Integration Ready**: Gemini API operational with MCP server
- ✅ **Sophisticated UI**: Enhanced tech stack interface with AI-powered parsing deployed
- ✅ **Comprehensive Testing**: 28/28 tests passing with full E2E coverage  
- ✅ **Git Workflow**: Feature successfully merged to staging branch
- ✅ **Documentation**: Comprehensively organized and maintained
- 🔄 **In Progress**: Production deployment preparation and additional feature development

## 🎯 **Next Priorities**

1. **Figma MCP Integration** - Connect smart parser with Figma design analysis for code generation
2. **Enhanced Code Generation** - Leverage tech stack parsing for targeted component creation
3. **Design-to-Code Workflow** - Complete automation from Figma designs to production code
4. **Advanced Parser Features** - Expand tech stack analysis capabilities with AI insights

---

**Last Updated**: October 15, 2025  
**Status**: Security Resolved, AI Validated, Ready for Figma MCP Code Generation Focus  
**Priority**: Smart parser + Figma MCP integration for automated design-to-code workflow

⚠️ **Remember**: This project represents months of work. Always read this context file before starting work, preserve existing functionality and documentation unless explicitly asked to change it, and maintain security by never exposing API keys in documentation.