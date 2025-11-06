import { z } from "zod";
import { registerTool, UnifiedTool } from "./registry.js";
import { 
  MediaManagementSchema, 
  GeminiAPIError 
} from "../constants.js";
import { GeminiAPIClient } from "../gemini-client.js";

// Tool execution callback type
type ToolExecutionCallback = (newOutput: string) => void;

// Mock media storage (in a real implementation, this would use cloud storage)
interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
  size: number;
  metadata: Record<string, any>;
}

// In-memory media storage for demonstration
const mediaStorage = new Map<string, MediaItem>();

// Media management tool registry
const mediaManagementTools: UnifiedTool[] = [];

/**
 * Upload and reference images for image-to-image generation
 */
const uploadReferenceImage: UnifiedTool = {
  name: "upload_reference_image",
  description: "Upload and register reference images for use in image-to-image generation and video creation. Supports common image formats.",
  category: "media-management",
  zodSchema: z.object({
    imageUrl: z.string().url("Valid image URL required"),
    title: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    tags: z.array(z.string()).max(10).optional(),
    category: z.enum(["portrait", "landscape", "object", "art", "photo", "other"]).default("other")
  }),
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Processing reference image upload...");
      
      // In a real implementation, this would download and store the image
      // For this demo, we'll create a mock media item
      const mediaId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mediaItem: MediaItem = {
        id: mediaId,
        type: "image",
        url: args.imageUrl,
        prompt: args.description || "Reference image",
        model: "uploaded",
        createdAt: new Date().toISOString(),
        size: 0, // Would be actual file size
        metadata: {
          title: args.title,
          description: args.description,
          tags: args.tags || [],
          category: args.category
        }
      };
      
      mediaStorage.set(mediaId, mediaItem);
      
      if (onProgress) onProgress("Reference image uploaded successfully!");
      
      return `📤 **Reference Image Uploaded Successfully!**

**Image URL:** ${args.imageUrl}
**Media ID:** ${mediaId}
**Title:** ${args.title || "Untitled"}
**Description:** ${args.description || "No description provided"}
**Category:** ${args.category}
**Tags:** ${args.tags?.join(", ") || "None"}

**Features:**
- Image registered for future use
- Can be referenced in generation prompts
- Metadata preserved for organization
- Compatible with image-to-video conversion

*Reference image is now available for use in image generation and video creation*`;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Reference image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * List all generated media files
 */
const listGeneratedMedia: UnifiedTool = {
  name: "list_generated_media",
  description: "List all generated images and videos with metadata. Supports filtering by type, date, and search queries.",
  category: "media-management",
  zodSchema: MediaManagementSchema,
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Fetching media library...");
      
      // Get all media from storage
      const allMedia = Array.from(mediaStorage.values());
      
      // Apply filters
      let filteredMedia = allMedia;
      if (args.action !== "list") {
        // For other actions, we'd filter differently
        filteredMedia = allMedia;
      }
      
      // Apply pagination
      const start = args.offset || 0;
      const end = start + (args.limit || 10);
      const paginatedMedia = filteredMedia.slice(start, end);
      
      if (onProgress) onProgress(`Found ${filteredMedia.length} media items`);
      
      if (paginatedMedia.length === 0) {
        return `📚 **Media Library Empty**

No media files found in the library. Start generating images or videos to build your collection!

**Available Actions:**
- Generate images using image generation tools
- Generate videos using video generation tools
- Upload reference images

*Use the 'list' action to browse your media collection*`;
      }
      
      let output = `📚 **Media Library**

**Total Items:** ${filteredMedia.length}
**Showing:** ${start + 1}-${Math.min(end, filteredMedia.length)} of ${filteredMedia.length}
**Filter:** ${args.action === "list" ? "All media" : args.action}

`;

      paginatedMedia.forEach((item, index) => {
        const itemNumber = start + index + 1;
        const createdDate = new Date(item.createdAt).toLocaleDateString();
        
        output += `**${itemNumber}. ${item.type.toUpperCase()} - ${item.id}**
- URL: ${item.url}
- Prompt: ${item.prompt}
- Model: ${item.model}
- Created: ${createdDate}
- Size: ${item.size > 0 ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : "Unknown"}
- Category: ${item.metadata.category || "General"}
${item.metadata.tags ? `- Tags: ${item.metadata.tags.join(", ")}` : ""}

`;
      });
      
      // Add pagination info if needed
      if (filteredMedia.length > end) {
        output += `*Use offset ${end} to see more items*`;
      }
      
      return output;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Media listing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * Download generated media files
 */
const downloadMedia: UnifiedTool = {
  name: "download_media",
  description: "Download generated images and videos. Supports individual files and batch downloads.",
  category: "media-management",
  zodSchema: MediaManagementSchema,
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Preparing media download...");
      
      const mediaItems: MediaItem[] = [];
      
      if (args.mediaId) {
        // Download specific media item
        const item = mediaStorage.get(args.mediaId);
        if (item) {
          mediaItems.push(item);
        } else {
          throw new Error(`Media item with ID ${args.mediaId} not found`);
        }
      } else {
        // Download recent media (mock implementation)
        const allMedia = Array.from(mediaStorage.values());
        mediaItems.push(...allMedia.slice(0, args.limit || 5));
      }
      
      if (onProgress) onProgress(`Downloading ${mediaItems.length} media files...`);
      
      // In a real implementation, this would trigger actual downloads
      // For this demo, we'll return download information
      
      let output = `📥 **Media Download Ready**

**Items to Download:** ${mediaItems.length}

`;

      mediaItems.forEach((item, index) => {
        output += `**${index + 1}. ${item.type.toUpperCase()} - ${item.id}**
- File URL: ${item.url}
- File Name: ${item.id}.${item.type === "image" ? "jpg" : "mp4"}
- Prompt: ${item.prompt}
- Size: ${item.size > 0 ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : "Streaming"}

`;
      });
      
      output += `**Download Methods:**
1. **Direct Links:** Click the URLs above to download files
2. **API Download:** Use the media IDs with your preferred download tool
3. **Batch Download:** Use tools that support multiple media IDs

**Note:** Links are valid for 24 hours from generation.`;
      
      if (onProgress) onProgress("Download information prepared successfully!");
      
      return output;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Media download failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

/**
 * Delete media files
 */
const deleteMedia: UnifiedTool = {
  name: "delete_media",
  description: "Delete generated images and videos from the media library. Supports individual and batch deletion with confirmation.",
  category: "media-management",
  zodSchema: MediaManagementSchema.extend({
    force: z.boolean().default(false),
    confirmDelete: z.boolean().default(false)
  }),
  async execute(args: any, geminiClient: GeminiAPIClient, onProgress?: ToolExecutionCallback): Promise<string> {
    try {
      if (onProgress) onProgress("Processing media deletion request...");
      
      if (!args.confirmDelete && !args.force) {
        return `⚠️ **Deletion Confirmation Required**

To delete media files, you must confirm the action. This operation cannot be undone.

**Please confirm by setting:**
- confirmDelete: true (to proceed with deletion)

**Files that would be deleted:**
${args.mediaId ? `- Media ID: ${args.mediaId}` : `- All media items (${mediaStorage.size} files)`}

**Alternative:** Use force: true to bypass confirmation (not recommended).`;
      }
      
      let deletedCount = 0;
      const deletedItems: string[] = [];
      
      if (args.mediaId) {
        // Delete specific media item
        if (mediaStorage.has(args.mediaId)) {
          const item = mediaStorage.get(args.mediaId)!;
          mediaStorage.delete(args.mediaId);
          deletedCount++;
          deletedItems.push(`${item.type} - ${args.mediaId}`);
        }
      } else {
        // Delete all media (with confirmation)
        const allMedia = Array.from(mediaStorage.values());
        allMedia.forEach(item => {
          deletedItems.push(`${item.type} - ${item.id}`);
        });
        mediaStorage.clear();
        deletedCount = allMedia.length;
      }
      
      if (onProgress) onProgress(`Deleted ${deletedCount} media files`);
      
      let output = `🗑️ **Media Deletion Complete**

**Files Deleted:** ${deletedCount}

**Deleted Items:**
`;

      deletedItems.forEach(item => {
        output += `- ${item}\n`;
      });
      
      output += `

**Storage Status:**
- Remaining Files: ${mediaStorage.size}
- Storage Freed: ${deletedCount} media items

**Note:** Deleted files cannot be recovered. Use with caution!`;
      
      return output;
    } catch (error) {
      if (onProgress) onProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw new GeminiAPIError(`Media deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

// Register all media management tools
mediaManagementTools.push(
  uploadReferenceImage,
  listGeneratedMedia,
  downloadMedia,
  deleteMedia
);

mediaManagementTools.forEach(registerTool);

export { mediaManagementTools };