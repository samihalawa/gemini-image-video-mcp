// Simple JavaScript MCP server demo
// This can run directly without TypeScript compilation

// Simple tool registry
const toolRegistry = [];

// Register tool helper
function registerTool(tool) {
  toolRegistry.push(tool);
  console.log(`🔧 Registered tool: ${tool.name} (${tool.category})`);
}

// Image generation tools
registerTool({
  name: "generate_image_nano_banana",
  description: "Generate high-quality images using the Nano Banana model (Gemini 2.5 Flash Image). Fast and efficient for most use cases.",
  category: "image-generation",
  schema: {
    prompt: { type: "string", minLength: 1 },
    style: { type: "string", enum: ["natural", "artistic", "photorealistic", "cartoon", "anime"], default: "natural" },
    aspectRatio: { type: "string", enum: ["1:1", "16:9", "4:3", "3:2", "2:3", "3:4", "9:16", "21:9"], default: "1:1" },
    quality: { type: "string", enum: ["standard", "high"], default: "standard" }
  },
  execute: async (args) => {
    const mediaId = `mock_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const imageUrl = `https://picsum.photos/800/600?random=${mediaId}`;
    
    return `🎨 **Image Generated Successfully!**

**Model:** Nano Banana (Gemini 2.5 Flash Image)
**Prompt:** ${args.prompt}
**Style:** ${args.style}
**Aspect Ratio:** ${args.aspectRatio}
**Quality:** ${args.quality}

**Generated Image URL:** ${imageUrl}
**Media ID:** ${mediaId}

*Demo response - In production, this would generate real images using Gemini AI*`;
  }
});

registerTool({
  name: "generate_image_imagen", 
  description: "Generate high-fidelity images using Google's Imagen 3/4 models. Best for realistic and detailed images.",
  category: "image-generation",
  schema: {
    prompt: { type: "string", minLength: 1 },
    model: { type: "string", enum: ["imagen3", "imagen4"], default: "imagen3" },
    style: { type: "string", enum: ["natural", "artistic", "photorealistic"], default: "natural" },
    quality: { type: "string", enum: ["standard", "high"], default: "high" }
  },
  execute: async (args) => {
    const mediaId = `mock_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const imageUrl = `https://picsum.photos/800/600?random=${mediaId}`;
    const modelName = args.model === "imagen4" ? "Imagen 4.0" : "Imagen 3.0";
    
    return `🖼️ **High-Quality Image Generated!**

**Model:** ${modelName}
**Prompt:** ${args.prompt}
**Style:** ${args.style}
**Quality:** ${args.quality}

**Generated Image URL:** ${imageUrl}
**Media ID:** ${mediaId}

*Demo response - In production, this would generate real high-quality images*`;
  }
});

registerTool({
  name: "generate_video_veo",
  description: "Generate high-fidelity videos using Google's Veo 3.1 model. Creates 8-second videos with stunning realism.",
  category: "video-generation", 
  schema: {
    prompt: { type: "string", minLength: 1 },
    duration: { type: "number", min: 4, max: 8, default: 8 },
    resolution: { type: "string", enum: ["720p", "1080p"], default: "720p" },
    style: { type: "string", enum: ["natural", "cinematic", "artistic", "animation"], default: "natural" }
  },
  execute: async (args) => {
    const mediaId = `mock_vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const videoUrl = `https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4`;
    
    return `🎬 **Video Generated Successfully!**

**Model:** Veo 3.1
**Prompt:** ${args.prompt}
**Duration:** ${args.duration} seconds
**Resolution:** ${args.resolution}
**Style:** ${args.style}

**Generated Video URL:** ${videoUrl}
**Media ID:** ${mediaId}

*Demo response - In production, this would generate real videos using Veo 3.1*`;
  }
});

registerTool({
  name: "image_to_video",
  description: "Transform static images into dynamic videos using Veo 3.1. Add motion and life to your images.",
  category: "video-generation",
  schema: {
    imageUrl: { type: "string" },
    prompt: { type: "string", minLength: 1 },
    cameraMovement: { type: "string", enum: ["static", "pan", "zoom", "tilt", "tracking"], default: "static" },
    duration: { type: "number", min: 4, max: 8, default: 6 }
  },
  execute: async (args) => {
    const mediaId = `mock_i2v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const videoUrl = `https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4`;
    
    return `🎞️ **Image Successfully Converted to Video!**

**Source Image:** ${args.imageUrl}
**Prompt:** ${args.prompt}
**Camera Movement:** ${args.cameraMovement}
**Duration:** ${args.duration} seconds

**Generated Video URL:** ${videoUrl}
**Media ID:** ${mediaId}

*Demo response - In production, this would create real videos from your images*`;
  }
});

