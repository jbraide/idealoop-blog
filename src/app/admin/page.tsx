"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  BookOpen,
  Eye,
  FileText,
  Image,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { getAdminStats } from "@/lib/actions";

// Stats configuration
const statsConfig = [
  {
    title: "Total Users",
    key: "totalUsers",
    description: "All registered users",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Admin Users",
    key: "adminUsers",
    description: "Users with admin privileges",
    icon: Users,
    color: "text-red-600",
  },
  {
    title: "Editor Users",
    key: "editorUsers",
    description: "Users with editor privileges",
    icon: Users,
    color: "text-purple-600",
  },
  {
    title: "Total Posts",
    key: "totalPosts",
    description: "All posts including drafts",
    icon: FileText,
    color: "text-green-600",
  },
  {
    title: "Published Posts",
    key: "publishedPosts",
    description: "Live posts visible to readers",
    icon: BookOpen,
    color: "text-orange-600",
  },
  {
    title: "Total Views",
    key: "totalViews",
    description: "All-time page views",
    icon: Eye,
    color: "text-cyan-600",
  },
  {
    title: "Unique Visitors",
    key: "uniqueVisitors",
    description: "Distinct readers",
    icon: Users,
    color: "text-indigo-600",
  },
  {
    title: "Media Files",
    key: "totalMediaFiles",
    description: "Uploaded images and files",
    icon: Image,
    color: "text-yellow-600",
  },
  {
    title: "Comments",
    key: "totalComments",
    description: "Total comments submitted",
    icon: MessageSquare,
    color: "text-pink-600",
  },
];

const quickActions = [
  {
    title: "Write New Post",
    description: "Create a new blog post",
    icon: FileText,
    href: "/admin/posts/new",
    color: "bg-blue-500",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    title: "Upload Media",
    description: "Add images and files",
    icon: Image,
    href: "/admin/media",
    color: "bg-green-500",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    title: "View Analytics",
    description: "Check performance metrics",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "bg-purple-500",
    roles: ["ADMIN", "EDITOR"],
  },
  {
    title: "Moderate Comments",
    description: "Review user comments",
    icon: MessageSquare,
    href: "/admin/comments",
    color: "bg-orange-500",
    roles: ["ADMIN", "EDITOR"],
  },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<{
    totalPosts?: number;
    publishedPosts?: number;
    totalViews?: number;
    uniqueVisitors?: number;
    totalMediaFiles?: number;
    totalComments?: number;
    pendingComments?: number;
    totalUsers?: number;
    adminUsers?: number;
    editorUsers?: number;
    recentPosts?: Array<{
      id: string;
      title: string;
      status: string;
      views: number;
      publishedAt: string;
      author: string;
      commentCount: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await getAdminStats();
        if (result.success && result.data) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Error loading admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Redirect if not authenticated or not admin/editor
  if (
    status !== "loading" &&
    (!session ||
      (session.user?.role !== "ADMIN" &&
        session.user?.role !== "admin" &&
        session.user?.role !== "EDITOR"))
  ) {
    router.push("/auth/signin");
    return null;
  }

  const userRole = session?.user?.role || "USER";
  const filteredQuickActions = quickActions.filter((action) =>
    action.roles.includes(userRole),
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening with your blog
              today.
            </p>
          </div>
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            View Full Analytics
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
      >
        {statsConfig.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats
                  ? (() => {
                      const value = stats[stat.key as keyof typeof stats];
                      return typeof value === "number"
                        ? value.toString()
                        : Array.isArray(value)
                          ? value.length.toString()
                          : value || "0";
                    })()
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your blog
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {filteredQuickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto justify-start p-4"
                  asChild
                >
                  <a href={action.href}>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color} mr-3`}
                    >
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">View All Users</p>
                  <p className="text-sm text-muted-foreground">
                    Browse and manage all registered users
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/admin/users">View</a>
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">Add New User</p>
                  <p className="text-sm text-muted-foreground">
                    Create a new user account
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/admin/users/new">Add</a>
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">Role Management</p>
                  <p className="text-sm text-muted-foreground">
                    Manage user roles and permissions
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/admin/users/roles">Manage</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Your most recent blog posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.recentPosts?.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-foreground">{post.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {post.status}
                      </span>
                      <span>{post.views} views</span>
                      <span>{post.publishedAt}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
              {(!stats?.recentPosts || stats.recentPosts.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No posts yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Recent activity across your blog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                stats?.pendingComments && stats.pendingComments > 0
                  ? `${stats.pendingComments} comments pending moderation`
                  : null,
                stats?.publishedPosts && stats.publishedPosts > 0
                  ? `${stats.publishedPosts} posts published`
                  : null,
                stats?.totalComments && stats.totalComments > 0
                  ? `${stats.totalComments} total comments`
                  : null,
                stats?.totalMediaFiles && stats.totalMediaFiles > 0
                  ? `${stats.totalMediaFiles} media files uploaded`
                  : null,
                stats?.totalPosts && stats.totalPosts > 0
                  ? `${stats.totalPosts} total posts created`
                  : null,
              ]
                .filter(Boolean)
                .map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{activity}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {index === 0
                        ? "Recent"
                        : index === 1
                          ? "Today"
                          : index === 2
                            ? "This week"
                            : index === 3
                              ? "This month"
                              : "All time"}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
