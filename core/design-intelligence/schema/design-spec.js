/**
 * 🎯 Design Intelligence Schema v1.0
 *
 * Universal standard for design intelligence data that enables
 * specialized AI models to understand and process design intent.
 *
 * This schema serves as the foundational interchange format between:
 * - Figma data extraction
 * - Multi-AI orchestration
 * - Framework-specific adapters
 */

/**
 * @typedef {Object} DesignSpec
 * @property {DesignSpecMetadata} metadata - Schema metadata and versioning
 * @property {DesignTokens} designTokens - Normalized design tokens from the design system
 * @property {DesignComponent[]} components - Component hierarchy and semantic structure
 * @property {DesignSystemAnalysis} designSystem - Design system compliance and analysis
 * @property {ResponsiveDesignData} responsive - Responsive design and layout constraints
 * @property {AccessibilityData} accessibility - Accessibility and semantic information
 * @property {DesignContext} context - Context and intent analysis
 */

// =============================================================================
// METADATA & VERSIONING
// =============================================================================

/**
 * @typedef {Object} DesignSpecMetadata
 * @property {string} version - Schema version for compatibility and migration
 * @property {string} specId - Unique identifier for this design specification
 * @property {Object} figmaFile - Figma file information
 * @property {string} figmaFile.fileId
 * @property {string} figmaFile.fileName
 * @property {string} figmaFile.pageId
 * @property {string} figmaFile.pageName
 * @property {string[]} figmaFile.nodeIds
 * @property {Object} extraction - Extraction metadata
 * @property {string} extraction.timestamp
 * @property {string} extraction.extractedBy - "figma-mcp" | "figma-api" | etc
 * @property {number} extraction.processingTime
 * @property {number} extraction.confidence - 0-1 confidence in extraction quality
 * @property {Object} context - Processing context
 * @property {boolean} context.userSelection
 * @property {'frame'|'component'|'instance'|'mixed'} context.selectionType
 * @property {number} context.elementCount
 * @property {'simple'|'moderate'|'complex'} context.complexity
 */

// =============================================================================
// DESIGN TOKENS
// =============================================================================

/**
 * @typedef {Object} DesignTokens
 * @property {ColorToken[]} colors
 * @property {TypographyToken[]} typography
 * @property {SpacingToken[]} spacing
 * @property {EffectToken[]} effects
 * @property {BorderToken[]} borders
 * @property {RadiusToken[]} radii
 */

/**
 * @typedef {Object} ColorToken
 * @property {string} id
 * @property {string} name
 * @property {string} value - hex, rgb, hsl
 * @property {Object} rgba
 * @property {number} rgba.r
 * @property {number} rgba.g
 * @property {number} rgba.b
 * @property {number} rgba.a
 * @property {'primary'|'secondary'|'accent'|'neutral'|'semantic'} usage
 * @property {'success'|'warning'|'error'|'info'} [semantic]
 * @property {'global'|'component'|'local'} scope
 * @property {string[]} references - Where this token is used
 */

/**
 * @typedef {Object} TypographyToken
 * @property {string} id
 * @property {string} name
 * @property {string} fontFamily
 * @property {number} fontSize
 * @property {number} fontWeight
 * @property {number} lineHeight
 * @property {number} [letterSpacing]
 * @property {'left'|'center'|'right'|'justify'} [textAlign]
 * @property {'none'|'underline'|'line-through'} [textDecoration]
 * @property {'heading'|'body'|'label'|'caption'|'code'} usage
 * @property {'global'|'component'|'local'} scope
 * @property {string[]} [references]
 */

/**
 * @typedef {Object} SpacingToken
 * @property {string} id
 * @property {string} name
 * @property {number} value - in pixels
 * @property {'padding'|'margin'|'gap'|'inset'} usage
 * @property {'global'|'component'|'local'} scope
 * @property {string[]} [references]
 */

/**
 * @typedef {Object} EffectToken
 * @property {string} id
 * @property {string} name
 * @property {'drop-shadow'|'inner-shadow'|'blur'|'background-blur'} type
 * @property {Object} [shadow]
 * @property {number} shadow.x
 * @property {number} shadow.y
 * @property {number} shadow.blur
 * @property {number} shadow.spread
 * @property {string} shadow.color
 * @property {Object} [blur]
 * @property {number} blur.radius
 * @property {'global'|'component'|'local'} scope
 * @property {string[]} [references]
 */

