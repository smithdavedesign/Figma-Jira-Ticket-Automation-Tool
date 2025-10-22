/**
 * Figma Screenshot Utility for MCP Client
 * 
 * Handles secure screenshot fetching via backend API proxy
 * Replaces direct Figma Plugin API calls with server-side requests
 */

interface ScreenshotOptions {
  format?: string;
  scale?: number;
  timeout?: number;
  retries?: number;
}

interface ScreenshotResponse {
  imageUrl: string;
  cached?: boolean;
  metadata?: {
    requestTime?: string;
    nodeId: string;
    nodeName: string;
    [key: string]: any;
  };
}

interface ScreenshotMetadata {
  nodeId: string;
  nodeName: string;
  nodeType?: string;
  fileKey: string;
  captureTime: string;
  source: string;
  fallback?: boolean;
}

interface SmartScreenshotResult {
  imageUrl: string;
  metadata: ScreenshotMetadata;
}

interface FallbackScreenshotResult {
  imageUrl: string;
  metadata: ScreenshotMetadata;
}

/**
 * Configuration for screenshot API
 */
const SCREENSHOT_CONFIG = {
  // Production API endpoint
  PRODUCTION_API: 'https://your-production-server.com/api/figma/screenshot',
  
  // Development API endpoint
  DEVELOPMENT_API: 'http://localhost:3000/api/figma/screenshot',
  
  // Default settings
  DEFAULT_FORMAT: 'png',
  DEFAULT_SCALE: 2,
  
  // Timeout settings
  TIMEOUT_MS: 15000, // 15 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000 // 1 second
};

/**
 * Fetch screenshot from backend API
 * 
 * @param fileKey - Figma file key
 * @param nodeId - Node ID to capture
 * @param options - Additional options
 * @returns Screenshot URL
 */
export async function fetchScreenshot(
  fileKey: string, 
  nodeId: string, 
  options: ScreenshotOptions = {}
): Promise<string> {
  const {
    format = SCREENSHOT_CONFIG.DEFAULT_FORMAT,
    scale = SCREENSHOT_CONFIG.DEFAULT_SCALE,
    timeout = SCREENSHOT_CONFIG.TIMEOUT_MS,
    retries = SCREENSHOT_CONFIG.MAX_RETRIES
  } = options;

  // For Figma plugin, assume development for now
  // TODO: Add proper environment detection
  const baseUrl = SCREENSHOT_CONFIG.DEVELOPMENT_API;

  // Build request URL
  const params = new URLSearchParams({
    fileKey,
    nodeId,
    format,
    scale: scale.toString()
  });
  
  const requestUrl = `${baseUrl}?${params.toString()}`;
  console.log(`📸 Fetching screenshot from backend: ${nodeId} in ${fileKey}`);

  let lastError: Error | undefined;
  
  // Retry logic
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📸 Attempt ${attempt}/${retries}: ${requestUrl}`);
      
      // Note: Figma plugin environment doesn't have AbortController
      // Using basic fetch with timeout handling
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Design-Intelligence-MCP-Client/1.0.0'
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Screenshot API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage += `. ${errorData.message}`;
          }
        } catch {
          // Ignore JSON parse errors for error responses
        }
        throw new Error(errorMessage);
      }
      
      const data: ScreenshotResponse = await response.json();
      
      if (!data.imageUrl) {
        throw new Error('No image URL returned from screenshot API');
      }
      
      console.log(`✅ Screenshot fetched successfully:`, {
        nodeId,
        fileKey,
        cached: data.cached,
        imageUrl: data.imageUrl.substring(0, 50) + '...',
        requestTime: data.metadata?.requestTime
      });
      
      return data.imageUrl;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`❌ Screenshot fetch attempt ${attempt} failed:`, lastError.message);
      
      // Don't retry on certain errors
      if (lastError.message.includes('400') || lastError.message.includes('404')) {
        // Don't retry client errors
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const delay = SCREENSHOT_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Screenshot fetch failed after all retries');
}

/**
 * Enhanced screenshot fetcher with smart node selection
 * 
 * @param fileKey - Figma file key  
 * @param selection - Current Figma selection
 * @param options - Additional options
 * @returns Screenshot data with metadata
 */
export async function fetchSmartScreenshot(
  fileKey: string, 
  selection: any[], 
  options: ScreenshotOptions = {}
): Promise<SmartScreenshotResult> {
  try {
    // Smart node selection logic (similar to existing MCP logic)
    let targetNode: any;
    
    if (!selection || selection.length === 0) {
      throw new Error('No selection provided for screenshot');
    }
    
    if (selection.length === 1) {
      targetNode = selection[0];
    } else {
      // For multiple selections, try to find the best parent frame
      targetNode = selection[0]; // Fallback to first selection
      
      // TODO: Implement smart parent detection if needed
      console.log(`📸 Multiple selections (${selection.length}), using first: ${targetNode.name}`);
    }
    
    if (!targetNode || !targetNode.id) {
      throw new Error('Invalid target node for screenshot');
    }
    
    console.log(`📸 Smart screenshot: capturing ${targetNode.name} (${targetNode.type})`);
    
    // Fetch screenshot via backend
    const imageUrl = await fetchScreenshot(fileKey, targetNode.id, options);
    
    return {
      imageUrl,
      metadata: {
        nodeId: targetNode.id,
        nodeName: targetNode.name,
        nodeType: targetNode.type,
        fileKey,
        captureTime: new Date().toISOString(),
        source: 'backend-api'
      }
    };
    
  } catch (error) {
    console.error('❌ Smart screenshot failed:', error);
    throw error;
  }
}

/**
 * Fallback screenshot function for development/testing
 * Returns a placeholder when backend is unavailable
 */
export function getFallbackScreenshot(nodeId: string, nodeName: string = 'Unknown'): FallbackScreenshotResult {
  const svgContent = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
      <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
        Screenshot Unavailable
      </text>
      <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="12" fill="#999">
        ${nodeName}
      </text>
      <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
        Backend API not available
      </text>
    </svg>
  `;
  
  // Create base64 encoded SVG
  const base64Content = btoa(svgContent);
  const placeholderUrl = `data:image/svg+xml;base64,${base64Content}`;
  
  return {
    imageUrl: placeholderUrl,
    metadata: {
      nodeId,
      nodeName,
      fallback: true,
      source: 'placeholder',
      fileKey: 'unknown',
      captureTime: new Date().toISOString()
    }
  };
}

/**
 * Test backend API connectivity
 */
export async function testBackendConnection(): Promise<boolean> {
  try {
    const healthUrl = 'http://localhost:3000/api/figma/health';
    
    const response = await fetch(healthUrl, { 
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API health check passed:', data);
      return true;
    } else {
      throw new Error(`Health check failed: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Backend API health check failed:', error);
    return false;
  }
}

export { SCREENSHOT_CONFIG };