import { FigmaDataExtractor } from '../../src/data/extractor.js';
import type { DesignSystem, ComponentInstance, DesignSystemLinks, HierarchicalData } from '../../src/data/types.js';
interface BaseDesignSystemScanner {
    scanDesignSystem(): Promise<DesignSystem | null>;
}
interface EnhancedDesignSystemResult extends DesignSystem {
    hierarchy: HierarchicalData;
    componentInstances: ComponentInstance[];
    designSystemLinks: DesignSystemLinks;
    exportCapabilities: {
        screenshots: boolean;
        assets: boolean;
        tokens: boolean;
    };
    mcpMetadata: {
        version: string;
        extractedAt: string;
        enhancementLevel: 'basic' | 'standard' | 'advanced';
        sources: string[];
        performance: {
            scanDuration: number;
            enhancementDuration: number;
            totalNodes: number;
            processedNodes: number;
        };
    };
}
declare class EnhancedDesignSystemScanner {
    private enhancementLevel;
    private baseScanner;
    constructor(mcpExtractor: FigmaDataExtractor, options?: {
        enhancementLevel?: 'basic' | 'standard' | 'advanced';
        maxDepth?: number;
        includeScreenshots?: boolean;
        baseScanner?: BaseDesignSystemScanner;
    });
    scanWithHierarchy(): Promise<EnhancedDesignSystemResult | null>;
    private getBaseDesignSystem;
    private createMockDesignSystem;
    private addMCPEnhancements;
    private extractHierarchicalData;
    private processPageHierarchy;
    private extractNodeTokens;
    private extractComponentInstances;
    private findInstancesInPage;
    private extractInstanceProps;
    private extractInstanceOverrides;
    private detectDesignSystemLinks;
    private detectExportCapabilities;
    private createMinimalEnhancement;
    private rgbToHex;
}
export declare function createEnhancedDesignSystemScanner(mcpExtractor: FigmaDataExtractor, options?: {
    enhancementLevel?: 'basic' | 'standard' | 'advanced';
    maxDepth?: number;
    includeScreenshots?: boolean;
}): EnhancedDesignSystemScanner;
export { EnhancedDesignSystemScanner };
export type { EnhancedDesignSystemResult };
//# sourceMappingURL=enhanced-design-system-scanner.d.ts.map