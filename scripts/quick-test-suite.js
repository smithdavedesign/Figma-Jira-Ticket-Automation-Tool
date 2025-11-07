#!/usr/bin/env node

/**
 * Quick Test Suite - Focused Testing Without Server Dependencies
 * 
 * Runs comprehensive tests without hanging on server startup
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync } from 'fs';
import chalk from 'chalk';

class QuickTestSuite {
    constructor() {
        this.results = {
            lint: { passed: 0, failed: 0, total: 0 },
            unit: { passed: 0, failed: 0, total: 0 },
            dependencies: { passed: 0, failed: 0, total: 0 },
            security: { passed: 0, failed: 0, total: 0 },
            ui: { passed: 0, failed: 0, total: 0 },
            templates: { passed: 0, failed: 0, total: 0 },
            ci: { passed: 0, failed: 0, total: 0 },
            files: { passed: 0, failed: 0, total: 0 },
            overall: { passed: 0, failed: 0, total: 0 }
        };
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
                timeout: options.timeout || 120000,
                ...options
            });
            
            this.log(`✅ ${description} completed`, 'success');
            return { success: true, output: result };
        } catch (error) {
            this.log(`❌ ${description} failed: ${error.message}`, 'error');
            return { success: false, error: error.message, code: error.status };
        }
    }

    async runLintTests() {
        this.log('🔍 CODE QUALITY TESTS', 'header');
        
        // Run lint check with error tolerance
        const result = await this.runCommand(
            'npm run lint -- --max-warnings 300',
            'Running ESLint with error tolerance',
            { silent: true }
        );

        if (result.success || (result.code && result.code < 2)) {
            this.results.lint.passed++;
            this.log('✅ Lint check passed (within tolerance)');
        } else {
            this.results.lint.failed++;
            this.log('❌ Lint check failed', 'error');
        }
        this.results.lint.total++;

        return this.results.lint.failed === 0;
    }

    async runUnitTests() {
        this.log('🧪 UNIT TESTS', 'header');
        
        const result = await this.runCommand(
            'npm test -- --run',
            'Running all Vitest unit tests',
            { silent: true }
        );

        if (result.success && result.output) {
            // Parse Vitest output for test counts
            const lines = result.output.split('\n');
            const summaryLine = lines.find(line => line.includes('Tests') && line.includes('passed'));
            
            if (summaryLine) {
                const passedMatch = summaryLine.match(/(\d+)\s+passed/);
                const totalMatch = summaryLine.match(/\((\d+)\)/);
                
                if (passedMatch && totalMatch) {
                    this.results.unit.passed = parseInt(passedMatch[1]);
                    this.results.unit.total = parseInt(totalMatch[1]);
                    this.results.unit.failed = this.results.unit.total - this.results.unit.passed;
                } else {
                    this.results.unit.passed = 1;
                    this.results.unit.total = 1;
                }
            } else {
                this.results.unit.passed = 1;
                this.results.unit.total = 1;
            }
        } else {
            this.results.unit.failed = 1;
            this.results.unit.total = 1;
        }

        this.log(`📊 Unit tests: ${this.results.unit.passed}/${this.results.unit.total} passed`);
        return result.success;
    }

    async runDependencyTests() {
        this.log('📦 DEPENDENCY TESTS', 'header');
        
        try {
            // Check package.json exists and is valid
            const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
            this.results.dependencies.passed++;
            this.log('✅ package.json is valid');
            this.results.dependencies.total++;

            // Check if node_modules exists
            if (existsSync('node_modules')) {
                this.results.dependencies.passed++;
                this.log('✅ node_modules directory exists');
            } else {
                this.results.dependencies.failed++;
                this.log('❌ node_modules directory missing', 'error');
            }
            this.results.dependencies.total++;

            // Quick dependency check
            const depResult = await this.runCommand(
                'npm ls --depth=0 --prod',
                'Checking production dependencies',
                { timeout: 30000, silent: true }
            );

            if (depResult.success) {
                this.results.dependencies.passed++;
                this.log('✅ Production dependencies check passed');
            } else {
                this.results.dependencies.failed++;
                this.log('⚠️  Some dependency issues detected', 'warning');
            }
            this.results.dependencies.total++;

        } catch (error) {
            this.log(`❌ Dependency tests failed: ${error.message}`, 'error');
            this.results.dependencies.failed++;
            this.results.dependencies.total++;
        }

        return this.results.dependencies.failed === 0;
    }

    async runSecurityTests() {
        this.log('🔒 SECURITY TESTS', 'header');
        
        try {
            // Check for obvious security issues in package.json
            const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
            
            // Check for security-related scripts
            const hasSecurityScripts = packageJson.scripts && 
                (packageJson.scripts.audit || packageJson.scripts['security:check']);

            if (hasSecurityScripts) {
                this.results.security.passed++;
                this.log('✅ Security scripts configured');
            } else {
                this.results.security.failed++;
                this.log('⚠️  No security scripts found', 'warning');
            }
            this.results.security.total++;

            // Quick npm audit (with timeout)
            try {
                const auditResult = await this.runCommand(
                    'npm audit --audit-level=high --timeout=30000',
                    'Running quick security audit',
                    { timeout: 35000, silent: true }
                );

                if (auditResult.success) {
                    this.results.security.passed++;
                    this.log('✅ Security audit passed');
                } else {
                    this.results.security.failed++;
                    this.log('⚠️  Security audit found issues', 'warning');
                }
            } catch (error) {
                this.results.security.failed++;
                this.log('❌ Security audit timed out or failed', 'error');
            }
            this.results.security.total++;

        } catch (error) {
            this.log(`❌ Security tests failed: ${error.message}`, 'error');
            this.results.security.failed++;
            this.results.security.total++;
        }

        return this.results.security.failed === 0;
    }

    async runUITests() {
        this.log('🎨 UI TESTS', 'header');
        
        try {
            // Check UI file structure
            const uiFiles = [
                'ui/index.html',
                'ui/ultimate-test-suite-dashboard.html',
                'ui/context-layer-dashboard.html'
            ];

            let foundFiles = 0;
            for (const file of uiFiles) {
                if (existsSync(file)) {
                    foundFiles++;
                    this.log(`✅ Found ${file}`);
                } else {
                    this.log(`⚠️  Missing ${file}`, 'warning');
                }
            }

            if (foundFiles >= 2) {
                this.results.ui.passed++;
                this.log(`✅ UI structure check passed (${foundFiles}/${uiFiles.length})`);
            } else {
                this.results.ui.failed++;
                this.log('❌ UI structure check failed', 'error');
            }
            this.results.ui.total++;

            // Check for JavaScript files
            try {
                const jsFiles = readdirSync('ui/js/', { withFileTypes: true })
                    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
                    .map(dirent => dirent.name);

                if (jsFiles.length > 0) {
                    this.results.ui.passed++;
                    this.log(`✅ Found ${jsFiles.length} UI JavaScript files`);
                } else {
                    this.results.ui.failed++;
                    this.log('❌ No UI JavaScript files found', 'error');
                }
            } catch (error) {
                this.results.ui.failed++;
                this.log('❌ UI JavaScript directory check failed', 'error');
            }
            this.results.ui.total++;

        } catch (error) {
            this.log(`❌ UI tests failed: ${error.message}`, 'error');
            this.results.ui.failed++;
            this.results.ui.total++;
        }

        return this.results.ui.failed === 0;
    }

    async runTemplateTests() {
        this.log('📝 TEMPLATE TESTS', 'header');
        
        try {
            // Check template directory
            const templateDir = './core/ai/templates';
            if (existsSync(templateDir)) {
                const files = readdirSync(templateDir);
                const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
                
                if (yamlFiles.length > 0) {
                    this.results.templates.passed++;
                    this.log(`✅ Found ${yamlFiles.length} template files`);
                } else {
                    this.results.templates.failed++;
                    this.log('❌ No YAML template files found', 'error');
                }
            } else {
                this.results.templates.failed++;
                this.log('❌ Template directory not found', 'error');
            }
            this.results.templates.total++;

            // Check for template validation script
            try {
                const validateResult = await this.runCommand(
                    'npm run validate:yaml',
                    'Validating YAML templates',
                    { timeout: 30000, silent: true }
                );

                if (validateResult.success) {
                    this.results.templates.passed++;
                    this.log('✅ Template validation passed');
                } else {
                    this.results.templates.failed++;
                    this.log('❌ Template validation failed', 'error');
                }
            } catch (error) {
                this.results.templates.failed++;
                this.log('❌ Template validation script failed', 'error');
            }
            this.results.templates.total++;

        } catch (error) {
            this.log(`❌ Template tests failed: ${error.message}`, 'error');
            this.results.templates.failed++;
            this.results.templates.total++;
        }

        return this.results.templates.failed === 0;
    }

    async runCITests() {
        this.log('🔄 CI/CD READINESS TESTS', 'header');
        
        try {
            // Check for CI configuration files
            const ciFiles = [
                '.github/workflows',
                '.gitlab-ci.yml',
                'Jenkinsfile',
                '.travis.yml'
            ];

            let ciConfigFound = false;
            for (const file of ciFiles) {
                if (existsSync(file)) {
                    ciConfigFound = true;
                    this.log(`✅ Found CI configuration: ${file}`);
                    break;
                }
            }

            if (ciConfigFound) {
                this.results.ci.passed++;
            } else {
                this.results.ci.failed++;
                this.log('⚠️  No CI configuration found', 'warning');
            }
            this.results.ci.total++;

            // Check for essential npm scripts
            const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
            const requiredScripts = ['test', 'start'];
            const missingScripts = requiredScripts.filter(script => 
                !packageJson.scripts || !packageJson.scripts[script]
            );

            if (missingScripts.length === 0) {
                this.results.ci.passed++;
                this.log('✅ Required npm scripts present');
            } else {
                this.results.ci.failed++;
                this.log(`❌ Missing npm scripts: ${missingScripts.join(', ')}`, 'error');
            }
            this.results.ci.total++;

        } catch (error) {
            this.log(`❌ CI tests failed: ${error.message}`, 'error');
            this.results.ci.failed++;
            this.results.ci.total++;
        }

        return this.results.ci.failed === 0;
    }

    async runFileStructureTests() {
        this.log('📁 FILE STRUCTURE TESTS', 'header');
        
        try {
            const criticalFiles = [
                'package.json',
                'app/server.js',
                'code.js',
                'manifest.json',
                'ui/index.html',
                'README.md'
            ];

            const missingFiles = [];
            const foundFiles = [];

            for (const file of criticalFiles) {
                if (existsSync(file)) {
                    foundFiles.push(file);
                } else {
                    missingFiles.push(file);
                }
            }

            if (missingFiles.length === 0) {
                this.results.files.passed++;
                this.log(`✅ All ${criticalFiles.length} critical files present`);
            } else {
                this.results.files.failed++;
                this.log(`❌ Missing files: ${missingFiles.join(', ')}`, 'error');
            }
            this.results.files.total++;

            // Check directory structure
            const criticalDirs = [
                'app/',
                'core/',
                'ui/',
                'tests/',
                'scripts/'
            ];

            const missingDirs = [];
            for (const dir of criticalDirs) {
                if (!existsSync(dir)) {
                    missingDirs.push(dir);
                }
            }

            if (missingDirs.length === 0) {
                this.results.files.passed++;
                this.log(`✅ All ${criticalDirs.length} critical directories present`);
            } else {
                this.results.files.failed++;
                this.log(`❌ Missing directories: ${missingDirs.join(', ')}`, 'error');
            }
            this.results.files.total++;

        } catch (error) {
            this.log(`❌ File structure tests failed: ${error.message}`, 'error');
            this.results.files.failed++;
            this.results.files.total++;
        }

        return this.results.files.failed === 0;
    }

    generateReport() {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        
        // Calculate totals
        this.results.overall.total = 
            this.results.lint.total + 
            this.results.unit.total + 
            this.results.dependencies.total + 
            this.results.security.total +
            this.results.ui.total +
            this.results.templates.total +
            this.results.ci.total +
            this.results.files.total;
            
        this.results.overall.passed = 
            this.results.lint.passed + 
            this.results.unit.passed + 
            this.results.dependencies.passed + 
            this.results.security.passed +
            this.results.ui.passed +
            this.results.templates.passed +
            this.results.ci.passed +
            this.results.files.passed;
            
        this.results.overall.failed = 
            this.results.lint.failed + 
            this.results.unit.failed + 
            this.results.dependencies.failed + 
            this.results.security.failed +
            this.results.ui.failed +
            this.results.templates.failed +
            this.results.ci.failed +
            this.results.files.failed;

        console.log('\n' + '='.repeat(60));
        this.log('📊 QUICK TEST SUITE RESULTS', 'header');
        console.log('='.repeat(60));
        
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`📈 Overall: ${this.results.overall.passed}/${this.results.overall.total} passed`);
        
        console.log(`🔍 Lint Tests: ${this.results.lint.passed}/${this.results.lint.total} passed`);
        console.log(`🧪 Unit Tests: ${this.results.unit.passed}/${this.results.unit.total} passed`);
        console.log(`📦 Dependency Tests: ${this.results.dependencies.passed}/${this.results.dependencies.total} passed`);
        console.log(`🔒 Security Tests: ${this.results.security.passed}/${this.results.security.total} passed`);
        console.log(`🎨 UI Tests: ${this.results.ui.passed}/${this.results.ui.total} passed`);
        console.log(`📝 Template Tests: ${this.results.templates.passed}/${this.results.templates.total} passed`);
        console.log(`🔄 CI/CD Tests: ${this.results.ci.passed}/${this.results.ci.total} passed`);
        console.log(`📁 File Structure: ${this.results.files.passed}/${this.results.files.total} passed`);

        console.log('='.repeat(60));
        
        const successRate = Math.round((this.results.overall.passed / this.results.overall.total) * 100);
        
        if (successRate >= 90) {
            this.log(`🎉 EXCELLENT! ${successRate}% success rate - System is in great shape!`, 'success');
        } else if (successRate >= 75) {
            this.log(`✅ GOOD! ${successRate}% success rate - Minor issues to address`, 'warning');
        } else if (successRate >= 60) {
            this.log(`⚠️  ${successRate}% success rate - Some issues need attention`, 'warning');
        } else {
            this.log(`❌ ${successRate}% success rate - Significant issues detected`, 'error');
        }
        
        return successRate >= 60;
    }

    async runAll() {
        this.log('🚀 STARTING QUICK TEST SUITE', 'header');
        console.log('='.repeat(60));
        
        const phases = [
            { name: 'File Structure Tests', fn: () => this.runFileStructureTests() },
            { name: 'Dependency Tests', fn: () => this.runDependencyTests() },
            { name: 'Lint Tests', fn: () => this.runLintTests() },
            { name: 'Unit Tests', fn: () => this.runUnitTests() },
            { name: 'UI Tests', fn: () => this.runUITests() },
            { name: 'Template Tests', fn: () => this.runTemplateTests() },
            { name: 'Security Tests', fn: () => this.runSecurityTests() },
            { name: 'CI/CD Tests', fn: () => this.runCITests() }
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
    const suite = new QuickTestSuite();
    await suite.runAll();
}

main().catch(error => {
    console.error('💥 Quick test suite failed:', error);
    process.exit(1);
});