/**
 * Figma API Adapter
 *
 * Provides a clean interface to the Figma Plugin API
 * Converted from TypeScript to JavaScript with JSDoc types
 *
 * @typedef {Object} ShowUIOptions
 * @property {number} [width] - UI width
 * @property {number} [height] - UI height
 * @property {boolean} [themeColors] - Use theme colors
 */

/**
 * Clean interface to the Figma Plugin API
 */
export class FigmaAPI {
  /**
   * Get current selection
   * @returns {Array} Array of selected nodes
   */
  static get selection() {
    return (figma.currentPage?.selection || []);
  }

  /**
   * Get current page
   * @returns {Object} Current page node
   */
  static get currentPage() {
    return figma.currentPage;
  }

  /**
   * Get file key
   * @returns {string} File key
   */
  static get fileKey() {
    return figma.fileKey || '';
  }

  /**
   * Get root document node
   * @returns {Object} Root document node
   */
  static get root() {
    return figma.root;
  }

  /**
   * Post message to UI
   * @param {Object} message - Message to send
   */
  static postMessage(message) {
    figma.ui.postMessage(message);
  }

  /**
   * Close the plugin
   */
  static closePlugin() {
    figma.closePlugin();
  }

  /**
   * Show the plugin UI
   * @param {string} html - HTML content
   * @param {ShowUIOptions} [options] - UI options
   */
  static showUI(html, options) {
    figma.showUI(html, options);
  }
}