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

// ─── Token subtree extractor (for INSTANCE master components) ──────────
// Recursively collects design tokens from a node tree without polluting the
// layer hierarchy. Used to capture canonical typography/spacing values from
// master components when the selected frame contains INSTANCE nodes.
async function extractTokensFromSubtree(
  node: any,
  tokens: { colors: Set<string>; typography: Set<string>; spacing: Set<number>; borderRadius: Set<number>; shadows: Set<string>; typographyRichMap: Map<string, any> }
): Promise<void> {
  const extracted = extractDesignTokens(node as SceneNode);
  extracted.colors.forEach((c: string) => tokens.colors.add(c));
  extracted.typography.forEach((t: string) => tokens.typography.add(t));
  extracted.typographyRich?.forEach((t: any) => { const k = `${t.family}-${t.size}-${t.weight}`; tokens.typographyRichMap.set(k, t); });
  extracted.spacing.forEach((s: number) => tokens.spacing.add(s));
  extracted.borderRadius.forEach((r: number) => tokens.borderRadius.add(r));
  extracted.shadows.forEach((sh: string) => tokens.shadows.add(sh));
  if ('children' in node && node.children) {
    for (const child of node.children) await extractTokensFromSubtree(child, tokens);
  }
}

// ─── Hierarchy builder (recursive) ────────────────────────────────────

async function buildHierarchy(node: SceneNode): Promise<any> {
  const layers: any[] = [];
  const tokens = { colors: new Set<string>(), typography: new Set<string>(), spacing: new Set<number>(), borderRadius: new Set<number>(), shadows: new Set<string>(), typographyRichMap: new Map<string, any>() };
  let maxDepth = 1, componentCount = 0, textCount = 0;

  async function walk(n: SceneNode, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    if (n.type === 'INSTANCE' || n.type === 'COMPONENT') componentCount++;
    if (n.type === 'TEXT') textCount++;

    const extracted = extractDesignTokens(n);
    extracted.colors.forEach((c: string) => tokens.colors.add(c));
    extracted.typography.forEach((t: string) => tokens.typography.add(t));
    extracted.typographyRich?.forEach((t: any) => { const k = `${t.family}-${t.size}-${t.weight}`; tokens.typographyRichMap.set(k, t); });
    extracted.spacing.forEach((s: number) => tokens.spacing.add(s));
    extracted.borderRadius.forEach((r: number) => tokens.borderRadius.add(r));
    extracted.shadows.forEach((sh: string) => tokens.shadows.add(sh));

    const layer: any = {
      id: n.id, name: n.name, type: n.type, depth,
      position: { x: n.x, y: n.y },
      size: { width: n.width, height: n.height },
      visible: n.visible,
      semanticRole: determineSemanticRole(n),
      tokens: extracted,
      ...(extracted.layout ? { layout: extracted.layout } : {}),
    };

    if (n.type === 'INSTANCE') {
      try {
        const master = await (n as InstanceNode).getMainComponentAsync();
        layer.masterComponent = { id: master?.id, name: master?.name };
        if ((n as any).componentProperties) layer.componentProperties = (n as any).componentProperties;
        // Fix 1+2: Extract tokens from master component's full subtree so that
        // typography/spacing inside nested instances is captured with canonical values.
        if (master) await extractTokensFromSubtree(master as any, tokens);
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
      typographyRich: [...tokens.typographyRichMap.values()],
      spacing: [...tokens.spacing].sort((a, b) => a - b),
      borderRadius: [...tokens.borderRadius].sort((a, b) => a - b),
      shadows: [...tokens.shadows]
    }
  };
}

// ─── Design-token extraction (single node) ─────────────────────────────

function extractDesignTokens(node: SceneNode): any {
  const t: any = { colors: [], typography: [], typographyRich: [], spacing: [], borderRadius: [], shadows: [], layout: null };
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
    // Typography — full extraction including weight, lineHeight, letterSpacing
    if (node.type === 'TEXT') {
      const n = node as TextNode;
      let family = 'Inter', style = 'Regular';
      try {
        if (n.fontName && typeof (n.fontName as any).family === 'string') {
          family = (n.fontName as FontName).family;
          style = (n.fontName as FontName).style || 'Regular';
        }
      } catch { /* mixed font */ }
      const size = typeof n.fontSize === 'number' ? n.fontSize : 16;
      const weight = _styleToWeight(style);
      let lineHeight = 'auto';
      try {
        const lh = n.lineHeight as any;
        if (lh && lh.unit === 'PIXELS' && lh.value) lineHeight = `${Math.round(lh.value)}px`;
        else if (lh && lh.unit === 'PERCENT' && lh.value) lineHeight = `${Math.round(lh.value)}%`;
      } catch { /* mixed */ }
      let letterSpacing: string | number = 0;
      try {
        const ls = n.letterSpacing as any;
        if (ls && ls.value && ls.value !== 0) letterSpacing = ls.unit === 'PIXELS' ? `${ls.value}px` : `${ls.value}%`;
      } catch { /* mixed */ }
      t.typography.push(`${family}-${size}px`);
      t.typographyRich.push({ family, style, size, weight, lineHeight, letterSpacing, role: determineSemanticRole(node) });
    }
    // Auto-layout properties
    const any_n = node as any;
    if (any_n.layoutMode && any_n.layoutMode !== 'NONE') {
      t.layout = {
        mode: any_n.layoutMode,
        gap: any_n.itemSpacing || 0,
        paddingTop: any_n.paddingTop || 0,
        paddingRight: any_n.paddingRight || 0,
        paddingBottom: any_n.paddingBottom || 0,
        paddingLeft: any_n.paddingLeft || 0,
        primaryAlign: any_n.primaryAxisAlignItems || null,
        counterAlign: any_n.counterAxisAlignItems || null,
      };
    }
    // Padding → spacing
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
  // typographyRich: deduplicate by family+size+weight
  const _richSeen = new Set<string>();
  t.typographyRich = t.typographyRich.filter((r: any) => {
    const k = `${r.family}-${r.size}-${r.weight}`;
    if (_richSeen.has(k)) return false;
    _richSeen.add(k); return true;
  });
  t.spacing = [...new Set(t.spacing as number[])].sort((a: number, b: number) => a - b);
  t.borderRadius = [...new Set(t.borderRadius as number[])].sort((a: number, b: number) => a - b);
  t.shadows = [...new Set(t.shadows)];
  return t;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
}

// Map Figma font style string to CSS font-weight number
function _styleToWeight(style: string): number {
  const s = (style || '').toLowerCase();
  if (s.includes('thin') || s.includes('hairline')) return 100;
  if (s.includes('extralight') || s.includes('ultralight')) return 200;
  if (s.includes('light')) return 300;
  if (s.includes('semibold') || s.includes('demibold')) return 600;
  if (s.includes('extrabold') || s.includes('ultrabold')) return 800;
  if (s.includes('black') || s.includes('heavy')) return 900;
  if (s.includes('bold')) return 700;
  if (s.includes('medium')) return 500;
  return 400; // Regular / Normal / Roman
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
