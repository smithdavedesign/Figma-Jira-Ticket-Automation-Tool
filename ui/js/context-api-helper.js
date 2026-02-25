/**
 * Context Layer API Helper
 * Simplified interface for populating context layer from API responses
 */

class ContextAPIHelper {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.contextClient = new ContextLayerClient(baseUrl);
        this.processor = new ContextProcessor(this.contextClient);
    }

    /**
     * Process Figma file and populate context layer
     */
    async processFigmaFile(fileKey, options = {}) {
        try {
            console.log(`Processing Figma file: ${fileKey}`);
            
            // Fetch file data from Figma API
            const response = await fetch(`${this.baseUrl}/api/figma/file/${fileKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            }

            const fileData = await response.json();
            
            if (!fileData.success || !fileData.data) {
                throw new Error('Invalid file response');
            }

            // Process and store context
            const result = await this.processor.processFileResponse(fileData.data, fileKey);
            
            return {
                success: true,
                fileKey,
                processed: result.success,
                context: result.context,
                confidence: result.context?.confidence || 0,
                message: `File ${fileKey} processed and context stored`
            };

        } catch (error) {
            console.error(`Error processing Figma file ${fileKey}:`, error);
            return {
                success: false,
                fileKey,
                error: error.message
            };
        }
    }

    /**
     * Capture screenshot and populate context layer
     */
    async captureAndProcessScreenshot(fileKey, nodeId = null, options = {}) {
        try {
            console.log(`Capturing screenshot for file: ${fileKey}, node: ${nodeId}`);
            
            const requestBody = {
                fileKey,
                nodeId,
                format: options.format || 'png',
                scale: options.scale || 1
            };

            const response = await fetch(`${this.baseUrl}/api/figma/screenshot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Screenshot failed: ${response.status} ${response.statusText}`);
            }

            const screenshotData = await response.json();
            
            if (!screenshotData.success) {
                throw new Error(screenshotData.message || 'Screenshot capture failed');
            }

            // Process screenshot and store context
            const result = await this.processor.processScreenshotResponse(
                screenshotData.data, 
                fileKey, 
                nodeId
            );

            return {
                success: true,
                fileKey,
                nodeId,
                screenshot: screenshotData.data,
                context: result.context,
                message: `Screenshot captured and context stored`
            };

        } catch (error) {
            console.error(`Error capturing screenshot:`, error);
            return {
                success: false,
                fileKey,
                nodeId,
                error: error.message
            };
        }
    }

    /**
     * Get enriched context data (combines stored context with live API data)
     */
    async getEnrichedContext(fileKey, nodeId = null) {
        try {
            console.log(`Getting enriched context for ${fileKey}:${nodeId || 'file'}`);
            
            // Get stored context
            const storedContext = await this.contextClient.getContext(fileKey, nodeId);
            
            // If no stored context, process file first
            if (!storedContext.success || !storedContext.data) {
                console.log('No stored context found, processing file...');
                const processResult = await this.processFigmaFile(fileKey);
                if (!processResult.success) {
                    throw new Error(processResult.error);
                }
                return await this.contextClient.getContext(fileKey, nodeId);
            }

            // Check if context is stale (older than 1 hour)
            const contextAge = Date.now() - new Date(storedContext.data.timestamp).getTime();
            const isStale = contextAge > (60 * 60 * 1000); // 1 hour

            if (isStale) {
                console.log('Context is stale, refreshing...');
                await this.processFigmaFile(fileKey);
                return await this.contextClient.getContext(fileKey, nodeId);
            }

            return storedContext;

        } catch (error) {
            console.error(`Error getting enriched context:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Batch process multiple files
     */
    async processBatch(fileKeys, options = {}) {
        const results = [];
        const maxConcurrent = options.maxConcurrent || 3;
        
        console.log(`Processing batch of ${fileKeys.length} files (max ${maxConcurrent} concurrent)`);

        // Process in chunks to avoid overwhelming the API
        for (let i = 0; i < fileKeys.length; i += maxConcurrent) {
            const chunk = fileKeys.slice(i, i + maxConcurrent);
            const chunkPromises = chunk.map(fileKey => this.processFigmaFile(fileKey, options));
            
            const chunkResults = await Promise.allSettled(chunkPromises);
            
            chunkResults.forEach((result, index) => {
                const fileKey = chunk[index];
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    results.push({
                        success: false,
                        fileKey,
                        error: result.reason?.message || 'Unknown error'
                    });
                }
            });

            // Brief pause between chunks
            if (i + maxConcurrent < fileKeys.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        const successful = results.filter(r => r.success).length;
        console.log(`Batch processing complete: ${successful}/${fileKeys.length} successful`);

        return {
            success: true,
            total: fileKeys.length,
            successful,
            failed: fileKeys.length - successful,
            results
        };
    }

    /**
     * Search context with live data fallback
     */
    async searchWithFallback(query, options = {}) {
        try {
            // First try stored context search
            const searchResult = await this.contextClient.searchContext(query, options);
            
            if (searchResult.success && searchResult.data.totalResults > 0) {
                return searchResult;
            }

            // If no results and fallback enabled, suggest processing files
            if (options.suggestProcessing !== false) {
                return {
                    success: true,
                    data: {
                        query,
                        totalResults: 0,
                        results: [],
                        suggestion: 'No context found. Consider processing your Figma files first.',
                        processingHelper: 'Use processFigmaFile(fileKey) to populate context data'
                    }
                };
            }

            return searchResult;

        } catch (error) {
            console.error('Error in context search with fallback:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Health check for context layer integration
     */
    async healthCheck() {
        try {
            const health = await fetch(`${this.baseUrl}/api/health`);
            const healthData = await health.json();
            
            const contextHealth = await this.contextClient.validateConnection();
            
            return {
                success: true,
                server: healthData,
                contextLayer: contextHealth,
                processor: 'available',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get context summary for a file
     */
    async getContextSummary(fileKey) {
        try {
            const response = await fetch(`${this.baseUrl}/api/figma/context-summary/${fileKey}`);
            
            if (!response.ok) {
                throw new Error(`Failed to get context summary: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error(`Error getting context summary for ${fileKey}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Quick setup method for new users
     */
    async quickSetup(fileKey) {
        try {
            console.log(`Quick setup for file: ${fileKey}`);
            
            // Step 1: Process file
            console.log('Step 1: Processing Figma file...');
            const fileResult = await this.processFigmaFile(fileKey);
            
            if (!fileResult.success) {
                throw new Error(`File processing failed: ${fileResult.error}`);
            }

            // Step 2: Capture screenshot
            console.log('Step 2: Capturing screenshot...');
            const screenshotResult = await this.captureAndProcessScreenshot(fileKey);

            // Step 3: Get context summary
            console.log('Step 3: Getting context summary...');
            const summaryResult = await this.getContextSummary(fileKey);

            return {
                success: true,
                fileKey,
                steps: {
                    fileProcessed: fileResult.success,
                    screenshotCaptured: screenshotResult.success,
                    summaryGenerated: summaryResult.success
                },
                context: fileResult.context,
                summary: summaryResult.data,
                message: `Quick setup complete for ${fileKey}`
            };

        } catch (error) {
            console.error(`Quick setup failed:`, error);
            return {
                success: false,
                fileKey,
                error: error.message
            };
        }
    }
}

// Initialize global helper instance
window.contextHelper = new ContextAPIHelper();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextAPIHelper;
}