import { prisma } from "@/lib/prisma";
import { BlogPost, Category, Comment, User, MediaFile } from "@/types";

export interface GetPostsOptions {
  status?: string[];
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pages: number;
}

export class DataService {
  // Users
  static async getUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return users.map((user) => ({
        ...user,
        avatar: user.image,
        role: user.role.toLowerCase() as "admin" | "editor" | "author",
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) return null;

      return {
        ...user,
        avatar: user.image,
        role: user.role.toLowerCase() as "admin" | "editor" | "author",
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }
  }

  // Blog Posts
  static async getBlogPosts(
    options: GetPostsOptions = {},
  ): Promise<GetPostsResponse> {
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
      const where: any = {
        status: {
          in: status.map((s) => s.toUpperCase()),
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

      // Transform to match BlogPost interface
      const transformedPosts: BlogPost[] = posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || "",
        authorId: post.authorId,
        mainImage: post.mainImage || "",
        commentsEnabled: post.commentsEnabled ?? true,
        author: {
          id: post.author.id,
          email: post.author.email,
          name: post.author.name || "",
          image: post.author.image || "",
        },
        status: post.status.toLowerCase() as "draft" | "published" | "archived",
        categories: post.categories.map((cat) => cat.name),
        tags: post.tags.map((tag) => tag.name),
        seo: {
          metaTitle: post.metaTitle || post.title,
          metaDescription: post.metaDescription || post.excerpt || "",
          canonicalUrl: post.canonicalUrl || `/posts/${post.slug}`,
          openGraph: {
            title: post.ogTitle || post.title,
            description: post.ogDescription || post.excerpt || "",
            image: post.ogImage || "",
            type: (post.ogType as "article") || "article",
          },
          twitterCard: {
            card: "summary",
            title: post.twitterTitle || post.title,
            description: post.twitterDescription || post.excerpt || "",
            image: post.twitterImage || "",
            creator: post.twitterCreator || "",
          },
        },
        publishedAt: post.publishedAt || undefined,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        readingTime: Math.ceil(post.content.split(/\s+/).length / 200), // Estimate reading time
        viewCount: 0, // TODO: Implement view counting
        uniqueViewCount: 0, // TODO: Implement unique view counting
        commentCount: post._count.comments,
      }));

      return {
        posts: transformedPosts,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw new Error("Failed to fetch blog posts");
    }
  }

