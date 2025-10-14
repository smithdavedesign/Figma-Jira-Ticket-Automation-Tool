/**
 * Design System Types
 * Defines structures for design system detection and analysis
 */

import { RGB } from './figma-data';
import type { ComplianceScore } from './compliance';

// Design System Core Types
export interface DesignSystem {
  id: string;
  name: string;
  pages: DesignSystemPage[];
  colors: ColorToken[];
  typography: TypographyToken[];
  components: ComponentLibrary;
  spacing: SpacingToken[];
  effects: EffectToken[];
  detectionConfidence: number; // 0-1 score
  compliance?: ComplianceScore; // Compliance scoring
}

export interface DesignSystemPage {
  id: string;
  name: string;
  type: 'components' | 'tokens' | 'styles' | 'documentation';
  confidence: number;
}

// Token Types
export interface ColorToken {
  id: string;
  name: string;
  value: RGB;
  description?: string;
  semantic?: string; // primary, secondary, error, warning, etc.
}

export interface TypographyToken {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight?: number;
  letterSpacing?: number;
  description?: string;
}

export interface SpacingToken {
  id: string;
  name: string;
  value: number;
  unit: 'px' | 'rem' | 'em';
  description?: string;
}

export interface EffectToken {
  id: string;
  name: string;
  type: 'drop-shadow' | 'inner-shadow' | 'blur';
  values: {
    color?: RGB;
    x?: number;
    y?: number;
    blur?: number;
    spread?: number;
  };
  description?: string;
}

// Component Library
export interface ComponentLibrary {
  components: Component[];
  categories: ComponentCategory[];
  totalComponents: number;
}

export interface Component {
  id: string;
  name: string;
  category: string;
  variants: ComponentVariant[];
  description?: string;
  figmaId?: string;
}

export interface ComponentVariant {
  id: string;
  name: string;
  properties: { [key: string]: string };
  figmaId?: string;
}

export interface ComponentCategory {
  name: string;
  count: number;
  components: string[]; // Component IDs
}

// Token and Component Usage
export interface Token {
  id: string;
  name: string;
  type: 'color' | 'typography' | 'spacing' | 'effect';
  value: any;
  usageCount?: number;
}

export interface Recommendation {
  type: 'component' | 'token' | 'style' | 'structure';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestedAction: string;
  impact: string;
}

export interface Violation {
  id: string;
  type: 'color' | 'typography' | 'component' | 'spacing';
  nodeId: string;
  nodeName: string;
  description: string;
  suggestedFix: string;
}

// Compliance Scoring (Forward declaration - import from compliance.ts)
export type { 
  ComplianceScore,
  ComplianceBreakdown,
  ComplianceViolation,
  ComplianceRecommendation
} from './compliance';