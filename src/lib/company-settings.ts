import { prisma } from "@/lib/prisma";

export interface CompanySettings {
  companyName: string;
  companyDescription: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyLogo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  twitterUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  instagramUrl: string;
}

const defaultSettings: CompanySettings = {
  companyName: "Modern Blog",
  companyDescription: "A beautiful, fast, and modern blog built with Next.js",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  companyLogo: "",
  primaryColor: "#6366F1",
  secondaryColor: "#0F172A",
  accentColor: "#10B981",
  twitterUrl: "",
  linkedinUrl: "",
  githubUrl: "",
  instagramUrl: "",
};

/**
 * Get company settings from database
 * Returns default values if settings are not found
 */
export async function getCompanySettings(): Promise<CompanySettings> {
  try {
    const settings = await prisma.setting.findMany();

    const settingsObject: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    return {
      companyName: settingsObject.companyName || defaultSettings.companyName,
      companyDescription:
        settingsObject.companyDescription || defaultSettings.companyDescription,
      companyEmail: settingsObject.companyEmail || defaultSettings.companyEmail,
      companyPhone: settingsObject.companyPhone || defaultSettings.companyPhone,
      companyAddress:
        settingsObject.companyAddress || defaultSettings.companyAddress,
      companyLogo: settingsObject.companyLogo || defaultSettings.companyLogo,
      primaryColor: settingsObject.primaryColor || defaultSettings.primaryColor,
      secondaryColor:
        settingsObject.secondaryColor || defaultSettings.secondaryColor,
      accentColor: settingsObject.accentColor || defaultSettings.accentColor,
      twitterUrl: settingsObject.twitterUrl || defaultSettings.twitterUrl,
      linkedinUrl: settingsObject.linkedinUrl || defaultSettings.linkedinUrl,
      githubUrl: settingsObject.githubUrl || defaultSettings.githubUrl,
      instagramUrl: settingsObject.instagramUrl || defaultSettings.instagramUrl,
    };
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return defaultSettings;
  }
}

/**
 * Get company initials for logo display
 * Returns first two characters of company name or "BL" as fallback
 */
export function getCompanyInitials(companyName: string): string {
  if (!companyName || companyName.trim().length === 0) {
    return "BL";
  }

  const words = companyName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Validate color format
 * Returns true if valid hex color
 */
export function isValidColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Generate CSS variables for brand colors
 * Returns CSS string with custom properties
 */
export function generateBrandCSS(settings: CompanySettings): string {
  return `
    :root {
      --company-primary: ${settings.primaryColor};
      --company-secondary: ${settings.secondaryColor};
      --company-accent: ${settings.accentColor};
    }

    .dark {
      --company-primary: ${settings.primaryColor};
      --company-secondary: ${settings.secondaryColor};
      --company-accent: ${settings.accentColor};
    }
  `;
}
