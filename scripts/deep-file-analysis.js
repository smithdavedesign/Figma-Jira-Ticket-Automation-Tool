#!/usr/bin/env node

/**
 * Deep File Analysis Script
 * Analyzes all project files to identify unused files, dependencies, and optimization opportunities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Files and directories to ignore
const IGNORE_PATTERNS = [
    'node_modules',
    '.git',
    '.vscode',
    'logs',
    'coverage',
    'dist',
    'build'
];

// Track all files and their usage
const fileRegistry = new Map();
const importGraph = new Map();
const exportGraph = new Map();

/**
 * Recursively find all JavaScript and TypeScript files
 */
function findAllFiles(dir) {
    const files = [];
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (IGNORE_PATTERNS.some(pattern => entry.name.includes(pattern))) {
                continue;
            }
            
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                files.push(...findAllFiles(fullPath));
            } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.mjs'))) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.warn(`Cannot read directory ${dir}: ${error.message}`);
    }
    
    return files;
}

/**
 * Parse a file to extract imports and exports
 */
function parseFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(projectRoot, filePath);
        
        const fileInfo = {
            path: filePath,
            relativePath,
            size: content.length,
            imports: [],
            exports: [],
            isUsed: false,
            isEntry: false,
            hasTests: false,
            category: categorizeFile(relativePath)
        };
        
        // Extract imports (ES6 and CommonJS)
        const importRegex = /(?:import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]|require\s*\(\s*['"`]([^'"`]+)['"`]\))/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1] || match[2];
            if (importPath.startsWith('.')) {
                fileInfo.imports.push(resolveImportPath(filePath, importPath));
            }
        }
        
        // Extract exports
        const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)|module\.exports\s*=|exports\.(\w+)/g;
        while ((match = exportRegex.exec(content)) !== null) {
            const exportName = match[1] || match[2] || 'default';
            fileInfo.exports.push(exportName);
        }
        
        // Check if it's an entry point
        fileInfo.isEntry = isEntryPoint(relativePath, content);
        
        // Check if it has tests
        fileInfo.hasTests = hasTestFiles(relativePath);
        
        return fileInfo;
    } catch (error) {
        console.warn(`Cannot parse file ${filePath}: ${error.message}`);
        return null;
    }
}

/**
 * Resolve relative import path to absolute
 */
function resolveImportPath(fromFile, importPath) {
    const dir = path.dirname(fromFile);
    let resolved = path.resolve(dir, importPath);
    
    // Try common extensions
    const extensions = ['.js', '.ts', '.mjs'];
    for (const ext of extensions) {
        if (fs.existsSync(resolved + ext)) {
            return resolved + ext;
        }
    }
    
    // Try index files
    for (const ext of extensions) {
        const indexPath = path.join(resolved, 'index' + ext);
        if (fs.existsSync(indexPath)) {
            return indexPath;
        }
    }
    
    return resolved;
}

/**
 * Categorize file based on its path
 */
function categorizeFile(relativePath) {
    if (relativePath.includes('app/')) return 'controller';
    if (relativePath.includes('core/')) return 'model';
    if (relativePath.includes('ui/')) return 'view';
    if (relativePath.includes('tests/')) return 'test';
    if (relativePath.includes('scripts/')) return 'script';
    if (relativePath.includes('config/')) return 'config';
    if (relativePath.includes('docs/')) return 'documentation';
    return 'other';
}

/**
 * Check if file is an entry point
 */
function isEntryPoint(relativePath, content) {
    // Main entry points
    if (relativePath === 'app/main.js' || relativePath === 'src/code.ts') return true;
    if (relativePath.includes('main.js') || relativePath.includes('index.js')) return true;
    
    // Server or CLI entry points
    if (content.includes('express()') || content.includes('new Server(')) return true;
    if (content.includes('#!/usr/bin/env node')) return true;
    
    // Test runners
    if (relativePath.includes('test') && content.includes('.describe(')) return true;
    
    return false;
}

/**
 * Check if file has corresponding test files
 */
function hasTestFiles(relativePath) {
    const basename = path.basename(relativePath, path.extname(relativePath));
    const testPaths = [
        `tests/**/*${basename}*.test.js`,
        `tests/**/*${basename}*.spec.js`,
        `**/*.test.js`,
        `**/*.spec.js`
    ];
    
    // Simple heuristic - check if test files exist
    return fs.existsSync(path.join(projectRoot, 'tests')) && 
           relativePath.includes('core/') || relativePath.includes('app/');
}

/**
 * Build import dependency graph
 */
function buildDependencyGraph(files) {
    // Mark files as used based on import chains
    const visited = new Set();
    
    function markAsUsed(filePath, depth = 0) {
        if (visited.has(filePath) || depth > 10) return; // Prevent infinite loops
        visited.add(filePath);
        
        const fileInfo = fileRegistry.get(filePath);
        if (fileInfo) {
            fileInfo.isUsed = true;
            
            // Mark all imported files as used
            for (const importPath of fileInfo.imports) {
                if (fileRegistry.has(importPath)) {
                    markAsUsed(importPath, depth + 1);
                }
            }
        }
    }
    
    // Start from entry points
    for (const [filePath, fileInfo] of fileRegistry.entries()) {
        if (fileInfo.isEntry) {
            markAsUsed(filePath);
        }
    }
    
    // Also mark package.json scripts targets as used
    try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
        const scripts = packageJson.scripts || {};
        
        for (const script of Object.values(scripts)) {
            // Extract file references from scripts
            const fileMatches = script.match(/(?:node|npm run)\s+([^\s]+)/g);
            if (fileMatches) {
                for (const match of fileMatches) {
                    const scriptFile = match.replace(/^(?:node|npm run)\s+/, '');
                    const fullPath = path.resolve(projectRoot, scriptFile);
                    if (fileRegistry.has(fullPath)) {
                        markAsUsed(fullPath);
                    }
                }
            }
        }
    } catch (error) {
        console.warn('Could not parse package.json:', error.message);
    }
}

/**
 * Generate comprehensive report
 */
function generateReport(files) {
    const report = {
        summary: {
            totalFiles: files.length,
            usedFiles: 0,
            unusedFiles: 0,
            totalSize: 0,
            unusedSize: 0
        },
        categories: {},
        unusedFiles: [],
        largestFiles: [],
        entryPoints: [],
        isolatedFiles: [],
        recommendations: []
    };
    
    // Categorize and analyze files
    for (const [filePath, fileInfo] of fileRegistry.entries()) {
        const category = fileInfo.category;
        if (!report.categories[category]) {
            report.categories[category] = { total: 0, used: 0, unused: 0, size: 0 };
        }
        
        report.categories[category].total++;
        report.categories[category].size += fileInfo.size;
        report.summary.totalSize += fileInfo.size;
        
        if (fileInfo.isUsed) {
            report.summary.usedFiles++;
            report.categories[category].used++;
        } else {
            report.summary.unusedFiles++;
            report.categories[category].unused++;
            report.summary.unusedSize += fileInfo.size;
            report.unusedFiles.push({
                path: fileInfo.relativePath,
                size: fileInfo.size,
                category: fileInfo.category,
                hasExports: fileInfo.exports.length > 0
            });
        }
        
        if (fileInfo.isEntry) {
            report.entryPoints.push(fileInfo.relativePath);
        }
        
        if (fileInfo.imports.length === 0 && fileInfo.exports.length === 0 && !fileInfo.isEntry) {
            report.isolatedFiles.push(fileInfo.relativePath);
        }
    }
    
    // Find largest files
    report.largestFiles = Array.from(fileRegistry.values())
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .map(f => ({
            path: f.relativePath,
            size: f.size,
            category: f.category,
            isUsed: f.isUsed
        }));
    
    // Generate recommendations
    if (report.summary.unusedFiles > 0) {
        report.recommendations.push(`Remove ${report.summary.unusedFiles} unused files (${Math.round(report.summary.unusedSize/1024)}KB saved)`);
    }
    
    const unusedCategories = Object.entries(report.categories)
        .filter(([cat, data]) => data.unused > data.used)
        .map(([cat]) => cat);
    
    if (unusedCategories.length > 0) {
        report.recommendations.push(`Review categories with high unused file counts: ${unusedCategories.join(', ')}`);
    }
    
    return report;
}

/**
 * Main analysis function
 */
async function analyzeProject() {
    console.log('🔍 Starting Deep File Analysis...\n');
    
    // Find all files
    const files = findAllFiles(projectRoot);
    console.log(`Found ${files.length} JavaScript/TypeScript files\n`);
    
    // Parse each file
    for (const filePath of files) {
        const fileInfo = parseFile(filePath);
        if (fileInfo) {
            fileRegistry.set(filePath, fileInfo);
        }
    }
    
    // Build dependency graph
    buildDependencyGraph(files);
    
    // Generate report
    const report = generateReport(files);
    
    return report;
}

/**
 * Format and display report
 */
function displayReport(report) {
    console.log('📊 PROJECT FILE ANALYSIS REPORT');
    console.log(''.padEnd(50, '='));
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`Total Files: ${report.summary.totalFiles}`);
    console.log(`Used Files: ${report.summary.usedFiles} (${Math.round(report.summary.usedFiles/report.summary.totalFiles*100)}%)`);
    console.log(`Unused Files: ${report.summary.unusedFiles} (${Math.round(report.summary.unusedFiles/report.summary.totalFiles*100)}%)`);
    console.log(`Total Size: ${Math.round(report.summary.totalSize/1024)}KB`);
    console.log(`Unused Size: ${Math.round(report.summary.unusedSize/1024)}KB`);
    
    // Categories
    console.log('\n📁 BY CATEGORY:');
    Object.entries(report.categories).forEach(([category, data]) => {
        const usagePercent = Math.round(data.used / data.total * 100);
        console.log(`${category.padEnd(15)}: ${data.total} files (${data.used} used, ${data.unused} unused) - ${usagePercent}% usage`);
    });
    
    // Entry Points
    console.log('\n🚀 ENTRY POINTS:');
    report.entryPoints.forEach(path => console.log(`  - ${path}`));
    
    // Unused Files
    console.log('\n🗑️  UNUSED FILES:');
    if (report.unusedFiles.length === 0) {
        console.log('  ✅ No unused files found!');
    } else {
        report.unusedFiles
            .sort((a, b) => b.size - a.size)
            .slice(0, 20)
            .forEach(file => {
                const sizeKB = Math.round(file.size/1024);
                console.log(`  - ${file.path} (${sizeKB}KB, ${file.category})`);
            });
        
        if (report.unusedFiles.length > 20) {
            console.log(`  ... and ${report.unusedFiles.length - 20} more`);
        }
    }
    
    // Largest Files
    console.log('\n📏 LARGEST FILES:');
    report.largestFiles.forEach(file => {
        const sizeKB = Math.round(file.size/1024);
        const status = file.isUsed ? '✅' : '❌';
        console.log(`  ${status} ${file.path} (${sizeKB}KB, ${file.category})`);
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (report.recommendations.length === 0) {
        console.log('  ✅ Project structure looks optimized!');
    } else {
        report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    // Isolated Files
    if (report.isolatedFiles.length > 0) {
        console.log('\n🏝️  ISOLATED FILES (no imports/exports):');
        report.isolatedFiles.slice(0, 10).forEach(path => console.log(`  - ${path}`));
    }
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
    analyzeProject()
        .then(displayReport)
        .catch(console.error);
}

export { analyzeProject, displayReport };