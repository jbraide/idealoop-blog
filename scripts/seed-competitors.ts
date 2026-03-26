import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const competitors = [
    {
        name: "Canny",
        domain: "canny.io",
        blogPath: "/blog",
    },
    {
        name: "Frill",
        domain: "frill.co",
        blogPath: "/blog",
    },
    {
        name: "Upvoty",
        domain: "upvoty.com",
        blogPath: "/blog",
    },
    {
        name: "Featurebase",
        domain: "featurebase.app",
        blogPath: "/blog",
    },
    {
        name: "Nolt",
        domain: "nolt.io",
        blogPath: "/blog",
    },
    {
        name: "Sleekplan",
        domain: "sleekplan.com",
        blogPath: "/blog",
    },
];

async function seedCompetitors() {
    console.log("Seeding competitors...");

    for (const competitor of competitors) {
        try {
            const existing = await prisma.competitor.findUnique({
                where: { domain: competitor.domain },
            });

            if (existing) {
                console.log(`  ⏭  ${competitor.name} already exists, skipping`);
                continue;
            }

            await prisma.competitor.create({ data: competitor });
            console.log(`  ✅ Added ${competitor.name} (${competitor.domain})`);
        } catch (error: any) {
            console.error(`  ❌ Failed to add ${competitor.name}: ${error.message}`);
        }
    }

    console.log("\nDone! Seeded competitors.");
}

seedCompetitors()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
