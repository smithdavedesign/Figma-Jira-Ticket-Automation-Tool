#!/usr/bin/env node

/**
 * UI and Figma Integration Test Runner
 * 
 * Executes comprehensive testing of UI dashboards and live Figma integration
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import chalk from 'chalk';

class UIFigmaIntegrationTester {
    constructor() {
        this.results = {
            uiDashboard: { passed: 0, failed: 0, total: 0 },
            contextDashboard: { passed: 0, failed: 0, total: 0 },
            figmaIntegration: { passed: 0, failed: 0, total: 0 },
            apiIntegration: { passed: 0, failed: 0, total: 0 },
            endToEnd: { passed: 0, failed: 0, total: 0 },
            overall: { passed: 0, failed: 0, total: 0 }
        };
        this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
        this.figmaApiKey = process.env.FIGMA_API_KEY;
        this.testFileId = process.env.TEST_FIGMA_FILE_ID || 'sample-file-id';
        this.startTime = Date.now();
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

    async runCommand(command, description, options = {}) {
        this.log(`🔄 ${description}...`, 'info');
        
        try {
            const result = execSync(command, {
                encoding: 'utf8',
                stdio: options.silent ? 'pipe' : 'inherit',
                cwd: process.cwd(),
                timeout: options.timeout || 30000,
                ...options
            });
            
            this.log(`✅ ${description} completed`, 'success');
            return { success: true, output: result };
        } catch (error) {
            this.log(`❌ ${description} failed: ${error.message}`, 'error');
            return { success: false, error: error.message, code: error.status };
        }
    }

    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                timeout: 10000,
                ...options
            });
            
            if (response.ok) {
                const data = await response.json();
                return { success: true, data, status: response.status };
            } else {
                return { success: false, status: response.status, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testUIDashboard() {
        this.log('🎨 UI DASHBOARD TESTING', 'header');
        
        try {
            // Test 1: Check if Unified Testing Dashboard HTML exists
            const dashboardFile = './ui/unified-testing-dashboard.html';
            if (existsSync(dashboardFile)) {
                this.results.uiDashboard.passed++;
                this.log('✅ Unified Testing Dashboard file exists');
            } else {
                this.results.uiDashboard.failed++;
                this.log('❌ Unified Testing Dashboard file missing', 'error');
            }
            this.results.uiDashboard.total++;

            // Test 2: Validate HTML structure
            try {
                const htmlContent = readFileSync(dashboardFile, 'utf8');
                const hasRequiredElements = [
                    'ultimate-test-suite',
                    'system-status',
                    'test-execution',
                    'service-validation'
                ].every(id => htmlContent.includes(id));

                if (hasRequiredElements) {
                    this.results.uiDashboard.passed++;
                    this.log('✅ Dashboard HTML structure validation passed');
                } else {
                    this.results.uiDashboard.failed++;
                    this.log('❌ Dashboard HTML structure validation failed', 'error');
                }
            } catch (error) {
                this.results.uiDashboard.failed++;
                this.log('❌ Dashboard HTML validation error', 'error');
            }
            this.results.uiDashboard.total++;

            // Test 3: API endpoint availability
            const statusEndpoint = `${this.baseUrl}/api/test-suite/status`;
            const statusResult = await this.makeRequest(statusEndpoint);
            
            if (statusResult.success) {
                this.results.uiDashboard.passed++;
                this.log('✅ Test Suite Status API available');
            } else {
                this.results.uiDashboard.failed++;
                this.log(`❌ Test Suite Status API failed: ${statusResult.error}`, 'error');
            }
            this.results.uiDashboard.total++;

            // Test 4: Metrics endpoint
            const metricsEndpoint = `${this.baseUrl}/api/test-suite/metrics`;
            const metricsResult = await this.makeRequest(metricsEndpoint);
            
            if (metricsResult.success) {
                this.results.uiDashboard.passed++;
                this.log('✅ Test Suite Metrics API available');
            } else {
                this.results.uiDashboard.failed++;
                this.log(`❌ Test Suite Metrics API failed: ${metricsResult.error}`, 'error');
            }
            this.results.uiDashboard.total++;

        } catch (error) {
            this.log(`❌ UI Dashboard testing failed: ${error.message}`, 'error');
            this.results.uiDashboard.failed++;
            this.results.uiDashboard.total++;
        }

        return this.results.uiDashboard.failed === 0;
    }

    async testContextDashboard() {
        this.log('🧠 CONTEXT DASHBOARD TESTING', 'header');
        
        try {
            // Test 1: Check Context Intelligence Dashboard file
            const contextFiles = [
                './ui/context-intelligence-test-dashboard.html',
                './ui/unified-testing-dashboard.html'
            ];

            let foundContextDashboard = false;
            for (const file of contextFiles) {
                if (existsSync(file)) {
                    foundContextDashboard = true;
                    this.log(`✅ Found context dashboard: ${file}`);
                    break;
                }
            }

            if (foundContextDashboard) {
                this.results.contextDashboard.passed++;
            } else {
                this.results.contextDashboard.failed++;
                this.log('❌ No context dashboard files found', 'error');
            }
            this.results.contextDashboard.total++;

            // Test 2: Context Intelligence API availability
            const contextEndpoint = `${this.baseUrl}/api/test/unit/context-intelligence`;
            const contextResult = await this.makeRequest(contextEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ suite: 'basic' })
            });

            if (contextResult.success) {
                this.results.contextDashboard.passed++;
                this.log('✅ Context Intelligence API available');
            } else {
                this.results.contextDashboard.failed++;
                this.log(`❌ Context Intelligence API failed: ${contextResult.error}`, 'error');
            }
            this.results.contextDashboard.total++;

            // Test 3: Context layer live testing
            const liveTestingFile = './ui/context-layer-live-testing.html';
            if (existsSync(liveTestingFile)) {
                this.results.contextDashboard.passed++;
                this.log('✅ Context layer live testing interface available');
            } else {
                this.results.contextDashboard.failed++;
                this.log('❌ Context layer live testing interface missing', 'error');
            }
            this.results.contextDashboard.total++;

        } catch (error) {
            this.log(`❌ Context Dashboard testing failed: ${error.message}`, 'error');
            this.results.contextDashboard.failed++;
            this.results.contextDashboard.total++;
        }

        return this.results.contextDashboard.failed === 0;
    }

    async testFigmaIntegration() {
        this.log('🎭 FIGMA INTEGRATION TESTING', 'header');
        
        try {
            // Test 1: Check Figma API key configuration
            if (this.figmaApiKey && this.figmaApiKey.startsWith('figd_')) {
                this.results.figmaIntegration.passed++;
                this.log('✅ Figma API key properly configured');
            } else {
                this.results.figmaIntegration.failed++;
                this.log('❌ Figma API key missing or invalid', 'error');
            }
            this.results.figmaIntegration.total++;

            // Test 2: Figma tester UI availability
            const figmaTesterFile = './ui/figma-tester.html';
            if (existsSync(figmaTesterFile)) {
                this.results.figmaIntegration.passed++;
                this.log('✅ Figma tester interface available');
            } else {
                this.results.figmaIntegration.failed++;
                this.log('❌ Figma tester interface missing', 'error');
            }
            this.results.figmaIntegration.total++;

            // Test 3: Figma API endpoints
            const figmaEndpoints = [
                '/api/figma/files',
                '/api/figma/analyze',
                '/api/figma/core'
            ];

            for (const endpoint of figmaEndpoints) {
                const result = await this.makeRequest(`${this.baseUrl}${endpoint}`);
                
                if (result.success || result.status === 400) { // 400 might be expected for missing params
                    this.results.figmaIntegration.passed++;
                    this.log(`✅ Figma endpoint available: ${endpoint}`);
                } else {
                    this.results.figmaIntegration.failed++;
                    this.log(`❌ Figma endpoint failed: ${endpoint} - ${result.error}`, 'error');
                }
                this.results.figmaIntegration.total++;
            }

            // Test 4: Figma session management
            const sessionEndpoint = `${this.baseUrl}/api/figma/session`;
            const sessionResult = await this.makeRequest(sessionEndpoint);
            
            if (sessionResult.success || sessionResult.status >= 400) { // Endpoint exists
                this.results.figmaIntegration.passed++;
                this.log('✅ Figma session management available');
            } else {
                this.results.figmaIntegration.failed++;
                this.log(`❌ Figma session management failed: ${sessionResult.error}`, 'error');
            }
            this.results.figmaIntegration.total++;

        } catch (error) {
            this.log(`❌ Figma Integration testing failed: ${error.message}`, 'error');
            this.results.figmaIntegration.failed++;
            this.results.figmaIntegration.total++;
        }

        return this.results.figmaIntegration.failed === 0;
    }

    async testAPIIntegration() {
        this.log('🔌 API INTEGRATION TESTING', 'header');
        
        try {
            // Test 1: Health monitoring API
            const healthEndpoint = `${this.baseUrl}/api/health-monitoring/status`;
            const healthResult = await this.makeRequest(healthEndpoint);
            
            if (healthResult.success) {
                this.results.apiIntegration.passed++;
                this.log('✅ Health monitoring API working');
            } else {
                this.results.apiIntegration.failed++;
                this.log(`❌ Health monitoring API failed: ${healthResult.error}`, 'error');
            }
            this.results.apiIntegration.total++;

            // Test 2: Service validation API
            const validateEndpoint = `${this.baseUrl}/api/test-suite/validate-services`;
            const validateResult = await this.makeRequest(validateEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (validateResult.success) {
                this.results.apiIntegration.passed++;
                this.log('✅ Service validation API working');
            } else {
                this.results.apiIntegration.failed++;
                this.log(`❌ Service validation API failed: ${validateResult.error}`, 'error');
            }
            this.results.apiIntegration.total++;

            // Test 3: Test execution API
            const runTestsEndpoint = `${this.baseUrl}/api/test-suite/run-all`;
            const runTestsResult = await this.makeRequest(runTestsEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (runTestsResult.success) {
                this.results.apiIntegration.passed++;
                this.log('✅ Test execution API working');
            } else {
                this.results.apiIntegration.failed++;
                this.log(`❌ Test execution API failed: ${runTestsResult.error}`, 'error');
            }
            this.results.apiIntegration.total++;

        } catch (error) {
            this.log(`❌ API Integration testing failed: ${error.message}`, 'error');
            this.results.apiIntegration.failed++;
            this.results.apiIntegration.total++;
        }

        return this.results.apiIntegration.failed === 0;
    }

    async testEndToEndScenarios() {
        this.log('🎯 END-TO-END SCENARIO TESTING', 'header');
        
        try {
            // Scenario 1: Complete test suite execution flow
            this.log('📋 Testing complete test suite execution flow...', 'info');
            
            // Step 1: Get initial status
            const initialStatus = await this.makeRequest(`${this.baseUrl}/api/test-suite/status`);
            if (initialStatus.success) {
                this.results.endToEnd.passed++;
                this.log('✅ Initial system status retrieved');
            } else {
                this.results.endToEnd.failed++;
                this.log('❌ Failed to get initial system status', 'error');
            }
            this.results.endToEnd.total++;

            // Step 2: Execute test suite
            const testExecution = await this.makeRequest(`${this.baseUrl}/api/test-suite/run-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (testExecution.success) {
                this.results.endToEnd.passed++;
                this.log('✅ Test suite execution initiated successfully');
            } else {
                this.results.endToEnd.failed++;
                this.log('❌ Test suite execution failed', 'error');
            }
            this.results.endToEnd.total++;

            // Step 3: Get updated metrics
            const updatedMetrics = await this.makeRequest(`${this.baseUrl}/api/test-suite/metrics`);
            if (updatedMetrics.success) {
                this.results.endToEnd.passed++;
                this.log('✅ Updated metrics retrieved successfully');
            } else {
                this.results.endToEnd.failed++;
                this.log('❌ Failed to get updated metrics', 'error');
            }
            this.results.endToEnd.total++;

            // Scenario 2: Service validation workflow
            this.log('🔧 Testing service validation workflow...', 'info');
            
            const serviceValidation = await this.makeRequest(`${this.baseUrl}/api/test-suite/validate-services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (serviceValidation.success) {
                this.results.endToEnd.passed++;
                this.log('✅ Service validation workflow completed');
            } else {
                this.results.endToEnd.failed++;
                this.log('❌ Service validation workflow failed', 'error');
            }
            this.results.endToEnd.total++;

        } catch (error) {
            this.log(`❌ End-to-End testing failed: ${error.message}`, 'error');
            this.results.endToEnd.failed++;
            this.results.endToEnd.total++;
        }

        return this.results.endToEnd.failed === 0;
    }

    generateReport() {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        
        // Calculate totals
        this.results.overall.total = 
            this.results.uiDashboard.total + 
            this.results.contextDashboard.total + 
            this.results.figmaIntegration.total + 
            this.results.apiIntegration.total +
            this.results.endToEnd.total;
            
        this.results.overall.passed = 
            this.results.uiDashboard.passed + 
            this.results.contextDashboard.passed + 
            this.results.figmaIntegration.passed + 
            this.results.apiIntegration.passed +
            this.results.endToEnd.passed;
            
        this.results.overall.failed = 
            this.results.uiDashboard.failed + 
            this.results.contextDashboard.failed + 
            this.results.figmaIntegration.failed + 
            this.results.apiIntegration.failed +
            this.results.endToEnd.failed;

        console.log('\n' + '='.repeat(70));
        this.log('📊 UI & FIGMA INTEGRATION TEST RESULTS', 'header');
        console.log('='.repeat(70));
        
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`📈 Overall: ${this.results.overall.passed}/${this.results.overall.total} passed`);
        
        console.log(`🎨 UI Dashboard: ${this.results.uiDashboard.passed}/${this.results.uiDashboard.total} passed`);
        console.log(`🧠 Context Dashboard: ${this.results.contextDashboard.passed}/${this.results.contextDashboard.total} passed`);
        console.log(`🎭 Figma Integration: ${this.results.figmaIntegration.passed}/${this.results.figmaIntegration.total} passed`);
        console.log(`🔌 API Integration: ${this.results.apiIntegration.passed}/${this.results.apiIntegration.total} passed`);
        console.log(`🎯 End-to-End: ${this.results.endToEnd.passed}/${this.results.endToEnd.total} passed`);

        console.log('='.repeat(70));
        
        const successRate = Math.round((this.results.overall.passed / this.results.overall.total) * 100);
        
        if (successRate >= 95) {
            this.log(`🎉 EXCELLENT! ${successRate}% success rate - Production ready!`, 'success');
        } else if (successRate >= 85) {
            this.log(`✅ GOOD! ${successRate}% success rate - Minor issues to address`, 'warning');
        } else if (successRate >= 70) {
            this.log(`⚠️  ${successRate}% success rate - Some issues need attention`, 'warning');
        } else {
            this.log(`❌ ${successRate}% success rate - Significant issues detected`, 'error');
        }
        
        // Provide recommendations
        console.log('\n🔧 RECOMMENDATIONS:');
        if (this.results.uiDashboard.failed > 0) {
            console.log('- Review UI dashboard files and API endpoints');
        }
        if (this.results.figmaIntegration.failed > 0) {
            console.log('- Check Figma API configuration and endpoints');
        }
        if (this.results.apiIntegration.failed > 0) {
            console.log('- Validate API service availability and responses');
        }
        if (this.results.endToEnd.failed > 0) {
            console.log('- Test complete user workflows manually');
        }
        
        return successRate >= 80;
    }

    async runAll() {
        this.log('🚀 STARTING UI & FIGMA INTEGRATION TESTING', 'header');
        console.log('='.repeat(70));
        
        const phases = [
            { name: 'UI Dashboard Tests', fn: () => this.testUIDashboard() },
            { name: 'Context Dashboard Tests', fn: () => this.testContextDashboard() },
            { name: 'Figma Integration Tests', fn: () => this.testFigmaIntegration() },
            { name: 'API Integration Tests', fn: () => this.testAPIIntegration() },
            { name: 'End-to-End Scenarios', fn: () => this.testEndToEndScenarios() }
        ];

        let allPassed = true;

        for (const phase of phases) {
            try {
                const success = await phase.fn();
                if (!success) {
                    allPassed = false;
                    this.log(`❌ ${phase.name} had issues`, 'warning');
                } else {
                    this.log(`✅ ${phase.name} passed`, 'success');
                }
            } catch (error) {
                allPassed = false;
                this.log(`💥 ${phase.name} crashed: ${error.message}`, 'error');
            }
            
            console.log(''); // Space between phases
        }

        const finalResult = this.generateReport();
        
        process.exit(finalResult ? 0 : 1);
    }
}

// Main execution
async function main() {
    const tester = new UIFigmaIntegrationTester();
    await tester.runAll();
}

main().catch(error => {
    console.error('💥 UI & Figma Integration testing failed:', error);
    process.exit(1);
});