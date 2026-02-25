/**
 * Context Layer Data Processor
 * Processes Figma API responses and extracts context data
 */

class ContextProcessor {
    constructor(contextClient) {
        this.contextClient = contextClient;
        this.extractors = {
            frame: this.extractFrameContext.bind(this),
            component: this.extractComponentContext.bind(this),
            text: this.extractTextContext.bind(this),
            style: this.extractStyleContext.bind(this),
            vector: this.extractVectorContext.bind(this),
            instance: this.extractInstanceContext.bind(this)
        };
    }

    /**
     * Process complete Figma file response and extract context
     */
    async processFileResponse(figmaResponse, fileKey) {
        try {
            console.log('Processing Figma file response for context extraction');
            
            const context = {
                confidence: 0,
                nodes: [],
                styles: [],
                components: [],
                instances: [],
                textStyles: [],
                effects: [],
                constraints: [],
                layouts: [],
                interactions: [],
                animations: [],
                assets: [],
                metadata: {
                    fileName: figmaResponse.name || 'Unknown',
                    lastModified: figmaResponse.lastModified || null,
                    version: figmaResponse.version || '1.0',
                    thumbnailUrl: figmaResponse.thumbnailUrl || null,
                    editorType: figmaResponse.editorType || 'design'
                }
            };

            // Process document structure
            if (figmaResponse.document) {
                await this.processNode(figmaResponse.document, context, fileKey);
            }

            // Process styles
            if (figmaResponse.styles) {
                this.processStyles(figmaResponse.styles, context);
            }

            // Process components
            if (figmaResponse.components) {
                this.processComponents(figmaResponse.components, context);
            }

            // Calculate confidence score
            context.confidence = this.calculateConfidence(context);

            // Store in context layer
            const stored = await this.contextClient.storeContext(fileKey, null, context, {
                source: 'figma-api',
                processor: 'automated',
                extracted: new Date().toISOString(),
                fileMetadata: context.metadata
            });

            console.log(`Context stored for ${fileKey} with confidence ${context.confidence}`);
            return { success: true, context, stored };

        } catch (error) {
            console.error('Error processing file response:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process individual node and extract context
     */
    async processNode(node, context, fileKey, depth = 0) {
        if (!node || depth > 20) return; // Prevent infinite recursion

        try {
            // Extract basic node info
            const nodeInfo = {
                id: node.id,
                type: node.type,
                name: node.name || `${node.type}_${node.id}`,
                visible: node.visible !== false,
                locked: node.locked || false,
                depth: depth
            };

            // Add geometric properties
            if (node.absoluteBoundingBox) {
                nodeInfo.bounds = {
                    x: node.absoluteBoundingBox.x,
                    y: node.absoluteBoundingBox.y,
                    width: node.absoluteBoundingBox.width,
                    height: node.absoluteBoundingBox.height
                };
            }

            // Extract type-specific context
            if (this.extractors[node.type.toLowerCase()]) {
                const typeContext = this.extractors[node.type.toLowerCase()](node);
                Object.assign(nodeInfo, typeContext);
            }

            // Add to context
            context.nodes.push(nodeInfo);

            // Process children recursively
            if (node.children && Array.isArray(node.children)) {
                for (const child of node.children) {
                    await this.processNode(child, context, fileKey, depth + 1);
                }
            }

            // Store individual node context if significant
            if (this.isSignificantNode(node)) {
                await this.storeNodeContext(fileKey, node.id, nodeInfo);
            }

        } catch (error) {
            console.warn(`Error processing node ${node.id}:`, error);
        }
    }

    /**
     * Extract frame-specific context
     */
    extractFrameContext(node) {
        const context = {
            nodeType: 'frame',
            layoutMode: node.layoutMode || 'NONE',
            layoutWrap: node.layoutWrap || 'NO_WRAP',
            layoutGrow: node.layoutGrow || 0
        };

        // Layout properties
        if (node.primaryAxisSizingMode) {
            context.primaryAxisSizing = node.primaryAxisSizingMode;
        }
        if (node.counterAxisSizingMode) {
            context.counterAxisSizing = node.counterAxisSizingMode;
        }
        if (node.primaryAxisAlignItems) {
            context.primaryAxisAlign = node.primaryAxisAlignItems;
        }
        if (node.counterAxisAlignItems) {
            context.counterAxisAlign = node.counterAxisAlignItems;
        }

        // Padding
        if (node.paddingLeft !== undefined) {
            context.padding = {
                left: node.paddingLeft,
                right: node.paddingRight,
                top: node.paddingTop,
                bottom: node.paddingBottom
            };
        }

        // Gap
        if (node.itemSpacing !== undefined) {
            context.gap = node.itemSpacing;
        }

        return context;
    }

    /**
     * Extract component-specific context
     */
    extractComponentContext(node) {
        return {
            nodeType: 'component',
            componentId: node.componentId || null,
            componentSetId: node.componentSetId || null,
            isMainComponent: true,
            description: node.description || ''
        };
    }

    /**
     * Extract text-specific context
     */
    extractTextContext(node) {
        const context = {
            nodeType: 'text',
            content: node.characters || '',
            fontFamily: null,
            fontSize: null,
            fontWeight: null,
            textAlign: null,
            lineHeight: null,
            letterSpacing: null
        };

        // Extract text styling
        if (node.style) {
            context.fontFamily = node.style.fontFamily;
            context.fontSize = node.style.fontSize;
            context.fontWeight = node.style.fontWeight;
            context.textAlign = node.style.textAlignHorizontal;
            context.lineHeight = node.style.lineHeightPx;
            context.letterSpacing = node.style.letterSpacing;
        }

        // Extract fills (text color)
        if (node.fills && node.fills.length > 0) {
            const fill = node.fills.find(f => f.visible !== false);
            if (fill && fill.color) {
                context.color = this.rgbaToHex(fill.color);
            }
        }

        return context;
    }

    /**
     * Extract style-specific context
     */
    extractStyleContext(node) {
        const context = {
            nodeType: 'style'
        };

        // Extract fills
        if (node.fills) {
            context.fills = node.fills.map(fill => ({
                type: fill.type,
                color: fill.color ? this.rgbaToHex(fill.color) : null,
                opacity: fill.opacity || 1,
                visible: fill.visible !== false
            }));
        }

        // Extract strokes
        if (node.strokes) {
            context.strokes = node.strokes.map(stroke => ({
                type: stroke.type,
                color: stroke.color ? this.rgbaToHex(stroke.color) : null,
                opacity: stroke.opacity || 1
            }));
        }

        // Extract effects
        if (node.effects) {
            context.effects = node.effects.map(effect => ({
                type: effect.type,
                color: effect.color ? this.rgbaToHex(effect.color) : null,
                offset: effect.offset,
                radius: effect.radius,
                spread: effect.spread
            }));
        }

        return context;
    }

    /**
     * Extract vector-specific context
     */
    extractVectorContext(node) {
        return {
            nodeType: 'vector',
            strokeWeight: node.strokeWeight || 0,
            strokeAlign: node.strokeAlign || 'INSIDE',
            cornerRadius: node.cornerRadius || 0
        };
    }

    /**
     * Extract instance-specific context
     */
    extractInstanceContext(node) {
        return {
            nodeType: 'instance',
            componentId: node.componentId || null,
            isMainComponent: false,
            overrides: node.overrides || {}
        };
    }

    /**
     * Process styles from Figma response
     */
    processStyles(styles, context) {
        for (const [styleId, style] of Object.entries(styles)) {
            context.styles.push({
                id: styleId,
                name: style.name,
                type: style.styleType,
                description: style.description || ''
            });
        }
    }

    /**
     * Process components from Figma response  
     */
    processComponents(components, context) {
        for (const [componentId, component] of Object.entries(components)) {
            context.components.push({
                id: componentId,
                name: component.name,
                description: component.description || '',
                componentSetId: component.componentSetId || null
            });
        }
    }

    /**
     * Calculate confidence score based on extracted data
     */
    calculateConfidence(context) {
        let score = 0;
        
        // Base score for having nodes
        if (context.nodes.length > 0) score += 0.3;
        
        // Points for different types of content
        if (context.components.length > 0) score += 0.2;
        if (context.styles.length > 0) score += 0.15;
        if (context.nodes.some(n => n.nodeType === 'text')) score += 0.1;
        if (context.nodes.some(n => n.nodeType === 'frame')) score += 0.1;
        
        // Points for metadata
        if (context.metadata.fileName !== 'Unknown') score += 0.05;
        if (context.metadata.lastModified) score += 0.05;
        
        // Bonus for rich content
        if (context.nodes.length > 10) score += 0.05;
        
        return Math.min(1, Math.max(0, score));
    }

    /**
     * Check if node is significant enough to store separately
     */
    isSignificantNode(node) {
        const significantTypes = ['COMPONENT', 'FRAME', 'GROUP'];
        return significantTypes.includes(node.type) && 
               node.name && 
               !node.name.startsWith('_') &&
               node.visible !== false;
    }

    /**
     * Store individual node context
     */
    async storeNodeContext(fileKey, nodeId, nodeInfo) {
        try {
            await this.contextClient.storeContext(fileKey, nodeId, {
                node: nodeInfo,
                confidence: 0.8,
                extracted: new Date().toISOString()
            }, {
                source: 'node-extraction',
                type: 'individual-node'
            });
        } catch (error) {
            console.warn(`Failed to store node context for ${nodeId}:`, error);
        }
    }

    /**
     * Convert RGBA to hex color
     */
    rgbaToHex(rgba) {
        if (!rgba) return null;
        
        const r = Math.round((rgba.r || 0) * 255);
        const g = Math.round((rgba.g || 0) * 255);
        const b = Math.round((rgba.b || 0) * 255);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Process screenshot response and store metadata
     */
    async processScreenshotResponse(screenshotData, fileKey, nodeId = null) {
        try {
            const context = {
                screenshot: {
                    url: screenshotData.url || screenshotData.image,
                    format: screenshotData.format || 'png',
                    scale: screenshotData.scale || 1,
                    width: screenshotData.width,
                    height: screenshotData.height,
                    generated: new Date().toISOString()
                },
                confidence: 0.7,
                metadata: {
                    source: 'screenshot-capture',
                    nodeId: nodeId,
                    fileKey: fileKey
                }
            };

            await this.contextClient.storeContext(fileKey, nodeId, context, {
                source: 'screenshot',
                type: 'visual-capture'  
            });

            return { success: true, context };
        } catch (error) {
            console.error('Error processing screenshot response:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextProcessor;
}