import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get the authenticated user session
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

    // Check if user has admin role
    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "admin" &&
      session.user?.role !== "editor"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 },
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Post ID is required",
        },
        { status: 400 },
      );
    }

    // Get post with related data (including all statuses for admin)
    const post = await prisma.post.findUnique({
      where: {
        id,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Admin get post by ID error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch post",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get the authenticated user session
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

    // Check if user has admin role
    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "admin" &&
      session.user?.role !== "editor"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 },
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Post ID is required",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
        },
        { status: 404 },
      );
    }

    const {
      title,
      content,
      excerpt,
      status,
      categories,
      tags,
      mainImage,
      commentsEnabled,
      metaTitle,
      metaDescription,
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

    // Generate new slug if title changed
    let newSlug = existingPost.slug;
    if (title && title !== existingPost.title) {
      newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      // Check if new slug already exists (excluding current post)
      const slugExists = await prisma.post.findUnique({
        where: { slug: newSlug },
      });

      if (slugExists && slugExists.id !== existingPost.id) {
        return NextResponse.json(
          {
            success: false,
            error: "A post with this title already exists",
          },
          { status: 400 },
        );
      }
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(newSlug !== existingPost.slug && { slug: newSlug }),
        ...(content && { content }),
        ...(excerpt && { excerpt }),
        ...(status && { status: status.toUpperCase() }),
        ...(mainImage && { mainImage }),
        ...(typeof commentsEnabled === "boolean" && { commentsEnabled }),
        ...(metaTitle && { metaTitle }),
        ...(metaDescription && { metaDescription }),
        ...(canonicalUrl && { canonicalUrl }),
        ...(ogTitle && { ogTitle }),
        ...(ogDescription && { ogDescription }),
        ...(ogImage && { ogImage }),
        ...(ogType && { ogType }),
        ...(twitterCard && { twitterCard }),
        ...(twitterTitle && { twitterTitle }),
        ...(twitterDescription && { twitterDescription }),
        ...(twitterImage && { twitterImage }),
        ...(twitterCreator && { twitterCreator }),
        ...(publishedAt && { publishedAt: new Date(publishedAt) }),
        ...(categories && {
          categories: {
            set: categories.map((categoryId: string) => ({ id: categoryId })),
          },
        }),
        ...(tags && {
          tags: {
            set: tags.map((tagId: string) => ({ id: tagId })),
          },
        }),
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
      data: updatedPost,
    });
  } catch (error) {
    console.error("Admin update post error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update post",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get the authenticated user session
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

    // Check if user has admin role
    if (session.user?.role !== "ADMIN" && session.user?.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 },
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Post ID is required",
        },
        { status: 400 },
      );
    }

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
        },
        { status: 404 },
      );
    }

    // Delete post (this will cascade delete related comments due to foreign key constraints)
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete post error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete post",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
