# Production-Ready Design Intelligence Schema v1.0

> **The canonical LLM-ready output format for extracted design intelligence**

## 🎯 Schema Philosophy

This schema is designed for **production consumption** by LLMs, agents, and development tools. It balances semantic richness with practical constraints:
- **Compact but complete**: All essential intelligence without token bloat
- **Modular structure**: Can be consumed in parts or as a whole
- **Version-stable**: Backward compatible evolution path
- **Tool-agnostic**: Works with any LLM or agent system

## 📋 Core Schema: `designSpec.v1.json`

```json
{
  "$schema": "https://design-intelligence.dev/schemas/designSpec.v1.json",
  
  "meta": {
    "fileKey": "string",           // Figma file ID
    "frameId": "string",           // Specific frame/node ID
    "frameName": "string",         // Human-readable frame name
    "extractedAt": "iso8601",      // Extraction timestamp
    "extractorVersion": "string",  // Version for compatibility
    "sourceUrl": "string",         // Direct Figma link
    "confidence": 0.87             // Overall extraction confidence
  },
  
  "projectContext": {
    "projectId": "string",
    "projectName": "string",
    "pageType": "marketing | app | dashboard | settings | modal | email | landing | product | checkout",
    "targetDevices": ["mobile", "tablet", "desktop"],
    "team": "string",
    "techStack": ["React", "TypeScript", "Tailwind", "Next.js"],
    "designSystem": "material-ui | custom | none",
    "businessDomain": "ecommerce | saas | marketing | internal"
  },
  
  "tokens": {
    "colors": {
      "brand.primary": "#0062E3",
      "brand.secondary": "#FF6B35",
      "surface.background": "#FFFFFF",
      "text.primary": "#1A1A1A",
      "semantic.success": "#10B981",
      "semantic.warning": "#F59E0B",
      "semantic.error": "#EF4444"
    },
    "spacing": {
      "xs": "4px",
      "sm": "8px", 
      "md": "16px",
      "lg": "24px",
      "xl": "32px",
      "2xl": "48px"
    },
    "radius": {
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "full": "9999px"
    },
    "typography": {
      "h1": "Inter 48/56 Bold",
      "h2": "Inter 32/40 Bold", 
      "h3": "Inter 24/32 SemiBold",
      "body": "Inter 16/24 Regular",
      "caption": "Inter 14/20 Medium"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
    }
  },
  
  "components": [
    {
      "id": "12:3",
      "name": "HeroBanner",
      "role": "component | instance | group",
      "semanticType": "banner | card | list | modal | nav | form | input | button | content",
      "intent": {
        "purpose": "conversion | navigation | information | interaction | decoration",
        "priority": "critical | high | medium | low",
        "userAction": "click | input | submit | navigate | view | none"
      },
      "bounds": {
        "x": 0,
        "y": 0,
        "w": 1440,
        "h": 720
      },
      "layout": {
        "type": "auto-layout | absolute | grid",
        "direction": "horizontal | vertical",
        "gap": 24,
        "alignment": "center | start | end | space-between",
        "padding": { "top": 24, "right": 32, "bottom": 24, "left": 32 },
        "constraints": { "horizontal": "left-right", "vertical": "top" }
      },
      "styling": {
        "fill": "tokens.colors.brand.primary",
        "border": "1px solid tokens.colors.surface.border",
        "borderRadius": "tokens.radius.md",
        "shadow": "tokens.shadows.lg"
      },
      "tokens": [
        "tokens.colors.brand.primary",
        "tokens.spacing.md",
        "tokens.typography.h1"
      ],
      "contentSummary": {
        "texts": [
          {
            "id": "t1",
            "text": "Enterprise NVMe SSDs",
            "style": "h1",
            "semanticRole": "heading | body | caption | label | cta"
          }
        ],
        "images": [
          {
            "id": "img1", 
            "src": "https://cdn.figma.com/.../hero.png",
            "role": "hero | icon | decoration | product",
            "alt": "High-performance SSD storage array"
          }
        ],
        "ctas": [
          {
            "id": "cta1",
            "label": "Request Quote",
            "intent": "primary_cta | secondary_cta | tertiary",
            "action": "navigate | submit | toggle | external"
          }
        ]
      },
      "interactions": [
        {
          "trigger": "onClick | onHover | onFocus | onSubmit",
          "target": "ProductDetail | external | modal",
          "intent": "navigate | submit | toggle | validate",
          "payload": { "productId": "ssd-enterprise-7680gb" }
        }
      ],
      "accessibility": [
        {
          "role": "banner | button | navigation | main | complementary",
          "ariaLabel": "Product hero banner",
          "keyboardNavigable": true,
          "contrastRatio": 4.5,
          "focusOrder": 1
        }
      ],
      "designSystemMatch": {
        "matchedComponentId": "DS.Hero/variantDefault",
        "matchConfidence": 0.86,
        "suggestedMapping": "components/Hero/Hero.tsx",
        "variations": ["Hero/Large", "Hero/Compact", "Hero/WithCTA"]
      },
      "codeHints": {
        "suggestedComponent": "Hero",
        "framework": {
          "react": {
            "component": "Hero",
            "props": ["title", "subtitle", "image", "cta"],
            "hooks": ["useState", "useCallback"],
            "imports": ["Image", "Button", "Container"]
          }
        },
        "styling": {
          "approach": "tailwind | css-modules | styled-components",
          "responsive": true,
          "stateVariants": ["default", "loading", "error"]
        }
      },
      "notes": "Designer: uses 3-column grid on desktop; mobile stacks vertically"
    }
  ],
  
  "relationships": {
    "hierarchy": [
      { "parent": "root", "children": ["12:3", "12:8", "12:20"] },
      { "parent": "12:3", "children": ["t1", "img1", "cta1"] }
    ],
    "siblings": [
      { "component": "12:3", "siblings": ["12:8", "12:20"], "relationship": "sequence" }
    ],
    "dependencies": [
      { "component": "12:3", "depends": ["img1"], "type": "asset" },
      { "component": "cta1", "depends": ["ProductDetail"], "type": "navigation" }
    ]
  },
  
  "interactionGraph": {
    "nodes": ["HeroBanner", "FeatureGrid", "Footer"],
    "edges": [
      {
        "from": "HeroBanner.cta1",
        "to": "ProductDetail", 
        "type": "navigate",
        "weight": "high | medium | low"
      }
    ],
    "flows": [
      {
        "name": "Primary Conversion Flow",
        "steps": ["HeroBanner.view", "HeroBanner.cta1.click", "ProductDetail.view"]
      }
    ]
  },
  
  "assets": [
    {
      "id": "img1",
      "url": "https://cdn.figma.com/.../hero.png",
      "w": 1200,
      "h": 600,
      "format": "png",
      "hash": "sha256:abc123...",
      "optimized": {
        "webp": "https://cdn.figma.com/.../hero.webp",
        "thumbnail": "https://cdn.figma.com/.../hero-thumb.jpg"
      }
    }
  ],
  
  "snapshots": [
    {
      "type": "low-res | high-res | thumbnail",
      "url": "https://cdn.figma.com/.../frame-low.png",
      "purpose": "visual-grounding | reference | documentation",
      "bounds": { "x": 0, "y": 0, "w": 1440, "h": 720 }
    }
  ],
  
  "inferredIntent": {
    "primaryGoal": "lead_capture | conversion | information | browse | onboarding",
    "priority": "high | medium | low", 
    "conversionPoints": ["cta1", "contact-form"],
    "a11yRiskScore": 0.35,
    "complexityScore": 0.67,
    "implementationRisk": "low | medium | high"
  },
  
  "extractionStats": {
    "nodeCount": 47,
    "componentInstances": 12,
    "tokensUsed": 3420,
    "payloadSizeBytes": 14500,
    "processingTimeMs": 1250,
    "confidenceDistribution": {
      "high": 12,
      "medium": 8,
      "low": 3
    }
  },
  
  "validation": {
    "schemaVersion": "1.0",
    "isValid": true,
    "warnings": [
      "Component 'Hero' missing alt text for image img1",
      "Low contrast ratio detected in secondary text"
    ],
    "suggestions": [
      "Consider using design system component DS.Hero/Default",
      "Add loading state for CTA button"
    ]
  }
}
```

