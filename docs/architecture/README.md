# 🏗️ Architecture Documentation

**Purpose:** System architecture, design patterns, and technical implementation details  
**Last Updated:** October 24, 2025

---

## 📋 Files in this Directory

### 🎯 Primary Documents
- **SYSTEM_ARCHITECTURE.md** - Complete system architecture including MVC pattern, data layer, and production architecture
- **AI_INTEGRATION_ARCHITECTURE.md** - AI orchestration, design intelligence, and multi-provider integration
- **MIGRATION_HISTORY.md** - Complete migration history: TypeScript→JavaScript, MVC implementation, Redis integration

### 📁 Archived Documents (Legacy)
- **archive/** - Historical architecture documents preserved for reference
  - CLASSIFICATION_SYSTEM.md - Component classification system (merged into AI_INTEGRATION_ARCHITECTURE.md)
  - DATA_LAYER_ARCHITECTURE.md - Data layer design (merged into SYSTEM_ARCHITECTURE.md)
  - DESIGN_INTELLIGENCE_LAYER.md - Design intelligence concepts (merged into AI_INTEGRATION_ARCHITECTURE.md)
  - DESIGN_SPEC_SCHEMA.md - Schema definitions (merged into SYSTEM_ARCHITECTURE.md)
  - FIGMA_EXTRACTION_PIPELINE.md - Figma data processing (merged into AI_INTEGRATION_ARCHITECTURE.md)
  - FUTURE_ARCHITECTURE_ROADMAP.md - Future planning (merged into SYSTEM_ARCHITECTURE.md)
  - LLM_INTEGRATION.md - LLM integration patterns (merged into AI_INTEGRATION_ARCHITECTURE.md)
  - MVC_NODEJS_MIGRATION_PLAN.md - MVC migration planning (merged into MIGRATION_HISTORY.md)
  - SERVER_CONSOLIDATION_REDIS_PLAN.md - Redis integration planning (merged into MIGRATION_HISTORY.md)
  - TEMPLATE_ARCHITECTURE_FIX.md - Template system fixes (merged into AI_INTEGRATION_ARCHITECTURE.md)
  - TYPESCRIPT_TO_JAVASCRIPT_MIGRATION_COMPLETE.md - TypeScript migration (merged into MIGRATION_HISTORY.md)
  - UI_ARCHITECTURE.md - UI architecture details (merged into SYSTEM_ARCHITECTURE.md)

### 🖼️ Visual Assets
- **architecture-diagram.png** - System architecture diagram

---

## 🗺️ Architecture Quick Reference

### **Core Architecture Pattern**
- **MVC Structure**: Controllers (app/) + Models (core/) + Views (ui/) + Configuration (config/)
- **MCP Server**: Model Context Protocol server on localhost:3000
- **Redis Integration**: Persistent caching with graceful fallback
- **AI Orchestration**: Multi-provider AI integration (Gemini, GPT-4, Claude)

### **Key Integration Points**
1. **Plugin UI ↔ MCP Server**: HTTP API with JSON payloads
2. **MCP Server ↔ AI Services**: Secure multi-provider integration
3. **MCP Server ↔ Redis**: High-performance caching layer
4. **MCP Server ↔ Figma API**: Secure token-based integration

### **Production Features**
- **6 MCP Business Tools**: Production-ready business logic
- **Enterprise Caching**: Redis with 50-80% performance improvement
- **Comprehensive Logging**: Structured logging with performance tracking
- **Health Monitoring**: Real-time system status and metrics

---

## 🔄 Maintenance Protocol
- Update this README when adding/modifying any architecture document
- Check existing architecture docs before creating new ones to avoid duplication
- Consider consolidation opportunities when adding new technical documentation
- Maintain consistency across all architecture documentation

---

**📋 Architecture Status: Production Ready with MVC + Redis Integration ✅**