"use client";

import { useState, useEffect } from "react";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Search, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";

export function AdminHeader() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session !== undefined) {
      setIsLoading(false);
    }
  }, [session]);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Menu and Title */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your blog content
            </p>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden flex-1 max-w-md lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts, media, users..."
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Search button for mobile */}
          <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground"
            >
              3
            </motion.span>
          </Button>

          {/* User profile */}
          <Button variant="ghost" className="h-9 gap-2 px-2">
            {isLoading ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted animate-pulse">
                <div className="h-3 w-3 rounded-full bg-muted-foreground/50" />
              </div>
            ) : session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                <User className="h-3 w-3" />
              </div>
            )}
            <span className="hidden sm:block text-sm">
              {isLoading ? (
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              ) : (
                session?.user?.name || session?.user?.email || "User"
              )}
            </span>
          </Button>

          {/* Sign out */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
