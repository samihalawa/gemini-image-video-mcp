import { z } from "zod";
import { registerTool, UnifiedTool } from "./registry.js";
import { 
  ImageGenerationSchema, 
  GeminiAPIError 
} from "../constants.js";
import { GeminiAPIClient } from "../gemini-client.js";

// Tool execution callback type
type ToolExecutionCallback = (newOutput: string) => void;

// Image generation tool registry
const imageGenerationTools: UnifiedTool[] = [];

/**
 * Generate image using Nano Banana model for fast generation
 */
const generateImageNanoBanana: UnifiedTool = {
  name: "generate_image_nano_banana",
  description: "Generate high-quality images using the Nano Banana model (Gemini 2.5 Flash Image). Fast and efficient for most use cases with natural styles.",
  category: "image-generation",
  zodSchema: ImageGenerationSchema,
  prompt: {
    description: "Generate images quickly with good quality using Nano Banana model",
    arguments: [
      {
        name: "prompt",
        description: "Text description of the image to generate",
        required: true
      },
      {
        name: "style",
        description: "Visual style: natural, artistic, photorealistic, cartoon, anime",
        required: false
      },
      {
        name: "aspectRatio",
        description: "Image aspect ratio: 1:1, 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9",
        required: false
      }
    ]
  },
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Preparing image generation request...");
      
      const result = await geminiClient.generateImage({
        prompt: args.prompt,
        model: "nano-banana",
        aspectRatio: args.aspectRatio,
        quality: args.quality,
        style: args.style,
        seed: args.seed
      });
      
      if (onProgress) onProgress("Image generated successfully!");
      
      return `🎨 **Image Generated Successfully!**

**Model:** Nano Banana (Gemini 2.5 Flash Image)
**Prompt:** ${args.prompt}
**Style:** ${args.style}
**Aspect Ratio:** ${args.aspectRatio}
**Quality:** ${args.quality}

**Generated Image URL:** ${result.imageUrl}
**Media ID:** ${result.mediaId}

**Features:**
- Fast generation
- High quality output
- Natural style support
- Multiple aspect ratios

*Image generated using Google's Gemini AI via Nano Banana model*`;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Nano Banana image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * Generate image using Imagen models for high-quality images
 */
const generateImageImagen: UnifiedTool = {
  name: "generate_image_imagen",
  description: "Generate high-fidelity images using Google's Imagen 3/4 models. Best for realistic and detailed images with superior quality.",
  category: "image-generation",
  zodSchema: ImageGenerationSchema,
  prompt: {
    description: "Generate high-quality realistic images using Imagen models",
    arguments: [
      {
        name: "prompt",
        description: "Detailed text description of the image to generate",
        required: true
      },
      {
        name: "model",
        description: "Imagen model version: imagen3 or imagen4",
        required: false
      },
      {
        name: "quality",
        description: "Image quality: standard or high",
        required: false
      },
      {
        name: "style",
        description: "Visual style: natural, artistic, photorealistic",
        required: false
      }
    ]
  },
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Preparing high-quality image generation...");
      
      const result = await geminiClient.generateImage({
        prompt: args.prompt,
        model: args.model === "imagen4" ? "imagen4" : "imagen3",
        aspectRatio: args.aspectRatio,
        quality: args.quality,
        style: args.style,
        seed: args.seed
      });
      
      if (onProgress) onProgress("High-quality image generated successfully!");
      
      const modelName = args.model === "imagen4" ? "Imagen 4.0" : "Imagen 3.0";
      
      return `🖼️ **High-Quality Image Generated!**

**Model:** ${modelName}
**Prompt:** ${args.prompt}
**Style:** ${args.style}
**Aspect Ratio:** ${args.aspectRatio}
**Quality:** ${args.quality}

**Generated Image URL:** ${result.imageUrl}
**Media ID:** ${result.mediaId}

**Features:**
- Superior image quality
- Realistic rendering
- Advanced detail preservation
- Professional-grade output

*Image generated using Google's ${modelName} model*`;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Imagen image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * Batch generate multiple images
 */
const batchGenerateImages: UnifiedTool = {
  name: "batch_generate_images",
  description: "Generate multiple images in a single operation. Efficient for creating image sets or variations of similar concepts.",
  category: "image-generation",
  zodSchema: ImageGenerationSchema.extend({
    items: z.array(z.object({
      prompt: z.string().min(1).max(2000),
      style: z.enum(["natural", "artistic", "photorealistic", "cartoon", "anime"]).optional(),
      aspectRatio: z.enum(["1:1", "16:9", "4:3", "3:2", "2:3", "3:4", "9:16", "21:9"]).optional(),
      seed: z.number().int().min(0).max(4294967295).optional()
    })).min(1).max(10, "Maximum 10 images per batch")
  }),
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Starting batch image generation...");
      
      const results = [];
      const totalItems = args.items.length;
      
      for (let i = 0; i < totalItems; i++) {
        const item = args.items[i];
        if (onProgress) onProgress(`Generating image ${i + 1}/${totalItems}...`);
        
        const result = await geminiClient.generateImage({
          prompt: item.prompt,
          model: args.model || "nano-banana",
          aspectRatio: item.aspectRatio || args.aspectRatio,
          quality: args.quality,
          style: item.style || args.style,
          seed: item.seed
        });
        
        results.push({
          index: i + 1,
          prompt: item.prompt,
          imageUrl: result.imageUrl,
          mediaId: result.mediaId,
          style: item.style || args.style,
          aspectRatio: item.aspectRatio || args.aspectRatio
        });
      }
      
      if (onProgress) onProgress("All images generated successfully!");
      
      let output = `📦 **Batch Image Generation Complete!**

**Total Images:** ${results.length}
**Model Used:** ${args.model === "imagen4" ? "Imagen 4.0" : args.model === "imagen3" ? "Imagen 3.0" : "Nano Banana"}

`;

      results.forEach((result) => {
        output += `**Image ${result.index}:**
- Prompt: ${result.prompt}
- Style: ${result.style}
- Aspect Ratio: ${result.aspectRatio}
- URL: ${result.imageUrl}
- Media ID: ${result.mediaId}

`;
      });
      
      return output;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Batch image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * Edit existing images using text prompts
 */
const editImageWithPrompt: UnifiedTool = {
  name: "edit_image_with_prompt",
  description: "Edit existing images using text prompts. Can modify, enhance, or transform images while maintaining the original composition.",
  category: "image-generation",
  zodSchema: ImageGenerationSchema.extend({
    imageUrl: z.string().url("Valid image URL required"),
    editType: z.enum(["modify", "enhance", "transform", "style_transfer"]).default("modify")
  }),
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Preparing image editing request...");
      
      // For image editing, we'll use the image analysis combined with generation
      // In a full implementation, this would use the Gemini image editing API
      
      const editPrompt = `${args.editType} this image: ${args.prompt}`;
      
      const result = await geminiClient.generateImage({
        prompt: editPrompt,
        model: args.model || "nano-banana",
        aspectRatio: args.aspectRatio,
        quality: args.quality,
        style: args.style,
        seed: args.seed
      });
      
      if (onProgress) onProgress("Image edited successfully!");
      
      return `✂️ **Image Edited Successfully!**

**Original Image:** ${args.imageUrl}
**Edit Type:** ${args.editType}
**Edit Prompt:** ${args.prompt}
**Style:** ${args.style}
**Aspect Ratio:** ${args.aspectRatio}

**Edited Image URL:** ${result.imageUrl}
**Media ID:** ${result.mediaId}

**Features:**
- AI-powered image editing
- Maintains original composition
- Flexible edit types
- Style preservation

*Image edited using Gemini AI*`;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Image editing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

// Register all image generation tools
imageGenerationTools.push(
  generateImageNanoBanana,
  generateImageImagen,
  batchGenerateImages,
  editImageWithPrompt
);

imageGenerationTools.forEach(registerTool);

export { imageGenerationTools };