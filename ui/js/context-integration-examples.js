/**
 * Context Layer Integration Example
 * Demonstrates how to use the context layer helpers in practice
 */

// Example usage of the Context Layer API Helper
async function demonstrateContextLayerUsage() {
    console.log('=== Context Layer Integration Demo ===');
    
    // Initialize the helper (this is done globally in the browser)
    const contextHelper = new ContextAPIHelper('http://localhost:3000');
    
    // Example 1: Process a Figma file and extract context
    console.log('\n1. Processing Figma file...');
    try {
        const fileKey = 'sample-file-key'; // Replace with real Figma file key
        const processResult = await contextHelper.processFigmaFile(fileKey);
        
        if (processResult.success) {
            console.log(`✓ File processed successfully`);
            console.log(`  - Confidence: ${(processResult.confidence * 100).toFixed(1)}%`);
            console.log(`  - Nodes found: ${processResult.context?.nodes?.length || 0}`);
            console.log(`  - Components: ${processResult.context?.components?.length || 0}`);
        } else {
            console.log(`✗ Processing failed: ${processResult.error}`);
        }
    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
    }
    
    // Example 2: Get enriched context (with caching and freshness checks)
    console.log('\n2. Getting enriched context...');
    try {
        const fileKey = 'sample-file-key';
        const contextResult = await contextHelper.getEnrichedContext(fileKey);
        
        if (contextResult.success) {
            console.log(`✓ Context retrieved`);
            console.log(`  - Cached: ${contextResult.data.cached ? 'Yes' : 'No'}`);
            console.log(`  - Last updated: ${contextResult.data.timestamp}`);
        } else {
            console.log(`✗ Context retrieval failed: ${contextResult.error}`);
        }
    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
    }
    
    // Example 3: Capture screenshot and store visual context
    console.log('\n3. Capturing screenshot...');
    try {
        const fileKey = 'sample-file-key';
        const screenshotResult = await contextHelper.captureAndProcessScreenshot(fileKey, null, {
            format: 'png',
            scale: 2
        });
        
        if (screenshotResult.success) {
            console.log(`✓ Screenshot captured`);
            console.log(`  - Image URL: ${screenshotResult.screenshot?.url || 'Generated'}`);
            console.log(`  - Context stored: Yes`);
        } else {
            console.log(`✗ Screenshot failed: ${screenshotResult.error}`);
        }
    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
    }
    
    // Example 4: Search context data
    console.log('\n4. Searching context...');
    try {
        const searchResult = await contextHelper.searchWithFallback('button', {
            type: 'component',
            maxResults: 10
        });
        
        if (searchResult.success) {
            console.log(`✓ Search completed`);
            console.log(`  - Results found: ${searchResult.data.totalResults}`);
            
            if (searchResult.data.results) {
                searchResult.data.results.forEach((result, index) => {
                    console.log(`    ${index + 1}. ${result.fileKey} (${(result.score * 100).toFixed(1)}%)`);
                });
            }
            
            if (searchResult.data.suggestion) {
                console.log(`  - Suggestion: ${searchResult.data.suggestion}`);
            }
        } else {
            console.log(`✗ Search failed: ${searchResult.error}`);
        }
    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
    }
    
    // Example 5: Batch processing
    console.log('\n5. Batch processing example...');
    try {
        const fileKeys = ['file1', 'file2', 'file3']; // Replace with real file keys
        const batchResult = await contextHelper.processBatch(fileKeys, {
            maxConcurrent: 2
        });
        
        console.log(`✓ Batch processing completed`);
        console.log(`  - Total files: ${batchResult.total}`);
        console.log(`  - Successful: ${batchResult.successful}`);
        console.log(`  - Failed: ${batchResult.failed}`);
        
        // Show results breakdown
        batchResult.results.forEach((result, index) => {
            const status = result.success ? '✓' : '✗';
            console.log(`    ${status} ${result.fileKey}: ${result.success ? 'OK' : result.error}`);
        });
        
    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
    }
    
    // Example 6: Quick setup for new files
    console.log('\n6. Quick setup example...');
    try {
        const fileKey = 'new-file-key'; // Replace with real file key
        const quickResult = await contextHelper.quickSetup(fileKey);
        
        if (quickResult.success) {
            console.log(`✓ Quick setup completed for ${fileKey}`);
            console.log(`  - File processed: ${quickResult.steps.fileProcessed ? '✓' : '✗'}`);
            console.log(`  - Screenshot captured: ${quickResult.steps.screenshotCaptured ? '✓' : '✗'}`);
            console.log(`  - Summary generated: ${quickResult.steps.summaryGenerated ? '✓' : '✗'}`);
        } else {
            console.log(`✗ Quick setup failed: ${quickResult.error}`);
        }
    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
    }
    
    console.log('\n=== Demo Complete ===');
}

// Example integration with existing UI workflows
class FigmaContextIntegration {
    constructor() {
        this.contextHelper = new ContextAPIHelper();
    }
    
