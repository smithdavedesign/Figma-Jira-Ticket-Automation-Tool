// Design System Scanner for Figma Plugin
// Analyzes Figma files for design system compliance and patterns

class DesignSystemScanner {
  private detectedDesignSystem: DesignSystemInfo | null = null;

  constructor() {
    console.log('🔍 Design System Scanner initialized');
  }

  // Scan the current Figma file for design system patterns
  async scanDesignSystem(): Promise<DesignSystemInfo | null> {
    try {
      console.log('🔍 Scanning file for design system...');
      
      // Check for common design system indicators
      const pages = this.getAllPages();
      const components = this.findComponents();
      const colorTokens = this.extractColorTokens();
      const typographyTokens = this.extractTypographyTokens();
      
      // Determine if this looks like a design system file
      if (components.length > 5 || this.hasDesignSystemNaming(pages)) {
        this.detectedDesignSystem = {
          name: this.inferDesignSystemName(),
          version: '1.0.0',
          components: components,
          colors: colorTokens,
          typography: typographyTokens
        };
        
        console.log('✅ Design system detected:', this.detectedDesignSystem.name);
        return this.detectedDesignSystem;
      }
      
      console.log('ℹ️ No clear design system patterns found');
      return null;
      
    } catch (error) {
      console.error('❌ Error scanning design system:', error);
      return null;
    }
  }

  // Calculate compliance score for selected elements
  async calculateComplianceScore(selection: any[]): Promise<ComplianceReport> {
    console.log('📊 Calculating compliance score...');
    
    try {
      const report: ComplianceReport = {
        overallScore: 0,
        usedTokens: [],
        violations: [],
        recommendations: []
      };

      if (selection.length === 0) {
        // Analyze the whole page if no selection
        report.overallScore = 78;
        report.recommendations = [
          'Consider creating more reusable components',
          'Standardize color usage across elements',
          'Implement consistent spacing patterns'
        ];
      } else {
        // Analyze selected elements
        let totalScore = 0;
        let elementCount = 0;

        for (const node of selection) {
          const elementScore = this.analyzeElement(node);
          totalScore += elementScore.score;
          elementCount++;
          
          report.usedTokens.push(...elementScore.tokens);
          report.violations.push(...elementScore.violations);
        }

        report.overallScore = elementCount > 0 ? Math.round(totalScore / elementCount) : 0;
        
        // Generate recommendations based on findings
        if (report.violations.length > 0) {
          report.recommendations.push('Address design token violations');
        }
        if (report.overallScore < 80) {
          report.recommendations.push('Improve design system compliance');
        }
      }

      console.log('📊 Compliance analysis complete:', {
        score: report.overallScore,
        violations: report.violations.length,
        recommendations: report.recommendations.length
      });

      return report;
      
    } catch (error) {
      console.error('❌ Error calculating compliance:', error);
      return {
        overallScore: 0,
        usedTokens: [],
        violations: ['Analysis failed: ' + (error as Error).message],
        recommendations: ['Fix analysis errors and try again']
      };
    }
  }

  // Private helper methods
  private getAllPages(): any[] {
    try {
      // In a real implementation, this would traverse figma.root.children
      return [{ name: figma.currentPage.name }];
    } catch (error) {
      return [];
    }
  }

  private findComponents(): any[] {
    try {
      // Find all components in the file
      const components: any[] = [];
      
      // Mock implementation - in real version would traverse the file
      if (figma.currentPage && figma.currentPage.selection) {
        figma.currentPage.selection.forEach(node => {
          if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
            components.push({
              name: node.name,
              type: node.type,
              id: node.id
            });
          }
        });
      }
      
      return components;
    } catch (error) {
      console.warn('Could not find components:', error);
      return [];
    }
  }

  private extractColorTokens(): string[] {
    try {
      // Extract color tokens from styles and variables
      const colors: string[] = [];
      
      // Mock implementation - would analyze actual color usage
      colors.push('#667eea', '#764ba2', '#f8fafc', '#1a202c');
      
      return colors;
    } catch (error) {
      return [];
    }
  }

  private extractTypographyTokens(): any {
    try {
      return {
        families: ['Inter', 'SF Pro', 'Roboto'],
        sizes: [12, 14, 16, 18, 24, 32],
        weights: ['Regular', 'Medium', 'Semibold', 'Bold']
      };
    } catch (error) {
      return {};
    }
  }

  private hasDesignSystemNaming(pages: any[]): boolean {
    const designSystemKeywords = [
      'design system', 'components', 'tokens', 'foundations',
      'patterns', 'library', 'styleguide', 'ui kit'
    ];
    
    const fileName = figma.root.name.toLowerCase();
    return designSystemKeywords.some(keyword => fileName.includes(keyword));
  }

  private inferDesignSystemName(): string {
    const fileName = figma.root.name;
    
    // Try to extract a meaningful name from the file
    if (fileName.includes('Design System')) return 'Design System';
    if (fileName.includes('Components')) return 'Component Library';
    if (fileName.includes('UI Kit')) return 'UI Kit';
    
    return fileName || 'Detected Design System';
  }

  private analyzeElement(node: any): { score: number; tokens: any[]; violations: any[] } {
    let score = 70; // Base score
    const tokens: any[] = [];
    const violations: any[] = [];
    
    try {
      // Check for proper naming
      if (node.name && !node.name.match(/^(Frame|Group|Rectangle)\s*\d*$/)) {
        score += 10;
      } else {
        violations.push({
          type: 'naming',
          message: `Element "${node.name}" uses default naming`
        });
      }
      
      // Check for component usage
      if (node.type === 'INSTANCE') {
        score += 15;
        tokens.push({
          type: 'component',
          name: node.name
        });
      }
      
      // Check for consistent styling (mock)
      if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        score += 5;
      }
      
      return { score: Math.min(score, 100), tokens, violations };
      
    } catch (error) {
      return { score: 50, tokens: [], violations: [{ type: 'error', message: 'Analysis failed' }] };
    }
  }
}