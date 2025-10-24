export interface DesignTokens {
    colors?: Record<string, string>;
    typography?: Record<string, any>;
    spacing?: Record<string, string>;
    shadows?: Record<string, string>;
    borderRadius?: Record<string, string>;
}
export interface ComponentPattern {
    type: string;
    properties: Record<string, any>;
    figmaProperties?: Record<string, any>;
}
export interface ComplianceResult {
    isCompliant: boolean;
    confidence: number;
    designSystem: string;
    issues: string[];
    suggestions: string[];
    score: number;
}
export interface TechStackCompatibility {
    compatible: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
    recommendedLibraries: string[];
}
export declare class DesignSystemComplianceChecker {
    private knownDesignSystems;
    constructor();
    checkDesignTokenCompliance(tokens: DesignTokens): ComplianceResult;
    recognizeComponentPattern(component: ComponentPattern): ComplianceResult;
    checkTechStackCompatibility(designSystem: string, techStack: Record<string, string>): TechStackCompatibility;
    analyzeDesignSystem(data: {
        tokens: DesignTokens;
        components: ComponentPattern[];
        techStack: Record<string, string>;
    }): {
        tokenCompliance: ComplianceResult;
        componentCompliance: ComplianceResult[];
        techStackCompatibility: TechStackCompatibility;
        overallScore: number;
        recommendations: string[];
    };
    private initializeDesignSystems;
    private checkMaterialDesignCompliance;
    private checkAppleHIGCompliance;
    private checkFluentDesignCompliance;
    private checkAntDesignCompliance;
    private analyzeButtonPattern;
    private analyzeInputPattern;
    private analyzeCardPattern;
    private analyzeNavigationPattern;
    private analyzeGenericPattern;
    private getCompatibilityMatrix;
    private generateRecommendations;
}
export default DesignSystemComplianceChecker;
//# sourceMappingURL=design-system-compliance-checker.d.ts.map