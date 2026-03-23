import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// Environment variables for admin configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@blogplatform.com";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const EDITOR_EMAIL = process.env.EDITOR_EMAIL || "editor@blogplatform.com";
const EDITOR_NAME = process.env.EDITOR_NAME || "Editor User";
const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD || "editor123";

// Check if data already exists
async function checkExistingData(): Promise<boolean> {
  try {
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const postCount = await prisma.post.count();

    return userCount > 0 || categoryCount > 0 || postCount > 0;
  } catch (error) {
    console.error("❌ Error checking existing data:", error);
    return false;
  }
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Check if data already exists
  const hasExistingData = await checkExistingData();

  if (hasExistingData) {
    console.log("⚠️ Database already contains data. Skipping seed...");
    console.log(
      "💡 To force re-seed, clear the database first or set FORCE_SEED=true",
    );

    if (process.env.FORCE_SEED !== "true") {
      return;
    }
    console.log("🔄 Force seeding enabled, proceeding...");
  }

  // Clear existing data only if force seed is enabled
  if (process.env.FORCE_SEED === "true") {
    console.log("🗑️ Force clearing existing data...");
    try {
      await prisma.$executeRaw`TRUNCATE TABLE "users", "categories", "tags", "posts", "comments", "media_files", "pages", "settings", "_PostCategories", "_PostTags" RESTART IDENTITY CASCADE`;
    } catch (error) {
      console.error("❌ Error clearing existing data:", error);
      throw error;
    }
  }

  // Create users (upsert to handle existing users)
  console.log("👥 Creating users...");

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  let adminUser;
  if (existingAdmin) {
    console.log(`👤 Admin user ${ADMIN_EMAIL} already exists`);
    adminUser = existingAdmin;
  } else {
    adminUser = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: "ADMIN",
        password: await hash(ADMIN_PASSWORD, 12),
        emailVerified: new Date(),
      },
    });
    console.log(`👤 Created admin user: ${ADMIN_EMAIL}`);
  }

  // Check if editor user already exists
  const existingEditor = await prisma.user.findUnique({
    where: { email: EDITOR_EMAIL },
  });

  let editorUser;
  if (existingEditor) {
    console.log(`👤 Editor user ${EDITOR_EMAIL} already exists`);
    editorUser = existingEditor;
  } else {
    editorUser = await prisma.user.create({
      data: {
        email: EDITOR_EMAIL,
        name: EDITOR_NAME,
        role: "EDITOR",
        password: await hash(EDITOR_PASSWORD, 12),
        emailVerified: new Date(),
      },
    });
    console.log(`👤 Created editor user: ${EDITOR_EMAIL}`);
  }

  // Create categories (upsert pattern)
  console.log("📂 Creating categories...");

  const categories = [
    {
      name: "Technology",
      slug: "technology",
      description: "Latest tech news and tutorials",
      color: "#3B82F6",
    },
    {
      name: "Web Development",
      slug: "web-development",
      description: "Frontend and backend development",
      color: "#10B981",
    },
    {
      name: "Design",
      slug: "design",
      description: "UI/UX design principles and trends",
      color: "#8B5CF6",
    },
  ];

  const categoryResults = [];
  for (const categoryData of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug },
    });

    if (existingCategory) {
      console.log(`📂 Category "${categoryData.name}" already exists`);
      categoryResults.push(existingCategory);
    } else {
      const category = await prisma.category.create({
        data: categoryData,
      });
      console.log(`📂 Created category: ${categoryData.name}`);
      categoryResults.push(category);
    }
  }

  const [technologyCategory, webDevCategory, designCategory] = categoryResults;

  // Create tags (upsert pattern)
  console.log("🏷️ Creating tags...");

  const tags = [
    { name: "Next.js", slug: "nextjs" },
    { name: "React", slug: "react" },
    { name: "JavaScript", slug: "javascript" },
    { name: "UI Design", slug: "ui-design" },
    { name: "Security", slug: "security" },
  ];

  const tagResults = [];
  for (const tagData of tags) {
    const existingTag = await prisma.tag.findUnique({
      where: { slug: tagData.slug },
    });

    if (existingTag) {
      console.log(`🏷️ Tag "${tagData.name}" already exists`);
      tagResults.push(existingTag);
    } else {
      const tag = await prisma.tag.create({
        data: tagData,
      });
      console.log(`🏷️ Created tag: ${tagData.name}`);
      tagResults.push(tag);
    }
  }

  const [nextjsTag, reactTag, javascriptTag, uiTag, securityTag] = tagResults;

  // Create posts (only if they don't exist)
  console.log("📝 Creating posts...");

  const posts = [
    {
      title: "Getting Started with Next.js 14",
      slug: "getting-started-with-nextjs-14",
      content: `
        <h2>Introduction to Next.js 14</h2>
        <p>Next.js 14 brings exciting new features that make building React applications even better. With the new App Router, Server Components, and improved performance, it's the perfect time to dive in.</p>

        <h3>Key Features</h3>
        <ul>
          <li>App Router with React Server Components</li>
          <li>Improved performance with Turbopack</li>
          <li>Better developer experience</li>
          <li>Enhanced SEO capabilities</li>
        </ul>

        <p>In this tutorial, we'll walk through setting up your first Next.js 14 project and explore the new features.</p>
      `,
      excerpt:
        "Learn how to get started with Next.js 14 and its powerful new features including the App Router and Server Components.",
      status: "PUBLISHED" as const,
      authorId: adminUser.id,
      metaTitle: "Getting Started with Next.js 14 - Complete Guide",
      metaDescription:
        "Learn how to get started with Next.js 14 and its powerful new features including the App Router and Server Components.",
      keywords: "nextjs, react, javascript, web development, tutorial",
      canonicalUrl: "/posts/getting-started-with-nextjs-14",
      ogTitle: "Getting Started with Next.js 14",
      ogDescription:
        "Learn how to get started with Next.js 14 and its powerful new features",
      ogImage: "/images/nextjs-14-og.jpg",
      ogType: "article",
      twitterCard: "summary_large_image",
      twitterTitle: "Getting Started with Next.js 14",
      twitterDescription:
        "Learn how to get started with Next.js 14 and its powerful new features",
      twitterImage: "/images/nextjs-14-twitter.jpg",
      twitterCreator: "@blogplatform",
      publishedAt: new Date("2024-01-15T10:00:00Z"),
      categoryIds: [technologyCategory.id, webDevCategory.id],
      tagIds: [nextjsTag.id, reactTag.id, javascriptTag.id],
    },
    {
      title: "Modern UI Design Patterns for 2024",
      slug: "modern-ui-design-patterns-2024",
      content: `
        <h2>Modern UI Design Patterns</h2>
        <p>Design patterns have evolved significantly in recent years. Let's explore the most effective patterns for creating beautiful and functional user interfaces in 2024.</p>

        <h3>Key Patterns</h3>
        <ul>
          <li>Dark mode with smooth transitions</li>
          <li>Micro-interactions and hover effects</li>
          <li>Responsive design with mobile-first approach</li>
          <li>Accessibility-first design principles</li>
        </ul>
      `,
      excerpt:
        "Explore the latest UI design patterns and trends that are shaping modern web applications in 2024.",
      status: "PUBLISHED" as const,
      authorId: editorUser.id,
      metaTitle: "Modern UI Design Patterns for 2024",
      metaDescription:
        "Explore the latest UI design patterns and trends that are shaping modern web applications in 2024.",
      keywords:
        "ui design, web design, user interface, design patterns, 2024 trends",
      canonicalUrl: "/posts/modern-ui-design-patterns-2024",
      ogTitle: "Modern UI Design Patterns for 2024",
      ogDescription: "Explore the latest UI design patterns and trends",
      ogImage: "/images/ui-design-og.jpg",
      ogType: "article",
      twitterCard: "summary_large_image",
      twitterTitle: "Modern UI Design Patterns for 2024",
      twitterDescription: "Explore the latest UI design patterns and trends",
      twitterImage: "/images/ui-design-twitter.jpg",
      twitterCreator: "@blogplatform",
      publishedAt: new Date("2024-01-14T14:00:00Z"),
      categoryIds: [designCategory.id],
      tagIds: [uiTag.id],
    },
    {
      title: "Database Authentication Best Practices",
      slug: "database-authentication-best-practices",
      content: `
        <h2>Database Authentication Guide</h2>
        <p>Modern database authentication provides a complete authentication solution for web and mobile apps. Let's explore best practices for implementing secure and user-friendly authentication.</p>
      `,
      excerpt:
        "Learn best practices for implementing secure database authentication in your applications.",
      status: "DRAFT" as const,
      authorId: adminUser.id,
      metaTitle: "Database Authentication Best Practices",
      metaDescription:
        "Learn best practices for implementing secure database authentication in your applications.",
      keywords:
        "database, authentication, security, best practices, web security",
      canonicalUrl: "/posts/database-authentication-best-practices",
      ogTitle: "Database Authentication Best Practices",
      ogDescription:
        "Learn best practices for implementing secure database authentication",
      ogImage: "/images/database-auth-og.jpg",
      ogType: "article",
      twitterCard: "summary",
      twitterTitle: "Database Authentication Best Practices",
      twitterDescription:
        "Learn best practices for implementing secure database authentication",
      twitterImage: "/images/database-auth-twitter.jpg",
      twitterCreator: "@blogplatform",
      categoryIds: [technologyCategory.id, webDevCategory.id],
      tagIds: [securityTag.id],
    },
  ];

  const postResults = [];
  for (const postData of posts) {
    const existingPost = await prisma.post.findUnique({
      where: { slug: postData.slug },
    });

    if (existingPost) {
      console.log(`📝 Post "${postData.title}" already exists`);
      postResults.push(existingPost);
    } else {
      const { categoryIds, tagIds, ...postCreateData } = postData;
      const post = await prisma.post.create({
        data: {
          ...postCreateData,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
          tags: {
            connect: tagIds.map((id) => ({ id })),
          },
        },
      });
      console.log(`📝 Created post: ${postData.title}`);
      postResults.push(post);
    }
  }

  const [post1, post2, post3] = postResults;

  // Create comments (only for newly created posts)
  if (
    post1 &&
    !(await prisma.comment.findFirst({ where: { postId: post1.id } }))
  ) {
    console.log("💬 Creating comments...");
    await prisma.comment.createMany({
      data: [
        {
          content:
            "Great article! The App Router explanation was particularly helpful.",
          status: "APPROVED",
          authorName: "John Developer",
          authorEmail: "john@example.com",
          authorUrl: "https://johndev.com",
          postId: post1.id,
        },
        {
          content:
            "Looking forward to trying out the new features. Any performance benchmarks?",
          status: "APPROVED",
          authorName: "Sarah Designer",
          authorEmail: "sarah@example.com",
          postId: post1.id,
        },
      ],
    });
  }

  if (
    post2 &&
    !(await prisma.comment.findFirst({ where: { postId: post2.id } }))
  ) {
    await prisma.comment.create({
      data: {
        content:
          "The dark mode patterns mentioned here are exactly what I needed for my current project!",
        status: "APPROVED",
        authorName: "Mike UX",
        authorEmail: "mike@example.com",
        authorUrl: "https://mikeux.com",
        postId: post2.id,
      },
    });
  }

  // Skip media file creation to avoid orphaned records without actual files
  // Media files should be uploaded through the admin interface to ensure
  // they exist in both the database and Cloudflare R2

  // Create settings (only if they don't exist)
  console.log("⚙️ Creating settings...");

  const settings = [
    { key: "site_title", value: "Modern Blog Platform" },
    {
      key: "site_description",
      value: "A modern blog platform built with Next.js and PostgreSQL",
    },
    { key: "posts_per_page", value: "10" },
    { key: "comments_enabled", value: "true" },
    { key: "comments_moderation", value: "true" },
  ];

  for (const setting of settings) {
    const existingSetting = await prisma.setting.findUnique({
      where: { key: setting.key },
    });

    if (!existingSetting) {
      await prisma.setting.create({
        data: setting,
      });
      console.log(`⚙️ Created setting: ${setting.key}`);
    } else {
      console.log(`⚙️ Setting "${setting.key}" already exists`);
    }
  }

  console.log("✅ Database seed completed successfully!");
  console.log(`📊 Current database state:`);
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.category.count()} categories`);
  console.log(`   - ${await prisma.tag.count()} tags`);
  console.log(`   - ${await prisma.post.count()} posts`);
  console.log(`   - ${await prisma.comment.count()} comments`);
  console.log(
    `   - ${await prisma.mediaFile.count()} media files (skipped creation)`,
  );
  console.log(`   - ${await prisma.setting.count()} settings`);
}

main()
  .catch((e) => {
    console.error("❌ Database seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
