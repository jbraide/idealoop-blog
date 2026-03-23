import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MediaService } from "@/lib/r2/media-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin/editor role
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mediaFile = await MediaService.getMediaFile(id);

    if (!mediaFile) {
      return NextResponse.json(
        { error: "Media file not found" },
        { status: 404 },
      );
    }

    if (mediaFile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only access your own media files" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: mediaFile,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching media file:", error);
    return NextResponse.json(
      { error: "Failed to fetch media file" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin/editor role
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { alt, caption, postId } = body;

    // Check if media file exists and belongs to current user
    const mediaFile = await MediaService.getMediaFile(id);
    if (!mediaFile) {
      return NextResponse.json(
        { error: "Media file not found" },
        { status: 404 },
      );
    }

    if (mediaFile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own media files" },
        { status: 403 },
      );
    }

    const updatedMediaFile = await MediaService.updateMediaFile(id, {
      alt,
      caption,
      postId,
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedMediaFile,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Error updating media file:", error);
    return NextResponse.json(
      { error: "Failed to update media file" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin/editor role
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if media file exists and belongs to current user
    const mediaFile = await MediaService.getMediaFile(id);
    if (!mediaFile) {
      return NextResponse.json(
        { error: "Media file not found" },
        { status: 404 },
      );
    }

    if (mediaFile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own media files" },
        { status: 403 },
      );
    }

    await MediaService.deleteFile(id);

    return NextResponse.json(
      {
        success: true,
        message: "Media file deleted successfully",
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Error deleting media file:", error);
    return NextResponse.json(
      { error: "Failed to delete media file" },
      { status: 500 },
    );
  }
}
