# 📚 Documentation Organization Standards

## 🎯 **STRICT RULE FOR AI ASSISTANT**

**ALL documentation files (.md, README files, guides, instructions) MUST be placed in the `docs/` directory with proper organization.**

### 📁 **Directory Structure**

```
docs/
├── project-phases/          # Phase completion docs, milestones
├── testing/                 # All testing guides, results, procedures  
├── deployment/              # Production deployment, launch guides
├── troubleshooting/         # Bug fixes, architecture clarifications
├── planning/                # Strategic plans, roadmaps, next steps
├── guides/                  # User guides, how-to documentation
├── api/                     # API documentation
├── architecture/            # System architecture documentation
└── README.md               # Main documentation index
```

### 🚨 **MANDATORY PLACEMENT RULES**

| File Type | Location | Examples |
|-----------|----------|----------|
| **Testing** | `docs/testing/` | `*TESTING*.md`, `TEST_RESULTS.md` |
| **Deployment** | `docs/deployment/` | `PRODUCTION*.md`, `LAUNCH*.md` |
| **Troubleshooting** | `docs/troubleshooting/` | `*FIXES*.md`, `ARCHITECTURE*.md` |
| **Project Phases** | `docs/project-phases/` | `PHASE_*.md`, `*_COMPLETE.md` |
| **Planning** | `docs/planning/` | `*PLAN*.md`, `ROADMAP*.md` |
| **Instructions** | `docs/guides/` | `*INSTRUCTIONS*.md`, `*GUIDE*.md` |

### ✅ **Correct Examples**
- `docs/testing/FIGMA_TESTING_GUIDE.md` ✅
- `docs/deployment/PRODUCTION_LAUNCH.md` ✅  
- `docs/troubleshooting/PLUGIN_FIXES_APPLIED.md` ✅

### ❌ **WRONG - Never Do This**
- `./FIGMA_TESTING_GUIDE.md` ❌
- `./PRODUCTION_LAUNCH.md` ❌
- `./PLUGIN_FIXES_APPLIED.md` ❌

## 🔄 **When Creating New Documentation**

1. **Always ask**: "What type of documentation is this?"
2. **Choose the correct subdirectory** from the structure above
3. **Create the file in the proper location** 
4. **Update the main docs/README.md** with a link to the new file

## 📝 **File Naming Conventions**

- Use `UPPERCASE_WITH_UNDERSCORES.md` for major documentation
- Use `kebab-case.md` for guides and instructions
- Include clear, descriptive names that indicate content type
- Add date suffixes for versioned documents: `PHASE_4_COMPLETE_2025-10-16.md`

## 🎯 **Context Rule for AI Assistant**

**BEFORE creating any .md file, ALWAYS:**
1. Determine the documentation category
2. Choose the correct `docs/` subdirectory  
3. Create the file in the proper location
4. NEVER create documentation files in project root

This rule applies to ALL documentation creation, no exceptions! 🚫

---

**Last Updated**: October 16, 2025  
**Organized Files**: 17 documentation files moved from root to proper locations