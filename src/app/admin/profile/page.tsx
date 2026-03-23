"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/actions";
import { toast } from "sonner";
import { Loader2, ShieldCheck, KeyRound } from "lucide-react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) return;

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await changePassword({
                userId: session.user.id,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            if (result.success) {
                toast.success("Password updated successfully");
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                toast.error(result.error || "Failed to update password");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-3xl border-muted/50 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <CardTitle>Change Password</CardTitle>
                        </div>
                        <CardDescription>
                            Update your password to keep your account secure.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="rounded-xl"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full rounded-xl gap-2 h-11"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-muted/50 shadow-lg bg-primary/[0.02]">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <CardTitle>Security Check</CardTitle>
                        </div>
                        <CardDescription>
                            Current account information and status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-2xl bg-card border border-muted/50 space-y-1">
                            <div className="text-sm text-muted-foreground">Account Email</div>
                            <div className="font-semibold">{session?.user?.email}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-card border border-muted/50 space-y-1">
                            <div className="text-sm text-muted-foreground">Access Level</div>
                            <div className="font-semibold flex items-center gap-2">
                                <span className="capitalize">{session?.user?.role || "User"}</span>
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
