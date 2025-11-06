# Gemini AI MCP Server

A comprehensive Model Context Protocol (MCP) server that integrates Google's Gemini AI capabilities for image generation, video creation, text processing, and image analysis. Built specifically for smithery.ai deployment with full TypeScript support.

## 🚀 Features

### 🎨 Image Generation
- **Nano Banana Model** (Gemini 2.5 Flash Image) - Fast, efficient image generation
- **Imagen 3/4 Models** - High-fidelity, realistic image creation
- **Multiple Styles** - Natural, artistic, photorealistic, cartoon, anime
- **Flexible Aspect Ratios** - 1:1, 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9
- **Batch Processing** - Generate multiple images simultaneously
- **Image Editing** - Edit existing images with text prompts

### 🎬 Video Generation
- **Veo 3.1 Model** - State-of-the-art video generation
- **High Quality Output** - 720p and 1080p resolution options
- **Flexible Duration** - 4-8 second videos
- **Multiple Styles** - Natural, cinematic, artistic, animation
- **Image-to-Video** - Transform static images into dynamic videos
- **Camera Movements** - Static, pan, zoom, tilt, tracking
- **Batch Video Generation** - Create multiple videos efficiently

### 📝 Text Processing
- **Gemini 2.5 Flash** - Advanced language model for text generation
- **Customizable Parameters** - Temperature, max tokens, top-p, top-k
- **Multiple Use Cases** - Creative writing, analysis, summaries
- **Image Analysis** - Computer vision capabilities with OCR
- **Batch Analysis** - Process multiple images simultaneously

### 🗃️ Media Management
- **Reference Image Upload** - Upload and register images for future use
- **Media Library** - List and manage all generated content
- **Download Management** - Download individual or batch media files
- **Organized Storage** - Categorize and tag media items
- **Metadata Support** - Rich metadata for better organization

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Quick Setup

1. **Clone or download the project**
   ```bash
   cd gemini-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set your API key**
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   ./run.sh
   ```

## 🔧 Deployment to smithery.ai

### Method 1: Direct Deployment
1. **Upload to smithery.ai**
   - Upload the project directory to smithery.ai
   - The platform will automatically detect the `mcp-server.json` configuration
   - Set the `GEMINI_API_KEY` environment variable in smithery.ai

2. **Test the deployment**
   - Use smithery.ai's testing interface
   - Verify all tools are available and functional

### Method 2: Local Testing
1. **Set environment variables**
   ```bash
   export GEMINI_API_KEY="your-api-key"
   export LOG_LEVEL=debug
   ```

2. **Run locally**
   ```bash
   ./run.sh
   ```

## 📋 Available Tools

### Image Generation Tools

#### `generate_image_nano_banana`
Generate images using the Nano Banana model for fast, efficient results.
```json
{
  "prompt": "A serene mountain landscape at sunset",
  "style": "natural",
  "aspectRatio": "16:9",
  "quality": "standard"
}
```

#### `generate_image_imagen`
Create high-quality images using Imagen 3/4 models.
```json
{
  "prompt": "A photorealistic portrait of a person reading a book",
  "model": "imagen4",
  "style": "photorealistic",
  "quality": "high"
}
```

#### `batch_generate_images`
Generate multiple images in one request.
```json
{
  "model": "nano-banana",
  "items": [
    {
      "prompt": "A red apple on a white background",
      "style": "photorealistic"
    },
    {
      "prompt": "A green apple on a white background", 
      "style": "photorealistic"
    }
  ]
}
```

