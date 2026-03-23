import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const includePosts = searchParams.get("includePosts") === "true";

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const tags = await prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
              },
            },
          },
        },
        ...(includePosts && {
          posts: {
            where: {
              status: "PUBLISHED",
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
            },
            orderBy: {
              publishedAt: "desc",
            },
            take: 5, // Limit posts per tag
          },
        }),
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform data to include postCount
    const tagsWithCounts = tags.map((tag) => ({
      ...tag,
      postCount: tag._count.posts,
      posts: tag.posts || [],
    }));

    return NextResponse.json({
      success: true,
      data: tagsWithCounts,
    });
  } catch (error) {
    console.error("Tags API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tags",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Tag name is required",
        },
        { status: 400 },
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if slug already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (existingTag) {
      return NextResponse.json(
        {
          success: false,
          error: "A tag with this name already exists",
        },
        { status: 400 },
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error("Create tag error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create tag",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
