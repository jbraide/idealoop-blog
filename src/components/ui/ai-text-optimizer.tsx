"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AITextOptimizerProps {
    selectedText: string;
    onReplace: (optimizedText: string) => void;
    disabled?: boolean;
}

export function AITextOptimizer({
    selectedText,
    onReplace,
    disabled = false,
}: AITextOptimizerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tone, setTone] = useState("professional");
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedText, setOptimizedText] = useState("");

    const tones = [
        { value: "professional", label: "Professional" },
        { value: "casual", label: "Casual" },
        { value: "persuasive", label: "Persuasive" },
        { value: "seo", label: "SEO-Optimized" },
        { value: "concise", label: "Concise" },
        { value: "engaging", label: "Engaging" },
    ];

    const handleOptimize = async () => {
        if (!selectedText) {
            toast.error("Please select text to optimize first");
            return;
        }

        setIsOptimizing(true);
        setOptimizedText("");

        try {
            const response = await fetch("/api/ai/optimize-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: selectedText, tone }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to optimize text");
            }

            setOptimizedText(data.optimizedText);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleReplace = () => {
        if (optimizedText) {
            onReplace(optimizedText);
            setIsOpen(false);
            setOptimizedText("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={disabled || !selectedText}
                >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Optimize
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Optimize Selected Text
                    </DialogTitle>
                    <DialogDescription>
                        Choose a tone to rewrite the highlighted text using AI.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Desired Tone:</span>
                        <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a tone" />
                            </SelectTrigger>
                            <SelectContent>
                                {tones.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleOptimize}
                            disabled={isOptimizing || !selectedText}
                        >
                            {isOptimizing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Optimize"
                            )}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Original Text
                            </span>
                            <div
                                className="text-sm p-3 bg-muted rounded-md min-h-[120px] max-h-[250px] overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: selectedText || "No text selected." }}
                            />
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Optimized Output
                            </span>
                            <div
                                className="text-sm p-3 bg-primary/5 border border-primary/20 rounded-md min-h-[120px] max-h-[250px] overflow-y-auto"
                                dangerouslySetInnerHTML={{
                                    __html: isOptimizing
                                        ? "Generating ideas..."
                                        : optimizedText || "Click optimize to see results.",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReplace}
                        disabled={!optimizedText || isOptimizing}
                        className="gap-2"
                    >
                        Replace Text
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
