#!/usr/bin/env node

/**
 * Universal Template System CLI
 * 
 * Command-line interface for testing and using the Universal Template Engine
 * 
 * Usage:
 *   template-cli generate --platform jira --type component --stack react
 *   template-cli list --platform jira
 *   template-cli test --all
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { UniversalTemplateEngine } from './UniversalTemplateEngine.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const program = new Command();
const engine = new UniversalTemplateEngine();

// Sample context data for testing
const sampleContext = {
  figma: {
    component_name: 'Button',
    component_type: 'UI Component',
    description: 'A reusable button component for user interactions',
    dimensions: { width: 120, height: 40 },
    variants: [
      { name: 'Primary', description: 'Main call-to-action button' },
      { name: 'Secondary', description: 'Secondary action button' },
      { name: 'Outline', description: 'Outlined button variant' }
    ],
    states: [
      { name: 'Default', description: 'Normal button state' },
      { name: 'Hover', description: 'Mouse over state' },
      { name: 'Disabled', description: 'Non-interactive state' }
    ],
    properties: [
      { name: 'variant', type: 'string', required: false, default: 'primary' },
      { name: 'size', type: 'string', required: false, default: 'medium' },
      { name: 'disabled', type: 'boolean', required: false, default: false },
      { name: 'onClick', type: 'function', required: false }
    ],
    url: 'https://figma.com/file/example',
    file_name: 'Design System Components'
  },
  project: {
    name: 'Design System',
    tech_stack: ['React', 'TypeScript', 'Storybook'],
    repository: 'https://github.com/company/design-system',
    frontend_framework: 'React',
    styling_approach: 'CSS Modules',
    testing_framework: 'Jest'
  },
  design_tokens: {
    colors: [
      { name: 'primary', value: '#0066CC' },
      { name: 'secondary', value: '#6C757D' },
      { name: 'background', value: '#FFFFFF' }
    ],
    spacing: [
      { name: 'sm', value: '8' },
      { name: 'md', value: '16' },
      { name: 'lg', value: '24' }
    ]
  },
  team: {
    name: 'Design System Team',
    contact: 'design@company.com'
  }
};

// CLI Configuration
program
  .name('template-cli')
  .description('Universal Template System CLI')
  .version('1.0.0');

// Generate Template Command
program
  .command('generate')
  .description('Generate a template with specified parameters')
  .option('-p, --platform <platform>', 'Target platform (jira, wiki, figma, storybook)')
  .option('-t, --type <type>', 'Document type (component, feature, service, authoring)')
  .option('-s, --stack <stack>', 'Tech stack (react, aem, custom)', 'custom')
  .option('-o, --output <path>', 'Output file path')
  .option('-i, --interactive', 'Interactive mode with prompts')
  .action(async (options) => {
    try {
      let { platform, type, stack, output, interactive } = options;

      // Interactive mode
      if (interactive || !platform || !type) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'platform',
            message: 'Select target platform:',
            choices: ['jira', 'wiki', 'figma', 'storybook'],
            default: platform
          },
          {
            type: 'list', 
            name: 'type',
            message: 'Select document type:',
            choices: ['component', 'feature', 'service', 'authoring'],
            default: type
          },
          {
            type: 'list',
            name: 'stack',
            message: 'Select tech stack:',
            choices: ['react', 'aem', 'custom'],
            default: stack || 'custom'
          },
          {
            type: 'input',
            name: 'output',
            message: 'Output file path (optional):',
            default: output
          }
        ]);

        platform = answers.platform;
        type = answers.type;
        stack = answers.stack;
        output = answers.output;
      }

      console.log(chalk.blue('\n🚀 Generating template...\n'));
      console.log(`Platform: ${chalk.green(platform)}`);
      console.log(`Type: ${chalk.green(type)}`);
      console.log(`Tech Stack: ${chalk.green(stack)}\n`);

      // Resolve and render template
      const template = await engine.resolveTemplate(platform, type, stack);
      const rendered = await engine.renderTemplate(template, sampleContext);

      console.log(chalk.yellow('📋 Template Resolution:'));
      console.log(`Resolved from: ${chalk.cyan(template._meta.resolutionPath)}`);
      console.log(`Cache key: ${chalk.gray(template._meta.cacheKey)}\n`);

      // Output rendered template
      if (output) {
        // Ensure output directory exists
        const dir = join(process.cwd(), output.substring(0, output.lastIndexOf('/')));
        await mkdir(dir, { recursive: true });
        
        // Write to file
        const content = typeof rendered === 'object' 
          ? JSON.stringify(rendered, null, 2) 
          : rendered;
        await writeFile(join(process.cwd(), output), content);
        console.log(chalk.green(`✅ Template saved to: ${output}\n`));
      } else {
        console.log(chalk.yellow('📄 Generated Template:\n'));
        console.log(chalk.white('─'.repeat(80)));
        
        if (typeof rendered === 'object') {
          console.log(JSON.stringify(rendered, null, 2));
        } else {
          console.log(rendered);
        }
        
        console.log(chalk.white('─'.repeat(80)));
      }

    } catch (error) {
      console.error(chalk.red('❌ Error generating template:'), error.message);
      process.exit(1);
    }
  });

// List Templates Command  
program
  .command('list')
  .description('List available templates')
  .option('-p, --platform <platform>', 'Filter by platform')
  .option('-s, --stack <stack>', 'Filter by tech stack')
  .option('-t, --type <type>', 'Filter by document type')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n📚 Available Templates:\n'));

      const templates = await engine.listAvailableTemplates();
      
      // Apply filters
      let filteredTemplates = templates;
      if (options.platform) {
        filteredTemplates = filteredTemplates.filter(t => t.platform === options.platform);
      }
      if (options.stack) {
        filteredTemplates = filteredTemplates.filter(t => t.techStack === options.stack);
      }
      if (options.type) {
        filteredTemplates = filteredTemplates.filter(t => t.documentType === options.type);
      }

      // Group by type
      const platformTemplates = filteredTemplates.filter(t => t.type === 'platform');
      const techStackTemplates = filteredTemplates.filter(t => t.type === 'tech-stack');

      if (platformTemplates.length > 0) {
        console.log(chalk.yellow('🎯 Platform Templates:'));
        platformTemplates.forEach(template => {
          console.log(`  ${chalk.green(template.platform)}/${chalk.cyan(template.documentType)} ${chalk.gray(`(${template.path})`)}`);
        });
        console.log();
      }

      if (techStackTemplates.length > 0) {
        console.log(chalk.yellow('⚙️  Tech Stack Templates:'));
        techStackTemplates.forEach(template => {
          console.log(`  ${chalk.green(template.techStack)}/${chalk.cyan(template.documentType)} ${chalk.gray(`(${template.path})`)}`);
        });
        console.log();
      }

      console.log(chalk.blue(`Total templates: ${chalk.white(filteredTemplates.length)}\n`));

    } catch (error) {
      console.error(chalk.red('❌ Error listing templates:'), error.message);
      process.exit(1);
    }
  });

// Test Command
program
  .command('test')
  .description('Test template resolution and rendering')
  .option('-a, --all', 'Test all available templates')
  .option('-p, --platform <platform>', 'Test specific platform')
  .option('-s, --stack <stack>', 'Test specific tech stack')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🧪 Testing Template System...\n'));

      if (options.all) {
        // Test all available templates
        const templates = await engine.listAvailableTemplates();
        let successCount = 0;
        let failureCount = 0;

        for (const templateInfo of templates) {
          try {
            const platform = templateInfo.platform || 'wiki';
            const stack = templateInfo.techStack || 'custom';
            
            const template = await engine.resolveTemplate(platform, templateInfo.documentType, stack);
            const rendered = await engine.renderTemplate(template, sampleContext);
            
            console.log(chalk.green(`✅ ${platform}/${templateInfo.documentType}/${stack}`));
            successCount++;
          } catch (error) {
            console.log(chalk.red(`❌ ${templateInfo.path}: ${error.message}`));
            failureCount++;
          }
        }

        console.log(chalk.blue(`\n📊 Test Results:`));
        console.log(`Success: ${chalk.green(successCount)}`);
        console.log(`Failures: ${chalk.red(failureCount)}`);
        console.log(`Total: ${chalk.white(successCount + failureCount)}\n`);

      } else {
        // Test specific combinations
        const testCases = [
          { platform: 'jira', type: 'component', stack: 'react' },
          { platform: 'jira', type: 'feature', stack: 'react' },
          { platform: 'wiki', type: 'component', stack: 'aem' },
          { platform: 'figma', type: 'component', stack: 'custom' },
          { platform: 'storybook', type: 'component', stack: 'react' }
        ];

        for (const testCase of testCases) {
          try {
            console.log(chalk.yellow(`Testing: ${testCase.platform}/${testCase.type}/${testCase.stack}`));
            
            const template = await engine.resolveTemplate(testCase.platform, testCase.type, testCase.stack);
            const rendered = await engine.renderTemplate(template, sampleContext);
            
            console.log(chalk.green(`✅ Success - resolved from: ${template._meta.resolutionPath}`));
          } catch (error) {
            console.log(chalk.red(`❌ Failed: ${error.message}`));
          }
        }
      }

      // Show cache stats
      const stats = engine.getCacheStats();
      console.log(chalk.blue('\n📈 Cache Statistics:'));
      console.log(`Template Cache: ${chalk.white(stats.templateCache)} entries`);
      console.log(`Resolved Cache: ${chalk.white(stats.resolvedCache)} entries\n`);

    } catch (error) {
      console.error(chalk.red('❌ Error running tests:'), error.message);
      process.exit(1);
    }
  });

// Cache Command
program
  .command('cache')
  .description('Manage template cache')
  .option('-c, --clear', 'Clear all caches')
  .option('-s, --stats', 'Show cache statistics')
  .action(async (options) => {
    try {
      if (options.clear) {
        engine.clearCache();
        console.log(chalk.green('✅ Cache cleared successfully\n'));
      }

      if (options.stats || !options.clear) {
        const stats = engine.getCacheStats();
        console.log(chalk.blue('\n📈 Cache Statistics:'));
        console.log(`Template Cache: ${chalk.white(stats.templateCache)} entries`);
        console.log(`Resolved Cache: ${chalk.white(stats.resolvedCache)} entries`);
        console.log(`Last Cleared: ${chalk.gray(stats.lastCleared)}\n`);
      }
    } catch (error) {
      console.error(chalk.red('❌ Error managing cache:'), error.message);
      process.exit(1);
    }
  });

// Demo Command
program
  .command('demo')
  .description('Run interactive demo of the template system')
  .action(async () => {
    console.log(chalk.blue('\n🎭 Universal Template System Demo\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'demoType',
        message: 'What would you like to demo?',
        choices: [
          { name: '🎯 Platform Template (Jira Component)', value: 'platform' },
          { name: '⚙️  Tech Stack Template (React Component)', value: 'techstack' },
          { name: '🔄 Fallback Resolution', value: 'fallback' },
          { name: '📋 Template Comparison', value: 'comparison' }
        ]
      }
    ]);

    switch (answers.demoType) {
      case 'platform':
        await demoplatformTemplate();
        break;
      case 'techstack':
        await demoTechStackTemplate();
        break;
      case 'fallback':
        await demoFallbackResolution();
        break;
      case 'comparison':
        await demoTemplateComparison();
        break;
    }
  });

// Demo functions
async function demoplatformTemplate() {
  console.log(chalk.yellow('\n🎯 Platform Template Demo - Jira Component\n'));
  
  const template = await engine.resolveTemplate('jira', 'component', 'react');
  const rendered = await engine.renderTemplate(template, sampleContext);
  
  console.log(chalk.cyan('Resolution Path:'), template._meta.resolutionPath);
  console.log(chalk.cyan('Template Type:'), 'Platform Template');
  console.log(chalk.yellow('\n📄 Rendered Output:\n'));
  console.log(JSON.stringify(rendered, null, 2));
}

async function demoTechStackTemplate() {
  console.log(chalk.yellow('\n⚙️  Tech Stack Template Demo - React Component\n'));
  
  const template = await engine.resolveTemplate('unknown-platform', 'component', 'react');
  const rendered = await engine.renderTemplate(template, sampleContext);
  
  console.log(chalk.cyan('Resolution Path:'), template._meta.resolutionPath);
  console.log(chalk.cyan('Template Type:'), 'Tech Stack Template');
  console.log(chalk.yellow('\n📄 Rendered Output:\n'));
  console.log(rendered.substring(0, 500) + '...');
}

async function demoFallbackResolution() {
  console.log(chalk.yellow('\n🔄 Fallback Resolution Demo\n'));
  
  const template = await engine.resolveTemplate('unknown-platform', 'unknown-type', 'unknown-stack');
  const rendered = await engine.renderTemplate(template, sampleContext);
  
  console.log(chalk.cyan('Resolution Path:'), template._meta.resolutionPath);
  console.log(chalk.cyan('Template Type:'), 'Built-in Fallback');
  console.log(chalk.yellow('\n📄 Fallback Template:\n'));
  console.log(rendered.substring(0, 300) + '...');
}

async function demoTemplateComparison() {
  console.log(chalk.yellow('\n📋 Template Comparison Demo\n'));
  
  const combinations = [
    { platform: 'jira', type: 'component', stack: 'react' },
    { platform: 'wiki', type: 'component', stack: 'react' },
    { platform: 'figma', type: 'component', stack: 'react' }
  ];
  
  for (const combo of combinations) {
    const template = await engine.resolveTemplate(combo.platform, combo.type, combo.stack);
    console.log(chalk.green(`${combo.platform}/${combo.type}/${combo.stack}:`));
    console.log(`  Resolution: ${chalk.cyan(template._meta.resolutionPath)}`);
    console.log(`  Meta: ${JSON.stringify(template.meta || {}, null, 2).substring(0, 100)}...\n`);
  }
}

// Run the CLI
program.parse(process.argv);