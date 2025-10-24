/**
 * 🔄 Design Spec Migration System
 * 
 * Handles schema evolution and migration between different versions
 * of the designSpec format to ensure backward compatibility.
 */

import { 
  DesignSpec, 
  DesignSpecMetadata,
  SchemaVersion, 
  DESIGN_SPEC_VERSION 
} from '../schema/design-spec.js';

export interface MigrationResult {
  success: boolean;
  originalVersion: string;
  targetVersion: string;
  migratedSpec?: DesignSpec;
  warnings: string[];
  errors: string[];
  migrationLog: MigrationLogEntry[];
}

export interface MigrationLogEntry {
  timestamp: string;
  operation: string;
  path: string;
  description: string;
  oldValue?: any;
  newValue?: any;
}

export interface MigrationRule {
  fromVersion: string;
  toVersion: string;
  priority: number;
  description: string;
  transform: (spec: any) => Promise<any>;
  validate?: (spec: any) => boolean;
}

export class DesignSpecMigrationManager {
  private migrationRules: Map<string, MigrationRule>;
  private migrationHistory: Map<string, MigrationLogEntry[]>;

  constructor() {
    this.migrationRules = new Map();
    this.migrationHistory = new Map();
    this.initializeMigrationRules();
  }

  /**
   * Migrate a design spec to the current version
   */
  async migrateToCurrentVersion(spec: any): Promise<MigrationResult> {
    const originalVersion = this.extractVersion(spec);
    const targetVersion = DESIGN_SPEC_VERSION;

    if (originalVersion === targetVersion) {
      return {
        success: true,
        originalVersion,
        targetVersion,
        migratedSpec: spec as DesignSpec,
        warnings: [],
        errors: [],
        migrationLog: []
      };
    }

    console.log(`🔄 Migrating designSpec from v${originalVersion} to v${targetVersion}...`);

    try {
      const migrationPath = this.calculateMigrationPath(originalVersion, targetVersion);
      const result = await this.executeMigrationPath(spec, migrationPath);

      console.log(`✅ Migration completed successfully from v${originalVersion} to v${targetVersion}`);
      return result;

    } catch (error) {
      console.error(`❌ Migration failed from v${originalVersion} to v${targetVersion}:`, error);
      return {
        success: false,
        originalVersion,
        targetVersion,
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown migration error'],
        migrationLog: []
      };
    }
  }

  /**
   * Migrate to a specific version
   */
  async migrateToVersion(spec: any, targetVersion: string): Promise<MigrationResult> {
    const originalVersion = this.extractVersion(spec);
    
    if (originalVersion === targetVersion) {
      return {
        success: true,
        originalVersion,
        targetVersion,
        migratedSpec: spec as DesignSpec,
        warnings: [],
        errors: [],
        migrationLog: []
      };
    }

    try {
      const migrationPath = this.calculateMigrationPath(originalVersion, targetVersion);
      const result = await this.executeMigrationPath(spec, migrationPath);
      return result;

    } catch (error) {
      return {
        success: false,
        originalVersion,
        targetVersion,
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown migration error'],
        migrationLog: []
      };
    }
  }

  /**
   * Check if migration is needed
   */
  needsMigration(spec: any): boolean {
    const specVersion = this.extractVersion(spec);
    return specVersion !== DESIGN_SPEC_VERSION;
  }

  /**
   * Get available migration paths from a version
   */
  getAvailableMigrations(fromVersion: string): string[] {
    const migrations: string[] = [];
    
    for (const [key, rule] of this.migrationRules) {
      if (rule.fromVersion === fromVersion) {
        migrations.push(rule.toVersion);
      }
    }
    
    return migrations.sort();
  }

  /**
   * Get migration history for a spec
   */
  getMigrationHistory(specId: string): MigrationLogEntry[] {
    return this.migrationHistory.get(specId) || [];
  }

  /**
   * Register a custom migration rule
   */
  registerMigrationRule(rule: MigrationRule): void {
    const key = `${rule.fromVersion}->${rule.toVersion}`;
    this.migrationRules.set(key, rule);
    console.log(`📝 Registered migration rule: ${key}`);
  }

  // =============================================================================
  // PRIVATE MIGRATION METHODS
  // =============================================================================

  private initializeMigrationRules(): void {
    // Migration from 0.9.x to 1.0.0
    this.registerMigrationRule({
      fromVersion: '0.9.0',
      toVersion: '1.0.0',
      priority: 1,
      description: 'Upgrade to stable v1.0 schema with enhanced accessibility data',
      transform: async (spec: any) => {
        return this.migrate_0_9_0_to_1_0_0(spec);
      },
      validate: (spec: any) => {
        return spec.metadata && spec.designTokens && spec.components;
      }
    });

    // Migration from 1.0.0 to 1.1.0 (future)
    this.registerMigrationRule({
      fromVersion: '1.0.0',
      toVersion: '1.1.0',
      priority: 1,
      description: 'Add enhanced responsive design features',
      transform: async (spec: any) => {
        return this.migrate_1_0_0_to_1_1_0(spec);
      }
    });

    console.log(`📋 Initialized ${this.migrationRules.size} migration rules`);
  }

