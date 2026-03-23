import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Post slug is required",
        },
        { status: 400 }
      );
    }

    // Get or create session ID
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      // Create a new session ID
      sessionId = crypto.randomUUID();
      cookieStore.set("session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Get client IP address (for additional uniqueness)
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";

    // Find the post
    const post = await prisma.post.findUnique({
      where: {
        slug,
        status: "PUBLISHED",
      },
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

    // Check if this session has already viewed this post
    const existingView = await prisma.postView.findUnique({
      where: {
        postId_sessionId: {
          postId: post.id,
          sessionId,
        },
      },
    });

    if (existingView) {
      // Session has already viewed this post, return current counts
      const currentPost = await prisma.post.findUnique({
        where: { id: post.id },
        select: {
          viewCount: true,
          uniqueViewCount: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          viewCount: currentPost?.viewCount || 0,
          uniqueViewCount: currentPost?.uniqueViewCount || 0,
          alreadyCounted: true,
        },
      });
    }

    // Create a new view record and update post counts in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the view record
      await tx.postView.create({
        data: {
          postId: post.id,
          sessionId,
          ipAddress,
        },
      });

      // Update post view counts
      const updatedPost = await tx.post.update({
        where: { id: post.id },
        data: {
          viewCount: {
            increment: 1,
          },
          uniqueViewCount: {
            increment: 1,
          },
        },
        select: {
          viewCount: true,
          uniqueViewCount: true,
        },
      });

      return updatedPost;
    });

    return NextResponse.json({
      success: true,
      data: {
        viewCount: result.viewCount,
        uniqueViewCount: result.uniqueViewCount,
        alreadyCounted: false,
      },
    });
  } catch (error) {
    console.error("Track post view error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track post view",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Post slug is required",
        },
        { status: 400 }
      );
    }

    // Get current view counts without tracking a new view
    const post = await prisma.post.findUnique({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        viewCount: true,
        uniqueViewCount: true,
      },
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

    return NextResponse.json({
      success: true,
      data: {
        viewCount: post.viewCount,
        uniqueViewCount: post.uniqueViewCount,
      },
    });
  } catch (error) {
    console.error("Get post views error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get post views",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
