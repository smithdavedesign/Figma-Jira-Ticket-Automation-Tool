export interface ParsedTechStack {
    frontend: FrontendConfig;
    backend?: BackendConfig;
    mobile?: MobileConfig;
    testing?: TestingConfig;
    deployment?: DeploymentConfig;
    componentLibrary?: ComponentLibrary;
    confidence: number;
    suggestions: string[];
}
interface FrontendConfig {
    framework: string;
    styling: string;
    stateManagement?: string;
    bundler?: string;
    features?: string[];
}
interface BackendConfig {
    language: string;
    framework?: string;
    database?: string;
    features?: string[];
}
interface MobileConfig {
    platform: string;
    framework?: string;
    features?: string[];
}
interface TestingConfig {
    unit?: string;
    integration?: string;
    e2e?: string;
    features?: string[];
}
interface DeploymentConfig {
    platform: string;
    features?: string[];
}
interface ComponentLibrary {
    name: string;
    framework: string;
}
export declare class TechStackParser {
    private readonly frameworkPatterns;
    private readonly stylingPatterns;
    private readonly statePatterns;
    private readonly backendPatterns;
    private readonly mobilePatterns;
    private readonly deploymentPatterns;
    parse(description: string): ParsedTechStack;
    private detectFrontend;
    private detectStyling;
    private detectStateManagement;
    private detectBackend;
    private detectMobile;
    private detectDeployment;
    private detectComponentLibrary;
    private getDefaultStyling;
    private getDefaultState;
    private getDefaultBackendFramework;
    private calculateConfidence;
    private generateSuggestions;
}
export {};
//# sourceMappingURL=tech-stack-parser.d.ts.map