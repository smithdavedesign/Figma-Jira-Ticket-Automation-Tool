/**
 * Figma API Adapter
 * 
 * Provides a clean interface to the Figma Plugin API
 */

export class FigmaAPI {
  static get selection(): readonly any[] {
    return (figma as any).currentPage?.selection || [];
  }

  static get currentPage(): any {
    return (figma as any).currentPage;
  }

  static get fileKey(): string {
    return (figma as any).fileKey || '';
  }

  static get root(): any {
    return (figma as any).root;
  }

  static postMessage(message: any): void {
    figma.ui.postMessage(message);
  }

  static closePlugin(): void {
    figma.closePlugin();
  }

  static showUI(html: string, options?: any): void {
    figma.showUI(html, options);
  }
}