  static async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const post = await prisma.post.findUnique({
        where: {
          slug,
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
          tags: true,
          comments: {
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

      if (!post) return null;

      // Transform to match BlogPost interface
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || "",
        authorId: post.authorId,
        author: {
          id: post.author.id,
          email: post.author.email,
          name: post.author.name || "",
          image: post.author.image || "",
        },
        status: post.status.toLowerCase() as "draft" | "published" | "archived",
        categories: post.categories.map((cat) => cat.name),
        tags: post.tags.map((tag) => tag.name),
        seo: {
          metaTitle: post.metaTitle || post.title,
          metaDescription: post.metaDescription || post.excerpt || "",
          canonicalUrl: post.canonicalUrl || `/posts/${post.slug}`,
          openGraph: {
            title: post.ogTitle || post.title,
            description: post.ogDescription || post.excerpt || "",
            image: post.ogImage || "",
            type: (post.ogType as "article") || "article",
          },
          twitterCard: {
            card: "summary",
            title: post.twitterTitle || post.title,
            description: post.twitterDescription || post.excerpt || "",
            image: post.twitterImage || "",
            creator: post.twitterCreator || "",
          },
        },
        publishedAt: post.publishedAt || undefined,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        readingTime: Math.ceil(post.content.split(/\s+/).length / 200),
        viewCount: 0, // TODO: Implement view counting
        uniqueViewCount: 0, // TODO: Implement unique view counting
        commentCount: post._count.comments,
      };
    } catch (error) {
      console.error("Error fetching blog post:", error);
      throw new Error("Failed to fetch blog post");
    }
  }

  static async getBlogPostById(id: string): Promise<BlogPost | null> {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
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
              comments: {
                where: {
                  status: "APPROVED",
                },
              },
            },
          },
        },
      });

      if (!post) return null;

      // Transform to match BlogPost interface
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || "",
        authorId: post.authorId,
        author: {
          id: post.author.id,
          email: post.author.email,
          name: post.author.name || "",
          image: post.author.image || "",
        },
        status: post.status.toLowerCase() as "draft" | "published" | "archived",
        categories: post.categories.map((cat) => cat.name),
        tags: post.tags.map((tag) => tag.name),
        seo: {
          metaTitle: post.metaTitle || post.title,
          metaDescription: post.metaDescription || post.excerpt || "",
          canonicalUrl: post.canonicalUrl || `/posts/${post.slug}`,
          openGraph: {
            title: post.ogTitle || post.title,
            description: post.ogDescription || post.excerpt || "",
            image: post.ogImage || "",
            type: (post.ogType as "article") || "article",
          },
          twitterCard: {
            card: "summary",
            title: post.twitterTitle || post.title,
            description: post.twitterDescription || post.excerpt || "",
            image: post.twitterImage || "",
            creator: post.twitterCreator || "",
          },
        },
        publishedAt: post.publishedAt || undefined,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        readingTime: Math.ceil(post.content.split(/\s+/).length / 200),
        viewCount: 0, // TODO: Implement view counting
        uniqueViewCount: 0, // TODO: Implement unique view counting
        commentCount: post._count.comments,
      };
    } catch (error) {
      console.error("Error fetching blog post:", error);
      throw new Error("Failed to fetch blog post");
    }
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
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

      return categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        color: category.color || "#3B82F6",
        postCount: category._count.posts,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
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

      if (!category) return null;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        color: category.color || "#3B82F6",
        postCount: category._count.posts,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching category:", error);
      throw new Error("Failed to fetch category");
    }
  }

  // Comments
  static async getCommentsByPostId(postId: string): Promise<Comment[]> {
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

      return comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        status: comment.status.toLowerCase() as
          | "pending"
          | "approved"
          | "rejected"
          | "spam",
        author: {
          name: comment.authorName || comment.user?.name || "Anonymous",
          email: comment.authorEmail || comment.user?.email || "",
          website: comment.authorUrl || null,
          avatar: comment.user?.image || null,
        },
        postId: comment.postId,
        parentId: comment.parentId || undefined,
        replies:
          comment.replies?.map((reply) => ({
            id: reply.id,
            content: reply.content,
            status: reply.status.toLowerCase() as
              | "pending"
              | "approved"
              | "rejected"
              | "spam",
            author: {
              name: reply.authorName || reply.user?.name || "Anonymous",
              email: reply.authorEmail || reply.user?.email || "",
              website: reply.authorUrl || null,
              avatar: reply.user?.image || null,
            },
            postId: reply.postId,
            parentId: reply.parentId || undefined,
            createdAt: reply.createdAt,
            updatedAt: reply.updatedAt,
            likes: 0,
          })) || [],
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likes: 0,
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error("Failed to fetch comments");
    }
  }

  // Media
  static async getMediaFiles(): Promise<MediaFile[]> {
    try {
      const mediaFiles = await prisma.mediaFile.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return mediaFiles.map((media) => ({
        id: media.id,
        filename: media.filename,
        originalName: media.originalName,
        mimeType: media.mimeType,
        size: media.size,
        url: media.url,
        thumbnailUrl: media.url, // Use main URL as thumbnail for now
        optimizedUrls: {
          small: media.url,
          medium: media.url,
          large: media.url,
        },
        uploadedBy: "system", // Default value since field doesn't exist
        uploadedAt: media.createdAt, // Use createdAt as uploadedAt
        altText: media.alt || "",
        caption: media.caption || "",
        width: media.width || 0,
        height: media.height || 0,
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
      }));
    } catch (error) {
      console.error("Error fetching media files:", error);
      throw new Error("Failed to fetch media files");
    }
  }

  static async getMediaFileById(id: string): Promise<MediaFile | null> {
    try {
      const mediaFile = await prisma.mediaFile.findUnique({
        where: { id },
      });

      if (!mediaFile) return null;

      return {
        id: mediaFile.id,
        filename: mediaFile.filename,
        originalName: mediaFile.originalName,
        mimeType: mediaFile.mimeType,
        size: mediaFile.size,
        url: mediaFile.url,
        thumbnailUrl: mediaFile.url, // Use main URL as thumbnail for now
        optimizedUrls: {
          small: mediaFile.url,
          medium: mediaFile.url,
          large: mediaFile.url,
        },
        uploadedBy: "system", // Default value since field doesn't exist
        uploadedAt: mediaFile.createdAt, // Use createdAt as uploadedAt
        altText: mediaFile.alt || "",
        caption: mediaFile.caption || "",
        width: mediaFile.width || 0,
        height: mediaFile.height || 0,
        createdAt: mediaFile.createdAt,
        updatedAt: mediaFile.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching media file:", error);
      throw new Error("Failed to fetch media file");
    }
  }
}
