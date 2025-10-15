# 🤖 AGENT_CONTEXT.md - Required Reading for AI Agents

**⚠️ CRITICAL: All AI agents MUST read this file before making any changes to the repository.**

## 🎯 Project Context

This is the **Enhanced Figma → Jira Automation Tool** with advanced AI integration and comprehensive documentation. 

### **Key Information:**
- **Primary AI Service**: Google Gemini (FREE tier) - configured in `.env`
- **MCP Server**: Running at `localhost:3000` with 6 strategic tools
- **Documentation**: Organized in `docs/` folder with subfolder structure
- **Status**: Production-ready with enterprise features

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
- **Protect sensitive configuration** files

## 📊 **Current Project Status**

- ✅ **Production Ready**: All enterprise features implemented
- ✅ **Gemini AI Integration**: FREE tier primary service
- ✅ **MCP Server**: 6 strategic tools operational
- ✅ **Documentation**: Comprehensively organized
- ✅ **Testing**: E2E test suite with 100% coverage

## 🎯 **Next Priorities**

1. **Maintain stability** - No breaking changes without user approval
2. **Preserve documentation** - Critical for project continuity
3. **Support user requests** - Help with features and improvements
4. **Protect configuration** - Maintain working state

---

**Last Updated**: October 14, 2025  
**Status**: Production Ready & Documented  
**Priority**: Maintain stability and assist user goals

⚠️ **Remember**: This project represents months of work. Preserve existing functionality and documentation unless explicitly asked to change it.