  private extractVersion(spec: any): string {
    if (spec?.metadata?.version) {
      return spec.metadata.version;
    }
    
    // Legacy version detection
    if (spec?.version) {
      return spec.version;
    }
    
    // Default to earliest known version
    return '0.9.0';
  }

  private calculateMigrationPath(fromVersion: string, toVersion: string): string[] {
    // Simple path calculation - could be enhanced with graph algorithms for complex paths
    const path: string[] = [];
    let currentVersion = fromVersion;

    // For now, support direct migrations only
    // Future enhancement: support multi-step migrations
    const directMigrationKey = `${fromVersion}->${toVersion}`;
    
    if (this.migrationRules.has(directMigrationKey)) {
      path.push(toVersion);
      return path;
    }

    // If no direct path, try to find intermediate steps
    // This is a simplified implementation - real-world would use pathfinding
    const availableMigrations = this.getAvailableMigrations(fromVersion);
    
    for (const intermediateVersion of availableMigrations) {
      const versionNumber = this.parseVersionNumber(intermediateVersion);
      const targetVersionNumber = this.parseVersionNumber(toVersion);
      
      if (versionNumber <= targetVersionNumber) {
        path.push(intermediateVersion);
        
        // Try to continue from this intermediate version
        const remainingPath = this.calculateMigrationPath(intermediateVersion, toVersion);
        path.push(...remainingPath);
        break;
      }
    }

    return path;
  }

  private async executeMigrationPath(
    spec: any,
    migrationPath: string[]
  ): Promise<MigrationResult> {
    let currentSpec = { ...spec };
    const warnings: string[] = [];
    const errors: string[] = [];
    const migrationLog: MigrationLogEntry[] = [];
    const originalVersion = this.extractVersion(spec);

    for (let i = 0; i < migrationPath.length; i++) {
      const targetVersion = migrationPath[i];
      const fromVersion = i === 0 ? originalVersion : migrationPath[i - 1];
      const migrationKey = `${fromVersion}->${targetVersion}`;
      
      const rule = this.migrationRules.get(migrationKey);
      if (!rule) {
        const error = `No migration rule found for ${migrationKey}`;
        errors.push(error);
        continue;
      }

      try {
        console.log(`🔧 Applying migration: ${rule.description}`);
        
        const migratedSpec = await rule.transform(currentSpec);
        
        // Validate if validation function provided
        if (rule.validate && !rule.validate(migratedSpec)) {
          warnings.push(`Migration ${migrationKey} validation failed`);
        }

        // Log the migration
        migrationLog.push({
          timestamp: new Date().toISOString(),
          operation: 'migrate',
          path: migrationKey,
          description: rule.description,
          oldValue: fromVersion,
          newValue: targetVersion
        });

        currentSpec = migratedSpec;

      } catch (error) {
        const errorMessage = `Migration ${migrationKey} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(`❌ ${errorMessage}`);
      }
    }

    // Store migration history
    if (currentSpec.metadata?.specId) {
      this.migrationHistory.set(currentSpec.metadata.specId, migrationLog);
    }

    return {
      success: errors.length === 0,
      originalVersion,
      targetVersion: migrationPath[migrationPath.length - 1] || originalVersion,
      migratedSpec: currentSpec as DesignSpec,
      warnings,
      errors,
      migrationLog
    };
  }

  private parseVersionNumber(version: string): number {
    const parts = version.split('.').map(part => parseInt(part, 10));
    return (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
  }

  // =============================================================================
  // SPECIFIC MIGRATION IMPLEMENTATIONS
  // =============================================================================

  private async migrate_0_9_0_to_1_0_0(spec: any): Promise<any> {
    console.log('🔄 Migrating from v0.9.0 to v1.0.0...');

    const migratedSpec = { ...spec };

    // Update version
    if (!migratedSpec.metadata) {
      migratedSpec.metadata = {};
    }
    migratedSpec.metadata.version = '1.0.0';

    // Add missing metadata fields
    if (!migratedSpec.metadata.specId) {
      migratedSpec.metadata.specId = `migrated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Ensure required top-level sections exist
    if (!migratedSpec.designTokens) {
      migratedSpec.designTokens = {
        colors: [],
        typography: [],
        spacing: [],
        effects: [],
        borders: [],
        radii: []
      };
    }

    if (!migratedSpec.components) {
      migratedSpec.components = [];
    }

    if (!migratedSpec.designSystem) {
      migratedSpec.designSystem = {
        detected: {
          system: 'custom',
          confidence: 0.5,
          evidence: ['Migrated from v0.9.0']
        },
        compliance: {
          overall: 0.5,
          categories: {
            colors: { score: 0.5, passed: 0, total: 0, issues: [] },
            typography: { score: 0.5, passed: 0, total: 0, issues: [] },
            spacing: { score: 0.5, passed: 0, total: 0, issues: [] },
            components: { score: 0.5, passed: 0, total: 0, issues: [] }
          },
          violations: [],
          recommendations: []
        },
        systemTokens: {
          colors: 0,
          typography: 0,
          spacing: 0,
          components: 0,
          coverage: 0
        }
      };
    }

    // Add enhanced accessibility section (new in v1.0.0)
    if (!migratedSpec.accessibility) {
      migratedSpec.accessibility = {
        compliance: {
          wcag: 'partial',
          score: 0.5,
          automated: true
        },
        semantics: {
          headingStructure: [],
          landmarks: [],
          navigation: [],
          forms: []
        },
        colorAccessibility: {
          contrastIssues: [],
          colorDependency: false,
          colorBlindnessIssues: []
        },
        interaction: {
          focusable: [],
          keyboardNavigation: true,
          touchTargets: []
        },
        content: {
          altTexts: [],
          textScaling: true,
          readingOrder: []
        },
        issues: [],
        recommendations: []
      };
    }

    // Add responsive design section if missing
    if (!migratedSpec.responsive) {
      migratedSpec.responsive = {
        breakpoints: [],
        layouts: [],
        flexible: {
          flexbox: [],
          grid: [],
          responsive: []
        },
        mobileFriendly: {
          isMobileFriendly: true,
          issues: [],
          recommendations: []
        }
      };
    }

    // Add context section if missing
    if (!migratedSpec.context) {
      migratedSpec.context = {
        intent: {
          purpose: 'Migrated design specification',
          context: 'web'
        },
        technical: {
          platform: 'web'
        },
        decisions: {
          rationale: [],
          assumptions: ['Migrated from legacy format'],
          constraints: [],
          tradeoffs: []
        },
        quality: {
          completeness: 0.7,
          consistency: 0.7,
          clarity: 0.7,
          complexity: 0.5,
          confidence: 0.6
        }
      };
    }

    return migratedSpec;
  }

  private async migrate_1_0_0_to_1_1_0(spec: any): Promise<any> {
    console.log('🔄 Migrating from v1.0.0 to v1.1.0...');

    const migratedSpec = { ...spec };

    // Update version
    migratedSpec.metadata.version = '1.1.0';

    // Add enhanced responsive features (hypothetical v1.1.0 feature)
    if (migratedSpec.responsive) {
      migratedSpec.responsive.enhancedFeatures = {
        containerQueries: [],
        fluidTypography: [],
        responsiveImages: [],
        viewportUnits: []
      };
    }

    // Add performance metrics section (hypothetical v1.1.0 feature)
    migratedSpec.performance = {
      metrics: {
        bundleSize: 0,
        renderTime: 0,
        accessibilityScore: 0,
        performanceScore: 0
      },
      optimizations: [],
      recommendations: []
    };

    return migratedSpec;
  }
}

// =============================================================================
// SCHEMA VERSION UTILITIES
// =============================================================================

export class SchemaVersionManager {
  /**
   * Parse version string into components
   */
  static parseVersion(version: string): SchemaVersion | null {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    
    if (!match) return null;

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4]
    };
  }

