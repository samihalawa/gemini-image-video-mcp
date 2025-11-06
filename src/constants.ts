import { z } from "zod";

// Protocol constants
export const PROTOCOL = {
  KEEPALIVE_INTERVAL: 25000, // 25 seconds
  NOTIFICATIONS: {
    PROGRESS: "notifications/progress",
  },
} as const;

// API configuration
export const GEMINI_CONFIG = {
  BASE_URL: "https://generativelanguage.googleapis.com/v1beta",
  API_VERSION: "v1beta",
  DEFAULT_TIMEOUT: 300000, // 5 minutes
  MAX_RETRIES: 3,
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
} as const;

// Environment validation
export const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
});

// Tool categories
export const TOOL_CATEGORIES = {
  IMAGE_GENERATION: "image-generation",
  VIDEO_GENERATION: "video-generation", 
  MEDIA_MANAGEMENT: "media-management",
  TEXT_PROCESSING: "text-processing",
} as const;

// API model names
export const GEMINI_MODELS = {
  // Image generation models
  IMAGE_NANO_BANANA: "gemini-2.5-flash-image",
  IMAGE_NANO_BANANA_PREVIEW: "gemini-2.5-flash-image-preview", 
  IMAGE_IMAGEN3: "imagen-3.0-generate-002",
  IMAGE_IMAGEN4: "imagen-4.0-generate-preview-06-06",
  
  // Video generation models
  VIDEO_VEO31: "veo-3.1-generate",
  VIDEO_VEO31_FAST: "veo-3.1-fast-generate",
  
  // Text generation models
  TEXT_GEMINI25_FLASH: "gemini-2.5-flash",
  TEXT_GEMINI20_FLASH: "gemini-2.0-flash-exp",
} as const;

// Zod schemas for tool arguments
export const ImageGenerationSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(2000, "Prompt too long"),
  model: z.enum(["nano-banana", "imagen3", "imagen4"]).default("nano-banana"),
  aspectRatio: z.enum(["1:1", "16:9", "4:3", "3:2", "2:3", "3:4", "9:16", "21:9"]).default("1:1"),
  quality: z.enum(["standard", "high"]).default("standard"),
  style: z.enum(["natural", "artistic", "photorealistic", "cartoon", "anime"]).default("natural"),
  seed: z.number().int().min(0).max(4294967295).optional(),
});

export const VideoGenerationSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(2000, "Prompt too long"),
  duration: z.number().int().min(4).max(8).default(8),
  resolution: z.enum(["720p", "1080p"]).default("720p"),
  fps: z.number().int().min(24).max(60).default(30),
  style: z.enum(["natural", "cinematic", "artistic", "animation"]).default("natural"),
  aspectRatio: z.enum(["16:9", "1:1", "9:16"]).default("16:9"),
  seed: z.number().int().min(0).max(4294967295).optional(),
  referenceImage: z.string().url().optional(),
});

export const ImageToVideoSchema = z.object({
  imageUrl: z.string().url("Valid image URL required"),
  prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt too long"),
  duration: z.number().int().min(4).max(8).default(8),
  resolution: z.enum(["720p", "1080p"]).default("720p"),
  motionPrompt: z.string().max(500).optional(),
  cameraMovement: z.enum(["static", "pan", "zoom", "tilt", "tracking"]).default("static"),
});

export const TextGenerationSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(16000, "Prompt too long"),
  model: z.enum(["gemini-2.5-flash", "gemini-2.0-flash-exp"]).default("gemini-2.5-flash"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(1).max(8192).default(2048),
  topP: z.number().min(0).max(1).default(0.8),
  topK: z.number().int().min(1).max(100).default(40),
});

export const ImageAnalysisSchema = z.object({
  imageUrl: z.string().url("Valid image URL required"),
  prompt: z.string().max(1000).optional(),
  analysisType: z.enum(["describe", "analyze", "ocr", "vision"]).default("describe"),
});

export const MediaManagementSchema = z.object({
  action: z.enum(["list", "download", "delete", "upload"]),
  mediaId: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

export const BatchOperationSchema = z.object({
  items: z.array(z.string()).min(1).max(10, "Maximum 10 items"),
  operation: z.enum(["generate", "analyze", "download"]),
  options: z.record(z.any()).optional(),
});

// Tool argument types
export type ToolArguments = 
  | z.infer<typeof ImageGenerationSchema>
  | z.infer<typeof VideoGenerationSchema> 
  | z.infer<typeof ImageToVideoSchema>
  | z.infer<typeof TextGenerationSchema>
  | z.infer<typeof ImageAnalysisSchema>
  | z.infer<typeof MediaManagementSchema>
  | z.infer<typeof BatchOperationSchema>;

// Error types
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "GeminiAPIError";
  }
}

export class MediaProcessingError extends Error {
  constructor(
    message: string,
    public mediaType: "image" | "video",
    public details?: any
  ) {
    super(message);
    this.name = "MediaProcessingError";
  }
}