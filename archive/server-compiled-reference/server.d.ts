#!/usr/bin/env node
import type { CodeGenerationOptions } from './figma/boilerplate-generator.js';
declare class FigmaAITestServer {
    private projectAnalyzer;
    private ticketGenerator;
    private complianceChecker;
    private aiEnhancedGenerator;
    private designHealthAnalyzer;
    private port;
    constructor(port?: number);
    private initializeDesignHealthAnalyzer;
    handleRequest(method: string, body: any): Promise<any>;
    generateEnhancedTicketWithBoilerplate(params: {
        techStack?: string;
        documentType?: string;
        confidence?: number;
        detectedTech?: any;
        designContext?: any;
        figmaContext?: {
            fileKey?: string;
            fileName?: string;
            selection?: Array<{
                id: string;
                name: string;
                type: string;
                textContent?: Array<{
                    content: string;
                    style: string;
                }>;
                colors?: string[];
                dimensions?: {
                    width: number;
                    height: number;
                };
                nodeCount?: number;
                pageName?: string;
                hasPrototype?: boolean;
                components?: any[];
                designSystemContext?: any;
            }>;
            hasSelection: boolean;
        };
        figmaUrl?: string;
        projectContext?: string;
        options?: CodeGenerationOptions;
    }): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
        ticket: string;
        boilerplateCode: {
            component: string;
            styles: string;
            tests?: string;
            story?: string;
            types?: string;
        };
        isFallback?: boolean;
        fallbackReason?: string;
    }>;
    private generateContextAwareTicket;
    private generateContextAwareBoilerplate;
    private generateComponentCode;
    private generateStylesCode;
    private generateTestsCode;
    private generateStoryCode;
    private generateTypesCode;
    private adjustColor;
    private generateFallbackBoilerplate;
    generateTicketWithProperLayerSeparation(params: {
        figmaUrl: string;
        prompt: string;
        documentType: string;
        context?: any;
    }): Promise<{
        success: boolean;
        error: string;
        ticket: string;
        metadata: any;
        dataLayer?: undefined;
        reasoningLayer?: undefined;
        architecture?: undefined;
    } | {
        success: boolean;
        ticket: string;
        dataLayer: import("./ai/figma-mcp-gemini-orchestrator.js").FigmaDataLayer;
        reasoningLayer: import("./ai/figma-mcp-gemini-orchestrator.js").GeminiReasoningLayer;
        metadata: any;
        architecture: {
            dataSource: string;
            reasoningEngine: string;
            orchestration: string;
        };
        error?: undefined;
    }>;
    generateTicketWithFigmaMCP(params: {
        figmaUrl: string;
        prompt: string;
        framework?: string;
        stylingSystem?: string;
        context?: any;
    }): Promise<any>;
    private generateCodebaseConventions;
    private suggestFilePath;
    private generateMCPEnhancedTicket;
    private generateFallbackTicket;
    private generateErrorTicket;
    generateVisualEnhancedTicket(params: {
        figmaContext?: {
            selection?: any[];
            fileKey?: string;
            fileName?: string;
            pageName?: string;
        };
        visualContext?: {
            screenshot?: {
                base64: string;
                format: string;
                resolution: {
                    width: number;
                    height: number;
                };
                size: number;
            };
            visualDesignContext?: any;
        };
        hierarchicalData?: any;
        options?: {
            documentType?: string;
            techStack?: string;
            instructions?: string;
        };
    }): Promise<any>;
    private generateVisualContextTicket;
    analyzeDesignHealth(params: {
        figmaUrl?: string;
        fileKey?: string;
        analysisDepth?: 'basic' | 'standard' | 'comprehensive';
        categories?: string[];
    }): Promise<any>;
    private formatDesignHealthReport;
    private getHealthEmoji;
    private getHealthGrade;
    private formatTable;
    private countVisualDataPoints;
    private calculateVisualConfidence;
    private screenshotCache;
    private readonly CACHE_DURATION;
    private handleScreenshotRequest;
    start(): void;
}
export { FigmaAITestServer };
//# sourceMappingURL=server.d.ts.map