export interface ParsedTechStack {
  frontend: FrontendConfig;
  backend?: BackendConfig;
  mobile?: MobileConfig;
  testing?: TestingConfig;
  deployment?: DeploymentConfig;
  componentLibrary?: ComponentLibrary;
  confidence: number;
  suggestions: string[];
}

interface FrontendConfig {
  framework: string;
  styling: string;
  stateManagement?: string;
  bundler?: string;
  features?: string[];
}

interface BackendConfig {
  language: string;
  framework?: string;
  database?: string;
  features?: string[];
}

interface MobileConfig {
  platform: string;
  framework?: string;
  features?: string[];
}

interface TestingConfig {
  unit?: string;
  integration?: string;
  e2e?: string;
  features?: string[];
}

interface DeploymentConfig {
  platform: string;
  features?: string[];
}

interface ComponentLibrary {
  name: string;
  framework: string;
}

export class TechStackParser {
  private readonly frameworkPatterns = {
    react: /\b(react|jsx)\b/i,
    vue: /\b(vue|vuejs)\b/i,
    angular: /\b(angular|ng)\b/i,
    svelte: /\b(svelte|sveltekit)\b/i,
    nextjs: /\b(next\.?js|nextjs)\b/i,
    nuxt: /\b(nuxt|nuxtjs)\b/i,
    remix: /\b(remix)\b/i,
    gatsby: /\b(gatsby)\b/i,
    astro: /\b(astro)\b/i,
    qwik: /\b(qwik)\b/i
  };

  private readonly stylingPatterns = {
    tailwind: /\b(tailwind|tailwindcss)\b/i,
    'styled-components': /\b(styled-components|styled)\b/i,
    'emotion': /\b(@emotion|emotion)\b/i,
    'css-modules': /\b(css modules|cssmodules)\b/i,
    scss: /\b(scss|sass)\b/i,
    less: /\b(less)\b/i,
    mui: /\b(mui|material-ui|material ui)\b/i,
    'chakra-ui': /\b(chakra|chakra-ui|chakra ui)\b/i,
    'ant-design': /\b(ant design|antd)\b/i,
    bootstrap: /\b(bootstrap)\b/i,
    bulma: /\b(bulma)\b/i
  };

  private readonly statePatterns = {
    redux: /\b(redux|@reduxjs)\b/i,
    zustand: /\b(zustand)\b/i,
    jotai: /\b(jotai)\b/i,
    recoil: /\b(recoil)\b/i,
    pinia: /\b(pinia)\b/i,
    vuex: /\b(vuex)\b/i,
    ngrx: /\b(ngrx)\b/i,
    mobx: /\b(mobx)\b/i,
    valtio: /\b(valtio)\b/i,
    xstate: /\b(xstate)\b/i
  };

