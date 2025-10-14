/**
 * Figma Plugin API Type Declarations
 * Extends the global Figma API with proper TypeScript definitions
 */

import { 
  PageNode, 
  DocumentNode, 
  PaintStyle, 
  TextStyle, 
  EffectStyle 
} from './figma-data';

// Global Figma API - these are provided by the Figma plugin environment
// Remove duplicate declarations to avoid conflicts

export interface PluginAPI {
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
  // Async versions (newer API)
  getLocalPaintStylesAsync(): Promise<PaintStyle[]>;
  getLocalTextStylesAsync(): Promise<TextStyle[]>;
  getLocalEffectStylesAsync(): Promise<EffectStyle[]>;
}

export interface PluginUIAPI {
  postMessage(message: any): void;
  onmessage: ((message: any) => void) | null;
  resize(width: number, height: number): void;
}

// Re-export types from figma-data for convenience
export * from './figma-data';