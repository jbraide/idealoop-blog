"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  ArrowUp,
  BookOpen,
  Building2,
} from "lucide-react";
import { getCompanyInitials } from "@/lib/company-settings";

export function PublicFooter() {
  const [companySettings, setCompanySettings] = useState({
    companyName: "Idealoop",
    companyDescription: "Insights for Product-Led Growth",
    companyEmail: "hello@idealoop.xyz",
    companyPhone: "",
    companyAddress: "",
    companyLogo: "",
    primaryColor: "#4F46E5",
    secondaryColor: "#0F172A",
    accentColor: "#10B981",
    twitterUrl: "https://twitter.com/idealoop",
    linkedinUrl: "https://linkedin.com/company/idealoop",
    githubUrl: "",
    instagramUrl: "",
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const loadCompanySettings = async () => {
      try {
        const response = await fetch("/api/company-settings");
        if (response.ok) {
          const data = await response.json();
          setCompanySettings(data);
        }
      } catch (error) {
        console.error("Error loading company settings:", error);
      }
    };

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    loadCompanySettings();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigation = [
    { name: "Latest Articles", href: "/posts" },
    { name: "Trending Categories", href: "/categories" },
    { name: "Our Story", href: "/about" },
    { name: "Contact Support", href: "/contact" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-[var(--company-secondary)] text-white relative overflow-hidden"
      style={
        {
          "--company-primary": companySettings.primaryColor,
          "--company-secondary": companySettings.secondaryColor,
          "--company-accent": companySettings.accentColor,
        } as React.CSSProperties
      }
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--company-primary)] opacity-[0.03] rounded-full -mr-64 -mt-64 blur-3xl"></div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl bg-[var(--company-primary)] text-white shadow-2xl hover:bg-[var(--company-primary)]/90 transition-all hover:-translate-y-1"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}

      <div className="mx-auto max-w-7xl px-4 py-24 relative z-10">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white font-black text-xl">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter">
                {companySettings.companyName}
              </span>
            </div>
            <p className="text-white/60 leading-relaxed text-lg max-w-md">
              {companySettings.companyDescription}
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, url: companySettings.twitterUrl },
                { icon: Linkedin, url: companySettings.linkedinUrl },
                { icon: Github, url: companySettings.githubUrl },
                { icon: Instagram, url: companySettings.instagramUrl },
              ].filter(s => s.url).map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/5 hover:bg-[var(--company-primary)] transition-all hover:-translate-y-1"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--company-primary)]">Product</h3>
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white/60 hover:text-white transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
              <h3 className="text-xl font-bold">Deep dives into product growth</h3>
              <p className="text-white/60">
                Join 2,400+ product managers getting weekly insights on product-led growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--company-primary)] transition-all"
                />
                <Button className="bg-[var(--company-primary)] hover:bg-[var(--company-primary)]/90 text-white font-bold px-8 h-auto py-4 rounded-2xl">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
          <p className="text-white/40 text-sm font-medium">
            © {currentYear} {companySettings.companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
