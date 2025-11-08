#!/usr/bin/env node

/**
 * Test Server Launcher
 * 
 * Launches the server for UI and Figma integration testing
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import chalk from 'chalk';

class TestServerLauncher {
    constructor() {
        this.serverProcess = null;
        this.isServerReady = false;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const colors = {
            info: chalk.blue,
            success: chalk.green,
            warning: chalk.yellow,
            error: chalk.red,
            header: chalk.cyan.bold
        };
        console.log(`${chalk.gray(timestamp)} ${colors[type](message)}`);
    }

    async startServer() {
        this.log('🚀 STARTING TEST SERVER', 'header');

        try {
            // Check if server file exists
            if (!existsSync('./app/server.js')) {
                throw new Error('Server file not found: ./app/server.js');
            }

            // Kill any existing processes on port 3000
            try {
                const { execSync } = await import('child_process');
                execSync('lsof -ti:3000 | xargs kill -9', { stdio: 'ignore' });
                await new Promise(resolve => setTimeout(resolve, 2000));
                this.log('🔧 Cleaned up existing processes on port 3000', 'info');
            } catch (error) {
                // No processes to kill, which is fine
            }

            // Start the server
            this.serverProcess = spawn('node', ['app/server.js'], {
                stdio: 'pipe',
                detached: false,
                env: { 
                    ...process.env, 
                    NODE_ENV: 'test',
                    PORT: '3000'
                }
            });

            let serverOutput = '';
            
            this.serverProcess.stdout.on('data', (data) => {
                const output = data.toString();
                serverOutput += output;
                
                // Log server output with proper formatting
                output.split('\n').forEach(line => {
                    if (line.trim()) {
                        this.log(`📟 ${line.trim()}`, 'info');
                    }
                });

                // Check for server ready indicators
                if (output.includes('Server running on') || 
                    output.includes('Server is listening') ||
                    output.includes('🚀 Server started') ||
                    output.includes('Application started')) {
                    this.isServerReady = true;
                }
            });

            this.serverProcess.stderr.on('data', (data) => {
                const error = data.toString();
                this.log(`⚠️  ${error.trim()}`, 'warning');
            });

            this.serverProcess.on('error', (error) => {
                this.log(`❌ Server process error: ${error.message}`, 'error');
            });

            this.serverProcess.on('exit', (code) => {
                this.log(`🛑 Server process exited with code: ${code}`, code === 0 ? 'info' : 'error');
            });

            // Wait for server to be ready
            this.log('⏳ Waiting for server to start...', 'info');
            
            const maxWaitTime = 30000; // 30 seconds
            const checkInterval = 500; // 500ms
            let waitTime = 0;

            while (!this.isServerReady && waitTime < maxWaitTime) {
                await new Promise(resolve => setTimeout(resolve, checkInterval));
                waitTime += checkInterval;

                // Also check via HTTP request
                if (!this.isServerReady) {
                    try {
                        const response = await fetch('http://localhost:3000/api/health', {
                            method: 'GET',
                            timeout: 2000
                        });
                        if (response.ok) {
                            this.isServerReady = true;
                        }
                    } catch (error) {
                        // Server not ready yet
                    }
                }
            }

            if (this.isServerReady) {
                this.log('✅ Server is ready for testing!', 'success');
                this.log('🌐 Server available at: http://localhost:3000', 'info');
                this.log('🎯 Unified Testing Dashboard: http://localhost:3000/ui/unified-testing-dashboard.html', 'info');
                this.log('🎭 Figma Tester: http://localhost:3000/ui/figma-tester.html', 'info');
                return true;
            } else {
                throw new Error('Server failed to start within 30 seconds');
            }

        } catch (error) {
            this.log(`❌ Failed to start server: ${error.message}`, 'error');
            return false;
        }
    }

    async stopServer() {
        if (this.serverProcess) {
            this.log('🛑 Stopping test server...', 'info');
            this.serverProcess.kill('SIGTERM');
            
            // Wait a bit for graceful shutdown
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Force kill if still running
            if (!this.serverProcess.killed) {
                this.serverProcess.kill('SIGKILL');
            }
            
            this.log('✅ Server stopped', 'success');
        }
    }

    async runWithServer(testFunction) {
        const serverStarted = await this.startServer();
        
        if (!serverStarted) {
            process.exit(1);
        }

        try {
            // Run the test function
            if (testFunction) {
                await testFunction();
            } else {
                // Keep server running for manual testing
                this.log('🔄 Server running. Press Ctrl+C to stop.', 'info');
                
                // Handle graceful shutdown
                process.on('SIGINT', async () => {
                    this.log('🛑 Received shutdown signal...', 'info');
                    await this.stopServer();
                    process.exit(0);
                });

                // Keep the process alive
                await new Promise(() => {}); // Never resolves
            }
        } finally {
            await this.stopServer();
        }
    }
}

// Main execution
async function main() {
    const launcher = new TestServerLauncher();
    const command = process.argv[2];

    switch (command) {
    case 'start':
        // Just start and keep running
        await launcher.runWithServer();
        break;
        
    case 'test':
        // Start server and run UI/Figma tests
        await launcher.runWithServer(async () => {
            const { UIFigmaIntegrationTester } = await import('./test-ui-figma-integration.js');
            const tester = new UIFigmaIntegrationTester();
            await tester.runAll();
        });
        break;
        
    case 'quick':
        // Start server and run a quick validation
        await launcher.runWithServer(async () => {
            launcher.log('🔍 Running quick server validation...', 'info');
            
            const endpoints = [
                'http://localhost:3000/api/test-suite/status',
                'http://localhost:3000/api/test-suite/metrics',
                'http://localhost:3000/ui/unified-testing-dashboard.html'
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, { timeout: 5000 });
                    if (response.ok) {
                        launcher.log(`✅ ${endpoint} - OK`, 'success');
                    } else {
                        launcher.log(`❌ ${endpoint} - ${response.status}`, 'error');
                    }
                } catch (error) {
                    launcher.log(`❌ ${endpoint} - ${error.message}`, 'error');
                }
            }
        });
        break;
        
    default:
        console.log(`
🎯 Test Server Launcher

Usage:
  node scripts/test-server-launcher.js [command]

Commands:
  start    Start server and keep running (for manual testing)
  test     Start server and run UI/Figma integration tests
  quick    Start server and run quick validation
  
Examples:
  node scripts/test-server-launcher.js start
  node scripts/test-server-launcher.js test
  node scripts/test-server-launcher.js quick
        `);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('💥 Test server launcher failed:', error);
    process.exit(1);
});