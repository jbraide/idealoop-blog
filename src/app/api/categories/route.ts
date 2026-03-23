import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includePosts = searchParams.get("includePosts") === "true";

    const categories = await prisma.category.findMany({
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
              tags: true,
            },
            orderBy: {
              publishedAt: "desc",
            },
            take: 5, // Limit posts per category
          },
        }),
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform data to include postCount (published posts only)
    const categoriesWithCounts = categories.map((category) => ({
      ...category,
      postCount: category._count.posts,
      posts: category.posts || [],
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithCounts,
    });
  } catch (error: any) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
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
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "A category with this name already exists",
        },
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color: color || "#3B82F6", // Default blue color
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    console.error("Create category error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
