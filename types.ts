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
}

interface PluginUIAPI {
  onmessage: ((message: any) => void) | null;
  postMessage(message: any): void;
}

interface PageNode {
  id: string;
  name: string;
  selection: ReadonlyArray<SceneNode>;
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

type PluginMessage = GenerateTicketMessage | ClosePluginMessage;
type UIMessage = FrameDataMessage | ErrorMessage;