  /**
   * Compare two versions
   */
  static compareVersions(a: string, b: string): number {
    const versionA = this.parseVersion(a);
    const versionB = this.parseVersion(b);

    if (!versionA || !versionB) {
      throw new Error('Invalid version format');
    }

    if (versionA.major !== versionB.major) {
      return versionA.major - versionB.major;
    }

    if (versionA.minor !== versionB.minor) {
      return versionA.minor - versionB.minor;
    }

    if (versionA.patch !== versionB.patch) {
      return versionA.patch - versionB.patch;
    }

    return 0;
  }

  /**
   * Check if version is compatible
   */
  static isCompatible(specVersion: string, systemVersion: string): boolean {
    const spec = this.parseVersion(specVersion);
    const system = this.parseVersion(systemVersion);

    if (!spec || !system) return false;

    // Major versions must match
    if (spec.major !== system.major) return false;

    // Spec minor version must be <= system minor version
    if (spec.minor > system.minor) return false;

    return true;
  }

  /**
   * Get next version for a given increment type
   */
  static incrementVersion(
    version: string, 
    increment: 'major' | 'minor' | 'patch'
  ): string {
    const parsed = this.parseVersion(version);
    if (!parsed) throw new Error('Invalid version format');

    switch (increment) {
      case 'major':
        return `${parsed.major + 1}.0.0`;
      case 'minor':
        return `${parsed.major}.${parsed.minor + 1}.0`;
      case 'patch':
        return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    }
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick migration function for simple use cases
 */
export async function migrateDesignSpec(spec: any): Promise<DesignSpec> {
  const migrationManager = new DesignSpecMigrationManager();
  const result = await migrationManager.migrateToCurrentVersion(spec);
  
  if (!result.success) {
    throw new Error(`Migration failed: ${result.errors.join(', ')}`);
  }
  
  return result.migratedSpec!;
}

/**
 * Create a singleton migration manager
 */
let globalMigrationManager: DesignSpecMigrationManager | null = null;

export function getGlobalMigrationManager(): DesignSpecMigrationManager {
  if (!globalMigrationManager) {
    globalMigrationManager = new DesignSpecMigrationManager();
  }
  return globalMigrationManager;
}