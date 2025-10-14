/**
 * Figma API and Data Types
 * Defines structures for Figma nodes, frames, and extracted data
 */

// Basic Figma API Types
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface FontName {
  family: string;
  style: string;
}

export interface BaseNode {
  id: string;
  name: string;
  type: string;
}

export interface SceneNode extends BaseNode {
  visible?: boolean;
  locked?: boolean;
}

export interface FrameNode extends SceneNode {
  children: ReadonlyArray<SceneNode>;
  width: number;
  height: number;
}

export interface InstanceNode extends SceneNode {
  mainComponent: ComponentNode | null;
}

export interface ComponentNode extends SceneNode {
  name: string;
}

export interface TextNode extends SceneNode {
  characters: string;
  fontSize: number | symbol;
  fontName: FontName | symbol;
}

export interface PageNode extends BaseNode {
  children: ReadonlyArray<SceneNode>;
}

export interface DocumentNode extends BaseNode {
  children: ReadonlyArray<PageNode>;
  findAll(callback: (node: any) => boolean): any[];
}

// Figma Styles
export interface PaintStyle {
  id: string;
  name: string;
  description: string;
  paints: ReadonlyArray<Paint>;
}

export interface TextStyle {
  id: string;
  name: string;
  description: string;
  fontSize: number | symbol;
  fontName: FontName | symbol;
  lineHeight?: { value: number; unit: string };
  letterSpacing?: { value: number; unit: string };
}

export interface EffectStyle {
  id: string;
  name: string;
  description: string;
  effects: ReadonlyArray<Effect>;
}

export interface Paint {
  type: string;
  color?: RGB;
  visible?: boolean;
}

export interface Effect {
  type: string;
  visible?: boolean;
  color?: RGB;
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
}

// Extracted Frame Data
export interface FrameData {
  name: string;
  id: string;
  type: string;
  nodeCount: number;
  dimensions: { width: number; height: number };
  annotations: string[];
  components: ComponentInfo[];
  colors: string[];
  textContent: TextInfo[];
  hasPrototype: boolean;
  fileKey: string;
  pageId: string;
  pageName: string;
}

export interface ComponentInfo {
  name: string;
  masterComponent: string;
}

export interface TextInfo {
  content: string;
  fontSize: number | string;
  fontName: string;
}

// Enhanced frame data with design system context
export interface EnhancedFrameData extends FrameData {
  designSystemContext?: {
    designSystem: any | null; // Will be typed properly when we move DesignSystem
    complianceReport: any | null; // Will be typed properly when we move ComplianceReport
    usedTokens: any[]; // Will be typed properly when we move Token types
    violations: any[]; // Will be typed properly when we move Violation types
    recommendations: any[]; // Will be typed properly when we move Recommendation types
  };
}