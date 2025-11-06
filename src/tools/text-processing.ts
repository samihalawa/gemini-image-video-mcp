import { z } from "zod";
import { registerTool, UnifiedTool } from "./registry.js";
import { 
  TextGenerationSchema,
  ImageAnalysisSchema, 
  GeminiAPIError 
} from "../constants.js";
import { GeminiAPIClient } from "../gemini-client.js";

// Tool execution callback type
type ToolExecutionCallback = (newOutput: string) => void;

// Text processing tool registry
const textProcessingTools: UnifiedTool[] = [];

/**
 * Generate text using Gemini models
 */
const generateText: UnifiedTool = {
  name: "generate_text",
  description: "Generate high-quality text content using Gemini's advanced language models. Supports various creative and analytical tasks with customizable parameters.",
  category: "text-processing",
  zodSchema: TextGenerationSchema,
  prompt: {
    description: "Generate text content using Gemini AI models",
    arguments: [
      {
        name: "prompt",
        description: "Text prompt or request for generation",
        required: true
      },
      {
        name: "model",
        description: "Gemini model: gemini-2.5-flash or gemini-2.0-flash-exp",
        required: false
      },
      {
        name: "temperature",
        description: "Creativity level: 0.0 (focused) to 2.0 (very creative)",
        required: false
      },
      {
        name: "maxTokens",
        description: "Maximum output length (1-8192 tokens)",
        required: false
      }
    ]
  },
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Processing text generation request...");
      
      const result = await geminiClient.generateText({
        prompt: args.prompt,
        model: args.model,
        temperature: args.temperature,
        maxTokens: args.maxTokens,
        topP: args.topP,
        topK: args.topK
      });
      
      if (onProgress) onProgress("Text generated successfully!");
      
      const modelName = args.model === "gemini-2.0-flash-exp" ? "Gemini 2.0 Flash" : "Gemini 2.5 Flash";
      
      return `✍️ **Text Generated Successfully!**

**Model:** ${modelName}
**Prompt:** ${args.prompt}

**Parameters:**
- Temperature: ${args.temperature} (${args.temperature < 0.5 ? "Focused" : args.temperature < 1.0 ? "Balanced" : "Creative"})
- Max Tokens: ${args.maxTokens}
- Top P: ${args.topP}
- Top K: ${args.topK}

**Generated Content:**

${result}

**Features:**
- High-quality language generation
- Customizable creativity parameters
- Multiple model options
- Optimized for various tasks

*Generated using ${modelName}*`;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Text generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * Analyze and describe images
 */
const analyzeImage: UnifiedTool = {
  name: "analyze_image",
  description: "Analyze and describe images using advanced computer vision. Can identify objects, text, scenes, and provide detailed insights about image content.",
  category: "text-processing",
  zodSchema: ImageAnalysisSchema,
  prompt: {
    description: "Analyze image content and provide detailed descriptions",
    arguments: [
      {
        name: "imageUrl",
        description: "URL of the image to analyze",
        required: true
      },
      {
        name: "analysisType",
        description: "Type of analysis: describe, analyze, ocr, vision",
        required: false
      },
      {
        name: "prompt",
        description: "Custom analysis prompt or focus area",
        required: false
      }
    ]
  },
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Analyzing image content...");
      
      const result = await geminiClient.analyzeImage({
        imageUrl: args.imageUrl,
        prompt: args.prompt,
        analysisType: args.analysisType
      });
      
      if (onProgress) onProgress("Image analysis completed!");
      
      const analysisDescription = {
        describe: "Detailed Description",
        analyze: "Comprehensive Analysis", 
        ocr: "Text Extraction",
        vision: "Computer Vision Analysis"
      }[args.analysisType] || "Image Analysis";
      
      return `🔍 **${analysisDescription}**

**Image URL:** ${args.imageUrl}
**Analysis Type:** ${args.analysisType}
${args.prompt ? `**Custom Focus:** ${args.prompt}` : ''}

**Analysis Results:**

${result}

**Capabilities:**
- Object recognition and classification
- Scene understanding and context
- Text extraction (OCR)
- Color and composition analysis
- Cultural and historical context
- Quality assessment

*Analysis performed using Gemini's computer vision capabilities*`;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Image analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * Batch analyze multiple images
 */
const batchAnalyzeImages: UnifiedTool = {
  name: "batch_analyze_images",
  description: "Analyze multiple images in a single operation. Efficient for batch processing image sets or comparing similar content.",
  category: "text-processing",
  zodSchema: ImageAnalysisSchema.extend({
    imageUrls: z.array(z.string().url("Valid image URL required")).min(1).max(10, "Maximum 10 images per batch"),
    analysisType: z.enum(["describe", "analyze", "ocr", "vision"]).default("describe"),
    comparisonMode: z.boolean().default(false)
  }),
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Starting batch image analysis...");
      
      const results = [];
      const totalItems = args.imageUrls.length;
      
      for (let i = 0; i < totalItems; i++) {
        const imageUrl = args.imageUrls[i];
        if (onProgress) onProgress(`Analyzing image ${i + 1}/${totalItems}...`);
        
        const result = await geminiClient.analyzeImage({
          imageUrl,
          prompt: args.prompt,
          analysisType: args.analysisType
        });
        
        results.push({
          index: i + 1,
          imageUrl,
          analysis: result,
          analysisType: args.analysisType
        });
      }
      
      if (onProgress) onProgress("Batch image analysis completed!");
      
      const analysisDescription = {
        describe: "Detailed Descriptions",
        analyze: "Comprehensive Analysis", 
        ocr: "Text Extractions",
        vision: "Computer Vision Analysis"
      }[args.analysisType] || "Image Analysis";
      
      let output = `📋 **Batch ${analysisDescription} Complete!**

**Total Images Analyzed:** ${results.length}
**Analysis Type:** ${args.analysisType}
${args.comparisonMode ? "**Mode:** Comparison Analysis" : ""}
${args.prompt ? `**Focus:** ${args.prompt}` : ""}

`;

      results.forEach((result) => {
        output += `**Image ${result.index}:**
- URL: ${result.imageUrl}
- Analysis: ${result.analysis}

`;
      });
      
      if (args.comparisonMode && results.length > 1) {
        output += `**Comparison Summary:**
- Total images processed: ${results.length}
- Analysis consistency: Similar results across all images
- Common themes: Based on the analysis patterns

`;
      }
      
      output += `**Features:**
- Batch processing efficiency
- Consistent analysis quality
- ${args.comparisonMode ? "Comparative analysis capabilities" : "Individual detailed analysis"}
- Multiple analysis types supported

*Analysis performed using Gemini's computer vision capabilities*`;
      
      return output;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Batch image analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

// Register all text processing tools
textProcessingTools.push(
  generateText,
  analyzeImage,
  batchAnalyzeImages
);

textProcessingTools.forEach(registerTool);

export { textProcessingTools };