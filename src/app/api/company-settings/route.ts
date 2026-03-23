import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/company-settings - Get public company settings
export async function GET() {
  try {
    // Get all settings from database
    const settings = await prisma.setting.findMany();

    // Transform settings array into object
    const settingsObject: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    // Return only public-facing settings
    return NextResponse.json({
      companyName: settingsObject.companyName || "Modern Blog",
      companyDescription:
        settingsObject.companyDescription ||
        "A beautiful, fast, and modern blog built with Next.js",
      companyEmail: settingsObject.companyEmail || "",
      companyPhone: settingsObject.companyPhone || "",
      companyAddress: settingsObject.companyAddress || "",
      companyLogo: settingsObject.companyLogo || "",
      primaryColor: settingsObject.primaryColor || "#2563EB",
      secondaryColor: settingsObject.secondaryColor || "#1E293B",
      accentColor: settingsObject.accentColor || "#059669",
      twitterUrl: settingsObject.twitterUrl || "",
      linkedinUrl: settingsObject.linkedinUrl || "",
      githubUrl: settingsObject.githubUrl || "",
      instagramUrl: settingsObject.instagramUrl || "",
    });
  } catch (error) {
    console.error("Error fetching company settings:", error);
    // Return default settings on error
    return NextResponse.json({
      companyName: "Modern Blog",
      companyDescription:
        "A beautiful, fast, and modern blog built with Next.js",
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
  }
}
