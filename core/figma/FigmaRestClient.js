/**
 * FigmaRestClient — Thin wrapper around Figma REST API endpoints used for
 * design-context enrichment (Part B: node data + variables, Part C: Code Connect).
 *
 * All methods degrade gracefully (return null) when the token is absent or the
 * API returns an error, so the generate flow is never blocked.
 */

import { Logger } from '../utils/logger.js';

export class FigmaRestClient {
  constructor(token, logger) {
    this.token = token;
    this.logger = logger || new Logger('FigmaRestClient');
    this.baseUrl = 'https://api.figma.com/v1';
    this.headers = { 'X-Figma-Token': this.token };
  }

  // ---------------------------------------------------------------------------
  // Part B — Node data + component variant properties
  // ---------------------------------------------------------------------------

  /**
   * Fetch a single node's full document object from the Figma REST API.
   * Extracts componentPropertyDefinitions (variant props) when present.
   *
   * @param {string} fileKey
   * @param {string} nodeId  — raw node id (colons or hyphens both work)
   * @returns {{ variants: Object, rawNode: Object } | null}
   */
  async fetchNodeData(fileKey, nodeId) {
    if (!this.token || !fileKey || !nodeId) return null;
    try {
      const encodedId = encodeURIComponent(nodeId.replace(/-/g, ':'));
      const url = `${this.baseUrl}/files/${fileKey}/nodes?ids=${encodedId}&depth=2`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) {
        this.logger.warn(`Figma nodes API ${res.status} for ${fileKey}/${nodeId}`);
        return null;
      }
      const data = await res.json();
      // Find the node document — key may use colons or hyphens
      const nodeDoc = data.nodes?.[nodeId]?.document
        || data.nodes?.[nodeId.replace(/-/g, ':')]?.document
        || Object.values(data.nodes || {})[0]?.document;

      if (!nodeDoc) return null;

      // Extract variant/component property definitions
      const rawVariants = nodeDoc.componentPropertyDefinitions
        || nodeDoc.componentProperties
        || {};
      const variants = {};
      for (const [propName, propDef] of Object.entries(rawVariants)) {
        // Clean up Figma's internal key format "PropName#123" → "PropName"
        const cleanName = propName.replace(/#\d+$/, '');
        if (propDef.variantOptions?.length) {
          variants[cleanName] = propDef.variantOptions;
        } else if (propDef.defaultValue !== undefined) {
          variants[cleanName] = propDef.defaultValue;
        } else if (propDef.type) {
          variants[cleanName] = propDef.type;
        }
      }

      return {
        variants,
        nodeType: nodeDoc.type,
        nodeName: nodeDoc.name,
        rawNode: nodeDoc,
      };
    } catch (err) {
      this.logger.warn('fetchNodeData error:', err.message);
      return null;
    }
  }

  /**
   * Fetch published local variables (design tokens) from the Figma file.
   * Returns a simplified map of { collectionName: { tokenName: value } }.
   *
   * @param {string} fileKey
   * @returns {Object | null}
   */
  async fetchLocalVariables(fileKey) {
    if (!this.token || !fileKey) return null;
    try {
      const url = `${this.baseUrl}/files/${fileKey}/variables/local`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) return null; // 403 on non-Pro plans — degrade silently
      const data = await res.json();

      const result = {};
      const collections = data.meta?.variableCollections || {};
      const variables = data.meta?.variables || {};

      for (const [, variable] of Object.entries(variables)) {
        const collection = collections[variable.variableCollectionId];
        const collName = collection?.name || 'tokens';
        if (!result[collName]) result[collName] = {};
        // Grab the default mode value
        const defaultModeId = collection?.defaultModeId;
        const modeValue = variable.valuesByMode?.[defaultModeId];
        if (modeValue !== undefined) {
          result[collName][variable.name] = modeValue;
        }
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch (err) {
      this.logger.warn('fetchLocalVariables error:', err.message);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Part C — Figma Code Connect (dev_resources)
  // ---------------------------------------------------------------------------

  /**
   * Fetch Code Connect mappings for a node via the Figma dev_resources API.
   * Returns the first mapped code syntax entry, or null if none exists.
   *
   * @param {string} fileKey
   * @param {string} nodeId
   * @returns {{ component: string, componentName: string, importPath: string, props: Object } | null}
   */
  async fetchDevResources(fileKey, nodeId) {
    if (!this.token || !fileKey || !nodeId) return null;
    try {
      const encodedId = encodeURIComponent(nodeId.replace(/-/g, ':'));
      const url = `${this.baseUrl}/files/${fileKey}/dev_resources?node_ids=${encodedId}`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) {
        // 404 = no Code Connect configured; 403 = insufficient plan — both are normal
        if (res.status !== 404 && res.status !== 403) {
          this.logger.warn(`Figma dev_resources API ${res.status}`);
        }
        return null;
      }
      const data = await res.json();
      const resources = data.dev_resources || [];
      if (resources.length === 0) return null;

      // Use the first resource entry
      const first = resources[0];
      const name = first.name || first.link_url?.split('/').pop() || 'Component';
      const importPath = first.link_url || null;

      // codeSyntax may contain actual JSX/HTL snippet — extract component tag if present
      let component = null, props = null;
      const syntax = first.code_syntax?.WEB || first.code_syntax?.REACT || Object.values(first.code_syntax || {})[0];
      if (syntax) {
        component = syntax.trim();
        // Try to extract props from the snippet (rough parse — good enough for LLM context)
        const propMatch = syntax.match(/<[\w]+([^>]*)>/);
        if (propMatch?.[1]) {
          try {
            const propStr = propMatch[1].trim();
            const propPairs = propStr.match(/(\w+)=(?:"([^"]+)"|{([^}]+)})/g) || [];
            props = Object.fromEntries(propPairs.map(p => {
              const m = p.match(/(\w+)=(?:"([^"]+)"|{([^}]+)})/);
              return m ? [m[1], m[2] || m[3]] : null;
            }).filter(Boolean));
          } catch { props = null; }
        }
      }

      // Try to extract component name from import path or name
      const componentName = name.replace(/\.(jsx?|tsx?|vue|html)$/, '').split('/').pop();

      return {
        component: component || `<${componentName} />`,
        componentName,
        importPath,
        props,
        rawResource: first,
      };
    } catch (err) {
      this.logger.warn('fetchDevResources error:', err.message);
      return null;
    }
  }
}
