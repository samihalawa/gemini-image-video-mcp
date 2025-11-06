// Export all tool modules
export { imageGenerationTools } from "./image-generation.js";
export { videoGenerationTools } from "./video-generation.js";
export { mediaManagementTools } from "./media-management.js";
export { textProcessingTools } from "./text-processing.js";

// Export registry utilities
export { 
  registerTool, 
  UnifiedTool, 
  toolRegistry, 
  toolExists, 
  getToolDefinitions, 
  getPromptDefinitions, 
  executeTool, 
  getPromptMessage 
} from "./registry.js";

// Tool execution callback type
export type { ToolExecutionCallback } from "./registry.js";

// Auto-register all tools on module import
import "./image-generation.js";
import "./video-generation.js";
import "./media-management.js";
import "./text-processing.js";

console.log("🔧 All Gemini AI MCP tools registered successfully!");