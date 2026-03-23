import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (postId) {
      where.postId = postId;
    }

    if (status) {
      where.status = status.toUpperCase();
    } else {
      // Default to approved comments for public API
      where.status = "APPROVED";
    }

    // Get comments with related data
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
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
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Comments API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch comments",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      content,
      postId,
      authorName,
      authorEmail,
      authorUrl,
      parentId,
    } = body;

    // Validate required fields
    if (!content || !postId) {
      return NextResponse.json(
        {
          success: false,
          error: "Content and postId are required",
        },
        { status: 400 }
      );
    }

    // Validate post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
        },
        { status: 404 }
      );
    }

    // Validate parent comment if provided
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          {
            success: false,
            error: "Parent comment not found",
          },
          { status: 404 }
        );
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        status: "PENDING", // Comments require moderation by default
        authorName,
        authorEmail,
        authorUrl,
        postId,
        parentId,
        // userId will be set if user is authenticated
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
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
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
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create comment",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
