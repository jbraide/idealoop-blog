"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";

interface MediaFile {
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
  createdAt: string;
  updatedAt: string;
}

interface ImageUploadModalProps {
  onImageSelect: (imageUrl: string, altText?: string) => void;
  trigger: React.ReactNode;
}

export function ImageUploadModal({
  onImageSelect,
  trigger,
}: ImageUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAltText, setSelectedAltText] = useState("");
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Fetch media files
  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/media?limit=50");
      const result = await response.json();

      if (result.success) {
        setMediaFiles(result.data);
      }
    } catch (error) {
      console.error("Error fetching media files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMediaFiles();
    }
  }, [isOpen]);

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadStatus({ type: null, message: "" });
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the media list
        fetchMediaFiles();
        // Reset file input
        event.target.value = "";
        setUploadStatus({
          type: "success",
          message: "Image uploaded successfully!",
        });
        // Clear success message after 3 seconds
        setTimeout(() => {
          setUploadStatus({ type: null, message: "" });
        }, 3000);
      } else {
        setUploadStatus({
          type: "error",
          message: result.error || "Failed to upload file",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus({
        type: "error",
        message: "Failed to upload file",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl, selectedAltText || undefined);
    setSelectedAltText("");
    setIsOpen(false);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Filter images only
  const imageFiles = mediaFiles.filter((file) =>
    file.mimeType.startsWith("image/"),
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Upload Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={uploading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
              <input
                id="image-upload"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                accept="image/*"
              />
            </div>

            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus.type && (
            <div
              className={`rounded-lg p-3 text-sm flex items-center gap-2 ${
                uploadStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {uploadStatus.message}
            </div>
          )}

          {/* Alt Text Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Alt Text (Optional)
            </label>
            <Input
              type="text"
              placeholder="Describe the image for accessibility..."
              value={selectedAltText}
              onChange={(e) => setSelectedAltText(e.target.value)}
            />
          </div>

          {/* Image Grid */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading images...
                  </p>
                </div>
              </div>
            ) : imageFiles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No images</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Upload your first image to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageFiles
                  .filter(
                    (image) =>
                      image.originalName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      image.alt
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  )
                  .map((image) => (
                    <Card
                      key={image.id}
                      className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => handleImageSelect(image.url)}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-square rounded-md overflow-hidden bg-muted mb-2">
                          <Image
                            src={image.url}
                            alt={image.alt || image.originalName || ""}
                            className="w-full h-full object-cover"
                            width={image.width || 200}
                            height={image.height || 200}
                            unoptimized={true}
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">Image</Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(image.url, "_blank");
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <p
                            className="text-xs font-medium truncate"
                            title={image.originalName}
                          >
                            {image.originalName}
                          </p>

                          {image.alt && (
                            <p
                              className="text-xs text-muted-foreground truncate"
                              title={image.alt}
                            >
                              {image.alt}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatFileSize(image.size)}</span>
                            {image.width && image.height && (
                              <span>
                                {image.width}×{image.height}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
