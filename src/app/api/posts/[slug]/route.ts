import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  try {
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Post slug is required",
        },
        { status: 400 },
      );
    }

    // Get post with related data
    const post = await prisma.post.findUnique({
      where: {
        slug,
        status: "PUBLISHED", // Only return published posts
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
        comments: {
          where: {
            status: "APPROVED",
            parentId: null, // Only top-level comments
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            replies: {
              where: {
                status: "APPROVED",
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                status: "APPROVED",
              },
            },
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

    // Increment view count (you can implement this later with analytics)
    // For now, we'll just return the post

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Get post by slug error:", error);
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
  const { slug } = await params;
  try {
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

    // Find user by email from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
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
    let newSlug = slug;
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
      where: { slug },
      data: {
        ...(title && { title }),
        ...(newSlug !== slug && { slug: newSlug }),
        ...(content && { content }),
        ...(excerpt && { excerpt }),
        ...(status && { status: status.toUpperCase() }),
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
            set: categories.map((id: string) => ({ id })),
          },
        }),
        ...(tags && {
          tags: {
            set: tags.map((id: string) => ({ id })),
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
    console.error("Update post error:", error);
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
  const { slug } = await params;
  try {
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
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
      where: { slug },
    });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
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
