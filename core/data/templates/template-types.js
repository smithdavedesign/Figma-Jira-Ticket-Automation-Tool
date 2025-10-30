/**
 * Template System Type Definitions
 *
 * Defines interfaces for the parameterized template system that supports
 * multiple document types, organization standards, and variable substitution.
 *
 * Note: This JavaScript file defines JSDoc type comments for template system interfaces.
 * In a TypeScript environment, these would be proper interfaces.
 */

/**
 * @typedef {Object} TemplateConfig
 * @property {string} template_id
 * @property {string} version
 * @property {string} organization
 * @property {DocumentPlatform} platform
 * @property {string} [description]
 * @property {TemplateVariables} variables
 * @property {TeamStandards} team_standards
 * @property {OutputFormat} output_format
 * @property {TemplateCustomization} customization
 * @property {ValidationRules} [validation]
 */

/**
 * @typedef {'jira'|'confluence'|'wiki'|'figma'|'github'|'linear'|'notion'|'azure-devops'|'trello'|'asana'} DocumentPlatform
 */

/**
 * @typedef {'component'|'feature'|'bug'|'epic'|'documentation'|'api-spec'|'design-handoff'|'pr-template'|'issue-template'} DocumentType
 */

/**
 * @typedef {Object} TemplateVariables
 * @property {string} component_name
 * @property {string[]} technologies
 * @property {string} design_ref
 * @property {ComplexityLevel} complexity_level
 * @property {number} [estimated_hours]
 * @property {Priority} [priority]
 * @property {string} [assignee]
 * @property {string} [due_date]
 * @property {string} [sprint]
 * @property {string[]} [labels]
 */

/**
 * @typedef {Object} TeamStandards
 * @property {TestingFramework} testing_framework
 * @property {AccessibilityLevel} accessibility_level
 * @property {DocumentationFormat} documentation_format
 * @property {CodeStyle} code_style
 * @property {ReviewProcess} review_process
 * @property {DeploymentProcess} [deployment_process]
 */

/**
 * @typedef {Object} OutputFormat
 * @property {string} ticket_type
 * @property {TemplateSectionType[]} sections
 * @property {FormattingOptions} formatting
 * @property {boolean} ai_context_markers
 * @property {boolean} include_metadata
 */

/**
 * @typedef {Object} TemplateCustomization
 * @property {boolean} include_ai_context_markers
 * @property {boolean} generate_test_files
 * @property {boolean} create_storybook_stories
 * @property {boolean} add_accessibility_checklist
 * @property {boolean} include_performance_metrics
 * @property {boolean} enable_automated_testing
 * @property {boolean} include_design_tokens
 * @property {boolean} add_similar_components
 * @property {boolean} include_risk_assessment
 */

/**
 * @typedef {'title'|'summary'|'requirements'|'design_context'|'acceptance_criteria'|'technical_implementation'|'testing_strategy'|'design_system_integration'|'complexity_analysis'|'subtasks'|'ai_assistant_integration'|'related_work'|'dependencies'|'risk_factors'|'timeline'|'resources'} TemplateSectionType
 */

/**
 * @typedef {'simple'|'medium'|'complex'} ComplexityLevel
 */

/**
 * @typedef {'low'|'medium'|'high'|'critical'} Priority
 */

/**
 * @typedef {'jest-rtl'|'cypress'|'playwright'|'vitest'|'mocha-chai'|'jasmine'|'karma'} TestingFramework
 */

/**
 * @typedef {'basic'|'wcag-aa'|'wcag-aaa'|'enterprise'|'government'} AccessibilityLevel
 */

/**
 * @typedef {'markdown'|'confluence'|'notion'|'jsdoc'|'storybook'|'gitbook'} DocumentationFormat
 */

/**
 * @typedef {'airbnb'|'standard'|'prettier'|'google'|'custom'} CodeStyle
 */

/**
 * @typedef {'standard'|'design-review'|'security-review'|'accessibility-review'|'performance-review'} ReviewProcess
 */

