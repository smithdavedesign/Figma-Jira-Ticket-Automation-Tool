/// <reference types="@figma/plugin-typings" />

// ─── Figma Plugin: Frame → Server pipeline ────────────────────────────
// Extracts frame data, captures a screenshot, sends everything to the
// Express server at localhost:3000 for AI ticket / wiki generation.
// ───────────────────────────────────────────────────────────────────────

figma.showUI(__html__, { width: 500, height: 700 });

// ─── Constants ─────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3000';
const SCREENSHOT_API = `${API_BASE}/api/figma/screenshot`;
const GENERATE_API = `${API_BASE}/api/generate`;
const MAX_RETRIES = 3;

// ─── Screenshot helpers ────────────────────────────────────────────────

async function fetchScreenshot(fileKey: string, nodeId: string): Promise<string | null> {
  const url = `${SCREENSHOT_API}?fileKey=${encodeURIComponent(fileKey)}&nodeId=${encodeURIComponent(nodeId)}&format=png&scale=2`;

  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`Screenshot API ${res.status}`);
      const json = await res.json();
      return json.data?.imageUrl || json.data?.screenshotUrl || json.imageUrl || json.screenshotUrl || null;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }
  console.warn('Screenshot API failed after retries:', lastError?.message);
  return null;
}

/** Try exportAsync as local fallback when backend is unreachable */
async function exportNodeAsBase64(node: SceneNode): Promise<string | null> {
  try {
    const bytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 }
    });
    if (bytes && bytes.length > 0) {
      return `data:image/png;base64,${figma.base64Encode(bytes)}`;
    }
  } catch { /* swallow */ }
  return null;
}

// ─── Message handler ───────────────────────────────────────────────────

figma.ui.onmessage = async (msg: any) => {
  try {
    switch (msg.type) {
      case 'generate-ai-ticket':
        await handleGenerateAITicket();
        break;
      case 'make-ai-request':
        await handleMakeAIRequest(msg);
        break;
      case 'get-context':
        await handleGetContext();
        break;
      case 'capture-screenshot':
        await handleCaptureScreenshot();
        break;
      case 'open-url':
        if (msg.url) figma.openExternal(msg.url);
        break;
      case 'close':
        figma.closePlugin();
        break;
      // File-key callback responses — handled inline, nothing to do here
      case 'real-file-key-response':
      case 'file-key-response':
      case 'file-key-response-for-screenshot':
        break;
      default:
        console.log('Unhandled message:', msg.type);
    }
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown plugin error'
    });
  }
};

// ─── Resolve file key ──────────────────────────────────────────────────

function resolveFileKey(): string {
  if (figma.fileKey && figma.fileKey !== 'dev-file') return figma.fileKey;
  return 'BioUSVD6t51ZNeG0g9AcNz'; // fallback for dev environment
}

// ─── Best screenshot target from selection ─────────────────────────────

function pickScreenshotTarget(selection: readonly SceneNode[]): SceneNode | null {
  if (selection.length === 0) {
    return figma.currentPage.findOne(n => n.type === 'FRAME') as SceneNode | null;
  }
  if (selection.length === 1) return selection[0];

  // Multiple selections → find common parent frame
  const first = selection[0];
  let parent = first.parent;
  while (parent && parent.type !== 'PAGE') {
    const containsAll = selection.every(node => {
      let a: BaseNode | null = node.parent;
      while (a && a !== parent) a = a.parent;
      return a === parent;
    });
    if (containsAll && (parent.type === 'FRAME' || parent.type === 'COMPONENT')) {
      return parent as SceneNode;
    }
    parent = parent.parent;
  }
  return first;
}

// ─── Core: generate-ai-ticket ──────────────────────────────────────────

