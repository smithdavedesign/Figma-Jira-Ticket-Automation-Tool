import type { TemplateConfig, TemplateContext, TemplateEngine, DocumentPlatform, DocumentType, TemplateInfo, ValidationResult } from './template-types.js';
export declare class AdvancedTemplateEngine implements TemplateEngine {
    private templateCache;
    private templatesDir;
    constructor(templatesDir?: string);
    loadTemplate(platform: DocumentPlatform, type: DocumentType): Promise<TemplateConfig>;
    renderTemplate(template: TemplateConfig, context: TemplateContext): Promise<string>;
    private renderSection;
    private substituteVariables;
    private processConditionals;
    private processLoops;
    private evaluateCondition;
    private getNestedProperty;
    private isTruthy;
    private renderTitle;
    private renderSummary;
    private renderRequirements;
    private renderAcceptanceCriteria;
    private renderTestingStrategy;
    private renderAIAssistantIntegration;
    private renderDesignContext;
    private renderTechnicalImplementation;
    private renderComplexityAnalysis;
    private renderSubtasks;
    private getEmojiForDocumentType;
    private getTypePrefix;
    private getTestingFrameworkName;
    validateTemplate(template: TemplateConfig): ValidationResult;
    private getDefaultTemplate;
    listAvailableTemplates(): Promise<TemplateInfo[]>;
}
export declare const templateEngine: AdvancedTemplateEngine;
//# sourceMappingURL=template-config.d.ts.map