    /**
     * Enhanced file processing with context layer integration
     */
    async processFileWithContext(fileKey) {
        try {
            // Step 1: Process file and extract context
            const processResult = await this.contextHelper.processFigmaFile(fileKey);
            
            if (!processResult.success) {
                throw new Error(`File processing failed: ${processResult.error}`);
            }
            
            // Step 2: Get context summary for UI display
            const summaryResult = await this.contextHelper.getContextSummary(fileKey);
            
            // Step 3: Return enriched data for UI
            return {
                success: true,
                fileKey,
                processing: processResult,
                summary: summaryResult.success ? summaryResult.data : null,
                confidence: processResult.confidence,
                metadata: {
                    nodes: processResult.context?.nodes?.length || 0,
                    components: processResult.context?.components?.length || 0,
                    styles: processResult.context?.styles?.length || 0,
                    processed: new Date().toISOString()
                }
            };
            
        } catch (error) {
            return {
                success: false,
                fileKey,
                error: error.message
            };
        }
    }
    
    /**
     * Enhanced screenshot capture with context awareness
     */
    async captureContextAwareScreenshot(fileKey, nodeId = null, options = {}) {
        try {
            // Check if we have context for this file/node
            const existingContext = await this.contextHelper.getEnrichedContext(fileKey);
            
            // Use context to optimize screenshot parameters
            let enhancedOptions = { ...options };
            
            if (existingContext.success && existingContext.data.context) {
                const context = existingContext.data.context;
                
                // Adjust scale based on content complexity
                if (!options.scale) {
                    const nodeCount = context.nodes?.length || 0;
                    enhancedOptions.scale = nodeCount > 50 ? 1 : 2; // Lower scale for complex files
                }
                
                // Suggest format based on content type
                if (!options.format) {
                    const hasVectors = context.nodes?.some(n => n.nodeType === 'vector');
                    enhancedOptions.format = hasVectors ? 'svg' : 'png';
                }
            }
            
            // Capture screenshot with enhanced options
            const screenshotResult = await this.contextHelper.captureAndProcessScreenshot(
                fileKey, 
                nodeId, 
                enhancedOptions
            );
            
            return {
                success: screenshotResult.success,
                fileKey,
                nodeId,
                screenshot: screenshotResult.screenshot,
                contextEnhanced: existingContext.success,
                options: enhancedOptions,
                error: screenshotResult.error
            };
            
        } catch (error) {
            return {
                success: false,
                fileKey,
                nodeId,
                error: error.message
            };
        }
    }
    
    /**
     * Smart search with context enrichment
     */
    async smartSearch(query, options = {}) {
        try {
            // Perform context search
            const searchResult = await this.contextHelper.searchWithFallback(query, options);
            
            if (!searchResult.success) {
                throw new Error(searchResult.error);
            }
            
            // Enrich results with additional context
            const enrichedResults = [];
            
            for (const result of searchResult.data.results || []) {
                try {
                    const contextData = await this.contextHelper.getEnrichedContext(result.fileKey);
                    
                    enrichedResults.push({
                        ...result,
                        enrichedContext: contextData.success ? contextData.data : null,
                        confidence: contextData.success ? contextData.data.context?.confidence : result.score
                    });
                    
                } catch (error) {
                    // Include result even if enrichment fails
                    enrichedResults.push({
                        ...result,
                        enrichmentError: error.message
                    });
                }
            }
            
            return {
                success: true,
                query,
                totalResults: searchResult.data.totalResults,
                results: enrichedResults,
                suggestion: searchResult.data.suggestion,
                enriched: true
            };
            
        } catch (error) {
            return {
                success: false,
                query,
                error: error.message
            };
        }
    }
}

// Usage examples for different scenarios
const examples = {
    
    // Example 1: Basic file processing
    basicProcessing: async (fileKey) => {
        const helper = new ContextAPIHelper();
        return await helper.processFigmaFile(fileKey);
    },
    
    // Example 2: UI integration
    uiIntegration: async (fileKey) => {
        const integration = new FigmaContextIntegration();
        return await integration.processFileWithContext(fileKey);
    },
    
    // Example 3: Batch operations
    batchOperations: async (fileKeys) => {
        const helper = new ContextAPIHelper();
        return await helper.processBatch(fileKeys, { maxConcurrent: 3 });
    },
    
    // Example 4: Context-aware screenshots
    contextScreenshots: async (fileKey, nodeId) => {
        const integration = new FigmaContextIntegration();
        return await integration.captureContextAwareScreenshot(fileKey, nodeId);
    },
    
    // Example 5: Smart search
    smartSearch: async (query) => {
        const integration = new FigmaContextIntegration();
        return await integration.smartSearch(query, { type: 'component' });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        demonstrateContextLayerUsage,
        FigmaContextIntegration,
        examples
    };
}

// Auto-run demo if in browser environment
if (typeof window !== 'undefined') {
    console.log('Context Layer Integration Examples loaded');
    console.log('Run demonstrateContextLayerUsage() to see the demo');
    console.log('Use examples.basicProcessing("fileKey") for quick tests');
}