async function handleGenerateAITicket() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify('Select at least one frame first.');
    return;
  }

  const fileKey = resolveFileKey();
  const fileInfo = {
    fileKey,
    fileName: figma.root.name || 'Figma Design',
    pageId: figma.currentPage.id,
    pageName: figma.currentPage.name
  };

  // Extract enhanced data for every selected node
  const enhancedFrameData = await Promise.all(
    selection.map(async (node) => {
      const base: any = {
        id: node.id,
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        visible: node.visible,
        locked: node.locked,
        dimensions: { width: node.width, height: node.height, x: node.x, y: node.y }
      };

      // Fills / colours
      const colors: string[] = [];
      if ('fills' in node && Array.isArray((node as any).fills)) {
        base.fills = (node as any).fills.map((fill: any) => {
          if (fill.type === 'SOLID' && fill.color) {
            const hex = rgbToHex(fill.color.r * 255, fill.color.g * 255, fill.color.b * 255);
            colors.push(hex);
            return { type: 'SOLID', hex };
          }
          return { type: fill.type };
        });
      }

      // Text
      if ('characters' in node) {
        base.text = (node as any).characters;
        base.fontSize = (node as any).fontSize;
        base.fontName = (node as any).fontName;
      }

      // Component instance
      if (node.type === 'INSTANCE') {
        try {
          const master = await (node as InstanceNode).getMainComponentAsync();
          base.masterComponent = { id: master?.id, name: master?.name };
        } catch { base.masterComponent = {}; }
      }

      // Hierarchy + design tokens
      base.hierarchy = await buildHierarchy(node);

      base.metadata = {
        colors,
        semanticRole: determineSemanticRole(node),
        extractedAt: new Date().toISOString(),
        figmaType: node.type,
        hasText: 'characters' in node && !!(node as any).characters,
        isComponent: node.type === 'INSTANCE' || node.type === 'COMPONENT',
        childCount: 'children' in node ? ((node as any).children?.length || 0) : 0
      };

      return base;
    })
  );

  // Screenshot
  let screenshot: string | null = null;
  const target = pickScreenshotTarget(selection);
  if (target) {
    screenshot = await fetchScreenshot(fileKey, target.id);
    if (!screenshot) screenshot = await exportNodeAsBase64(target);
  }

  figma.ui.postMessage({
    type: 'ai-ticket-data',
    data: {
      enhancedFrameData,
      fileContext: fileInfo,
      screenshot,
      metadata: {
        selectionCount: selection.length,
        pageInfo: { id: figma.currentPage.id, name: figma.currentPage.name }
      }
    }
  });
}

// ─── Simple context (selection + file info) ────────────────────────────

async function handleGetContext() {
  const selection = figma.currentPage.selection;
  figma.ui.postMessage({
    type: 'selection-context',
    data: selection.map(n => ({
      id: n.id, name: n.name, type: n.type,
      width: n.width, height: n.height,
      x: n.x, y: n.y
    }))
  });
  figma.ui.postMessage({
    type: 'file-context',
    data: {
      fileKey: resolveFileKey(),
      fileName: figma.root.name || 'Figma Design',
      pageId: figma.currentPage.id,
      pageName: figma.currentPage.name
    }
  });
}

// ─── Capture screenshot on demand ──────────────────────────────────────

async function handleCaptureScreenshot() {
  const target = pickScreenshotTarget(figma.currentPage.selection);
  if (!target) { figma.notify('No frame found to screenshot.'); return; }

  const fileKey = resolveFileKey();
  let url = await fetchScreenshot(fileKey, target.id);
  if (!url) url = await exportNodeAsBase64(target);

  figma.ui.postMessage({
    type: 'screenshot-captured',
    screenshotUrl: url,
    metadata: {
      nodeName: target.name,
      nodeType: target.type,
      nodeId: target.id,
      fileKey,
      captureTime: new Date().toISOString(),
      source: url?.startsWith('data:') ? 'figma-export' : 'backend-api'
    }
  });
}

// ─── Proxy AI request to server ────────────────────────────────────────

async function handleMakeAIRequest(msg: any) {
  try {
    const res = await fetch(GENERATE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg.params)
    });
    const data = await res.json();
    figma.ui.postMessage({ type: 'ai-generation-result', success: res.ok, data, requestId: msg.requestId });
  } catch (error) {
    figma.ui.postMessage({
      type: 'ai-generation-result',
      success: false,
      error: error instanceof Error ? error.message : 'Network request failed',
      requestId: msg.requestId
    });
  }
}

// ─── Hierarchy builder (recursive) ────────────────────────────────────