/**
 * @typedef {Object} BorderToken
 * @property {string} id
 * @property {string} name
 * @property {number} width
 * @property {'solid'|'dashed'|'dotted'} style
 * @property {string} color
 * @property {'global'|'component'|'local'} scope
 * @property {string[]} [references]
 */

/**
 * @typedef {Object} RadiusToken
 * @property {string} id
 * @property {string} name
 * @property {number|Object} value
 * @property {number} [value.topLeft]
 * @property {number} [value.topRight]
 * @property {number} [value.bottomLeft]
 * @property {number} [value.bottomRight]
 * @property {'button'|'card'|'input'|'modal'|'general'} usage
 * @property {'global'|'component'|'local'} scope
 * @property {string[]} [references]
 */

// =============================================================================
// DESIGN COMPONENTS
// =============================================================================

/**
 * Component types from Figma
 * @typedef {'frame'|'group'|'component'|'instance'|'text'|'rectangle'|'ellipse'|'polygon'|'star'|'vector'|'image'|'slice'} ComponentType
 */

/**
 * Component categories for organization
 * @typedef {'layout'|'navigation'|'form'|'display'|'feedback'|'overlay'|'media'|'typography'|'interactive'|'decorative'} ComponentCategory
 */

/**
 * Semantic intent detection
 * @typedef {'button'|'input'|'card'|'modal'|'navigation'|'header'|'footer'|'sidebar'|'content'|'hero'|'form'|'list'|'grid'|'table'|'chart'|'avatar'|'badge'|'tooltip'|'accordion'|'tabs'|'carousel'|'dropdown'|'unknown'} ComponentIntent
 */

/**
 * Common design patterns
 * @typedef {'container'|'flexbox'|'grid'|'stack'|'cluster'|'sidebar'|'switcher'|'cover'|'pancake'|'holy-grail'|'card-layout'|'list-detail'|'modal-overlay'|'custom'} DesignPattern
 */

/**
 * Accessibility roles
 * @typedef {'button'|'link'|'textbox'|'combobox'|'listbox'|'menu'|'menuitem'|'tab'|'tabpanel'|'dialog'|'alert'|'status'|'region'|'navigation'|'main'|'complementary'|'banner'|'contentinfo'|'article'|'section'|'heading'|'list'|'listitem'|'none'} AccessibilityRole
 */

/**
 * @typedef {Object} DesignComponent
 * @property {string} id - Unique component identifier
 * @property {string} name - Component name from Figma
 * @property {ComponentType} type - Figma node type
 * @property {ComponentCategory} category - Functional category
 * @property {ComponentIntent} intent - Semantic intent detection
 * @property {Object} geometry - Position and dimensions
 * @property {number} geometry.x
 * @property {number} geometry.y
 * @property {number} geometry.width
 * @property {number} geometry.height
 * @property {Object} semantic - Semantic analysis
 * @property {DesignPattern} semantic.pattern - Detected design pattern
 * @property {AccessibilityRole} semantic.role - ARIA role suggestion
 * @property {number} semantic.confidence - 0-1 confidence in semantic analysis
 * @property {string[]} semantic.keywords - Extracted semantic keywords
 * @property {Object} visual - Visual properties
 * @property {Fill[]} visual.fills - Background fills
 * @property {Stroke[]} visual.strokes - Border strokes
 * @property {Effect[]} visual.effects - Visual effects
 * @property {number} [visual.cornerRadius] - Border radius
 * @property {Object} [content] - Content analysis
 * @property {TextContent} [content.text] - Text content if applicable
 * @property {ImageContent} [content.image] - Image content if applicable
 * @property {IconContent} [content.icon] - Icon content if applicable
 * @property {Object} framework - Framework-specific data
 * @property {string} framework.suggestedTag - HTML tag suggestion
 * @property {Object} framework.attributes - Suggested attributes
 * @property {string[]} framework.possibleEvents - Potential event handlers
 * @property {Object} framework.states - Component state possibilities
 * @property {boolean} framework.states.hover
 * @property {boolean} framework.states.focus
 * @property {boolean} framework.states.active
 * @property {boolean} framework.states.disabled
 * @property {boolean} framework.states.selected
 * @property {string[]} children - Child component IDs
 * @property {string} [parent] - Parent component ID
 * @property {ComponentVariant[]} [variants] - Component variants if applicable
 * @property {LayoutConstraints} [constraints] - Layout constraints
 */

// Schema version constant
const DESIGN_SPEC_VERSION = '1.0.0';

module.exports = {
  DESIGN_SPEC_VERSION
};