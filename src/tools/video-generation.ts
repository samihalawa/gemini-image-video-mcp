import { z } from "zod";
import { registerTool, UnifiedTool } from "./registry.js";
import { 
  VideoGenerationSchema,
  ImageToVideoSchema, 
  GeminiAPIError 
} from "../constants.js";
import { GeminiAPIClient } from "../gemini-client.js";

// Tool execution callback type
type ToolExecutionCallback = (newOutput: string) => void;

// Video generation tool registry
const videoGenerationTools: UnifiedTool[] = [];

/**
 * Generate video using Veo 3.1 model
 */
const generateVideoVeo: UnifiedTool = {
  name: "generate_video_veo",
  description: "Generate high-fidelity videos using Google's Veo 3.1 model. Creates 8-second 720p or 1080p videos with stunning realism and native audio.",
  category: "video-generation",
  zodSchema: VideoGenerationSchema,
  prompt: {
    description: "Generate high-quality videos using Veo 3.1 model",
    arguments: [
      {
        name: "prompt",
        description: "Detailed description of the video to generate",
        required: true
      },
      {
        name: "duration",
        description: "Video duration in seconds (4-8)",
        required: false
      },
      {
        name: "resolution",
        description: "Video resolution: 720p or 1080p",
        required: false
      },
      {
        name: "style",
        description: "Video style: natural, cinematic, artistic, animation",
        required: false
      }
    ]
  },
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Preparing video generation request...");
      
      const result = await geminiClient.generateVideo({
        prompt: args.prompt,
        duration: args.duration,
        resolution: args.resolution,
        fps: args.fps,
        style: args.style,
        aspectRatio: args.aspectRatio,
        seed: args.seed,
        referenceImage: args.referenceImage
      });
      
      if (onProgress) onProgress("Video generated successfully!");
      
      return `🎬 **Video Generated Successfully!**

**Model:** Veo 3.1 (Google's latest video generation model)
**Prompt:** ${args.prompt}
**Duration:** ${args.duration} seconds
**Resolution:** ${args.resolution}
**Style:** ${args.style}
**Aspect Ratio:** ${args.aspectRatio}
**FPS:** ${args.fps}

**Generated Video URL:** ${result.videoUrl}
**Media ID:** ${result.mediaId}

**Features:**
- High-fidelity 8-second videos
- Native audio and dialogue
- Cinematic quality
- Multiple style options
- Professional-grade output

*Video generated using Google's Veo 3.1 model*`;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * Convert image to video using Veo 3.1
 */
const imageToVideo: UnifiedTool = {
  name: "image_to_video",
  description: "Transform static images into dynamic videos using Veo 3.1. Add motion, camera movement, and life to your images with AI-powered video generation.",
  category: "video-generation",
  zodSchema: ImageToVideoSchema,
  prompt: {
    description: "Convert images to videos with motion and camera effects",
    arguments: [
      {
        name: "imageUrl",
        description: "URL of the image to convert to video",
        required: true
      },
      {
        name: "prompt",
        description: "Description of desired motion and effects",
        required: true
      },
      {
        name: "cameraMovement",
        description: "Camera movement: static, pan, zoom, tilt, tracking",
        required: false
      },
      {
        name: "duration",
        description: "Video duration in seconds (4-8)",
        required: false
      }
    ]
  },
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Preparing image-to-video conversion...");
      
      const result = await geminiClient.generateImageToVideo({
        imageUrl: args.imageUrl,
        prompt: args.prompt,
        duration: args.duration,
        resolution: args.resolution,
        motionPrompt: args.motionPrompt,
        cameraMovement: args.cameraMovement
      });
      
      if (onProgress) onProgress("Image-to-video conversion completed!");
      
      return `🎞️ **Image Successfully Converted to Video!**

**Source Image:** ${args.imageUrl}
**Prompt:** ${args.prompt}
**Duration:** ${args.duration} seconds
**Resolution:** ${args.resolution}
**Camera Movement:** ${args.cameraMovement}
${args.motionPrompt ? `**Motion Details:** ${args.motionPrompt}` : ''}

**Generated Video URL:** ${result.videoUrl}
**Media ID:** ${result.mediaId}

**Features:**
- AI-powered motion generation
- Natural camera movements
- Preserves original image quality
- Dynamic video effects
- Professional animation

*Video created using Google's Veo 3.1 image-to-video model*`;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Image-to-video conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * Batch generate multiple videos
 */
const batchGenerateVideos: UnifiedTool = {
  name: "batch_generate_videos",
  description: "Generate multiple videos in a single operation. Efficient for creating video series or multiple variations of similar concepts.",
  category: "video-generation",
  zodSchema: VideoGenerationSchema.extend({
    items: z.array(z.object({
      prompt: z.string().min(1).max(2000),
      duration: z.number().int().min(4).max(8).optional(),
      style: z.enum(["natural", "cinematic", "artistic", "animation"]).optional(),
      aspectRatio: z.enum(["16:9", "1:1", "9:16"]).optional(),
      seed: z.number().int().min(0).max(4294967295).optional(),
      referenceImage: z.string().url().optional()
    })).min(1).max(5, "Maximum 5 videos per batch")
  }),
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Starting batch video generation...");
      
      const results = [];
      const totalItems = args.items.length;
      
      for (let i = 0; i < totalItems; i++) {
        const item = args.items[i];
        if (onProgress) onProgress(`Generating video ${i + 1}/${totalItems}...`);
        
        const result = await geminiClient.generateVideo({
          prompt: item.prompt,
          duration: item.duration || args.duration,
          resolution: args.resolution,
          fps: args.fps,
          style: item.style || args.style,
          aspectRatio: item.aspectRatio || args.aspectRatio,
          seed: item.seed,
          referenceImage: item.referenceImage
        });
        
        results.push({
          index: i + 1,
          prompt: item.prompt,
          videoUrl: result.videoUrl,
          mediaId: result.mediaId,
          duration: item.duration || args.duration,
          style: item.style || args.style,
          aspectRatio: item.aspectRatio || args.aspectRatio,
          referenceImage: item.referenceImage
        });
      }
      
      if (onProgress) onProgress("All videos generated successfully!");
      
      let output = `📹 **Batch Video Generation Complete!**

**Total Videos:** ${results.length}
**Model Used:** Veo 3.1
**Base Resolution:** ${args.resolution}

`;

      results.forEach((result) => {
        output += `**Video ${result.index}:**
- Prompt: ${result.prompt}
- Duration: ${result.duration} seconds
- Style: ${result.style}
- Aspect Ratio: ${result.aspectRatio}
- URL: ${result.videoUrl}
- Media ID: ${result.mediaId}
${result.referenceImage ? `- Source Image: ${result.referenceImage}` : ''}

`;
      });
      
      return output;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Batch video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

// Register all video generation tools
videoGenerationTools.push(
  generateVideoVeo,
  imageToVideo,
  batchGenerateVideos
);

videoGenerationTools.forEach(registerTool);

export { videoGenerationTools };