## 🔧 Schema Extensions

### Framework-Specific Extensions

```json
{
  "frameworkHints": {
    "react": {
      "stateManagement": "useState | useReducer | context | zustand | redux",
      "dataFetching": "useEffect | swr | react-query | apollo",
      "styling": "tailwind | styled-components | css-modules | emotion"
    },
    "vue": {
      "composition": "setup | options",
      "stateManagement": "ref | reactive | pinia | vuex"
    },
    "angular": {
      "changeDetection": "onPush | default",
      "stateManagement": "ngrx | akita | services"
    }
  }
}
```

### Design System Integration

```json
{
  "designSystem": {
    "libraryId": "team-design-system-v2",
    "mappings": [
      {
        "figmaComponent": "12:3",
        "dsComponent": "Hero/Default",
        "props": {
          "variant": "large",
          "theme": "primary",
          "hasImage": true
        },
        "confidence": 0.92
      }
    ],
    "gaps": [
      {
        "component": "12:8",
        "reason": "Custom component not in design system",
        "suggestion": "Create new ProductCard variant"
      }
    ]
  }
}
```

### Accessibility Intelligence

```json
{
  "accessibility": {
    "wcagLevel": "AA | AAA",
    "issues": [
      {
        "level": "error | warning | info",
        "rule": "1.4.3",
        "description": "Insufficient color contrast ratio",
        "component": "12:3",
        "suggestion": "Increase text color darkness to #2D3748"
      }
    ],
    "keyboardFlow": [
      { "order": 1, "component": "navigation" },
      { "order": 2, "component": "hero-cta" },
      { "order": 3, "component": "feature-grid" }
    ],
    "screenReaderFlow": [
      { "order": 1, "component": "hero-title", "announcement": "Main heading" },
      { "order": 2, "component": "hero-subtitle", "announcement": "Description" }
    ]
  }
}
```

