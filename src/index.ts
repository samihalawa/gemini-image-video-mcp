import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CallToolRequest,
  ListToolsRequest,
  ListPromptsRequest,
  GetPromptRequest,
  Tool,
  Prompt,
  GetPromptResult,
  CallToolResult,
  Transport,
} from "@modelcontextprotocol/sdk/types.js";
import { Logger } from "./logger.js";
import { 
  PROTOCOL, 
  ToolArguments, 
  EnvSchema,
  GeminiAPIError 
} from "./constants.js";
import { GeminiAPIClient } from "./gemini-client.js";
import { 
  getToolDefinitions, 
  getPromptDefinitions, 
  executeTool, 
  toolExists, 
  getPromptMessage 
} from "./tools/registry.js";

let transport: Transport;
let isProcessing = false; 
let currentOperationName = ""; 
let latestOutput = "";

const server = new Server(
  {
    name: "gemini-ai-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
      notifications: {},
      logging: {},
    },
  },
);

// Initialize Gemini API client
let geminiClient: GeminiAPIClient;
try {
  const env = EnvSchema.parse(process.env);
  geminiClient = new GeminiAPIClient(env.GEMINI_API_KEY);
  Logger.info("✅ Gemini API client initialized successfully");
} catch (error) {
  Logger.error("❌ Failed to initialize Gemini API client:", error);
  process.exit(1);
}

async function sendNotification(method: string, params: any) {
  try {
    await server.notification({ method, params });
  } catch (error) {
    Logger.error("Notification failed:", error);
  }
}

/**
 * Send progress notification to client
 * @param progressToken The progress token provided by the client
 * @param progress The current progress value
 * @param total Optional total value
 * @param message Optional status message
 */
async function sendProgressNotification(
  progressToken: string | number | undefined,
  progress: number,
  total?: number,
  message?: string
) {
  if (!progressToken) return;
  
  try {
    const params: any = {
      progressToken,
      progress
    };
    
    if (total !== undefined) params.total = total;
    if (message) params.message = message;
    
    await server.notification({
      method: PROTOCOL.NOTIFICATIONS.PROGRESS,
      params
    });
  } catch (error) {
    Logger.error("Failed to send progress notification:", error);
  }
}

function startProgressUpdates(
  operationName: string,
  progressToken?: string | number
) {
  isProcessing = true;
  currentOperationName = operationName;
  latestOutput = "";
  
  const progressMessages = [
    `🎨 ${operationName} - Preparing your creative request...`,
    `⚡ ${operationName} - Connecting to Gemini AI models...`,
    `🔄 ${operationName} - Generating content (this may take a moment)...`,
    `⏳ ${operationName} - Still processing... Quality results take time...`,
    `🎯 ${operationName} - Finalizing your media output...`,
  ];
  
  let messageIndex = 0;
  let progress = 0;
  
  if (progressToken) {
    sendProgressNotification(
      progressToken,
      0,
      undefined,
      `🎨 Starting ${operationName}`
    );
  }
  
  const progressInterval = setInterval(async () => {
    if (isProcessing && progressToken) {
      progress += 1;
      
      const baseMessage = progressMessages[messageIndex % progressMessages.length];
      const outputPreview = latestOutput.slice(-100).trim();
      const message = outputPreview 
        ? `${baseMessage}\n📝 Status: ...${outputPreview}`
        : baseMessage;
      
      await sendProgressNotification(
        progressToken,
        progress,
        undefined,
        message
      );
      messageIndex++;
    } else if (!isProcessing) {
      clearInterval(progressInterval);
    }
  }, PROTOCOL.KEEPALIVE_INTERVAL);
  
  return { interval: progressInterval, progressToken };
}

function stopProgressUpdates(
  progressData: { interval: NodeJS.Timeout; progressToken?: string | number },
  success: boolean = true
) {
  const operationName = currentOperationName;
  isProcessing = false;
  currentOperationName = "";
  clearInterval(progressData.interval);
  
  if (progressData.progressToken) {
    sendProgressNotification(
      progressData.progressToken,
      100,
      100,
      success ? `✅ ${operationName} completed successfully!` : `❌ ${operationName} failed`
    );
  }
}

// Tools list handler
server.setRequestHandler(ListToolsRequestSchema, async (request: ListToolsRequest): Promise<{ tools: Tool[] }> => {
  Logger.debug("📋 Tools list requested");
  return { tools: getToolDefinitions() as unknown as Tool[] };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
  const toolName: string = request.params.name;

  if (toolExists(toolName)) {
    const progressToken = (request.params as any)._meta?.progressToken;
    const progressData = startProgressUpdates(toolName, progressToken);
    
    try {
      const args: ToolArguments = (request.params.arguments as ToolArguments) || {};
      
      Logger.toolInvocation(toolName, args);

      // Execute tool with Gemini client and progress callback
      const result = await executeTool(toolName, args, geminiClient, (newOutput) => {
        latestOutput = newOutput;
      });

      stopProgressUpdates(progressData, true);
      Logger.toolSuccess(toolName, result);

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
        isError: false,
      };
    } catch (error) {
      stopProgressUpdates(progressData, false);
      
      Logger.error(`Error in tool '${toolName}':`, error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof GeminiAPIError) {
        errorMessage = `${error.message} (${error.code})`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        content: [
          {
            type: "text",
            text: `❌ Error executing ${toolName}: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  } else {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

// Prompts list handler
server.setRequestHandler(ListPromptsRequestSchema, async (request: ListPromptsRequest): Promise<{ prompts: Prompt[] }> => {
  Logger.debug("📋 Prompts list requested");
  return { prompts: getPromptDefinitions() as unknown as Prompt[] };
});

// Prompt handler
server.setRequestHandler(GetPromptRequestSchema, async (request: GetPromptRequest): Promise<GetPromptResult> => {
  const promptName = request.params.name;
  const args = request.params.arguments || {};
  
  const promptMessage = getPromptMessage(promptName, args);
  
  if (!promptMessage) {
    throw new Error(`Unknown prompt: ${promptName}`);
  }
  
  return { 
    messages: [{
      role: "user" as const,
      content: {
        type: "text" as const,
        text: promptMessage
      }
    }]
  };
});

// Resource handler (for future implementation)
server.setRequestHandler("resources/list", async () => {
  return { resources: [] };
});

// Health check endpoint
async function healthCheck() {
  try {
    const isHealthy = await geminiClient.healthCheck();
    if (isHealthy) {
      Logger.info("✅ Gemini API health check passed");
      return { status: "healthy", timestamp: new Date().toISOString() };
    } else {
      Logger.warn("⚠️ Gemini API health check failed");
      return { status: "unhealthy", timestamp: new Date().toISOString() };
    }
  } catch (error) {
    Logger.error("❌ Health check error:", error);
    return { 
      status: "error", 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString() 
    };
  }
}

// Start the server
async function main() {
  Logger.info("🚀 Starting Gemini AI MCP Server...");
  Logger.info("📡 Compatible with smithery.ai and MCP protocol");
  
  // Check for stdio transport (local development)
  const transport = new StdioServerTransport();
  await server.connect(transport);
  Logger.info("✅ MCP Server listening on stdio transport");
  
  // Log health status
  const health = await healthCheck();
  Logger.info(`🏥 Health status: ${health.status}`);
}

main().catch((error) => {
  Logger.error("💥 Fatal error:", error);
  process.exit(1);
});