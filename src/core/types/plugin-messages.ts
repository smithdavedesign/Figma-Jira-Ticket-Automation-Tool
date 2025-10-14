/**
 * Plugin Message Types
 * Defines communication between plugin and UI
 */

// Plugin to UI Messages (Commands)
export interface GenerateTicketMessage {
  type: 'generate-ticket';
}

export interface ClosePluginMessage {
  type: 'close-plugin';
}

export interface CalculateComplianceMessage {
  type: 'calculate-compliance';
}

// UI to Plugin Messages (Responses)
export interface FrameDataMessage {
  type: 'frame-data';
  data: any[]; // Will be properly typed once we move FrameData
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export interface DesignSystemDetectedMessage {
  type: 'design-system-detected';
  designSystem: any; // Will be properly typed once we move DesignSystem
}

export interface NoDesignSystemMessage {
  type: 'no-design-system';
}

export interface ComplianceResultsMessage {
  type: 'compliance-results';
  compliance: any; // Will be properly typed once we move ComplianceScore
  selectionCount: number;
}

export interface ComplianceErrorMessage {
  type: 'compliance-error';
  message: string;
}

export interface FileContextMessage {
  type: 'file-context';
  fileKey: string;
  fileName: string;
}

// Union Types
export type PluginMessage = 
  | GenerateTicketMessage 
  | ClosePluginMessage 
  | CalculateComplianceMessage;

export type UIMessage = 
  | FrameDataMessage 
  | ErrorMessage 
  | DesignSystemDetectedMessage 
  | NoDesignSystemMessage 
  | ComplianceResultsMessage 
  | ComplianceErrorMessage 
  | FileContextMessage;