registerTool({
  name: "batch_generate_images",
  description: "Generate multiple images in a single operation. Efficient for creating image sets or variations.",
  category: "image-generation",
  schema: {
    items: { type: "array", minItems: 1, maxItems: 10 },
    model: { type: "string", enum: ["nano-banana", "imagen3", "imagen4"], default: "nano-banana" },
    style: { type: "string", enum: ["natural", "artistic", "photorealistic", "cartoon", "anime"], default: "natural" }
  },
  execute: async (args) => {
    const results = args.items.map((item, i) => {
      const mediaId = `batch_img_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const imageUrl = `https://picsum.photos/800/600?random=${mediaId}`;
      return {
        index: i + 1,
        prompt: item.prompt,
        imageUrl,
        mediaId
      };
    });
    
    let output = `📦 **Batch Image Generation Complete!**

**Total Images:** ${results.length}
**Model Used:** ${args.model}

`;

    results.forEach(result => {
      output += `**Image ${result.index}:**
- Prompt: ${result.prompt}
- URL: ${result.imageUrl}
- Media ID: ${result.mediaId}

`;
    });
    
    return output + "*Demo response - In production, this would generate real images using batch processing*";
  }
});

registerTool({
  name: "generate_text",
  description: "Generate high-quality text content using Gemini's advanced language models.",
  category: "text-processing",
  schema: {
    prompt: { type: "string", minLength: 1 },
    model: { type: "string", enum: ["gemini-2.5-flash", "gemini-2.0-flash-exp"], default: "gemini-2.5-flash" },
    temperature: { type: "number", min: 0, max: 2, default: 0.7 },
    maxTokens: { type: "number", min: 1, max: 8192, default: 1000 }
  },
  execute: async (args) => {
    const modelName = args.model === "gemini-2.0-flash-exp" ? "Gemini 2.0 Flash" : "Gemini 2.5 Flash";
    const responses = [
      "This is a demonstration of Gemini AI's text generation capabilities. The AI has processed your prompt and generated a thoughtful response based on the parameters you provided.",
      `Generated content for: "${args.prompt.substring(0, 50)}..." using ${modelName} with temperature ${args.temperature}.`,
      "Demo response: Your prompt has been processed and this is the generated content. In a real implementation, this would be actual AI-generated text."
    ];
    
    const result = responses[Math.floor(Math.random() * responses.length)];
    
    return `✍️ **Text Generated Successfully!**

**Model:** ${modelName}
**Prompt:** ${args.prompt}

**Generated Content:**

${result}

*Demo response - In production, this would generate real AI content*`;
  }
});

