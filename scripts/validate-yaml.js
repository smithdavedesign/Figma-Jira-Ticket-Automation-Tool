#!/usr/bin/env node

/**
 * YAML Validation Script
 * Validates all YAML template files for syntax errors and structure
 */

import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class YAMLValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validated = [];
  }

  async validateFile(filePath) {
    try {
      console.log(`📝 Validating: ${filePath}`);
      
      const content = await readFile(filePath, 'utf8');
      
      // Basic YAML syntax validation
      let parsed;
      try {
        parsed = yaml.load(content);
      } catch (yamlError) {
        this.errors.push({
          file: filePath,
          error: 'YAML Syntax Error',
          details: yamlError.message,
          line: yamlError.mark?.line || 'unknown'
        });
        console.log(`  ${chalk.red('❌ YAML Syntax Error')}: ${yamlError.message}`);
        return false;
      }

      // Template structure validation
      const issues = this.validateTemplateStructure(parsed, filePath);
      if (issues.length > 0) {
        this.warnings.push(...issues);
        issues.forEach(issue => {
          console.log(`  ${chalk.yellow('⚠️  Warning')}: ${issue.details}`);
        });
      }

      // Jinja2 template syntax check
      const jinjaIssues = this.validateJinjaTemplates(content, filePath);
      if (jinjaIssues.length > 0) {
        this.warnings.push(...jinjaIssues);
        jinjaIssues.forEach(issue => {
          console.log(`  ${chalk.yellow('⚠️  Jinja Warning')}: ${issue.details}`);
        });
      }

      console.log(`  ${chalk.green('✅ Valid')}`);
      this.validated.push(filePath);
      return true;

    } catch (error) {
      this.errors.push({
        file: filePath,
        error: 'File Read Error',
        details: error.message
      });
      console.log(`  ${chalk.red('❌ File Error')}: ${error.message}`);
      return false;
    }
  }

  validateTemplateStructure(parsed, filePath) {
    const issues = [];

    // Check required fields for template files
    if (!parsed.meta) {
      issues.push({
        file: filePath,
        error: 'Missing Structure',
        details: 'Missing required "meta" section'
      });
    } else {
      if (!parsed.meta.platform) issues.push({ file: filePath, error: 'Missing Field', details: 'meta.platform is required' });
      if (!parsed.meta.document_type) issues.push({ file: filePath, error: 'Missing Field', details: 'meta.document_type is required' });
      if (!parsed.meta.version) issues.push({ file: filePath, error: 'Missing Field', details: 'meta.version is required' });
    }

    if (!parsed.template) {
      issues.push({
        file: filePath,
        error: 'Missing Structure',
        details: 'Missing required "template" section'
      });
    } else {
      if (!parsed.template.content && !parsed.template.title) {
        issues.push({ file: filePath, error: 'Missing Content', details: 'Template must have either content or title' });
      }
    }

    return issues;
  }

  validateJinjaTemplates(content, filePath) {
    const issues = [];
    
    // Check for common Jinja2 syntax issues
    const jinjaPatterns = [
      { pattern: /\{\{[^}]*\}\}/g, name: 'variables' },
      { pattern: /\{%[^%]*%\}/g, name: 'statements' },
      { pattern: /\{#[^#]*#\}/g, name: 'comments' }
    ];

    jinjaPatterns.forEach(({ pattern, name }) => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        // Check for unmatched braces
        if (name === 'variables') {
          if (!match.endsWith('}}')) {
            issues.push({ file: filePath, error: 'Jinja Syntax', details: `Unclosed variable: ${match}` });
          }
        }
        if (name === 'statements') {
          if (!match.endsWith('%}')) {
            issues.push({ file: filePath, error: 'Jinja Syntax', details: `Unclosed statement: ${match}` });
          }
        }
      });
    });

    // Check for unmatched if/endif pairs
    const ifMatches = (content.match(/\{%\s*if\s+/g) || []).length;
    const endifMatches = (content.match(/\{%\s*endif\s*%\}/g) || []).length;
    if (ifMatches !== endifMatches) {
      issues.push({ 
        file: filePath, 
        error: 'Jinja Logic', 
        details: `Unmatched if/endif: ${ifMatches} if statements, ${endifMatches} endif statements` 
      });
    }

    // Check for unmatched for/endfor pairs
    const forMatches = (content.match(/\{%\s*for\s+/g) || []).length;
    const endforMatches = (content.match(/\{%\s*endfor\s*%\}/g) || []).length;
    if (forMatches !== endforMatches) {
      issues.push({ 
        file: filePath, 
        error: 'Jinja Logic', 
        details: `Unmatched for/endfor: ${forMatches} for statements, ${endforMatches} endfor statements` 
      });
    }

    return issues;
  }

  async validateDirectory(dirPath) {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          await this.validateDirectory(fullPath);
        } else if (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml')) {
          await this.validateFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold('🔍 YAML VALIDATION SUMMARY'));
    console.log('='.repeat(60));
    
    console.log(`📁 Files Validated: ${chalk.green(this.validated.length)}`);
    console.log(`❌ Errors: ${chalk.red(this.errors.length)}`);
    console.log(`⚠️  Warnings: ${chalk.yellow(this.warnings.length)}`);

    if (this.errors.length > 0) {
      console.log('\n' + chalk.red.bold('❌ ERRORS:'));
      this.errors.forEach(error => {
        console.log(`  📄 ${error.file}`);
        console.log(`     ${chalk.red(error.error)}: ${error.details}`);
        if (error.line && error.line !== 'unknown') {
          console.log(`     Line: ${error.line}`);
        }
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n' + chalk.yellow.bold('⚠️  WARNINGS:'));
      this.warnings.forEach(warning => {
        console.log(`  📄 ${warning.file}`);
        console.log(`     ${chalk.yellow(warning.error)}: ${warning.details}`);
      });
    }

    if (this.errors.length === 0) {
      console.log('\n' + chalk.green.bold('🎉 All YAML files are valid!'));
    }

    return this.errors.length === 0;
  }
}

// Main execution
async function main() {
  const validator = new YAMLValidator();
  const templatesDir = join(__dirname, '../config/templates');
  
  console.log(chalk.bold('🔍 YAML Template Validation'));
  console.log(`📁 Scanning: ${templatesDir}`);
  console.log('-'.repeat(60));
  
  await validator.validateDirectory(templatesDir);
  
  const isValid = validator.printSummary();
  process.exit(isValid ? 0 : 1);
}

main().catch(console.error);