// Core types for the blog application

// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
  role: "admin" | "editor" | "author";
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

// Blog post types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  mainImage?: string;
  commentsEnabled?: boolean;
  author?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  status: "draft" | "published" | "archived";
  categories: string[];
  tags: string[];
  seo?: SEOData;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  readingTime: number;
  viewCount: number;
  uniqueViewCount: number;
  commentCount?: number;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords?: string;
  canonicalUrl: string;
  openGraph: OpenGraphData;
  twitterCard: TwitterCardData;
}

export interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  type: "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export interface TwitterCardData {
  card: "summary" | "summary_large_image";
  title: string;
  description: string;
  image: string;
  creator?: string;
}

// Category and tag types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  parentId?: string;
  children?: Category[];
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Media types
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  optimizedUrls: {
    small: string;
    medium: string;
    large: string;
  };
  uploadedBy: string;
  uploadedAt: Date;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Comment types
export interface Comment {
  id: string;
  postId: string;
  author: CommentAuthor;
  content: string;
  status: "pending" | "approved" | "rejected" | "spam";
  parentId?: string;
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  isLiked?: boolean;
}

export interface CommentAuthor {
  name: string;
  email: string;
  website?: string | null;
  avatar?: string | null;
  isAdmin?: boolean;
}

// Analytics types
export interface PageView {
  id: string;
  postId: string;
  sessionId: string;
  timestamp: Date;
  userAgent: string;
  ipAddress: string;
  referrer: string;
  country: string;
  isUnique: boolean;
}

export interface ViewSession {
  id: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  startedAt: Date;
  lastActivity: Date;
  postsViewed: string[];
}

export interface AnalyticsReport {
  totalViews: number;
  uniqueVisitors: number;
  uniqueViews: number;
  popularPosts: PopularPost[];
  trafficSources: TrafficSource[];
  viewsByDate: TimeSeriesData[];
  timeRange: DateRange;
}

export interface PopularPost {
  postId: string;
  title: string;
  slug: string;
  totalViews: number;
  uniqueViews: number;
  averageTimeOnPage: number;
}

export interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  uniqueViews: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form and validation types
export interface CreatePostForm {
  title: string;
  content: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  featuredImage?: string;
  status: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdatePostForm extends Partial<CreatePostForm> {
  id: string;
}

export interface CreateCommentForm {
  postId: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  parentId?: string;
}

// Search and filter types
export interface PostFilters {
  categories?: string[];
  tags?: string[];
  status?: string[];
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface SearchParams {
  q?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "popular";
}

// Theme and UI types
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

// Settings types
export interface BlogSettings {
  title: string;
  description: string;
  logo?: string;
  favicon?: string;
  language: string;
  timezone: string;
  dateFormat: string;
  postsPerPage: number;
  allowComments: boolean;
  moderateComments: boolean;
  socialLinks: SocialLinks;
  seo: GlobalSEO;
}

export interface SocialLinks {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  youtube?: string;
}

export interface GlobalSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  robots: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
