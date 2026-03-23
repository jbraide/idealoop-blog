import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/settings - Get all settings (Admin only)

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    // Get all settings from database
    const settings = await prisma.setting.findMany();

    // Transform settings array into object
    const settingsObject: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    // Return with default values if not set
    return NextResponse.json({
      companyName: settingsObject.companyName || "",
      companyDescription: settingsObject.companyDescription || "",
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
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/admin/settings - Update settings (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const settings = await request.json();

    // Update settings in database
    const updatePromises = Object.entries(settings).map(
      async ([key, value]) => {
        return prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      },
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