/**
 * @typedef {'ci-cd'|'manual'|'automated'|'staged'|'blue-green'} DeploymentProcess
 */

/**
 * @typedef {Object} FormattingOptions
 * @property {boolean} use_emojis
 * @property {boolean} include_diagrams
 * @property {boolean} code_highlighting
 * @property {boolean} table_formatting
 * @property {boolean} link_formatting
 */

/**
 * @typedef {Object} ValidationRules
 * @property {string[]} required_variables
 * @property {Record<string, RegExp>} variable_patterns
 * @property {Record<TemplateSectionType, boolean>} section_requirements
 * @property {number} max_complexity_hours
 * @property {number} min_acceptance_criteria
 */

/**
 * @typedef {Object} TemplateContext
 * @property {FigmaContext} figma
 * @property {ProjectContext} project
 * @property {CalculatedContext} calculated
 * @property {OrganizationContext} org
 * @property {TeamContext} team
 * @property {UserContext} user
 */

/**
 * @typedef {Object} FigmaContext
 * @property {string} component_name
 * @property {string} frame_id
 * @property {string} file_id
 * @property {string} file_name
 * @property {string} [url]
 * @property {string} [live_link]
 * @property {string} [component_variant]
 * @property {{width: number, height: number}} dimensions
 * @property {string} [screenshot]
 * @property {string} [screenshot_filename]
 * @property {DesignTokens} [design_tokens]
 * @property {string[]} [dependencies]
 * @property {string} [last_modified]
 * @property {string} [version]
 * @property {Array<{type: string, name: string, count: number}>} [semantic_elements]
 * @property {Array<{name: string, id: string, variant_properties?: Record<string, any>}>} [component_instances]
 * @property {string[]} [text_content]
 * @property {number} [hierarchy_depth]
 * @property {number} [layer_count]
 */

/**
 * @typedef {Object} ProjectContext
 * @property {string} name
 * @property {string[]} tech_stack
 * @property {string} repository
 * @property {string} branch
 * @property {'development'|'staging'|'production'} environment
 * @property {string} [deadline]
 * @property {string} [budget]
 */

/**
 * @typedef {Object} CalculatedContext
 * @property {ComplexityLevel} complexity
 * @property {number} hours
 * @property {number} confidence
 * @property {string[]} similar_components
 * @property {string[]} risk_factors
 * @property {string[]} dependencies
 */

/**
 * @typedef {Object} OrganizationContext
 * @property {string} name
 * @property {TestingFramework} testing_stack
 * @property {AccessibilityLevel} accessibility_standard
 * @property {DocumentationFormat} docs_format
 * @property {DocumentPlatform} project_management_tool
 * @property {CodeStyle} code_style_guide
 */

/**
 * @typedef {Object} TeamContext
 * @property {string} name
 * @property {string} workflow
 * @property {string[]} tools
 * @property {string} [meeting_schedule]
 * @property {string[]} [communication_channels]
 */

/**
 * @typedef {Object} UserContext
 * @property {string} name
 * @property {string} role
 * @property {Record<string, any>} preferences
 * @property {string} [timezone]
 */

/**
 * @typedef {Object} DesignTokens
 * @property {Record<string, string>} colors
 * @property {Record<string, any>} typography
 * @property {Record<string, string>} spacing
 * @property {Record<string, string>} borders
 * @property {Record<string, string>} shadows
 */

/**
 * @typedef {Object} TemplateEngine
 * @property {function(DocumentPlatform, DocumentType): Promise<TemplateConfig>} loadTemplate
 * @property {function(TemplateConfig, TemplateContext): Promise<string>} renderTemplate
 * @property {function(TemplateConfig): ValidationResult} validateTemplate
 * @property {function(): Promise<TemplateInfo[]>} listAvailableTemplates
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {string[]} errors
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} TemplateInfo
 * @property {string} template_id
 * @property {DocumentPlatform} platform
 * @property {DocumentType} type
 * @property {string} version
 * @property {string} description
 * @property {string[]} variables
 */

export {}; // Make this a module