#!/usr/bin/env node
export interface VisualEnhancedContext {
    screenshot: {
        base64: string;
        format: string;
        resolution: {
            width: number;
            height: number;
        };
        size: number;
        quality: string;
    } | null;
    visualDesignContext: {
        colorPalette: Array<{
            hex: string;
            rgb: {
                r: number;
                g: number;
                b: number;
            };
            usage: string[];
            count: number;
        }>;
        typography: {
            fonts: string[];
            sizes: number[];
            weights: string[];
            hierarchy: string[];
        };
        spacing: {
            measurements: number[];
            patterns: string[];
            grid: any;
        };
        layout: {
            structure: string | null;
            alignment: string | null;
            distribution: string | null;
        };
        designPatterns: string[];
        visualHierarchy: string[];
    };
    hierarchicalData: {
        frames: any[];
        components: any[];
        designSystemLinks: any;
        metadata: any;
    };
    figmaContext: {
        fileKey: string;
        fileName: string;
        pageName: string;
        selection: any;
    };
}
export interface EnhancedAIResponse {
    analysis: {
        visualUnderstanding: string;
        componentAnalysis: string;
        designSystemCompliance: string;
        recommendationSummary: string;
    };
    ticket: string;
    confidence: number;
    processingMetrics: {
        screenshotProcessed: boolean;
        dataStructuresAnalyzed: number;
        promptTokens: number;
        responseTokens: number;
    };
}
export declare class VisualEnhancedAIService {
    private geminiClient;
    private model;
    constructor(apiKey?: string);
    processVisualEnhancedContext(context: VisualEnhancedContext, options?: {
        documentType?: string;
        techStack?: string;
        instructions?: string;
    }): Promise<EnhancedAIResponse>;
    private buildEnhancedPrompt;
    private parseAIResponse;
    private extractSection;
    private calculateConfidence;
    private countDataStructures;
    testConfiguration(): Promise<{
        available: boolean;
        model: string;
        capabilities: string[];
    }>;
}
export default VisualEnhancedAIService;
//# sourceMappingURL=visual-enhanced-ai-service.d.ts.map