"use client";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  FileText,
  Image,
  MessageSquare,
  Settings,
  Users,
  Tag,
  KeyRound,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
    description: "Overview and analytics",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    name: "Posts",
    href: "/admin/posts",
    icon: FileText,
    description: "Manage blog posts",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    name: "Media",
    href: "/admin/media",
    icon: Image,
    description: "Upload and manage files",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    name: "Comments",
    href: "/admin/comments",
    icon: MessageSquare,
    description: "Moderate comments",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: BookOpen,
    description: "Organize content",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    name: "Tags",
    href: "/admin/tags",
    icon: Tag,
    description: "Manage content tags",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    name: "Research",
    href: "/admin/research",
    icon: Search,
    description: "Competitor intelligence",
    roles: ["ADMIN"],
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage team members",
    roles: ["ADMIN"],
  },
  {
    name: "Security",
    href: "/admin/profile",
    icon: KeyRound,
    description: "Update your password",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Configure company settings",
    roles: ["ADMIN"],
  },
];

export function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = session?.user?.role || "USER";

  const filteredNavigationItems = navigationItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <aside className="hidden w-64 border-r bg-background lg:flex lg:flex-col">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            B
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Blog Admin
            </h2>
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5",
                  isActive && "bg-accent text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex flex-1 flex-col items-start">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer/Status */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-muted-foreground">
              System Online
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Last updated: Just now
          </p>
        </div>
      </div>
    </aside>
  );
}
