import type { DocumentPlatform, DocumentType } from './templates/template-types.js';
export interface TicketGenerationOptions {
    platform?: DocumentPlatform;
    documentType?: DocumentType;
    organizationId?: string;
    projectName?: string;
    teamStandards?: {
        testing_framework?: string;
        accessibility_level?: string;
        code_style?: string;
    };
    useTemplates?: boolean;
}
export interface FigmaFrameData {
    id: string;
    name: string;
    components?: any[];
    hasPrototype?: boolean;
    nodeCount?: number;
    dimensions?: {
        width: number;
        height: number;
    };
    dependencies?: string[];
    screenshot?: string;
    screenshotFileName?: string;
}
export interface ProjectContext {
    name: string;
    tech_stack: string[];
    design_system?: string;
    repository_url?: string;
}
export declare class TemplateIntegrationService {
    generateParameterizedTicket(frameData: FigmaFrameData, figmaContext: any, options?: TicketGenerationOptions): Promise<string>;
    private buildTemplateContext;
    private calculateComplexity;
    private estimateHours;
    private calculateConfidence;
    private findSimilarComponents;
    private identifyRiskFactors;
    private inferTechStack;
    private getOrganizationName;
    private extractFileId;
    private generateLegacyTicket;
    private getPlatformIcon;
    private extractDesignTokens;
    private convertArrayToTokenMap;
    generateMultipleTickets(frameDataArray: FigmaFrameData[], figmaContext: any, options?: TicketGenerationOptions): Promise<string[]>;
    getAvailableTemplates(): Promise<import("./templates/template-types.js").TemplateInfo[]>;
    private selectTemplateType;
    private detectPlatformFromTechStack;
}
export declare const templateIntegration: TemplateIntegrationService;
//# sourceMappingURL=template-integration.d.ts.map