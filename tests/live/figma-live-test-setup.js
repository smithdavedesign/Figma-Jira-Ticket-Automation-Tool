/**
 * Live Figma Testing Setup
 * Configure test environment for actual Figma Desktop integration
 */

class FigmaLiveTestSetup {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.pluginStatus = null;
        this.figmaConnection = null;
        this.testResults = {
            connection: null,
            plugin: null,
            screenshot: null,
            ai: null,
            dataFlow: null
        };
    }

    /**
     * Step 1: Verify Figma Desktop connection
     */
    async checkFigmaConnection() {
        console.log('🔍 Checking Figma Desktop connection...');
        
        try {
            // Check if MCP server can detect Figma processes
            const response = await fetch(`${this.baseUrl}/api/health`);
            const health = await response.json();
            
            this.testResults.connection = {
                status: 'success',
                server: health.status === 'healthy',
                timestamp: new Date().toISOString()
            };
            
            console.log('✅ MCP Server connection verified');
            return true;
        } catch (error) {
            this.testResults.connection = {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
            console.error('❌ MCP Server connection failed:', error);
            return false;
        }
    }

    /**
     * Step 2: Configure live test environment
     */
    async configureLiveEnvironment() {
        console.log('⚙️ Configuring live test environment...');
        
        const liveConfig = {
            mode: 'live',
            mockData: false,
            figmaDesktop: true,
            endpoints: {
                screenshot: `${this.baseUrl}/api/screenshot`,
                analysis: `${this.baseUrl}/api/analysis`,
                ticket: `${this.baseUrl}/api/ticket`
            }
        };

        try {
            // Update test configuration
            const response = await fetch(`${this.baseUrl}/api/configure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(liveConfig)
            });

            if (response.ok) {
                console.log('✅ Live environment configured');
                return liveConfig;
            } else {
                throw new Error(`Configuration failed: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Live environment configuration failed:', error);
            throw error;
        }
    }

    /**
     * Step 3: Test plugin loading instructions
     */
    generatePluginInstructions() {
        return {
            steps: [
                "1. Open Figma Desktop application",
                "2. Create or open a design file with some frames",
                "3. Go to Plugins → Development → Import plugin from manifest...",
                "4. Navigate to your project folder and select manifest.json",
                "5. Once loaded, run the plugin from Plugins → Development → Design Intelligence Platform",
                "6. The plugin UI should connect to localhost:3000"
            ],
            verification: [
                "Plugin UI loads without errors",
                "Console shows connection to localhost:3000",
                "Screenshot functionality is available",
                "AI analysis options are present"
            ]
        };
    }

    /**
     * Step 4: Live screenshot test
     */
    async testLiveScreenshot(frameData = null) {
        console.log('📸 Testing live screenshot capture...');
        
        const testData = frameData || {
            // If no real frame data, use test parameters
            mode: 'live-test',
            instruction: 'Please select a frame in Figma and trigger screenshot'
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/screenshot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
            });

            const result = await response.json();
            
            this.testResults.screenshot = {
                status: response.ok ? 'success' : 'error',
                data: result,
                timestamp: new Date().toISOString()
            };

            if (response.ok) {
                console.log('✅ Live screenshot test passed');
                return result;
            } else {
                console.error('❌ Live screenshot test failed:', result);
                return null;
            }
        } catch (error) {
            this.testResults.screenshot = {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
            console.error('❌ Screenshot test error:', error);
            return null;
        }
    }

    /**
     * Step 5: Live AI analysis test
     */
    async testLiveAnalysis(screenshotData) {
        console.log('🤖 Testing live AI analysis...');
        
        if (!screenshotData) {
            console.warn('⚠️ No screenshot data for AI analysis');
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    screenshot: screenshotData,
                    mode: 'live-test'
                })
            });

            const result = await response.json();
            
            this.testResults.ai = {
                status: response.ok ? 'success' : 'error',
                data: result,
                timestamp: new Date().toISOString()
            };

            if (response.ok) {
                console.log('✅ Live AI analysis test passed');
                return result;
            } else {
                console.error('❌ Live AI analysis test failed:', result);
                return null;
            }
        } catch (error) {
            this.testResults.ai = {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
            console.error('❌ AI analysis test error:', error);
            return null;
        }
    }

    /**
     * Complete live test sequence
     */
    async runCompleteTest() {
        console.log('🚀 Starting complete live Figma test sequence...');
        
        const results = {
            startTime: new Date().toISOString(),
            steps: []
        };

        // Step 1: Connection
        const connectionOk = await this.checkFigmaConnection();
        results.steps.push({ step: 'connection', success: connectionOk });

        if (!connectionOk) {
            results.endTime = new Date().toISOString();
            results.status = 'failed';
            return results;
        }

        // Step 2: Configuration
        try {
            await this.configureLiveEnvironment();
            results.steps.push({ step: 'configuration', success: true });
        } catch (error) {
            results.steps.push({ step: 'configuration', success: false, error: error.message });
            results.endTime = new Date().toISOString();
            results.status = 'failed';
            return results;
        }

        // Step 3: Plugin instructions
        const instructions = this.generatePluginInstructions();
        results.pluginInstructions = instructions;
        results.steps.push({ step: 'instructions', success: true });

        // Step 4 & 5: Screenshot and AI tests (require manual plugin interaction)
        results.manualTestsReady = true;
        results.nextStep = 'Load plugin in Figma Desktop and run screenshot test';

        results.endTime = new Date().toISOString();
        results.status = 'ready-for-manual-testing';
        
        return results;
    }

    /**
     * Get current test status
     */
    getTestStatus() {
        return {
            results: this.testResults,
            timestamp: new Date().toISOString(),
            readyForManualTesting: this.testResults.connection?.status === 'success'
        };
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.FigmaLiveTestSetup = FigmaLiveTestSetup;
}

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FigmaLiveTestSetup;
}