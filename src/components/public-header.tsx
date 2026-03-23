"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, Moon, Search, Sun, X, Building2 } from "lucide-react";
import { useTheme } from "next-themes";
import { getCompanyInitials } from "@/lib/company-settings";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    companyName: "Idealoop",
    companyLogo: "",
    primaryColor: "#4F46E5",
    secondaryColor: "#0F172A",
    accentColor: "#10B981",
  });
  const { theme, setTheme } = useTheme();

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

    loadCompanySettings();
  }, []);

  const navigation = [
    { name: "Articles", href: "/posts" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      style={
        {
          "--company-primary": companySettings.primaryColor,
          "--company-secondary": companySettings.secondaryColor,
          "--company-accent": companySettings.accentColor,
        } as React.CSSProperties
      }
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-3 text-2xl font-black tracking-tighter text-foreground group"
              onClick={closeMenu}
            >
              {companySettings.companyLogo ? (
                <img
                  src={companySettings.companyLogo}
                  alt={companySettings.companyName}
                  className="h-9 w-9 object-contain"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--company-primary)] to-[var(--company-accent)] text-white shadow-lg shadow-[var(--company-primary)]/20 group-hover:scale-105 transition-transform">
                  <Building2 className="h-5 w-5" />
                </div>
              )}
              <span className="hidden sm:block">
                {companySettings.companyName.split("").map((char, i) => (
                  <span key={i} className={cn(i >= 4 ? "text-[var(--company-primary)]" : "")}>
                    {char}
                  </span>
                ))}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-10 w-10 rounded-xl"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-10 w-10 rounded-xl"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="h-10 w-10 rounded-xl"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t py-6 space-y-6 bg-background"
          >
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-lg font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

          </motion.div>
        )}
      </div>
    </header>
  );
}