registerTool({
  name: "analyze_image",
  description: "Analyze and describe images using advanced computer vision capabilities.",
  category: "text-processing",
  schema: {
    imageUrl: { type: "string" },
    analysisType: { type: "string", enum: ["describe", "analyze", "ocr", "vision"], default: "describe" },
    prompt: { type: "string" }
  },
  execute: async (args) => {
    const analysisTypes = {
      describe: `This appears to be an image that has been analyzed using computer vision. The AI can see various elements and provides detailed descriptions of the visual content, objects, colors, and composition.`,
      analyze: `Comprehensive image analysis reveals multiple layers of information including object detection, scene understanding, color palette analysis, and contextual interpretation of the visual elements.`,
      ocr: `OCR analysis detects and extracts any text present in the image. In this demonstration, no specific text content was identified, but the system is capable of reading various fonts and text orientations.`,
      vision: `Computer vision analysis identifies objects, people, actions, spatial relationships, and contextual information within the image. The system provides structured insights about visual content.`
    };

    return `🔍 **Image Analysis Complete**

**Image URL:** ${args.imageUrl}
**Analysis Type:** ${args.analysisType}
${args.prompt ? `**Focus:** ${args.prompt}` : ''}

**Analysis Results:**

${analysisTypes[args.analysisType] || analysisTypes.describe}

*Demo response - In production, this would provide real computer vision analysis*`;
  }
});

registerTool({
  name: "list_generated_media",
  description: "List all generated images and videos with metadata.",
  category: "media-management",
  schema: {
    limit: { type: "number", min: 1, max: 100, default: 10 },
    offset: { type: "number", min: 0, default: 0 }
  },
  execute: async (args) => {
    // Mock media items
    const media = [
      {
        id: "mock_img_123",
        type: "image",
        url: "https://picsum.photos/800/600?random=123",
        prompt: "A beautiful sunset over mountains",
        createdAt: "2025-11-06T10:00:00Z"
      },
      {
        id: "mock_vid_456", 
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4",
        prompt: "Ocean waves on a peaceful beach",
        createdAt: "2025-11-06T10:30:00Z"
      }
    ];
    
    const paginatedMedia = media.slice(args.offset, args.offset + args.limit);
    
    return `📚 **Media Library**

**Total Items:** ${media.length}
**Showing:** ${args.offset + 1}-${Math.min(args.offset + args.limit, media.length)} of ${media.length}

${paginatedMedia.map((item, i) => 
  `**${i + 1}. ${item.type.toUpperCase()} - ${item.id}**
- URL: ${item.url}
- Prompt: ${item.prompt}
- Created: ${new Date(item.createdAt).toLocaleDateString()}`
).join('\n\n')}

*Demo response - Shows mock media items*`;
  }
});

// Simple STDIO MCP server implementation
class SimpleMCPServer {
  constructor() {
    this.tools = toolRegistry;
  }

  async handleRequest(request) {
    const { method, params } = request;

    switch (method) {
      case "tools/list":
        return {
          tools: this.tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: {
              type: "object",
              properties: tool.schema,
              required: Object.keys(tool.schema).filter(key => !tool.schema[key].default)
            }
          }))
        };

      case "tools/call":
        const tool = this.tools.find(t => t.name === params.name);
        if (!tool) {
          return { error: `Unknown tool: ${params.name}` };
        }

        try {
          const result = await tool.execute(params.arguments || {});
          return {
            content: [{ type: "text", text: result }],
            isError: false
          };
        } catch (error) {
          return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
            isError: true
          };
        }

      default:
        return { error: `Unknown method: ${method}` };
    }
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting Gemini AI MCP Server (Demo Mode)...");
  console.log("📡 Compatible with smithery.ai and MCP protocol");
  console.log("🔧 Available tools:", toolRegistry.map(t => t.name).join(", "));
  console.log("💡 This is a demo with mock functionality");
  
  const server = new SimpleMCPServer();
  
  // Simple STDIO communication for MCP protocol
  process.stdin.setEncoding('utf8');
  let buffer = '';

  process.stdin.on('data', async (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const request = JSON.parse(line.trim());
          const response = await server.handleRequest(request);
          console.log(JSON.stringify(response));
        } catch (error) {
          console.log(JSON.stringify({ error: `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}` }));
        }
      }
    }
  });

  process.stdin.on('end', () => {
    console.log("👋 Demo server shutting down");
  });
}

main().catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});