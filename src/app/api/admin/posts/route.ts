import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Check if user has admin or editor role
    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "admin" &&
      session.user?.role !== "EDITOR"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const {
      title,
      content,
      excerpt,
      status,
      categories,
      tags,
      mainImage,
      commentsEnabled = true,
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      twitterCreator,
      publishedAt,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and content are required",
        },
        { status: 400 },
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: "A post with this title already exists",
        },
        { status: 400 },
      );
    }

    // Get the current user as author
    const author = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!author) {
      return NextResponse.json(
        {
          success: false,
          error: "Author not found",
        },
        { status: 404 },
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || "",
        status:
          (status?.toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED") ||
          "DRAFT",
        mainImage: mainImage || null,
        commentsEnabled,
        authorId: author.id,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
        canonicalUrl: canonicalUrl || null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        ogType: ogType || null,
        twitterCard: twitterCard || null,
        twitterTitle: twitterTitle || null,
        twitterDescription: twitterDescription || null,
        twitterImage: twitterImage || null,
        twitterCreator: twitterCreator || null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        categories: {
          connect:
            categories?.map((categoryId: string) => ({ id: categoryId })) || [],
        },
        tags: {
          connect: tags?.map((tagId: string) => ({ id: tagId })) || [],
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Admin create post error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create post",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
