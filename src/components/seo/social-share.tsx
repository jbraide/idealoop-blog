"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  MessageSquare,
} from "lucide-react";
import { generateSocialShareUrls } from "@/lib/seo-utils";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: "button" | "dropdown" | "inline";
}

export function SocialShare({
  url,
  title,
  description = "",
  className = "",
  variant = "dropdown",
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrls = generateSocialShareUrls(url, title, description);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  const shareButtons = [
    {
      name: "Twitter",
      icon: Twitter,
      url: shareUrls.twitter,
      color: "hover:text-blue-500",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: shareUrls.facebook,
      color: "hover:text-blue-600",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: shareUrls.linkedin,
      color: "hover:text-blue-700",
    },
    {
      name: "Reddit",
      icon: MessageSquare,
      url: shareUrls.reddit,
      color: "hover:text-orange-500",
    },
  ];

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">Share:</span>
        {shareButtons.map((button) => (
          <Button
            key={button.name}
            variant="ghost"
            size="sm"
            className={`p-2 h-8 ${button.color}`}
            onClick={() =>
              window.open(button.url, "_blank", "noopener,noreferrer")
            }
            aria-label={`Share on ${button.name}`}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-8 hover:text-green-600"
          onClick={handleCopyLink}
          aria-label={copied ? "Link copied" : "Copy link"}
        >
          <Link2 className="h-4 w-4" />
          {copied && (
            <span className="ml-1 text-xs text-green-600">Copied!</span>
          )}
        </Button>
        {typeof window !== "undefined" &&
          typeof navigator !== "undefined" &&
          (navigator as any).share && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 hover:text-purple-600"
              onClick={handleNativeShare}
              aria-label="Share using native share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {shareButtons.map((button) => (
          <Button
            key={button.name}
            variant="outline"
            size="sm"
            className={`gap-2 ${button.color}`}
            onClick={() =>
              window.open(button.url, "_blank", "noopener,noreferrer")
            }
          >
            <button.icon className="h-4 w-4" />
            {button.name}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:text-green-600"
          onClick={handleCopyLink}
        >
          <Link2 className="h-4 w-4" />
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        {typeof window !== "undefined" &&
          typeof navigator !== "undefined" &&
          (navigator as any).share && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:text-purple-600"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shareButtons.map((button) => (
          <DropdownMenuItem
            key={button.name}
            onClick={() =>
              window.open(button.url, "_blank", "noopener,noreferrer")
            }
            className={`cursor-pointer ${button.color}`}
          >
            <button.icon className="h-4 w-4 mr-2" />
            Share on {button.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer hover:text-green-600"
        >
          <Link2 className="h-4 w-4 mr-2" />
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        {typeof window !== "undefined" &&
          typeof navigator !== "undefined" &&
          (navigator as any).share && (
            <DropdownMenuItem
              onClick={handleNativeShare}
              className="cursor-pointer hover:text-purple-600"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Native Share
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
