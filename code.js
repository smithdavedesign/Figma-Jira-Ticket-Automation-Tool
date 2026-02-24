"use strict";
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
async function fetchScreenshot(fileKey, nodeId) {
    var _a, _b;
    const url = `${SCREENSHOT_API}?fileKey=${encodeURIComponent(fileKey)}&nodeId=${encodeURIComponent(nodeId)}&format=png&scale=2`;
    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok)
                throw new Error(`Screenshot API ${res.status}`);
            const json = await res.json();
            return ((_a = json.data) === null || _a === void 0 ? void 0 : _a.imageUrl) || ((_b = json.data) === null || _b === void 0 ? void 0 : _b.screenshotUrl) || json.imageUrl || json.screenshotUrl || null;
        }
        catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    console.warn('Screenshot API failed after retries:', lastError === null || lastError === void 0 ? void 0 : lastError.message);
    return null;
}
/** Try exportAsync as local fallback when backend is unreachable */
async function exportNodeAsBase64(node) {
    try {
        const bytes = await node.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 2 }
        });
        if (bytes && bytes.length > 0) {
            return `data:image/png;base64,${figma.base64Encode(bytes)}`;
        }
    }
    catch ( /* swallow */_a) { /* swallow */ }
    return null;
}
// ─── Message handler ───────────────────────────────────────────────────
figma.ui.onmessage = async (msg) => {
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
    }
    catch (error) {
        console.error('Plugin error:', error);
        figma.ui.postMessage({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown plugin error'
        });
    }
};
// ─── Resolve file key ──────────────────────────────────────────────────
function resolveFileKey() {
    if (figma.fileKey && figma.fileKey !== 'dev-file')
        return figma.fileKey;
    return 'BioUSVD6t51ZNeG0g9AcNz'; // fallback for dev environment
}
// ─── Best screenshot target from selection ─────────────────────────────
function pickScreenshotTarget(selection) {
    if (selection.length === 0) {
        return figma.currentPage.findOne(n => n.type === 'FRAME');
    }
    if (selection.length === 1)
        return selection[0];
    // Multiple selections → find common parent frame
    const first = selection[0];
    let parent = first.parent;
    while (parent && parent.type !== 'PAGE') {
        const containsAll = selection.every(node => {
            let a = node.parent;
            while (a && a !== parent)
                a = a.parent;
            return a === parent;
        });
        if (containsAll && (parent.type === 'FRAME' || parent.type === 'COMPONENT')) {
            return parent;
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
    const enhancedFrameData = await Promise.all(selection.map(async (node) => {
        var _a;
        const base = {
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
        const colors = [];
        if ('fills' in node && Array.isArray(node.fills)) {
            base.fills = node.fills.map((fill) => {
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
            base.text = node.characters;
            base.fontSize = node.fontSize;
            base.fontName = node.fontName;
        }
        // Component instance
        if (node.type === 'INSTANCE') {
            try {
                const master = await node.getMainComponentAsync();
                base.masterComponent = { id: master === null || master === void 0 ? void 0 : master.id, name: master === null || master === void 0 ? void 0 : master.name };
            }
            catch (_b) {
                base.masterComponent = {};
            }
        }
        // Hierarchy + design tokens
        base.hierarchy = await buildHierarchy(node);
        base.metadata = {
            colors,
            semanticRole: determineSemanticRole(node),
            extractedAt: new Date().toISOString(),
            figmaType: node.type,
            hasText: 'characters' in node && !!node.characters,
            isComponent: node.type === 'INSTANCE' || node.type === 'COMPONENT',
            childCount: 'children' in node ? (((_a = node.children) === null || _a === void 0 ? void 0 : _a.length) || 0) : 0
        };
        return base;
    }));
    // Screenshot
    let screenshot = null;
    const target = pickScreenshotTarget(selection);
    if (target) {
        screenshot = await fetchScreenshot(fileKey, target.id);
        if (!screenshot)
            screenshot = await exportNodeAsBase64(target);
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
    if (!target) {
        figma.notify('No frame found to screenshot.');
        return;
    }
    const fileKey = resolveFileKey();
    let url = await fetchScreenshot(fileKey, target.id);
    if (!url)
        url = await exportNodeAsBase64(target);
    figma.ui.postMessage({
        type: 'screenshot-captured',
        screenshotUrl: url,
        metadata: {
            nodeName: target.name,
            nodeType: target.type,
            nodeId: target.id,
            fileKey,
            captureTime: new Date().toISOString(),
            source: (url === null || url === void 0 ? void 0 : url.startsWith('data:')) ? 'figma-export' : 'backend-api'
        }
    });
}
// ─── Proxy AI request to server ────────────────────────────────────────
async function handleMakeAIRequest(msg) {
    try {
        const res = await fetch(GENERATE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg.params)
        });
        const data = await res.json();
        figma.ui.postMessage({ type: 'ai-generation-result', success: res.ok, data, requestId: msg.requestId });
    }
    catch (error) {
        figma.ui.postMessage({
            type: 'ai-generation-result',
            success: false,
            error: error instanceof Error ? error.message : 'Network request failed',
            requestId: msg.requestId
        });
    }
}
// ─── Hierarchy builder (recursive) ────────────────────────────────────
async function buildHierarchy(node) {
    const layers = [];
    const tokens = { colors: new Set(), typography: new Set(), spacing: new Set(), borderRadius: new Set(), shadows: new Set() };
    let maxDepth = 1, componentCount = 0, textCount = 0;
    async function walk(n, depth) {
        maxDepth = Math.max(maxDepth, depth);
        if (n.type === 'INSTANCE' || n.type === 'COMPONENT')
            componentCount++;
        if (n.type === 'TEXT')
            textCount++;
        const extracted = extractDesignTokens(n);
        extracted.colors.forEach((c) => tokens.colors.add(c));
        extracted.typography.forEach((t) => tokens.typography.add(t));
        extracted.spacing.forEach((s) => tokens.spacing.add(s));
        extracted.borderRadius.forEach((r) => tokens.borderRadius.add(r));
        extracted.shadows.forEach((sh) => tokens.shadows.add(sh));
        const layer = {
            id: n.id, name: n.name, type: n.type, depth,
            position: { x: n.x, y: n.y },
            size: { width: n.width, height: n.height },
            visible: n.visible,
            semanticRole: determineSemanticRole(n),
            tokens: extracted
        };
        if (n.type === 'INSTANCE') {
            try {
                const master = await n.getMainComponentAsync();
                layer.masterComponent = { id: master === null || master === void 0 ? void 0 : master.id, name: master === null || master === void 0 ? void 0 : master.name };
                if (n.componentProperties)
                    layer.componentProperties = n.componentProperties;
            }
            catch ( /* skip */_a) { /* skip */ }
        }
        layers.push(layer);
        if ('children' in n && n.children) {
            for (const child of n.children)
                await walk(child, depth + 1);
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
function extractDesignTokens(node) {
    var _a, _b, _c, _d;
    const t = { colors: [], typography: [], spacing: [], borderRadius: [], shadows: [] };
    try {
        // Fills
        if ('fills' in node && Array.isArray(node.fills)) {
            for (const fill of node.fills) {
                if (fill.type === 'SOLID' && fill.color) {
                    t.colors.push(rgbToHex(fill.color.r * 255, fill.color.g * 255, fill.color.b * 255));
                }
            }
        }
        // Stroke colours
        if ('strokes' in node && Array.isArray(node.strokes)) {
            for (const s of node.strokes) {
                if (s.type === 'SOLID' && s.color) {
                    t.colors.push(rgbToHex(s.color.r * 255, s.color.g * 255, s.color.b * 255));
                }
            }
        }
        // Typography
        if (node.type === 'TEXT') {
            const n = node;
            const family = ((_a = n.fontName) === null || _a === void 0 ? void 0 : _a.toString()) !== '[object Object]'
                ? 'Mixed' : (((_b = n.fontName) === null || _b === void 0 ? void 0 : _b.family) || 'Inter');
            const size = typeof n.fontSize === 'number' ? n.fontSize : 16;
            t.typography.push(`${family}-${size}px`);
        }
        // Padding → spacing
        const any_n = node;
        for (const key of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) {
            if (any_n[key] > 0)
                t.spacing.push(any_n[key]);
        }
        // Item spacing (auto-layout)
        if (any_n.itemSpacing > 0)
            t.spacing.push(any_n.itemSpacing);
        // Border radius
        if ('cornerRadius' in node && node.cornerRadius > 0) {
            t.borderRadius.push(node.cornerRadius);
        }
        // Shadows
        if ('effects' in node && node.effects) {
            for (const e of node.effects) {
                if (e.type === 'DROP_SHADOW') {
                    t.shadows.push(`${((_c = e.offset) === null || _c === void 0 ? void 0 : _c.x) || 0}px ${((_d = e.offset) === null || _d === void 0 ? void 0 : _d.y) || 0}px ${e.radius || 0}px`);
                }
            }
        }
    }
    catch ( /* safe */_e) { /* safe */ }
    // Deduplicate
    t.colors = [...new Set(t.colors)];
    t.typography = [...new Set(t.typography)];
    t.spacing = [...new Set(t.spacing)].sort((a, b) => a - b);
    t.borderRadius = [...new Set(t.borderRadius)].sort((a, b) => a - b);
    t.shadows = [...new Set(t.shadows)];
    return t;
}
// ─── Helpers ───────────────────────────────────────────────────────────
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
}
function determineSemanticRole(node) {
    switch (node.type) {
        case 'TEXT': return 'text';
        case 'RECTANGLE':
        case 'ELLIPSE':
        case 'POLYGON': return 'shape';
        case 'FRAME': return 'container';
        case 'GROUP': return 'group';
        case 'INSTANCE': return 'component-instance';
        case 'COMPONENT': return 'component-definition';
        case 'VECTOR': return 'icon';
        default: {
            const name = node.name.toLowerCase();
            if (name.includes('button'))
                return 'button';
            if (name.includes('input') || name.includes('field'))
                return 'input';
            if (name.includes('header') || name.includes('title'))
                return 'header';
            if (name.includes('nav') || name.includes('menu'))
                return 'navigation';
            if (name.includes('card'))
                return 'card';
            if (name.includes('modal') || name.includes('dialog'))
                return 'modal';
            return 'element';
        }
    }
}
console.log('✅ Figma Plugin loaded');