  private readonly backendPatterns = {
    javascript: /\b(node\.?js|nodejs|express|fastify|koa)\b/i,
    typescript: /\b(typescript|ts-node|nestjs|nest)\b/i,
    python: /\b(python|fastapi|django|flask|pyramid)\b/i,
    java: /\b(java|spring|springboot)\b/i,
    csharp: /\b(c#|csharp|\.net|dotnet|asp\.net)\b/i,
    go: /\b(golang|go|gin|fiber|echo)\b/i,
    rust: /\b(rust|axum|warp|actix)\b/i,
    php: /\b(php|laravel|symfony|codeigniter)\b/i,
    ruby: /\b(ruby|rails|sinatra)\b/i,
    kotlin: /\b(kotlin|ktor)\b/i,
    scala: /\b(scala|play|akka)\b/i
  };



  private readonly mobilePatterns = {
    'react-native': /\b(react native|react-native|rn)\b/i,
    flutter: /\b(flutter|dart)\b/i,
    ionic: /\b(ionic)\b/i,
    cordova: /\b(cordova|phonegap)\b/i,
    capacitor: /\b(capacitor)\b/i,
    nativescript: /\b(nativescript)\b/i,
    xamarin: /\b(xamarin)\b/i,
    expo: /\b(expo)\b/i
  };

  private readonly deploymentPatterns = {
    vercel: /\b(vercel)\b/i,
    netlify: /\b(netlify)\b/i,
    aws: /\b(aws|amazon web services|lambda|s3|ec2|amplify)\b/i,
    gcp: /\b(google cloud|gcp|firebase|cloud functions)\b/i,
    azure: /\b(azure|microsoft azure)\b/i,
    heroku: /\b(heroku)\b/i,
    railway: /\b(railway)\b/i,
    render: /\b(render\.com)\b/i,
    cloudflare: /\b(cloudflare pages|workers)\b/i,
    github: /\b(github pages|gh-pages)\b/i,
    docker: /\b(docker|containerized?)\b/i,
    kubernetes: /\b(kubernetes|k8s)\b/i
  };

  parse(description: string): ParsedTechStack {
    const normalized = description.toLowerCase();

    const frontend = this.detectFrontend(normalized);
    const backend = this.detectBackend(normalized);
    const mobile = this.detectMobile(normalized);
    const deployment = this.detectDeployment(normalized);
    const componentLibrary = this.detectComponentLibrary(normalized);
    
    const confidence = this.calculateConfidence(frontend, backend, mobile);
    const suggestions = this.generateSuggestions(frontend, backend, mobile);

    const result: ParsedTechStack = {
      frontend,
      confidence,
      suggestions
    };

    if (backend) result.backend = backend;
    if (mobile) result.mobile = mobile;
    if (deployment) result.deployment = deployment;
    if (componentLibrary) result.componentLibrary = componentLibrary;

    return result;
  }

  private detectFrontend(text: string): FrontendConfig {
    // Check for specific frameworks first (more specific matches)
    if (this.frameworkPatterns.nextjs.test(text)) {
      return { 
        framework: 'nextjs', 
        styling: this.detectStyling(text) || 'tailwind', 
        stateManagement: this.detectStateManagement(text) || 'none'
      };
    }
    
    if (this.frameworkPatterns.nuxt.test(text)) {
      return { 
        framework: 'nuxt', 
        styling: this.detectStyling(text) || 'tailwind', 
        stateManagement: this.detectStateManagement(text) || 'pinia'
      };
    }

    // Check for base frameworks
    for (const [framework, pattern] of Object.entries(this.frameworkPatterns)) {
      if (pattern.test(text)) {
        return { 
          framework, 
          styling: this.detectStyling(text) || this.getDefaultStyling(framework),
          stateManagement: this.detectStateManagement(text) || this.getDefaultState(framework)
        };
      }
    }

    return { 
      framework: 'react', 
      styling: this.detectStyling(text) || 'css', 
      stateManagement: this.detectStateManagement(text) || 'none'
    };
  }

  private detectStyling(text: string): string | undefined {
    // Check component libraries first (they often include styling)
    if (this.stylingPatterns.mui.test(text)) return 'mui';
    if (this.stylingPatterns['chakra-ui'].test(text)) return 'chakra-ui';
    if (this.stylingPatterns['ant-design'].test(text)) return 'ant-design';

    // Check for styling approaches
    for (const [styling, pattern] of Object.entries(this.stylingPatterns)) {
      if (pattern.test(text)) return styling;
    }

    return undefined;
  }

  private detectStateManagement(text: string): string | undefined {
    for (const [state, pattern] of Object.entries(this.statePatterns)) {
      if (pattern.test(text)) return state;
    }
    return undefined;
  }

  private detectBackend(text: string): BackendConfig | undefined {
    for (const [language, pattern] of Object.entries(this.backendPatterns)) {
      if (pattern.test(text)) {
        const framework = this.getDefaultBackendFramework(language);
        return { 
          language,
          ...(framework && { framework })
        };
      }
    }
    return undefined;
  }

  private detectMobile(text: string): MobileConfig | undefined {
    for (const [platform, pattern] of Object.entries(this.mobilePatterns)) {
      if (pattern.test(text)) {
        return { platform };
      }
    }
    return undefined;
  }

  private detectDeployment(text: string): DeploymentConfig | undefined {
    for (const [platform, pattern] of Object.entries(this.deploymentPatterns)) {
      if (pattern.test(text)) {
        return { platform };
      }
    }
    return undefined;
  }

  private detectComponentLibrary(text: string): ComponentLibrary | undefined {
    if (this.stylingPatterns.mui.test(text)) {
      return { name: 'mui', framework: 'react' };
    }
    if (this.stylingPatterns['chakra-ui'].test(text)) {
      return { name: 'chakra-ui', framework: 'react' };
    }
    if (this.stylingPatterns['ant-design'].test(text)) {
      return { name: 'ant-design', framework: 'react' };
    }
    return undefined;
  }

  private getDefaultStyling(framework: string): string {
    const defaults: Record<string, string> = {
      react: 'tailwind',
      vue: 'tailwind',
      angular: 'scss',
      svelte: 'css',
      nextjs: 'tailwind',
      nuxt: 'tailwind'
    };
    return defaults[framework] || 'css';
  }

  private getDefaultState(framework: string): string {
    const defaults: Record<string, string> = {
      react: 'none',
      vue: 'pinia',
      angular: 'none',
      svelte: 'none',
      nextjs: 'none',
      nuxt: 'pinia'
    };
    return defaults[framework] || 'none';
  }

  private getDefaultBackendFramework(language: string): string | undefined {
    const defaults: Record<string, string> = {
      typescript: 'express',
      javascript: 'express',
      python: 'fastapi',
      java: 'spring',
      csharp: 'dotnet',
      go: 'gin',
      rust: 'axum',
      php: 'laravel'
    };
    return defaults[language];
  }

  private calculateConfidence(frontend: FrontendConfig, backend?: BackendConfig, mobile?: MobileConfig): number {
    let confidence = 60; // Base confidence

    // Framework detection adds confidence
    if (frontend.framework !== 'react') confidence += 15; // Specific framework detected
    if (frontend.styling !== 'css') confidence += 10; // Specific styling detected
    if (frontend.stateManagement && frontend.stateManagement !== 'none') confidence += 10;

    // Backend detection adds confidence
    if (backend) confidence += 15;

    // Mobile detection adds confidence
    if (mobile) confidence += 10;

    return Math.min(confidence, 95); // Cap at 95%
  }

  private generateSuggestions(frontend: FrontendConfig, backend?: BackendConfig, _mobile?: MobileConfig): string[] {
    const suggestions: string[] = [];

    if (!frontend.stateManagement || frontend.stateManagement === 'none') {
      if (frontend.framework === 'react') {
        suggestions.push('Consider adding state management: Redux Toolkit or Zustand');
      } else if (frontend.framework === 'vue') {
        suggestions.push('Consider adding Pinia for state management');
      }
    }

    if (!backend && frontend.framework === 'react') {
      suggestions.push('Consider adding a backend: Node.js with Express or FastAPI');
    }

    if (frontend.styling === 'css') {
      suggestions.push('Consider using Tailwind CSS or a component library');
    }

    return suggestions;
  }
}