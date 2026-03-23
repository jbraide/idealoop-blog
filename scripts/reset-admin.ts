import { PrismaClient } from "@prisma/client";
import { hash, compare } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "braidej@gmail.com";
    const pass = "Pass123!@#";

    console.log(`🔍 Checking for user: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log(`✨ User not found. Creating new admin user: ${email}`);
            await prisma.user.create({
                data: {
                    email,
                    name: "Admin",
                    role: "ADMIN",
                    password: await hash(pass, 12),
                    emailVerified: new Date(),
                },
            });
        } else {
            console.log(`👤 User found. Updating password for: ${email}`);
            await prisma.user.update({
                where: { email },
                data: {
                    password: await hash(pass, 12),
                    role: "ADMIN", // Ensure they have ADMIN role
                },
            });
        }

        const updatedUser = await prisma.user.findUnique({ where: { email } });
        const isMatch = await compare(pass, updatedUser!.password!);

        console.log("✅ Operation completed.");
        console.log(`✅ User: ${email}`);
        console.log(`✅ Password: ${pass}`);
        console.log(`✅ Verification: ${isMatch ? "SUCCESS" : "FAILED"}`);
        console.log(`✅ Role: ${updatedUser!.role}`);

    } catch (error) {
        console.error("❌ Error during password reset:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
