/**
 * Compliance Scoring Types
 * Defines structures for design system compliance analysis
 */

// Main Compliance Score Interface
export interface ComplianceScore {
  overall: number; // 0-100 percentage
  breakdown: {
    colors: ComplianceBreakdown;
    typography: ComplianceBreakdown;
    components: ComplianceBreakdown;
    spacing: ComplianceBreakdown;
  };
  lastCalculated: number; // timestamp
  recommendations: ComplianceRecommendation[];
}

export interface ComplianceBreakdown {
  score: number; // 0-100 percentage
  compliantCount: number;
  totalCount: number;
  violations: ComplianceViolation[];
}

export interface ComplianceViolation {
  type: 'color' | 'typography' | 'component' | 'spacing';
  severity: 'low' | 'medium' | 'high';
  description: string;
  elementId?: string;
  suggestion: string;
}

export interface ComplianceRecommendation {
  priority: 'low' | 'medium' | 'high';
  category: string;
  description: string;
  action: string;
  impact: string;
}

// Legacy Compliance Report (for backward compatibility)
export interface ComplianceReport {
  overallScore: number;
  colorCompliance: {
    score: number;
    tokenizedColors: number;
    totalColors: number;
    violations: any[];
  };
  typographyCompliance: {
    score: number;
    tokenizedText: number;
    totalTextElements: number;
    violations: any[];
  };
  componentCompliance: {
    score: number;
    standardComponents: number;
    totalComponents: number;
    violations: any[];
  };
  recommendations: any[];
}