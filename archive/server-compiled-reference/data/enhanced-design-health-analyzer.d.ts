import { FigmaDataExtractor } from './extractor.js';
export interface DesignHealthAnalysis {
    overallScore: number;
    lastAnalyzed: string;
    analysisVersion: string;
    compliance: {
        colors: ComplianceCategory;
        typography: ComplianceCategory;
        components: ComplianceCategory;
        spacing: ComplianceCategory;
        effects: ComplianceCategory;
    };
    coverage: {
        tokenAdoption: TokenAdoptionMetrics;
        componentUsage: ComponentUsageMetrics;
        systemConsistency: ConsistencyMetrics;
    };
    insights: {
        topIssues: HealthIssue[];
        recommendations: HealthRecommendation[];
        trends: HealthTrend[];
    };
    performance: {
        loadTime: number;
        assetOptimization: number;
        codeEfficiency: number;
    };
    exports: {
        canExportTokens: boolean;
        canExportComponents: boolean;
        canGenerateStyleGuide: boolean;
    };
}
export interface ComplianceCategory {
    score: number;
    total: number;
    compliant: number;
    violations: HealthViolation[];
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
}
export interface TokenAdoptionMetrics {
    colors: {
        adopted: number;
        total: number;
        percentage: number;
    };
    typography: {
        adopted: number;
        total: number;
        percentage: number;
    };
    spacing: {
        adopted: number;
        total: number;
        percentage: number;
    };
    effects: {
        adopted: number;
        total: number;
        percentage: number;
    };
}
export interface ComponentUsageMetrics {
    designSystemComponents: number;
    customComponents: number;
    abandonedComponents: string[];
    overusedComponents: ComponentUsageDetail[];
    underusedComponents: ComponentUsageDetail[];
}
export interface ConsistencyMetrics {
    crossPageConsistency: number;
    namingConsistency: number;
    structureConsistency: number;
    tokenConsistency: number;
}
export interface HealthIssue {
    id: string;
    category: 'critical' | 'major' | 'minor';
    type: 'compliance' | 'performance' | 'maintenance' | 'accessibility';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    affectedElements: number;
}
export interface HealthRecommendation {
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    rationale: string;
    estimatedImpact: string;
    resources: string[];
}
export interface HealthTrend {
    metric: string;
    direction: 'improving' | 'declining' | 'stable';
    change: number;
    period: string;
}
export interface HealthViolation {
    id: string;
    elementId: string;
    elementName: string;
    violationType: string;
    description: string;
    suggestion: string;
    severity: 'low' | 'medium' | 'high';
}
export interface ComponentUsageDetail {
    id: string;
    name: string;
    usageCount: number;
    lastUsed?: string;
    masterComponentId?: string;
}
export declare class EnhancedDesignHealthAnalyzer {
    private enhancedScanner;
    private analysisCache;
    constructor(mcpExtractor: FigmaDataExtractor, options?: {
        cacheEnabled?: boolean;
        analysisDepth?: 'basic' | 'standard' | 'comprehensive';
    });
    analyzeDesignHealth(fileKey: string): Promise<DesignHealthAnalysis>;
    private analyzeCompliance;
    private analyzeColorCompliance;
    private analyzeTypographyCompliance;
    private analyzeComponentCompliance;
    private analyzeSpacingCompliance;
    private analyzeEffectsCompliance;
    private analyzeCoverage;
    private generateInsights;
    private analyzePerformance;
    private analyzeExportCapabilities;
    private calculateOverallScore;
    private calculateGrade;
    getCachedAnalysis(fileKey: string): DesignHealthAnalysis | null;
    clearCache(): void;
}
export default EnhancedDesignHealthAnalyzer;
//# sourceMappingURL=enhanced-design-health-analyzer.d.ts.map