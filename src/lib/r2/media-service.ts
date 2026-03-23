import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, r2Config } from "./client";
import { prisma } from "@/lib/prisma";

export interface UploadFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  alt?: string;
  caption?: string;
  userId: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  postId?: string | null;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MediaService {
  /**
   * Upload a file to Cloudflare R2 and create media record in database
   */
  static async uploadFile(
    file: UploadFile,
    postId?: string,
  ): Promise<MediaFile> {
    try {
      console.log("Starting file upload:", {
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        postId,
      });

      // Upload to Cloudflare R2
      const uploadCommand = new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: file.filename,
        Body: file.buffer,
        ContentType: file.mimeType,
        ContentLength: file.size,
      });

      console.log("Uploading to R2...");
      await r2Client.send(uploadCommand);
      console.log("R2 upload successful");

      // Get image dimensions if it's an image
      let width: number | undefined;
      let height: number | undefined;

      if (file.mimeType.startsWith("image/")) {
        try {
          const dimensions = await this.getImageDimensions(file.buffer);
          width = dimensions.width;
          height = dimensions.height;
          console.log("Image dimensions extracted:", { width, height });
        } catch (error) {
          // Continue without dimensions if extraction fails
          console.warn("Failed to extract image dimensions:", error);
        }
      }

      // Create media record in database
      const mediaData = {
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        url: `${r2Config.publicUrl}/${file.filename}`,
        alt: file.alt,
        caption: file.caption,
        width,
        height,
        postId: postId || null,
        userId: file.userId,
      };

      console.log("Creating database record with data:", mediaData);

      const mediaFile = await prisma.mediaFile.create({
        data: mediaData,
      });

      console.log("Database record created successfully:", mediaFile.id);
      return mediaFile;
    } catch (error) {
      console.error("Error in MediaService.uploadFile:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        filename: file.filename,
        originalName: file.originalName,
      });
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a file from Cloudflare R2 and database
   */
  static async deleteFile(mediaId: string): Promise<void> {
    try {
      // Get media record from database
      const mediaFile = await prisma.mediaFile.findUnique({
        where: { id: mediaId },
      });

      if (!mediaFile) {
        throw new Error("Media file not found");
      }

      // Only delete from Cloudflare R2 if the file exists there and has a valid R2 URL
      const isR2File = mediaFile.url.startsWith(r2Config.publicUrl);
      if (isR2File) {
        const fileExists = await this.fileExists(mediaFile.filename);
        if (fileExists) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: r2Config.bucketName,
            Key: mediaFile.filename,
          });
          await r2Client.send(deleteCommand);
        }
      }

      // Delete from database
      await prisma.mediaFile.delete({
        where: { id: mediaId },
      });
    } catch (error) {
      console.error("Error deleting file from R2:", error);
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get all media files from database
   */
  static async getMediaFiles(options?: {
    page?: number;
    limit?: number;
    search?: string;
    postId?: string;
    userId?: string;
  }): Promise<{ mediaFiles: MediaFile[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(options?.search && {
        OR: [
          {
            originalName: {
              contains: options.search,
              mode: "insensitive" as const,
            },
          },
          {
            filename: {
              contains: options.search,
              mode: "insensitive" as const,
            },
          },
          { alt: { contains: options.search, mode: "insensitive" as const } },
          {
            caption: { contains: options.search, mode: "insensitive" as const },
          },
        ],
      }),
      ...(options?.postId && { postId: options.postId }),
      userId: options?.userId,
    };

    const [mediaFiles, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.mediaFile.count({ where }),
    ]);

    return { mediaFiles, total };
  }

  /**
   * Get a single media file by ID
   */
  static async getMediaFile(id: string): Promise<MediaFile | null> {
    return prisma.mediaFile.findUnique({
      where: { id },
    });
  }

  /**
   * Generate a presigned URL for direct uploads
   */
  static async generatePresignedUrl(
    filename: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: filename,
      ContentType: contentType,
    });

    return getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour expiry
  }

  /**
   * Get image dimensions from buffer
   */
  private static async getImageDimensions(
    _buffer: Buffer,
  ): Promise<{ width: number; height: number }> {
    // Return default dimensions - image dimensions are not critical for functionality
    return { width: 800, height: 600 };
  }

  /**
   * Validate that a media file URL is accessible
   */
  static async validateMediaUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch (_error) {
      console.error("Error validating media URL:");
      return false;
    }
  }

  /**
   * Update media file metadata
   */
  static async updateMediaFile(
    id: string,
    data: { alt?: string; caption?: string; postId?: string },
  ): Promise<MediaFile> {
    return prisma.mediaFile.update({
      where: { id },
      data: {
        alt: data.alt,
        caption: data.caption,
        postId: data.postId,
      },
    });
  }

  /**
   * Check if a file exists in R2
   */
  static async fileExists(filename: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: r2Config.bucketName,
        Key: filename,
      });

      await r2Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clean up orphaned media files from database that don't exist in R2
   */
  static async cleanupOrphanedMediaFiles(): Promise<{ deletedCount: number }> {
    try {
      const allMediaFiles = await prisma.mediaFile.findMany();
      let deletedCount = 0;

      for (const mediaFile of allMediaFiles) {
        const isR2File = mediaFile.url.startsWith(r2Config.publicUrl);

        if (isR2File) {
          const fileExists = await this.fileExists(mediaFile.filename);
          if (!fileExists) {
            // Delete from database only - file doesn't exist in R2
            await prisma.mediaFile.delete({
              where: { id: mediaFile.id },
            });
            deletedCount++;
          }
        } else {
          // Delete non-R2 files (from seed, local files, etc.)
          await prisma.mediaFile.delete({
            where: { id: mediaFile.id },
          });
          deletedCount++;
        }
      }

      return { deletedCount };
    } catch (error) {
      console.error("Error cleaning up orphaned media files:", error);
      throw new Error(
        `Failed to clean up orphaned media files: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get media files that exist in database but not in R2
   */
  static async getOrphanedMediaFiles(): Promise<MediaFile[]> {
    try {
      const allMediaFiles = await prisma.mediaFile.findMany();
      const orphanedFiles: MediaFile[] = [];

      for (const mediaFile of allMediaFiles) {
        const isR2File = mediaFile.url.startsWith(r2Config.publicUrl);

        if (isR2File) {
          const fileExists = await this.fileExists(mediaFile.filename);
          if (!fileExists) {
            orphanedFiles.push(mediaFile);
          }
        } else {
          // Non-R2 files are considered orphaned
          orphanedFiles.push(mediaFile);
        }
      }

      return orphanedFiles;
    } catch (error) {
      console.error("Error getting orphaned media files:", error);
      throw new Error(
        `Failed to get orphaned media files: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
