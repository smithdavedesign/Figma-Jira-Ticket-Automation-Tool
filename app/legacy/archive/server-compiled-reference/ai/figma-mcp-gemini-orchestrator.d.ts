export interface FigmaDataLayer {
    structuredData: any;
    designTokens: any;
    assets: string[];
    metadata: any;
    screenshot: string;
    codeStructure: string;
}
export interface GeminiReasoningLayer {
    analysisResult: string;
    generatedContent: string;
    recommendations: string[];
    technicalSpecs: any;
}
declare class FigmaMCPGeminiOrchestrator {
    private geminiClient;
    constructor(geminiApiKey: string);
    generateTicketWithProperSeparation(params: {
        figmaUrl: string;
        prompt: string;
        documentType: string;
        context?: any;
    }): Promise<{
        success: boolean;
        ticket: string;
        dataLayer: FigmaDataLayer;
        reasoningLayer: GeminiReasoningLayer;
        metadata: any;
    }>;
    private extractFigmaData;
    private processWithGeminiReasoning;
    private buildGeminiReasoningPrompt;
    private parseGeminiReasoning;
    private extractSection;
    private orchestrateFinalOutput;
    private extractComponentName;
    private extractAssetUrls;
    private generateErrorTicket;
}
export { FigmaMCPGeminiOrchestrator };
//# sourceMappingURL=figma-mcp-gemini-orchestrator.d.ts.map