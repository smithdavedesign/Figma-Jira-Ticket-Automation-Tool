// Type definitions for Figma Plugin API
declare const figma: PluginAPI;
declare const __html__: string;

interface PluginAPI {
  showUI(html: string, options?: { width?: number; height?: number; themeColors?: boolean }): void;
  closePlugin(): void;
  ui: PluginUIAPI;
  currentPage: PageNode;
  fileKey: string;
  readonly mixed: unique symbol;
  root: DocumentNode;
  getLocalPaintStyles(): PaintStyle[];
  getLocalTextStyles(): TextStyle[];
  getLocalEffectStyles(): EffectStyle[];
}

interface DocumentNode extends BaseNode {
  children: ReadonlyArray<PageNode>;
  findAll(callback: (node: any) => boolean): any[];
}

interface PaintStyle {
  id: string;
  name: string;
  description: string;
  paints: ReadonlyArray<Paint>;
}

interface TextStyle {
  id: string;
  name: string;
  description: string;
  fontSize: number | symbol;
  fontName: FontName | symbol;
  lineHeight?: { value: number; unit: string };
  letterSpacing?: { value: number; unit: string };
}

interface EffectStyle {
  id: string;
  name: string;
  description: string;
  effects: ReadonlyArray<Effect>;
}

interface Paint {
  type: string;
  color?: RGB;
}

interface Effect {
  type: string;
  color?: RGB;
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
}

interface PluginUIAPI {
  onmessage: ((message: any) => void) | null;
  postMessage(message: any): void;
}

interface PageNode {
  id: string;
  name: string;
  selection: ReadonlyArray<SceneNode>;
  children: ReadonlyArray<SceneNode>;
  findAll(callback: (node: any) => boolean): any[];
}

interface BaseNode {
  id: string;
  name: string;
  type: string;
}

interface SceneNode extends BaseNode {
  findAll?: (callback: (node: any) => boolean) => any[];
}

interface FrameNode extends SceneNode {
  children: ReadonlyArray<SceneNode>;
  width: number;
  height: number;
  reactions: ReadonlyArray<any>;
}

interface TextNode extends SceneNode {
  characters: string;
  fontSize: number | symbol;
  fontName: FontName | symbol;
}

interface InstanceNode extends SceneNode {
  masterComponent: ComponentNode | null;
}

interface ComponentNode extends FrameNode {
  // Component specific properties
}

interface FontName {
  family: string;
  style: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface SolidPaint {
  type: 'SOLID';
  color: RGB;
}

// Message types for communication between plugin and UI
interface GenerateTicketMessage {
  type: 'generate-ticket';
}

interface ClosePluginMessage {
  type: 'close-plugin';
}

interface FrameDataMessage {
  type: 'frame-data';
  data: FrameData[];
}

interface ErrorMessage {
  type: 'error';
  message: string;
}

interface FrameData {
  name: string;
  id: string;
  type: string;
  nodeCount: number;
  dimensions: { width: number; height: number };
  annotations: any[];
  components: ComponentInfo[];
  colors: string[];
  textContent: TextInfo[];
  hasPrototype: boolean;
  fileKey: string;
  pageId: string;
  pageName: string;
}

interface ComponentInfo {
  name: string;
  masterComponent: string;
}

interface TextInfo {
  content: string;
  fontSize: number | string;
  fontName: string;
}

// Design System Types
interface DesignSystem {
  id: string;
  name: string;
  pages: DesignSystemPage[];
  colors: ColorToken[];
  typography: TypographyToken[];
  components: ComponentLibrary;
  spacing: SpacingToken[];
  effects: EffectToken[];
  detectionConfidence: number; // 0-1 score
}

interface DesignSystemPage {
  id: string;
  name: string;
  type: 'components' | 'tokens' | 'styles' | 'documentation';
  confidence: number;
}

interface ColorToken {
  id: string;
  name: string;
  value: RGB;
  description?: string;
  semantic?: string; // primary, secondary, error, warning, etc.
}

interface TypographyToken {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight?: number;
  letterSpacing?: number;
}

interface ComponentLibrary {
  components: ComponentMetadata[];
  variants: ComponentVariant[];
}

interface ComponentMetadata {
  id: string;
  name: string;
  description?: string;
  category: string;
  instances: number;
  variants?: string[];
}

interface ComponentVariant {
  id: string;
  parentId: string;
  properties: { [key: string]: string };
}

interface SpacingToken {
  id: string;
  name: string;
  value: number;
  semantic?: string; // xs, sm, md, lg, xl
}

interface EffectToken {
  id: string;
  name: string;
  type: 'shadow' | 'blur';
  properties: any;
}

interface ComplianceReport {
  overallScore: number; // 0-100 percentage
  colorCompliance: ColorCompliance;
  typographyCompliance: TypographyCompliance;
  componentCompliance: ComponentCompliance;
  recommendations: Recommendation[];
  usedTokens: Token[];
  violations: Violation[];
}

interface ColorCompliance {
  score: number;
  totalColors: number;
  tokenizedColors: number;
  hardcodedColors: number;
}

interface TypographyCompliance {
  score: number;
  totalTextElements: number;
  tokenizedText: number;
  hardcodedText: number;
}

interface ComponentCompliance {
  score: number;
  totalComponents: number;
  standardComponents: number;
  customComponents: number;
}

interface Recommendation {
  id: string;
  type: 'color' | 'typography' | 'component' | 'spacing';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  nodeId?: string;
}

interface Token {
  id: string;
  name: string;
  type: 'color' | 'typography' | 'spacing' | 'effect';
  value: any;
}

interface Violation {
  id: string;
  type: 'color' | 'typography' | 'component' | 'spacing';
  nodeId: string;
  nodeName: string;
  description: string;
  suggestedFix: string;
}

// Enhanced frame data with design system context
interface EnhancedFrameData extends FrameData {
  designSystemContext?: {
    designSystem: DesignSystem | null;
    complianceReport: ComplianceReport | null;
    usedTokens: Token[];
    violations: Violation[];
    recommendations: Recommendation[];
  };
}

interface DesignSystemDetectedMessage {
  type: 'design-system-detected';
  designSystem: DesignSystem;
}

interface NoDesignSystemMessage {
  type: 'no-design-system';
}

type PluginMessage = GenerateTicketMessage | ClosePluginMessage;
type UIMessage = FrameDataMessage | ErrorMessage | DesignSystemDetectedMessage | NoDesignSystemMessage;