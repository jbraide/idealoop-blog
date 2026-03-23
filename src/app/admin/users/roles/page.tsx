"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Loader2, Shield, User, UserCog } from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "EDITOR" | "ADMIN";
  createdAt: string;
  postsCount: number;
  commentsCount: number;
}

export default function RoleManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("ALL");

  useEffect(() => {
    if (status === "loading") return;

    if (
      !session ||
      (session.user?.role !== "ADMIN" && session.user?.role !== "admin")
    ) {
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        const result = await response.json();

        if (result.success && result.data) {
          setUsers(result.data.users);
        } else {
          console.error("Failed to load users:", result.error);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, role: newRole as "USER" | "EDITOR" | "ADMIN" }
              : user,
          ),
        );
      } else {
        console.error("Failed to update user role:", result.error);
        alert(
          "Failed to update user role: " + (result.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("An error occurred while updating the user role");
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: {
        label: "Admin",
        variant: "destructive" as const,
        icon: Shield,
      },
      EDITOR: {
        label: "Editor",
        variant: "default" as const,
        icon: Edit,
      },
      USER: {
        label: "User",
        variant: "secondary" as const,
        icon: User,
      },
    };

    const config = roleConfig[role as keyof typeof roleConfig];

    return (
      <div className="flex items-center gap-1">
        {role === "ADMIN" && <Shield className="h-3 w-3" />}
        {role === "EDITOR" && <Edit className="h-3 w-3" />}
        {role === "USER" && <User className="h-3 w-3" />}
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
    );
  };

  const filteredUsers =
    filterRole === "ALL" || !filterRole
      ? users
      : users.filter((user) => user.role === filterRole);

  const roleStats = {
    ADMIN: users.filter((user) => user.role === "ADMIN").length,
    EDITOR: users.filter((user) => user.role === "EDITOR").length,
    USER: users.filter((user) => user.role === "USER").length,
  };

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/users")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Role Management
            </h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions across the platform
            </p>
          </div>
        </div>
      </motion.div>

      {/* Role Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.ADMIN}</div>
            <p className="text-xs text-muted-foreground">Full system access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editor Users</CardTitle>
            <Edit className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.EDITOR}</div>
            <p className="text-xs text-muted-foreground">
              Content creation access
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <User className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.USER}</div>
            <p className="text-xs text-muted-foreground">
              Read and comment access
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Role Permissions Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Overview of what each user role can access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold">Admin</h3>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Full system access</li>
                  <li>• User management</li>
                  <li>• Content creation & editing</li>
                  <li>• Settings configuration</li>
                  <li>• Analytics access</li>
                </ul>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Editor</h3>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Create and edit posts</li>
                  <li>• Upload media files</li>
                  <li>• Moderate comments</li>
                  <li>• View analytics</li>
                  <li>• No user management</li>
                </ul>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">User</h3>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Read published content</li>
                  <li>• Submit comments</li>
                  <li>• Like content</li>
                  <li>• View public profiles</li>
                  <li>• No admin access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Manage User Roles</CardTitle>
                <CardDescription>
                  Update user roles and permissions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>New Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {user.image ? (
                            <div
                              className="h-10 w-10 rounded-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${user.image})` }}
                            />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {user.name || "Unnamed User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) =>
                          updateUserRole(user.id, value)
                        }
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="EDITOR">Editor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {updating === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No users found
                </h3>
                <p className="text-muted-foreground">
                  {filterRole
                    ? `No users have the ${filterRole.toLowerCase()} role.`
                    : "No users have been registered yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
