"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";

// Check if we're in a build environment
const isBuildEnvironment =
  process.env.NODE_ENV === "production" &&
  typeof window === "undefined" &&
  process.env.NETLIFY === "true";

export async function getPosts(
  options: {
    status?: string[];
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  // Skip database operations during build
  if (isBuildEnvironment) {
    return {
      success: true,
      data: {
        posts: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 10,
        totalPages: 0,
      },
    };
  }

  try {
    const {
      status = ["PUBLISHED"],
      category,
      tag,
      search,
      page = 1,
      limit = 10,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      status?: { in: ("DRAFT" | "PUBLISHED" | "ARCHIVED")[] };
      categories?: { some: { slug: string } };
      tags?: { some: { slug: string } };
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        excerpt?: { contains: string; mode: "insensitive" };
        content?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      status: {
        in: status.map(
          (s) => s.toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        ),
      },
    };

    if (category) {
      where.categories = {
        some: {
          slug: category,
        },
      };
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          mainImage: true,
          commentsEnabled: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          metaTitle: true,
          metaDescription: true,
          canonicalUrl: true,
          ogTitle: true,
          ogDescription: true,
          ogImage: true,
          ogType: true,
          twitterCard: true,
          twitterTitle: true,
          twitterDescription: true,
          twitterImage: true,
          twitterCreator: true,
          viewCount: true,
          uniqueViewCount: true,
          keywords: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              color: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
              createdAt: true,
              updatedAt: true,
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
        orderBy: {
          publishedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get posts error:", error);
    return {
      success: false,
      error: "Failed to fetch posts",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPostBySlug(slug: string) {
  // Skip database operations during build
  if (isBuildEnvironment) {
    return {
      success: true,
      data: null,
    };
  }

  try {
    const post = await prisma.post.findUnique({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        mainImage: true,
        commentsEnabled: true,
        status: true,
        publishedAt: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        uniqueViewCount: true,
        keywords: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        comments: {
          where: {
            status: "APPROVED",
            parentId: null,
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorName: true,
            authorEmail: true,
            authorUrl: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              where: {
                status: "APPROVED",
              },
              select: {
                id: true,
                content: true,
                createdAt: true,
                authorName: true,
                authorEmail: true,
                authorUrl: true,
                user: {
                  select: {
                    id: true,
                    name: true,
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
        metaTitle: true,
        metaDescription: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        ogType: true,
        twitterCard: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterImage: true,
        twitterCreator: true,
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
      return {
        success: false,
        error: "Post not found",
      };
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Get post error:", error);
    return {
      success: false,
      error: "Failed to fetch post",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCategories() {
  // Skip database operations during build
  if (isBuildEnvironment) {
    return {
      success: true,
      data: [],
    };
  }

  try {
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
      },
      orderBy: {
        name: "asc",
      },
    });

    const categoriesWithCounts = categories.map((category) => ({
      ...category,
      postCount: category._count.posts,
    }));

    return {
      success: true,
      data: categoriesWithCounts,
    };
  } catch (error) {
    console.error("Get categories error:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCommentsByPostId(postId: string) {
  // Skip database operations during build
  if (isBuildEnvironment) {
    return {
      success: true,
      data: [],
    };
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId,
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
        createdAt: "asc",
      },
    });

    return {
      success: true,
      data: comments,
    };
  } catch (error) {
    console.error("Get comments error:", error);
    return {
      success: false,
      error: "Failed to fetch comments",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createComment(data: {
  content: string;
  postId: string;
  authorName?: string;
  authorEmail?: string;
  authorUrl?: string;
  parentId?: string;
}) {
  try {
    const { content, postId, authorName, authorEmail, authorUrl, parentId } =
      data;

    // Validate required fields
    if (!content || !postId) {
      return {
        success: false,
        error: "Content and postId are required",
      };
    }

    // Validate post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    // Validate parent comment if provided
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return {
          success: false,
          error: "Parent comment not found",
        };
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        status: "PENDING",
        authorName,
        authorEmail,
        authorUrl,
        postId,
        parentId,
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

    revalidatePath(`/posts/${post.slug}`);

    return {
      success: true,
      data: comment,
    };
  } catch (error) {
    console.error("Create comment error:", error);
    return {
      success: false,
      error: "Failed to create comment",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getMediaFiles() {
  try {
    const mediaFiles = await prisma.mediaFile.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: mediaFiles,
    };
  } catch (error) {
    console.error("Get media files error:", error);
    return {
      success: false,
      error: "Failed to fetch media files",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPostById(id: string) {
  // Skip database operations during build
  if (isBuildEnvironment) {
    return {
      success: true,
      data: null,
    };
  }

  try {
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
        comments: {
          where: {
            status: "APPROVED",
            parentId: null,
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
      return {
        success: false,
        error: "Post not found",
      };
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Get post by ID error:", error);
    return {
      success: false,
      error: "Failed to fetch post",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAdminStats() {
  // Skip database operations during build
  if (isBuildEnvironment) {
    return {
      success: true,
      data: {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalUsers: 0,
        totalCategories: 0,
        totalTags: 0,
        totalComments: 0,
        recentPosts: [],
      },
    };
  }

  try {
    const [
      totalPosts,
      publishedPosts,
      totalViews,
      uniqueVisitors,
      totalMediaFiles,
      totalComments,
      pendingComments,
      totalUsers,
      adminUsers,
      editorUsers,
      recentPosts,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.aggregate({
        _sum: {
          viewCount: true,
          uniqueViewCount: true,
        },
      }).then(agg => agg._sum.viewCount || 0),
      prisma.post.aggregate({
        _sum: {
          viewCount: true,
          uniqueViewCount: true,
        },
      }).then(agg => agg._sum.uniqueViewCount || 0),
      prisma.mediaFile.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "EDITOR" } }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
    ]);

    const stats = {
      totalPosts,
      publishedPosts,
      totalViews,
      uniqueVisitors,
      totalMediaFiles,
      totalComments,
      pendingComments,
      totalUsers,
      adminUsers,
      editorUsers,
      recentPosts: recentPosts.map((post) => ({
        id: post.id,
        title: post.title,
        status: post.status.toLowerCase(),
        views: post.viewCount,
        publishedAt: post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString()
          : "In draft",
        author: post.author.name || "Unknown",
        commentCount: post._count.comments,
      })),
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Get admin stats error:", error);
    return {
      success: false,
      error: "Failed to fetch admin statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function changePassword(data: {
  userId: string;
  currentPassword?: string;
  newPassword: string;
  isSelfService?: boolean;
}) {
  try {
    const { userId, currentPassword, newPassword, isSelfService = true } = data;

    if (!userId || !newPassword) {
      return { success: false, error: "UserID and new password are required" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // If it's self-service, verify the current password
    if (isSelfService && user.password) {
      if (!currentPassword) {
        return { success: false, error: "Current password is required" };
      }
      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return { success: false, error: "Incorrect current password" };
      }
    }

    // Hash and update
    const hashedPassword = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      error: "Failed to update password",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