async function buildHierarchy(node: SceneNode): Promise<any> {
  const layers: any[] = [];
  const tokens = { colors: new Set<string>(), typography: new Set<string>(), spacing: new Set<number>(), borderRadius: new Set<number>(), shadows: new Set<string>() };
  let maxDepth = 1, componentCount = 0, textCount = 0;

  async function walk(n: SceneNode, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    if (n.type === 'INSTANCE' || n.type === 'COMPONENT') componentCount++;
    if (n.type === 'TEXT') textCount++;

    const extracted = extractDesignTokens(n);
    extracted.colors.forEach((c: string) => tokens.colors.add(c));
    extracted.typography.forEach((t: string) => tokens.typography.add(t));
    extracted.spacing.forEach((s: number) => tokens.spacing.add(s));
    extracted.borderRadius.forEach((r: number) => tokens.borderRadius.add(r));
    extracted.shadows.forEach((sh: string) => tokens.shadows.add(sh));

    const layer: any = {
      id: n.id, name: n.name, type: n.type, depth,
      position: { x: n.x, y: n.y },
      size: { width: n.width, height: n.height },
      visible: n.visible,
      semanticRole: determineSemanticRole(n),
      tokens: extracted
    };

    if (n.type === 'INSTANCE') {
      try {
        const master = await (n as InstanceNode).getMainComponentAsync();
        layer.masterComponent = { id: master?.id, name: master?.name };
        if ((n as any).componentProperties) layer.componentProperties = (n as any).componentProperties;
      } catch { /* skip */ }
    }

    layers.push(layer);

    if ('children' in n && (n as any).children) {
      for (const child of (n as any).children) await walk(child, depth + 1);
    }
  }

  await walk(node, 1);

  return {
    layers,
    totalDepth: maxDepth,
    componentCount,
    textLayerCount: textCount,
    designTokens: {
      colors: [...tokens.colors],
      typography: [...tokens.typography],
      spacing: [...tokens.spacing].sort((a, b) => a - b),
      borderRadius: [...tokens.borderRadius].sort((a, b) => a - b),
      shadows: [...tokens.shadows]
    }
  };
}

// ─── Design-token extraction (single node) ─────────────────────────────

function extractDesignTokens(node: SceneNode): any {
  const t: any = { colors: [], typography: [], spacing: [], borderRadius: [], shadows: [] };
  try {
    // Fills
    if ('fills' in node && Array.isArray((node as any).fills)) {
      for (const fill of (node as any).fills) {
        if (fill.type === 'SOLID' && fill.color) {
          t.colors.push(rgbToHex(fill.color.r * 255, fill.color.g * 255, fill.color.b * 255));
        }
      }
    }
    // Stroke colours
    if ('strokes' in node && Array.isArray((node as any).strokes)) {
      for (const s of (node as any).strokes) {
        if (s.type === 'SOLID' && s.color) {
          t.colors.push(rgbToHex(s.color.r * 255, s.color.g * 255, s.color.b * 255));
        }
      }
    }
    // Typography
    if (node.type === 'TEXT') {
      const n = node as TextNode;
      const family = (n.fontName as FontName | typeof figma.mixed)?.toString() !== '[object Object]'
        ? 'Mixed' : ((n.fontName as FontName)?.family || 'Inter');
      const size = typeof n.fontSize === 'number' ? n.fontSize : 16;
      t.typography.push(`${family}-${size}px`);
    }
    // Padding → spacing
    const any_n = node as any;
    for (const key of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) {
      if (any_n[key] > 0) t.spacing.push(any_n[key]);
    }
    // Item spacing (auto-layout)
    if (any_n.itemSpacing > 0) t.spacing.push(any_n.itemSpacing);
    // Border radius
    if ('cornerRadius' in node && (node as any).cornerRadius > 0) {
      t.borderRadius.push((node as any).cornerRadius);
    }
    // Shadows
    if ('effects' in node && (node as any).effects) {
      for (const e of (node as any).effects) {
        if (e.type === 'DROP_SHADOW') {
          t.shadows.push(`${e.offset?.x || 0}px ${e.offset?.y || 0}px ${e.radius || 0}px`);
        }
      }
    }
  } catch { /* safe */ }

  // Deduplicate
  t.colors = [...new Set(t.colors)];
  t.typography = [...new Set(t.typography)];
  t.spacing = [...new Set(t.spacing as number[])].sort((a: number, b: number) => a - b);
  t.borderRadius = [...new Set(t.borderRadius as number[])].sort((a: number, b: number) => a - b);
  t.shadows = [...new Set(t.shadows)];
  return t;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
}

function determineSemanticRole(node: SceneNode): string {
  switch (node.type) {
    case 'TEXT': return 'text';
    case 'RECTANGLE': case 'ELLIPSE': case 'POLYGON': return 'shape';
    case 'FRAME': return 'container';
    case 'GROUP': return 'group';
    case 'INSTANCE': return 'component-instance';
    case 'COMPONENT': return 'component-definition';
    case 'VECTOR': return 'icon';
    default: {
      const name = node.name.toLowerCase();
      if (name.includes('button')) return 'button';
      if (name.includes('input') || name.includes('field')) return 'input';
      if (name.includes('header') || name.includes('title')) return 'header';
      if (name.includes('nav') || name.includes('menu')) return 'navigation';
      if (name.includes('card')) return 'card';
      if (name.includes('modal') || name.includes('dialog')) return 'modal';
      return 'element';
    }
  }
}

console.log('✅ Figma Plugin loaded');
