"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SignOutPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If no session exists, redirect to home
    if (!session) {
      router.push("/");
      return;
    }

    // Automatically sign out after a brief delay
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 2000);

    return () => clearTimeout(timer);
  }, [session, router]);

  const handleManualSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Signing Out</CardTitle>
            <CardDescription>
              You are being signed out of your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Info */}
            {session?.user && (
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-sm font-medium text-foreground">
                  {session.user.name || session.user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Redirecting in a moment...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleManualSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out Now
              </Button>
              <Button
                variant="ghost"
                className="flex-1 gap-2"
                asChild
              >
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Link>
              </Button>
            </div>

            {/* Security Note */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                For security, please close your browser when finished.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
