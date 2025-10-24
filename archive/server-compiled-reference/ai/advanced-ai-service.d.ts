#!/usr/bin/env node
export interface AIAnalysisConfig {
    openaiApiKey?: string | undefined;
    anthropicApiKey?: string | undefined;
    geminiApiKey?: string | undefined;
    enableVision: boolean;
    enableClaude: boolean;
    enableGemini: boolean;
    maxTokens: number;
    temperature: number;
}
export interface DesignAnalysisResult {
    components: ComponentAnalysis[];
    designSystem: DesignSystemAnalysis;
    accessibility: AccessibilityAnalysis;
    recommendations: string[];
    confidence: number;
}
export interface ComponentAnalysis {
    name: string;
    type: 'button' | 'input' | 'card' | 'modal' | 'navigation' | 'other';
    properties: Record<string, any>;
    variants: string[];
    usage: 'primary' | 'secondary' | 'tertiary';
    confidence: number;
}
export interface DesignSystemAnalysis {
    colors: ColorAnalysis;
    typography: TypographyAnalysis;
    spacing: SpacingAnalysis;
    consistency: number;
}
export interface ColorAnalysis {
    palette: {
        color: string;
        usage: string;
        count: number;
    }[];
    compliance: number;
    issues: string[];
}
export interface TypographyAnalysis {
    fonts: {
        family: string;
        weights: string[];
        sizes: string[];
    }[];
    hierarchy: string[];
    compliance: number;
}
export interface SpacingAnalysis {
    grid: string;
    margins: string[];
    padding: string[];
    compliance: number;
}
export interface AccessibilityAnalysis {
    colorContrast: {
        passed: boolean;
        issues: string[];
    };
    focusStates: {
        present: boolean;
        issues: string[];
    };
    semanticStructure: {
        score: number;
        issues: string[];
    };
    overallScore: number;
}
export declare class AdvancedAIService {
    private config;
    private promptTemplates;
    constructor(config: AIAnalysisConfig);
    analyzeDesignScreenshot(imageBuffer: Buffer, documentType?: string, context?: {
        techStack?: string;
        projectName?: string;
    }): Promise<DesignAnalysisResult>;
    generateDocumentContent(analysisResult: DesignAnalysisResult, documentType: string, context?: {
        techStack?: string;
        projectName?: string;
        additionalRequirements?: string;
    }): Promise<string>;
    private generateWithGemini;
    private generateWithClaude;
    private generateWithGPT4;
    private loadPromptTemplates;
    private getPromptTemplate;
    private enhancePromptWithAnalysis;
    private parseAnalysisResponse;
    private createFallbackAnalysis;
    testConfiguration(): Promise<{
        gemini: boolean;
        geminiVision: boolean;
        vision: boolean;
        claude: boolean;
        gpt4: boolean;
    }>;
}
export default AdvancedAIService;
//# sourceMappingURL=advanced-ai-service.d.ts.map