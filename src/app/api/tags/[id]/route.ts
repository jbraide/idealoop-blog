import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Tag ID is required",
        },
        { status: 400 },
      );
    }

    const tag = await prisma.tag.findUnique({
      where: {
        id,
      },
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
      },
    });

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: "Tag not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...tag,
        postCount: tag._count.posts,
      },
    });
  } catch (error) {
    console.error("Get tag by ID error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tag",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Tag ID is required",
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name } = body;

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json(
        {
          success: false,
          error: "Tag not found",
        },
        { status: 404 },
      );
    }

    // Generate new slug if name changed
    let newSlug = existingTag.slug;
    if (name && name !== existingTag.name) {
      newSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      // Check if new slug already exists (excluding current tag)
      const slugExists = await prisma.tag.findUnique({
        where: { slug: newSlug },
      });

      if (slugExists && slugExists.id !== existingTag.id) {
        return NextResponse.json(
          {
            success: false,
            error: "A tag with this name already exists",
          },
          { status: 400 },
        );
      }
    }

    // Update tag
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(newSlug !== existingTag.slug && { slug: newSlug }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTag,
    });
  } catch (error) {
    console.error("Update tag error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update tag",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Tag ID is required",
        },
        { status: 400 },
      );
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
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
      },
    });

    if (!existingTag) {
      return NextResponse.json(
        {
          success: false,
          error: "Tag not found",
        },
        { status: 404 },
      );
    }

    // Check if tag has posts
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete tag that has posts. Please remove all posts from this tag first.",
        },
        { status: 400 },
      );
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Delete tag error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete tag",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
