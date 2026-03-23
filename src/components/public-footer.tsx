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
} from "lucide-react";
import { getCompanyInitials } from "@/lib/company-settings";

export function PublicFooter() {
  const [companySettings, setCompanySettings] = useState({
    companyName: "Modern Blog",
    companyDescription: "A beautiful, fast, and modern blog built with Next.js",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyLogo: "",
    primaryColor: "#2563EB",
    secondaryColor: "#1E293B",
    accentColor: "#059669",
    twitterUrl: "",
    linkedinUrl: "",
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
    { name: "Home", href: "/" },
    { name: "Articles", href: "/posts" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-[var(--company-secondary)] text-white"
      style={
        {
          "--company-primary": companySettings.primaryColor,
          "--company-secondary": companySettings.secondaryColor,
          "--company-accent": companySettings.accentColor,
        } as React.CSSProperties
      }
    >
      {/* Scroll to top button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-[var(--company-primary)] text-white shadow-lg hover:bg-[var(--company-primary)]/90 transition-colors"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {companySettings.companyLogo ? (
                <img
                  src={companySettings.companyLogo}
                  alt={companySettings.companyName}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--company-primary)] text-white font-semibold">
                  {getCompanyInitials(companySettings.companyName)}
                </div>
              )}
              <span className="text-xl font-bold">
                {companySettings.companyName}
              </span>
            </div>
            <p className="text-white/70 leading-relaxed">
              {companySettings.companyDescription}
            </p>
            <div className="flex gap-3">
              {companySettings.twitterUrl && (
                <a
                  href={companySettings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {companySettings.linkedinUrl && (
                <a
                  href={companySettings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {companySettings.githubUrl && (
                <a
                  href={companySettings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {companySettings.instagramUrl && (
                <a
                  href={companySettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          {(companySettings.companyEmail ||
            companySettings.companyPhone ||
            companySettings.companyAddress) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact</h3>
              <div className="space-y-3">
                {companySettings.companyEmail && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${companySettings.companyEmail}`}
                      className="hover:text-white transition-colors"
                    >
                      {companySettings.companyEmail}
                    </a>
                  </div>
                )}
                {companySettings.companyPhone && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${companySettings.companyPhone}`}
                      className="hover:text-white transition-colors"
                    >
                      {companySettings.companyPhone}
                    </a>
                  </div>
                )}
                {companySettings.companyAddress && (
                  <div className="flex items-start gap-3 text-white/70">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{companySettings.companyAddress}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-white/70">
              Subscribe to our newsletter for the latest updates and articles.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--company-primary)]"
              />
              <Button className="w-full bg-[var(--company-primary)] hover:bg-[var(--company-primary)]/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm">
              © {currentYear} {companySettings.companyName}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Link href="/admin">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
