// TypeScript definitions for Figma plugin development

// Figma API types (simplified for plugin development)
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: FigmaNode[];
  fills?: any[];
  visible?: boolean;
  parent?: FigmaNode;
}

interface FrameData {
  name: string;
  id: string;
  type: string;
  nodeCount: number;
  dimensions: { width: number; height: number };
  annotations: any[];
  components: any[];
  colors: string[];
  textContent: any[];
  hasPrototype: boolean;
  fileKey: string;
  fileName: string;
  pageId: string;
  pageName: string;
  layerStructure: any[];
  interactions: any[];
  spacing: any;
  semanticInfo: any;
}

interface DesignSystemInfo {
  name: string;
  version?: string;
  tokens?: any;
  components?: any[];
  colors?: string[];
  typography?: any;
}

interface ComplianceReport {
  overallScore: number;
  usedTokens: any[];
  violations: any[];
  recommendations: any[];
}

// Global Figma plugin API
declare const figma: {
  showUI: (html: string, options?: any) => void;
  closePlugin: () => void;
  ui: {
    postMessage: (message: any) => void;
    onmessage: (callback: (msg: any) => void) => void;
  };
  currentPage: {
    selection: FigmaNode[];
    id: string;
    name: string;
  };
  root: {
    name: string;
  };
  fileKey?: string;
  base64Encode: (data: Uint8Array) => string;
};

declare const __html__: string;