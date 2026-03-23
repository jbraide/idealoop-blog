"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Upload, X, Eye, Download } from "lucide-react";

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

interface MediaUploadProps {
  onMediaSelect?: (media: MediaFile) => void;
  onMediaRemove?: (mediaId: string) => void;
  selectedMedia?: MediaFile[];
  multiple?: boolean;
  className?: string;
}

export function MediaUpload({
  onMediaSelect,
  onMediaRemove,
  selectedMedia = [],
  multiple = false,
  className = "",
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newMedia = result.media;
        setMediaFiles((prev) => [newMedia, ...prev]);
        if (onMediaSelect) {
          onMediaSelect(newMedia);
        }
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert(result.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Handle media selection
  const handleMediaSelect = (media: MediaFile) => {
    if (onMediaSelect) {
      onMediaSelect(media);
    }
  };

  // Handle media removal
  const handleMediaRemove = (mediaId: string) => {
    if (onMediaRemove) {
      onMediaRemove(mediaId);
    }
  };

  // Check if media is selected
  const isSelected = (mediaId: string) => {
    return selectedMedia.some((media) => media.id === mediaId);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file type badge
  const getFileTypeBadge = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Badge variant="secondary">Image</Badge>;
    } else if (mimeType === "application/pdf") {
      return <Badge variant="secondary">PDF</Badge>;
    } else if (mimeType.includes("word")) {
      return <Badge variant="secondary">Document</Badge>;
    } else if (mimeType === "text/plain") {
      return <Badge variant="secondary">Text</Badge>;
    }
    return <Badge variant="secondary">File</Badge>;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Section */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>

        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search media library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Selected Media Preview */}
      {selectedMedia.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Selected Media</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedMedia.map((media) => (
              <Card key={media.id} className="relative overflow-hidden">
                <CardContent className="p-3">
                  {media.mimeType.startsWith("image/") ? (
                    <div className="aspect-square rounded-md overflow-hidden bg-muted mb-2">
                      <Image
                        src={media.url}
                        alt={media.alt || media.originalName || ""}
                        className="w-full h-full object-cover"
                        width={media.width || 200}
                        height={media.height || 200}
                        unoptimized={true}
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <p
                      className="text-xs font-medium truncate"
                      title={media.originalName}
                    >
                      {media.originalName}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(media.size)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMediaRemove(media.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Media Library */}
      <div>
        <h4 className="text-sm font-medium mb-2">Media Library</h4>
        {mediaFiles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                No media files uploaded yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {mediaFiles
              .filter(
                (media) =>
                  media.originalName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  media.alt?.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((media) => {
                const selected = isSelected(media.id);

                return (
                  <Card
                    key={media.id}
                    className={`relative overflow-hidden cursor-pointer transition-all ${
                      selected
                        ? "ring-2 ring-primary border-primary"
                        : "hover:ring-2 hover:ring-muted-foreground/20"
                    }`}
                    onClick={() => {
                      if (selected) {
                        handleMediaRemove(media.id);
                      } else {
                        if (!multiple && selectedMedia.length > 0) {
                          // Replace current selection if not multiple
                          handleMediaRemove(selectedMedia[0].id);
                        }
                        handleMediaSelect(media);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      {media.mimeType.startsWith("image/") ? (
                        <div className="aspect-square rounded-md overflow-hidden bg-muted mb-2">
                          <Image
                            src={media.url}
                            alt={media.alt || media.originalName || ""}
                            className="w-full h-full object-cover"
                            width={media.width || 400}
                            height={media.height || 400}
                            unoptimized={true}
                          />
                        </div>
                      ) : (
                        <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          {getFileTypeBadge(media.mimeType)}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(media.url, "_blank");
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(media.url, "_blank");
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p
                          className="text-xs font-medium truncate"
                          title={media.originalName}
                        >
                          {media.originalName}
                        </p>

                        {media.alt && (
                          <p
                            className="text-xs text-muted-foreground truncate"
                            title={media.alt}
                          >
                            {media.alt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(media.size)}</span>
                          {selected && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