### Performance Hints

```json
{
  "performance": {
    "bundleSize": {
      "estimated": "45kb",
      "components": [
        { "name": "Hero", "size": "12kb", "treeshakeable": true },
        { "name": "ProductCard", "size": "8kb", "treeshakeable": true }
      ]
    },
    "lazyLoading": [
      { "component": "ProductGrid", "trigger": "viewport" },
      { "component": "Footer", "trigger": "scroll" }
    ],
    "criticalPath": ["Hero", "Navigation"],
    "preloadAssets": ["hero-image.webp"]
  }
}
```

## 📏 Schema Validation Rules

### Required Fields
- `meta.fileKey`, `meta.frameId`, `meta.extractedAt`
- `projectContext.techStack` (minimum 1 item)
- `components` (minimum 1 component)
- `extractionStats.nodeCount`, `extractionStats.confidence`

### Constraints
- `confidence` values: 0.0 to 1.0
- `bounds` values: non-negative numbers
- `tokens` references: must match pattern `tokens.{category}.{name}`
- Color values: valid hex, rgb, or hsl
- URLs: valid HTTP/HTTPS URLs

### Validation Schema (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["meta", "projectContext", "components"],
  "properties": {
    "meta": {
      "type": "object",
      "required": ["fileKey", "frameId", "extractedAt"],
      "properties": {
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },
    "components": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "name", "semanticType", "bounds"],
        "properties": {
          "bounds": {
            "type": "object",
            "properties": {
              "x": { "type": "number", "minimum": 0 },
              "y": { "type": "number", "minimum": 0 },
              "w": { "type": "number", "minimum": 0 },
              "h": { "type": "number", "minimum": 0 }
            }
          }
        }
      }
    }
  }
}
```

## 🎯 Production Considerations

### Size Limits
- **Maximum payload**: 50MB per extraction
- **Component limit**: 100 components per frame
- **Token budget**: Target ≤6-8k tokens for LLM consumption
- **Asset size**: ≤5MB per image, prefer WebP/optimized formats

### Caching Strategy
- **TTL**: 24 hours for active development files
- **Invalidation**: On Figma webhook updates
- **Compression**: gzip enabled for API responses
- **CDN**: Asset URLs should be CDN-optimized

### Error Handling
- **Graceful degradation**: Return partial intelligence on extraction failures
- **Retry logic**: 3 attempts with exponential backoff
- **Fallback data**: Basic component structure if ML inference fails
- **Quality gates**: Minimum confidence thresholds before returning data

This schema provides the production-ready foundation for the Design Intelligence Layer — structured, validated, and optimized for real-world LLM consumption.