"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error caught:", error);

    if (process.env.NODE_ENV === "production") {
      // Here you would send to Sentry, LogRocket, etc.
      // logErrorToService(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive/20 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription className="text-base">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error details for development */}
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Error details (development only):
              </p>
              <div className="space-y-2">
                <code className="block text-xs text-destructive break-all bg-muted-foreground/10 p-2 rounded">
                  {error.message}
                </code>
                {error.digest && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Digest:</span>
                    <code className="text-xs text-muted-foreground bg-muted-foreground/10 px-2 py-1 rounded">
                      {error.digest}
                    </code>
                  </div>
                )}
                {error.stack && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground mb-2">
                      Stack trace
                    </summary>
                    <pre className="bg-muted-foreground/10 p-2 rounded overflow-auto max-h-48 text-xs">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="gap-2"
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
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
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="gap-2 flex-1"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </div>

          {/* Support information */}
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
            <p className="text-sm text-primary text-center">
              Need help?{" "}
              <a
                href="mailto:support@blogplatform.com"
                className="underline hover:no-underline"
              >
                Contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
