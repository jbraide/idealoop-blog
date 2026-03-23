"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-muted shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileQuestion className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
            <CardDescription className="text-base">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Suggested actions */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Here are some things you can try:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Check the URL for typos
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Use the search to find what you need
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Browse from the homepage
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button asChild className="gap-2" size="lg">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>

            <div className="flex gap-3">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="gap-2 flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={() => {
                  // This would typically open a search modal
                  const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.focus();
                  } else {
                    // Fallback: redirect to search page
                    window.location.href = "/search";
                  }
                }}
                variant="outline"
                className="gap-2 flex-1"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Blog navigation suggestions */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Popular sections:
            </p>
            <div className="flex flex-wrap gap-2">
              {["Blog", "About", "Contact", "Categories"].map((section) => (
                <Link
                  key={section}
                  href={`/${section.toLowerCase()}`}
                  className="text-xs text-primary hover:underline px-2 py-1 rounded bg-background"
                >
                  {section}
                </Link>
              ))}
            </div>
          </div>

          {/* Error code */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Error code: 404
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
