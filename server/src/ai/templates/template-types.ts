/**
 * Template System Type Definitions
 * 
 * Defines interfaces for the parameterized template system that supports
 * multiple document types, organization standards, and variable substitution.
 */

export interface TemplateConfig {
  template_id: string;
  version: string;
  organization: string;
  platform: DocumentPlatform;
  description?: string;
  variables: TemplateVariables;
  team_standards: TeamStandards;
  output_format: OutputFormat;
  customization: TemplateCustomization;
  validation?: ValidationRules;
}

export type DocumentPlatform = 
  | 'jira' 
  | 'confluence' 
  | 'wiki' 
  | 'figma' 
  | 'github' 
  | 'linear' 
  | 'notion'
  | 'azure-devops'
  | 'trello'
  | 'asana';

export type DocumentType = 
  | 'component' 
  | 'feature' 
  | 'bug' 
  | 'epic' 
  | 'documentation'
  | 'api-spec'
  | 'design-handoff'
  | 'pr-template'
  | 'issue-template';

export interface TemplateVariables {
  component_name: string;
  technologies: string[];
  design_ref: string;
  complexity_level: ComplexityLevel;
  estimated_hours?: number;
  priority?: Priority;
  assignee?: string;
  due_date?: string;
  sprint?: string;
  labels?: string[];
  [key: string]: any; // Allow additional variables
}

export interface TeamStandards {
  testing_framework: TestingFramework;
  accessibility_level: AccessibilityLevel;
  documentation_format: DocumentationFormat;
  code_style: CodeStyle;
  review_process: ReviewProcess;
  deployment_process?: DeploymentProcess;
}

export interface OutputFormat {
  ticket_type: string;
  sections: TemplateSectionType[];
  formatting: FormattingOptions;
  ai_context_markers: boolean;
  include_metadata: boolean;
}

export interface TemplateCustomization {
  include_ai_context_markers: boolean;
  generate_test_files: boolean;
  create_storybook_stories: boolean;
  add_accessibility_checklist: boolean;
  include_performance_metrics: boolean;
  enable_automated_testing: boolean;
  include_design_tokens: boolean;
  add_similar_components: boolean;
  include_risk_assessment: boolean;
}

export type TemplateSectionType = 
  | 'title'
  | 'summary'
  | 'requirements' 
  | 'design_context'
  | 'acceptance_criteria' 
  | 'technical_implementation'
  | 'testing_strategy'
  | 'design_system_integration'
  | 'complexity_analysis'
  | 'subtasks'
  | 'ai_assistant_integration'
  | 'related_work'
  | 'dependencies'
  | 'risk_factors'
  | 'timeline'
  | 'resources';

export type ComplexityLevel = 'simple' | 'medium' | 'complex';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TestingFramework = 
  | 'jest-rtl' 
  | 'cypress' 
  | 'playwright' 
  | 'vitest' 
  | 'mocha-chai'
  | 'jasmine'
  | 'karma';

export type AccessibilityLevel = 
  | 'basic' 
  | 'wcag-aa' 
  | 'wcag-aaa' 
  | 'enterprise'
  | 'government';

export type DocumentationFormat = 
  | 'markdown' 
  | 'confluence' 
  | 'notion' 
  | 'jsdoc'
  | 'storybook'
  | 'gitbook';

export type CodeStyle = 
  | 'airbnb' 
  | 'standard' 
  | 'prettier' 
  | 'google'
  | 'custom';

export type ReviewProcess = 
  | 'standard' 
  | 'design-review' 
  | 'security-review' 
  | 'accessibility-review'
  | 'performance-review';

export type DeploymentProcess = 
  | 'ci-cd' 
  | 'manual' 
  | 'automated' 
  | 'staged'
  | 'blue-green';

export interface FormattingOptions {
  use_emojis: boolean;
  include_diagrams: boolean;
  code_highlighting: boolean;
  table_formatting: boolean;
  link_formatting: boolean;
}

export interface ValidationRules {
  required_variables: string[];
  variable_patterns: Record<string, RegExp>;
  section_requirements: Record<TemplateSectionType, boolean>;
  max_complexity_hours: number;
  min_acceptance_criteria: number;
}

export interface TemplateContext {
  figma: FigmaContext;
  project: ProjectContext;
  calculated: CalculatedContext;
  org: OrganizationContext;
  team: TeamContext;
  user: UserContext;
}

export interface FigmaContext {
  component_name: string;
  frame_id: string;
  file_id: string;
  file_name: string;
  url?: string;
  live_link?: string;
  component_variant?: string;
  dimensions: { width: number; height: number };
  screenshot?: string;
  design_tokens?: DesignTokens;
  dependencies?: string[];
  last_modified?: string;
  version?: string;
  // Enhanced context from detailed frame analysis
  semantic_elements?: Array<{
    type: string;
    name: string;
    count: number;
  }>;
  component_instances?: Array<{
    name: string;
    id: string;
    variant_properties?: Record<string, any>;
  }>;
  text_content?: string[];
  hierarchy_depth?: number;
  layer_count?: number;
}

export interface ProjectContext {
  name: string;
  tech_stack: string[];
  repository: string;
  branch: string;
  environment: 'development' | 'staging' | 'production';
  deadline?: string;
  budget?: string;
}

export interface CalculatedContext {
  complexity: ComplexityLevel;
  hours: number;
  confidence: number;
  similar_components: string[];
  risk_factors: string[];
  dependencies: string[];
}

export interface OrganizationContext {
  name: string;
  testing_stack: TestingFramework;
  accessibility_standard: AccessibilityLevel;
  docs_format: DocumentationFormat;
  project_management_tool: DocumentPlatform;
  code_style_guide: CodeStyle;
}

export interface TeamContext {
  name: string;
  workflow: string;
  tools: string[];
  meeting_schedule?: string;
  communication_channels?: string[];
}

export interface UserContext {
  name: string;
  role: string;
  preferences: Record<string, any>;
  timezone?: string;
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, any>;
  spacing: Record<string, string>;
  borders: Record<string, string>;
  shadows: Record<string, string>;
}

export interface TemplateEngine {
  loadTemplate(platform: DocumentPlatform, type: DocumentType): Promise<TemplateConfig>;
  renderTemplate(template: TemplateConfig, context: TemplateContext): Promise<string>;
  validateTemplate(template: TemplateConfig): ValidationResult;
  listAvailableTemplates(): Promise<TemplateInfo[]>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateInfo {
  template_id: string;
  platform: DocumentPlatform;
  type: DocumentType;
  version: string;
  description: string;
  variables: string[];
}