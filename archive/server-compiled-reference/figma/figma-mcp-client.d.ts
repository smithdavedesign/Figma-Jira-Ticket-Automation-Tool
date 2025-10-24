export interface FigmaMCPRequest {
    method: string;
    params: {
        [key: string]: any;
    };
}
export interface FigmaMCPResponse {
    content: Array<{
        type: string;
        text?: string;
        data?: any;
    }>;
    isError?: boolean;
    error?: string;
}
export interface FigmaMCPConfig {
    serverUrl: string;
    timeout: number;
    retries: number;
}
export declare class FigmaMCPClient {
    private config;
    private isAvailable;
    constructor(config?: Partial<FigmaMCPConfig>);
    checkAvailability(): Promise<boolean>;
    private tryLocalServer;
    callTool(toolName: string, params: any): Promise<FigmaMCPResponse>;
    getCode(frameUrl: string, options?: {
        framework?: string;
        styling?: string;
        components?: string;
    }): Promise<FigmaMCPResponse>;
    getVariables(frameUrl: string): Promise<FigmaMCPResponse>;
    getCodeConnectMap(frameUrl: string): Promise<FigmaMCPResponse>;
    getScreenshot(frameUrl: string): Promise<FigmaMCPResponse>;
    getMetadata(frameUrl: string): Promise<FigmaMCPResponse>;
    createDesignSystemRules(frameUrl: string, projectContext?: any): Promise<FigmaMCPResponse>;
    private formatError;
    getConfig(): FigmaMCPConfig;
    isServerAvailable(): boolean;
}
export declare class FigmaWorkflowOrchestrator {
    private figmaMCP;
    constructor(figmaMCPClient?: FigmaMCPClient);
    executeCompleteWorkflow(params: {
        figmaUrl: string;
        projectContext?: any;
        requirements?: any;
    }): Promise<{
        strategicAnalysis: any;
        tacticalCode: FigmaMCPResponse;
        enhancedTickets: any;
        designSystemRules?: FigmaMCPResponse;
    }>;
    generateEnhancedTicket(frameUrl: string, template: string, instructions?: string): Promise<any>;
}
export declare const figmaMCPClient: FigmaMCPClient;
export declare const workflowOrchestrator: FigmaWorkflowOrchestrator;
//# sourceMappingURL=figma-mcp-client.d.ts.map