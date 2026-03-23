"use client";

import { motion } from "framer-motion";
import {
    Users,
    Rocket,
    Target,
    Award,
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AboutPage() {
    const [companySettings, setCompanySettings] = useState({
        companyName: "Idealoop",
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

    return (
        <div className="min-h-screen bg-background" style={{
            "--company-primary": companySettings.primaryColor,
            "--company-accent": companySettings.accentColor
        } as any}>
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden border-b">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--company-primary),transparent_50%)] opacity-[0.03]"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider uppercase rounded-full bg-[var(--company-primary)]/10 text-[var(--company-primary)]">
                            Our Story
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8">
                            Pioneering the future of <span className="text-[var(--company-primary)]">Product Growth</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We started {companySettings.companyName} with a simple mission: to help product teams move from guessing to knowing. Insights shouldn't be locked behind complex dashboards.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Data-Driven, Human-Centric",
                                desc: "We believe the best decisions happen at the intersection of hard data and human intuition.",
                                icon: TrendingUp,
                                color: "indigo"
                            },
                            {
                                title: "Radical Transparency",
                                desc: "We share our learnings, our failures, and our wins openly to help the community grow.",
                                icon: Heart,
                                color: "emerald"
                            },
                            {
                                title: "Product Excellence",
                                desc: "Every interaction matters. We obsess over the details so you don't have to.",
                                icon: Rocket,
                                color: "amber"
                            }
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-card border shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="h-14 w-14 rounded-2xl bg-[var(--company-primary)]/10 flex items-center justify-center mb-6 text-[var(--company-primary)]">
                                    <value.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                                <p className="text-muted-foreground leading-extended">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team/Mission Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--company-primary)] to-[var(--company-accent)] rounded-3xl blur-2xl opacity-10"></div>
                            <div className="relative rounded-3xl overflow-hidden aspect-video bg-muted border">
                                {/* Placeholder for team/office image */}
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-black text-6xl opacity-10 uppercase tracking-tighter">
                                    {companySettings.companyName}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl font-extrabold tracking-tight">Built for the next generation of builders.</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Whether you're a solo founder or leading a team of hundreds, our platform is designed to scale with your ambitions. We provide the tools to listen to your customers at scale and turn their feedback into your roadmap.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Used by 2,400+ product teams globally",
                                    "Winner of 'Scale Tool of the Year' 2025",
                                    "Remote-first team across 12 countries"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-bold text-foreground">
                                        <CheckCircle2 className="h-5 w-5 text-[var(--company-accent)]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Button size="lg" className="bg-[var(--company-primary)] font-bold px-8 py-6 rounded-2xl" asChild>
                                <Link href="/contact">Join the journey <ArrowRight className="ml-2 h-5 w-5" /></Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
