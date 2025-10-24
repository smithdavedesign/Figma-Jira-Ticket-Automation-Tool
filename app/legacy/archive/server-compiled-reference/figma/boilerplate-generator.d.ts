export interface TechStackConfig {
    frontend: {
        framework: 'react' | 'vue' | 'angular' | 'svelte' | 'html';
        styling: 'tailwind' | 'css-modules' | 'styled-components' | 'scss' | 'css';
        stateManagement?: 'redux' | 'zustand' | 'pinia' | 'ngrx' | 'none';
        testing?: 'jest' | 'vitest' | 'cypress' | 'playwright' | 'none';
    };
    backend?: {
        language: 'typescript' | 'javascript' | 'python' | 'java' | 'csharp';
        framework: 'express' | 'fastapi' | 'spring' | 'dotnet' | 'none';
    };
    mobile?: {
        platform: 'react-native' | 'flutter' | 'ionic' | 'swift' | 'kotlin';
    };
    deployment: {
        platform: 'vercel' | 'netlify' | 'aws' | 'azure' | 'docker' | 'none';
    };
}
export interface CodeGenerationOptions {
    includeTests: boolean;
    includeStorybook: boolean;
    includeAccessibility: boolean;
    includeResponsive: boolean;
    testing?: 'jest' | 'vitest' | 'cypress' | 'playwright' | 'none';
    componentLibrary?: string;
}
export declare class BoilerplateCodeGenerator {
    private techStack;
    private options;
    constructor(techStack: TechStackConfig, options: CodeGenerationOptions);
    generateBoilerplateCode(figmaUrl: string, figmaMCP: any): Promise<{
        component: string;
        styles: string;
        tests?: string;
        story?: string;
        types?: string;
    }>;
    private generateComponentCode;
    private generateReactComponent;
    private generateVueComponent;
    private generateAngularComponent;
    private generateSvelteComponent;
    private generateHTMLComponent;
    private generateStyleCode;
    private generateTestCode;
    private generateStoryCode;
    private extractComponentName;
    private getComponentImports;
    private generatePropsInterface;
    private generatePropsList;
    private generateStateLogic;
    private convertToReactJSX;
    private convertToVueTemplate;
    private convertToSvelteTemplate;
    private convertToHTMLTemplate;
    private generateVueScript;
    private generateVueStyles;
    private convertToAngularTemplate;
    private generateAngularInputs;
    private generateStyledComponents;
    private generateCSSModules;
    private generateSCSS;
    private generateCSS;
    private generateTypeDefinitions;
    private generateStoryArgs;
}
//# sourceMappingURL=boilerplate-generator.d.ts.map