import { GoogleGenerativeAI } from "google-generative-ai";
import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import { 
  GEMINI_CONFIG, 
  GEMINI_MODELS, 
  GeminiAPIError, 
  MediaProcessingError 
} from "./constants.js";

export class GeminiAPIClient {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === "") {
      throw new GeminiAPIError("Gemini API key is required", "NO_API_KEY");
    }
    
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Image generation methods
  async generateImage(params: {
    prompt: string;
    model: "nano-banana" | "imagen3" | "imagen4";
    aspectRatio: string;
    quality: string;
    style: string;
    seed?: number;
  }): Promise<{ imageUrl: string; mediaId: string }> {
    try {
      const model = this.getImageModel(params.model);
      const modelInstance = this.genAI.getGenerativeModel({ model });
      
      const requestBody = {
        contents: [{
          parts: [{ text: this.buildImagePrompt(params) }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      };

      const response = await axios.post(
        `${GEMINI_CONFIG.BASE_URL}/models/${model}:generateContent?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: GEMINI_CONFIG.DEFAULT_TIMEOUT,
        }
      );

      // Extract image URL from response
      const result = response.data.candidates[0].content.parts[0];
      if (result.inlineData?.mimeType?.startsWith("image/")) {
        const mediaId = this.generateMediaId();
        const imageData = result.inlineData.data;
        const imageUrl = await this.storeImage(imageData, mediaId);
        
        return { imageUrl, mediaId };
      }

      throw new GeminiAPIError("No image generated", "NO_IMAGE_RESPONSE");
    } catch (error: any) {
      if (error.response) {
        throw new GeminiAPIError(
          `Gemini API error: ${error.response.data?.error?.message || error.message}`,
          error.response.data?.error?.code,
          error.response.status,
          error.response.data
        );
      }
      throw new GeminiAPIError(`Image generation failed: ${error.message}`, "IMAGE_GENERATION_FAILED");
    }
  }

  // Video generation methods
  async generateVideo(params: {
    prompt: string;
    duration: number;
    resolution: string;
    fps: number;
    style: string;
    aspectRatio: string;
    seed?: number;
    referenceImage?: string;
  }): Promise<{ videoUrl: string; mediaId: string }> {
    try {
      const model = GEMINI_MODELS.VIDEO_VEO31;
      
      const requestBody = {
        contents: [{
          parts: [{ text: this.buildVideoPrompt(params) }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      };

      const response = await axios.post(
        `${GEMINI_CONFIG.BASE_URL}/models/${model}:generateVideo?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: GEMINI_CONFIG.DEFAULT_TIMEOUT,
        }
      );

      // Extract video URL from response
      const result = response.data.candidates[0].content.parts[0];
      if (result.inlineData?.mimeType?.startsWith("video/")) {
        const mediaId = this.generateMediaId();
        const videoData = result.inlineData.data;
        const videoUrl = await this.storeVideo(videoData, mediaId);
        
        return { videoUrl, mediaId };
      }

      throw new GeminiAPIError("No video generated", "NO_VIDEO_RESPONSE");
    } catch (error: any) {
      if (error.response) {
        throw new GeminiAPIError(
          `Gemini API error: ${error.response.data?.error?.message || error.message}`,
          error.response.data?.error?.code,
          error.response.status,
          error.response.data
        );
      }
      throw new GeminiAPIError(`Video generation failed: ${error.message}`, "VIDEO_GENERATION_FAILED");
    }
  }

  // Image to video conversion
  async generateImageToVideo(params: {
    imageUrl: string;
    prompt: string;
    duration: number;
    resolution: string;
    motionPrompt?: string;
    cameraMovement: string;
  }): Promise<{ videoUrl: string; mediaId: string }> {
    try {
      const model = GEMINI_MODELS.VIDEO_VEO31;
      
      // Download and encode image
      const imageData = await this.downloadAndEncodeImage(params.imageUrl);
      
      const requestBody = {
        contents: [{
          parts: [
            { text: this.buildImageToVideoPrompt(params) },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageData
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      };

      const response = await axios.post(
        `${GEMINI_CONFIG.BASE_URL}/models/${model}:generateVideo?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: GEMINI_CONFIG.DEFAULT_TIMEOUT,
        }
      );

      // Extract video URL from response
      const result = response.data.candidates[0].content.parts[0];
      if (result.inlineData?.mimeType?.startsWith("video/")) {
        const mediaId = this.generateMediaId();
        const videoData = result.inlineData.data;
        const videoUrl = await this.storeVideo(videoData, mediaId);
        
        return { videoUrl, mediaId };
      }

      throw new GeminiAPIError("No video generated from image", "NO_IMAGE_TO_VIDEO");
    } catch (error: any) {
      if (error.response) {
        throw new GeminiAPIError(
          `Gemini API error: ${error.response.data?.error?.message || error.message}`,
          error.response.data?.error?.code,
          error.response.status,
          error.response.data
        );
      }
      throw new GeminiAPIError(`Image to video generation failed: ${error.message}`, "IMAGE_TO_VIDEO_FAILED");
    }
  }

  // Text generation
  async generateText(params: {
    prompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
  }): Promise<string> {
    try {
      const modelInstance = this.genAI.getGenerativeModel({ model: params.model });
      
      const result = await modelInstance.generateContent(params.prompt);
      const response = result.response;
      
      return response.text();
    } catch (error: any) {
      if (error.response) {
        throw new GeminiAPIError(
          `Gemini API error: ${error.message}`,
          error.response.error?.code,
          error.response.status,
          error.response
        );
      }
      throw new GeminiAPIError(`Text generation failed: ${error.message}`, "TEXT_GENERATION_FAILED");
    }
  }

  // Image analysis
  async analyzeImage(params: {
    imageUrl: string;
    prompt?: string;
    analysisType: string;
  }): Promise<string> {
    try {
      const imageData = await this.downloadAndEncodeImage(params.imageUrl);
      const modelInstance = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = params.prompt || this.getDefaultAnalysisPrompt(params.analysisType);
      
      const result = await modelInstance.generateContent([
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData
          }
        },
        { text: prompt }
      ]);
      
      return result.response.text();
    } catch (error: any) {
      if (error.response) {
        throw new GeminiAPIError(
          `Gemini API error: ${error.message}`,
          error.response.error?.code,
          error.response.status,
          error.response
        );
      }
      throw new GeminiAPIError(`Image analysis failed: ${error.message}`, "IMAGE_ANALYSIS_FAILED");
    }
  }

  // Helper methods
  private getImageModel(type: "nano-banana" | "imagen3" | "imagen4"): string {
    switch (type) {
      case "imagen3":
        return GEMINI_MODELS.IMAGE_IMAGEN3;
      case "imagen4":
        return GEMINI_MODELS.IMAGE_IMAGEN4;
      default:
        return GEMINI_MODELS.IMAGE_NANO_BANANA;
    }
  }

  private buildImagePrompt(params: any): string {
    return `Generate an image with the following specifications:
${params.prompt}

Style: ${params.style}
Aspect Ratio: ${params.aspectRatio}
Quality: ${params.quality}${params.seed ? `\nSeed: ${params.seed}` : ''}`;
  }

  private buildVideoPrompt(params: any): string {
    return `Generate a ${params.duration}-second ${params.resolution} video with the following specifications:
${params.prompt}

Style: ${params.style}
Aspect Ratio: ${params.aspectRatio}
FPS: ${params.fps}${params.seed ? `\nSeed: ${params.seed}` : ''}`;
  }

  private buildImageToVideoPrompt(params: any): string {
    return `Create a ${params.duration}-second ${params.resolution} video from this image with the following specifications:
${params.prompt}

Camera Movement: ${params.cameraMovement}${params.motionPrompt ? `\nMotion Details: ${params.motionPrompt}` : ''}`;
  }

  private getDefaultAnalysisPrompt(analysisType: string): string {
    switch (analysisType) {
      case "analyze":
        return "Provide a detailed analysis of this image including objects, colors, composition, and any notable features.";
      case "ocr":
        return "Extract and transcribe any text visible in this image.";
      case "vision":
        return "Analyze this image with computer vision techniques, identifying objects, people, actions, and context.";
      default:
        return "Describe what you see in this image in detail.";
    }
  }

  private async downloadAndEncodeImage(imageUrl: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to download image: ${response.status}`);
      }
      
      // Convert to base64
      return Buffer.from(response.data).toString("base64");
    } catch (error: any) {
      throw new MediaProcessingError(`Failed to download image: ${error.message}`, "image");
    }
  }

  private async storeImage(base64Data: string, mediaId: string): Promise<string> {
    // In a real implementation, you would store this in cloud storage
    // For this MCP server, we'll return a mock URL that represents the stored image
    const timestamp = Date.now();
    return `https://storage.googleapis.com/gemini-generated-images/${mediaId}-${timestamp}.jpg`;
  }

  private async storeVideo(base64Data: string, mediaId: string): Promise<string> {
    // In a real implementation, you would store this in cloud storage
    // For this MCP server, we'll return a mock URL that represents the stored video
    const timestamp = Date.now();
    return `https://storage.googleapis.com/gemini-generated-videos/${mediaId}-${timestamp}.mp4`;
  }

  private generateMediaId(): string {
    return `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      await model.generateContent("Hello");
      return true;
    } catch (error) {
      return false;
    }
  }
}