#### `edit_image_with_prompt`
Edit existing images using AI.
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "editType": "modify",
  "prompt": "Change the background to a beach setting"
}
```

### Video Generation Tools

#### `generate_video_veo`
Generate videos using Veo 3.1.
```json
{
  "prompt": "A cat playing in a sunny garden",
  "duration": 8,
  "resolution": "1080p",
  "style": "natural"
}
```

#### `image_to_video`
Convert images to videos.
```json
{
  "imageUrl": "https://example.com/portrait.jpg",
  "prompt": "The person turns their head slightly to the left",
  "cameraMovement": "pan",
  "duration": 6
}
```

#### `batch_generate_videos`
Generate multiple videos efficiently.
```json
{
  "items": [
    {
      "prompt": "Ocean waves on a beach",
      "style": "cinematic"
    },
    {
      "prompt": "Forest with falling leaves",
      "style": "artistic"
    }
  ]
}
```

### Media Management Tools

#### `upload_reference_image`
Upload images for future use.
```json
{
  "imageUrl": "https://example.com/style-image.jpg",
  "title": "Art Style Reference",
  "description": "Impressionist art style for reference",
  "category": "art"
}
```

#### `list_generated_media`
Browse your media library.
```json
{
  "limit": 10,
  "offset": 0
}
```

#### `download_media`
Download generated content.
```json
{
  "mediaId": "gemini_12345_example"
}
```

#### `delete_media`
Remove media files.
```json
{
  "mediaId": "gemini_12345_example",
  "confirmDelete": true
}
```

### Text Processing Tools

#### `generate_text`
Generate text content.
```json
{
  "prompt": "Write a creative story about AI and creativity",
  "model": "gemini-2.5-flash",
  "temperature": 0.8,
  "maxTokens": 1000
}
```

#### `analyze_image`
Analyze image content.
```json
{
  "imageUrl": "https://example.com/photo.jpg",
  "analysisType": "analyze",
  "prompt": "Identify the main objects and describe the scene"
}
```

#### `batch_analyze_images`
Analyze multiple images.
```json
{
  "imageUrls": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg"
  ],
  "analysisType": "describe",
  "comparisonMode": true
}
```

## 🏗️ Architecture

### Project Structure
```
gemini-mcp-server/
├── src/
│   ├── index.ts                 # Main server implementation
│   ├── constants.ts             # Configuration and schemas
│   ├── gemini-client.ts         # Gemini API integration
│   ├── logger.ts                # Logging utilities
│   └── tools/                   # Tool implementations
│       ├── index.ts             # Tool registry
│       ├── registry.ts          # Tool registration logic
│       ├── image-generation.ts  # Image tools
│       ├── video-generation.ts  # Video tools
│       ├── media-management.ts  # Media tools
│       └── text-processing.ts   # Text tools
├── dist/                        # Compiled JavaScript
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── run.sh                       # Startup script
├── mcp-server.json             # Smithery.ai configuration
└── README.md                    # This file
```

### Key Components

1. **GeminiAPIClient** - Handles all communication with Google's Gemini API
2. **Tool Registry** - Centralized tool registration and execution
3. **Progress Tracking** - Real-time updates for long-running operations
4. **Error Handling** - Comprehensive error management and reporting
5. **Media Management** - Storage and organization of generated content

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `LOG_LEVEL` | No | Logging level (debug, info, warn, error) |
| `NODE_ENV` | No | Environment (development, production) |

## 🧪 Testing

### Manual Testing
1. Start the server: `./run.sh`
2. Use any MCP-compatible client to connect
3. Test individual tools with various parameters
4. Verify error handling and edge cases

### API Health Check
The server includes a built-in health check that verifies Gemini API connectivity.

## 🛡️ Security Considerations

- API keys are never logged or stored permanently
- All user inputs are validated using Zod schemas
- Network requests have timeout and retry mechanisms
- Error messages don't expose sensitive information

## 📝 API Models Used

### Image Generation
- `gemini-2.5-flash-image` - Nano Banana model for fast generation
- `imagen-3.0-generate-002` - Imagen 3 for high quality
- `imagen-4.0-generate-preview-06-06` - Imagen 4 for best quality

### Video Generation
- `veo-3.1-generate` - Veo 3.1 for standard video generation
- `veo-3.1-fast-generate` - Veo 3.1 Fast for quicker results

### Text Generation
- `gemini-2.5-flash` - Latest Gemini 2.5 Flash model
- `gemini-2.0-flash-exp` - Experimental Gemini 2.0 Flash

## 🤝 Contributing

This MCP server is designed to be extensible. To add new tools:

1. Create a new tool file in `src/tools/`
2. Implement the tool using the `UnifiedTool` interface
3. Register the tool using `registerTool()`
4. Add comprehensive documentation and examples

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Resources

- [Gemini API Documentation](https://ai.google.dev/gemini-api)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [smithery.ai Platform](https://smithery.ai/)
- [Google AI Studio](https://aistudio.google.com/)

## 🆘 Support

For issues, questions, or contributions:
1. Check the documentation above
2. Review the tool examples
3. Test with different parameters
4. Verify your API key has appropriate permissions

---

*Built with ❤️ for the MCP community and smithery.ai*