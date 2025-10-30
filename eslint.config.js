import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Figma Plugin API globals
        figma: 'readonly',
        __html__: 'readonly',
        // Browser globals
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        XMLHttpRequest: 'readonly',
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        performance: 'readonly',
        URL: 'readonly',
        // Figma API Types
        SceneNode: 'readonly',
        FrameNode: 'readonly',
        ComponentNode: 'readonly',
        InstanceNode: 'readonly',
        TextNode: 'readonly',
        PageNode: 'readonly',
        DocumentNode: 'readonly',
        ShowUIOptions: 'readonly',
        // Project-specific globals
        DesignSystemScanner: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' }],
      'no-console': 'off', // Allow console in Figma plugins and development
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': 'error',
      'curly': 'error',
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'warn',
      'indent': ['warn', 2],
      'quotes': ['warn', 'single'],
      'semi': ['error', 'always'],
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './config/tsconfig.json',
      },
      globals: {
        // Figma Plugin API globals for TypeScript files
        figma: 'readonly',
        __html__: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        performance: 'readonly',
        // Figma API Types
        SceneNode: 'readonly',
        FrameNode: 'readonly',
        ComponentNode: 'readonly',
        InstanceNode: 'readonly',
        TextNode: 'readonly',
        PageNode: 'readonly',
        DocumentNode: 'readonly',
        ShowUIOptions: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Disable JavaScript rules that conflict with TypeScript
      'no-unused-vars': 'off',
      'no-undef': 'off',
      // Enable TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' }],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any for Figma plugin flexibility
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      'production-bundle/',
      'archive/',
      'browser-tests/',
      'server/',
      'ui/',
      'tests/',
      'docs/',
      'scripts/',
      'logs/',
      '*.log',
      '*.min.js',
      'code.js',
      'code.ts',
    ],
  },
];