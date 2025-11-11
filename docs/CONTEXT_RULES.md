# Context Rules for API Development

## Rule: Always Update Swagger Documentation

**When creating new API routes, ALWAYS update the Swagger documentation.**

### 📋 Required Steps:

1. **Create/Update Route** - Implement the new API endpoint
2. **Update Swagger** - Add comprehensive documentation to `app/api-docs/swagger.yaml`
3. **Test Documentation** - Verify Swagger UI displays correctly
4. **Validate Examples** - Ensure all examples work with real API

### 🔧 Swagger Documentation Requirements:

#### **Essential Elements:**
- **Summary**: Clear, concise endpoint purpose with emoji
- **Description**: Detailed explanation with use cases and examples
- **Tags**: Appropriate categorization
- **Request/Response Schemas**: Complete data models
- **Examples**: Multiple realistic examples showing different use cases
- **Error Responses**: All possible error conditions documented

#### **Documentation Standards:**
- Use consistent emoji prefixes for visual categorization
- Include markdown formatting for readability
- Provide curl examples in descriptions when helpful
- Document all query parameters, headers, and body properties
- Include realistic example values
- Specify required vs optional fields clearly

### 🎯 Context Intelligence Routes Documentation (COMPLETED):

**✅ Recently Added Routes:**
- `POST /api/context/extract` - Extract context from Figma data
- `GET /api/context/get` - Get cached context data
- `GET /api/context/search` - Search context data
- `GET /api/context/explore` - Explore context relationships  
- `GET /api/context/summary` - Get context summary
- `POST /api/intelligence/semantic` - Semantic analysis
- `POST /api/intelligence/accessibility` - Accessibility analysis
- `POST /api/intelligence/design-tokens` - Design tokens extraction
- `POST /api/component/analyze` - Component structure analysis
- `POST /api/component/tokens` - Component-specific tokens

**📝 Documentation Features Added:**
- Complete request/response schemas
- Multiple example scenarios
- Error handling documentation
- New `context-intelligence` tag category
- Integration with existing API patterns

### 🔄 Process Workflow:

```bash
# 1. Create new route
echo "Add route handler to appropriate route file"

# 2. Update Swagger immediately
echo "Add endpoint documentation to app/api-docs/swagger.yaml"

# 3. Test documentation
echo "Open http://localhost:3000/api-docs to verify"

# 4. Validate with real API
echo "Test examples with curl or Postman"
```

### 📍 Swagger File Location:
- **File**: `app/api-docs/swagger.yaml`
- **Sections**: 
  - `tags` - Add new category tags
  - `paths` - Add new endpoint definitions
  - `components/schemas` - Add reusable data models

### ⚠️ Important Notes:
- **No Exceptions**: Every new route MUST have Swagger documentation
- **Update Before Commit**: Documentation should be updated before code commit
- **Consistent Style**: Follow existing documentation patterns and emoji usage
- **Validation**: Always test Swagger UI renders correctly
- **Examples**: Include working examples that can be copy-pasted

### 🎯 Benefits:
- **Developer Experience**: Clear API documentation for all team members
- **API Discoverability**: New endpoints are immediately discoverable
- **Testing**: Examples provide immediate testing capability
- **Maintenance**: Documented APIs are easier to maintain and debug
- **Integration**: Frontend/external integrations have clear specifications

---

**This rule ensures our API documentation stays comprehensive and up-to-date as the system evolves.**