"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Mail,
    MessageSquare,
    Send,
    Github,
    Twitter,
    Linkedin,
    MapPin,
    CheckCircle2,
    Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [companySettings, setCompanySettings] = useState({
        companyName: "Idealoop",
        companyEmail: "hello@idealoop.xyz",
        primaryColor: "#4F46E5",
        accentColor: "#10B981",
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch("/api/company-settings");
                if (response.ok) {
                    const data = await response.json();
                    setCompanySettings(data);
                }
            } catch (error) { }
        };
        loadSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-background" style={{
            "--company-primary": companySettings.primaryColor,
            "--company-accent": companySettings.accentColor
        } as any}>
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--company-primary),transparent_50%)] opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-24">
                            {/* Left Side: Contact Info */}
                            <div className="space-y-12">
                                <div>
                                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-black tracking-wider uppercase rounded-full bg-[var(--company-primary)]/10 text-[var(--company-primary)]">
                                        Get in touch
                                    </span>
                                    <h1 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
                                        Let's talk about <span className="text-[var(--company-primary)]">your growth</span>
                                    </h1>
                                    <p className="text-xl text-muted-foreground leading-relaxed">
                                        Have a question, feedback, or just want to say hi? We'd love to hear from you. Our team typically responds within 4 hours.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-6">
                                        <div className="h-12 w-12 rounded-2xl bg-[var(--company-primary)]/10 flex items-center justify-center shrink-0 text-[var(--company-primary)]">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Email Us</h3>
                                            <p className="text-muted-foreground font-medium">{companySettings.companyEmail}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6">
                                        <div className="h-12 w-12 rounded-2xl bg-[var(--company-primary)]/10 flex items-center justify-center shrink-0 text-[var(--company-primary)]">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Our Base</h3>
                                            <p className="text-muted-foreground font-medium">Remote First • London, UK</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-muted">
                                    <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Follow the progress</h4>
                                    <div className="flex gap-4">
                                        <a href="#" className="p-4 rounded-2xl bg-muted hover:bg-[var(--company-primary)] hover:text-white transition-all shadow-sm">
                                            <Twitter className="h-5 w-5" />
                                        </a>
                                        <a href="#" className="p-4 rounded-2xl bg-muted hover:bg-[var(--company-primary)] hover:text-white transition-all shadow-sm">
                                            <Linkedin className="h-5 w-5" />
                                        </a>
                                        <a href="#" className="p-4 rounded-2xl bg-muted hover:bg-[var(--company-primary)] hover:text-white transition-all shadow-sm">
                                            <Github className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Contact Form */}
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-[var(--company-primary)] to-[var(--company-accent)] rounded-[2.5rem] blur-2xl opacity-[0.05]"></div>
                                <div className="relative bg-card border border-muted p-10 rounded-[2rem] shadow-2xl">
                                    {submitted ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-12"
                                        >
                                            <div className="h-20 w-20 bg-[var(--company-accent)]/10 text-[var(--company-accent)] rounded-full flex items-center justify-center mx-auto mb-8">
                                                <CheckCircle2 className="h-10 w-10" />
                                            </div>
                                            <h2 className="text-3xl font-black mb-4">Message Sent!</h2>
                                            <p className="text-muted-foreground text-lg mb-8">
                                                Thanks for reaching out. We've received your message and will get back to you shortly.
                                            </p>
                                            <Button onClick={() => setSubmitted(false)} variant="outline" className="font-bold rounded-xl px-8 py-4">
                                                Send another message
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Name</label>
                                                    <Input required placeholder="Your name" className="bg-muted/50 border-none h-14 rounded-xl px-5 focus-visible:ring-2 focus-visible:ring-[var(--company-primary)]" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                                                    <Input required type="email" placeholder="Your email" className="bg-muted/50 border-none h-14 rounded-xl px-5 focus-visible:ring-2 focus-visible:ring-[var(--company-primary)]" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Subject</label>
                                                <Input required placeholder="How can we help?" className="bg-muted/50 border-none h-14 rounded-xl px-5 focus-visible:ring-2 focus-visible:ring-[var(--company-primary)]" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Message</label>
                                                <Textarea required placeholder="Tell us more about your inquiry..." className="bg-muted/50 border-none min-h-[160px] rounded-xl p-5 focus-visible:ring-2 focus-visible:ring-[var(--company-primary)]" />
                                            </div>
                                            <Button type="submit" disabled={isSubmitting} className="w-full bg-[var(--company-primary)] hover:bg-[var(--company-primary)]/90 text-white font-black py-8 rounded-2xl text-lg shadow-xl shadow-[var(--company-primary)]/20 transition-all hover:-translate-y-1">
                                                {isSubmitting ? "Sending..." : "Send Message"} <Send className="ml-3 h-5 w-5" />
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
