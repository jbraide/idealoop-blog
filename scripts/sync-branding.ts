import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🎨 Syncing Idealoop branding settings...");

    const settings = [
        {
            key: "companyName",
            value: "Idealoop",
        },
        {
            key: "companyDescription",
            value: "The customer-driven product management platform. Build what your users actually want.",
        },
        {
            key: "companyEmail",
            value: "hello@idealoop.xyz",
        },
        {
            key: "primaryColor",
            value: "#4F46E5", // Premium Indigo
        },
        {
            key: "secondaryColor",
            value: "#0F172A", // Slate 900
        },
        {
            key: "accentColor",
            value: "#10B981", // Emerald 500
        },
        {
            key: "twitterUrl",
            value: "https://twitter.com/idealoop",
        },
        {
            key: "githubUrl",
            value: "https://github.com/idealoop",
        },
    ];

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting,
        });
        console.log(`✅ Set ${setting.key} = ${setting.value}`);
    }

    // Also sync the old keys just in case anything else uses them
    const legacySettings = [
        { key: "site_title", value: "Idealoop Blog" },
        { key: "site_description", value: "Product management insights and customer-driven development." }
    ];

    for (const setting of legacySettings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting,
        });
    }

    console.log("✨ Branding sync completed!");
}

main()
    .catch((e) => {
        console.error("❌ Sync failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
