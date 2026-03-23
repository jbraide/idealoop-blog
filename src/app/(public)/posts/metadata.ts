import type { Metadata } from "next";
import { getCompanySettings } from "@/lib/company-settings";

export async function generateMetadata(): Promise<Metadata> {
    const companySettings = await getCompanySettings();

    return {
        title: `Blog | ${companySettings.companyName}`,
        description: `Explore the latest articles, tutorials, and insights from ${companySettings.companyName}.`,
        openGraph: {
            title: `Blog | ${companySettings.companyName}`,
            description: `Explore the latest articles, tutorials, and insights from ${companySettings.companyName}.`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `Blog | ${companySettings.companyName}`,
            description: `Explore the latest articles, tutorials, and insights from ${companySettings.companyName}.`,
        },
    };
}
