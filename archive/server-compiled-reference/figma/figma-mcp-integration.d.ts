export interface FigmaMCPPromptConfig {
    framework: string;
    stylingSystem: string;
    codebaseConventions: string;
    filePath?: string;
    componentLibrary?: string;
    layoutSystem?: string;
}
export interface FigmaMCPResponse {
    success: boolean;
    code?: string;
    metadata?: any;
    assets?: string[];
    designTokens?: any;
    errors?: string[];
    optimizationSuggestions?: string[];
}
export declare class EnhancedFigmaMCPService {
    private client;
    generateCodeWithBestPractices(figmaUrl: string, config: FigmaMCPPromptConfig, context?: any): Promise<FigmaMCPResponse>;
    private transformCodeToProjectConventions;
    generateEffectivePrompt(intent: string, config: FigmaMCPPromptConfig, context?: any): string;
    private addCustomRules;
    isOptimalFrameSize(context: any): {
        isOptimal: boolean;
        suggestions: string[];
    };
    private replaceTailwindWithDesignSystem;
    private applyFilePathConventions;
    private replaceWithExistingComponents;
    private applyLayoutSystem;
    private enforceDesignTokenUsage;
    private extractAssetUrls;
    private generateOptimizationSuggestions;
}
export declare const enhancedFigmaMCPService: EnhancedFigmaMCPService;
//# sourceMappingURL=figma-mcp-integration.d.ts.map