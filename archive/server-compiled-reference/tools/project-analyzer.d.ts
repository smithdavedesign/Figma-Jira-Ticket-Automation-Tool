export interface ProjectAnalysisResult {
    project: {
        name: string;
        fileKey: string;
        pageCount: number;
        componentCount: number;
        frameCount: number;
        lastModified: string;
    };
    designSystem: {
        complianceScore: number;
        colorUsage: Record<string, number>;
        typographyUsage: Record<string, number>;
        componentUsage: Record<string, number>;
        violations: Array<{
            type: string;
            severity: 'low' | 'medium' | 'high';
            description: string;
            location: string;
        }>;
    };
    relationships: {
        componentDependencies: Array<{
            component: string;
            dependsOn: string[];
            usedBy: string[];
        }>;
        pageStructure: Array<{
            page: string;
            components: string[];
            complexity: number;
        }>;
    };
    insights: {
        recommendations: string[];
        risks: string[];
        opportunities: string[];
    };
}
export declare class ProjectAnalyzer {
    analyze(args: any): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    private extractFileKey;
}
//# sourceMappingURL=project-analyzer.d.ts.map