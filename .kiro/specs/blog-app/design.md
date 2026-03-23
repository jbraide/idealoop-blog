# Design Document: Modern Blog Application (PostgreSQL Migration)

## Overview
A full-stack blog application built with Next.js, PostgreSQL with Prisma ORM for data persistence, and Cloudflare R2 for media storage. The system follows a modern architecture with clear separation between public-facing blog and admin CMS, leveraging relational database capabilities for better data consistency and query performance.

## Architecture

### System Architecture Diagram
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │◄──►│   Next.js API    │◄──►│   PostgreSQL    │
│ (Web, Mobile)   │    │    Gateway       │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Cloudflare R2   │◄──►│  Media Service   │    │   Redis Cache   │
│  (Media Storage) │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Prisma adapter
- **Media Storage**: Cloudflare R2 (S3-compatible)
- **Caching**: Vercel Edge Cache and Redis
- **Styling**: Tailwind CSS with modern design system
- **Animations**: Framer Motion for smooth interactions
- **UI Components**: Radix UI for accessible components
- **Deployment**: Vercel platform with edge functions

## Components and Interfaces

### 1. Next.js App Router Architecture
**Responsibilities**: Server-side rendering, API routes, middleware, authentication, edge caching

```javascript
// Core interfaces
interface AppConfig {
  databaseConfig: DatabaseConfig;
  r2Config: R2Config;
  nextAuthConfig: NextAuthConfig;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### 2. Authentication Service
**Responsibilities**: User authentication, session management, role-based access control

```javascript
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'USER' | 'EDITOR' | 'ADMIN';
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  session: Session;
}
```

### 3. Blog Service
**Responsibilities**: Blog post CRUD operations, content management, publishing workflow

```javascript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
  author: User;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categories: Category[];
  tags: Tag[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCreator?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Media Service
**Responsibilities**: File upload, image optimization, storage management

```javascript
interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  postId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UploadResponse {
  success: boolean;
  media: MediaFile;
  errors?: string[];
}
```

### 5. Comment Service
**Responsibilities**: Comment management, moderation, spam detection

```javascript
interface Comment {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  authorName?: string;
  authorEmail?: string;
  authorUrl?: string;
  postId: string;
  post: Post;
  userId?: string;
  user?: User;
  parentId?: string;
  parent?: Comment;
  replies: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 6. Analytics Service
**Responsibilities**: Traffic tracking, engagement metrics, reporting, unique view counting

```javascript
interface PageView {
  postId: string;
  timestamp: Date;
  userAgent: string;
  ipAddress: string;
  referrer: string;
  country: string;
  sessionId: string;
  isUnique: boolean;
}

interface ViewSession {
  sessionId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  startedAt: Date;
  lastActivity: Date;
  postsViewed: string[];
}

interface AnalyticsReport {
  totalViews: number;
  uniqueVisitors: number;
  uniqueViews: number;
  popularPosts: PopularPost[];
  trafficSources: TrafficSource[];
  timeRange: DateRange;
  viewsByPost: ViewsByPost[];
}

interface ViewsByPost {
  postId: string;
  totalViews: number;
  uniqueViews: number;
  viewsOverTime: TimeSeriesData[];
}

interface TimeSeriesData {
  timestamp: Date;
  views: number;
  uniqueViews: number;
}
```

## Data Models

### Database Schema Structure

```
/postgresql/
  ├── users (id, email, name, image, role, emailVerified, password, createdAt, updatedAt)
  ├── accounts (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
  ├── sessions (id, sessionToken, userId, expires)
  ├── verification_tokens (identifier, token, expires)
  ├── posts (id, title, slug, content, excerpt, status, authorId, metaTitle, metaDescription, canonicalUrl, ogTitle, ogDescription, ogImage, ogType, twitterCard, twitterTitle, twitterDescription, twitterImage, twitterCreator, publishedAt, createdAt, updatedAt)
  ├── categories (id, name, slug, description, color, createdAt, updatedAt)
  ├── tags (id, name, slug, createdAt, updatedAt)
  ├── post_categories (postId, categoryId)
  ├── post_tags (postId, tagId)
  ├── comments (id, content, status, authorName, authorEmail, authorUrl, postId, userId, parentId, createdAt, updatedAt)
  ├── media_files (id, filename, originalName, mimeType, size, url, alt, caption, width, height, postId, createdAt, updatedAt)
  ├── pages (id, title, slug, content, status, metaTitle, metaDescription, canonicalUrl, createdAt, updatedAt)
  └── settings (id, key, value)
```

### Key Data Relationships
- Users → Posts (one-to-many)
- Users → Comments (one-to-many, optional)
- Posts → Categories (many-to-many via post_categories)
- Posts → Tags (many-to-many via post_tags)
- Posts → Comments (one-to-many)
- Posts → MediaFiles (one-to-many)
- Comments → Comments (self-referencing for replies)
- Users → Accounts (one-to-many for OAuth)
- Users → Sessions (one-to-many)

### API Routes Design

### App Router Structure
```
/app/
  ├── (public)/           # Public blog routes
  │   ├── page.tsx        # Homepage
  │   ├── [slug]/page.tsx # Single post
  │   ├── categories/     # Category pages
  │   └── search/         # Search results
  ├── (admin)/            # Admin dashboard
  │   ├── page.tsx        # Admin dashboard
  │   ├── posts/          # Post management
  │   ├── media/          # Media library
  │   └── analytics/      # Analytics dashboard
  └── api/                # API routes
      ├── posts/route.ts
      ├── media/route.ts
      ├── comments/route.ts
      └── admin/          # Protected admin APIs
```

### API Routes
```
# Public API Routes
GET    /api/posts              # List published posts
GET    /api/posts/[slug]       # Get single post
GET    /api/categories         # List categories
GET    /api/tags               # List tags
GET    /api/search             # Search posts
POST   /api/comments           # Submit comment
GET    /api/sitemap.xml        # Generate sitemap

# Admin API Routes (Protected)
GET    /api/admin/posts        # List all posts
POST   /api/admin/posts        # Create post
PUT    /api/admin/posts/[id]   # Update post
DELETE /api/admin/posts/[id]   # Delete post
POST   /api/admin/media        # Upload media
GET    /api/admin/media        # List media
DELETE /api/admin/media/[id]   # Delete media
GET    /api/admin/analytics    # Get analytics
```

## Error Handling Strategy

### Error Categories
1. **Authentication Errors** (401, 403)
2. **Validation Errors** (400)
3. **Resource Not Found** (404)
4. **Rate Limiting** (429)
5. **Server Errors** (500)

### Error Response Format
```javascript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      "Title is required",
      "Content must be at least 100 characters"
    ],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Security Implementation

### Authentication & Authorization
- NextAuth.js with Prisma adapter
- Multiple providers (Google OAuth, Credentials)
- Role-based access control (RBAC)
- Session management with secure cookies
- Password hashing with bcryptjs

### Data Protection
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens for state-changing operations
- File upload restrictions and scanning

### Infrastructure Security
- HTTPS enforcement
- CORS configuration
- Rate limiting per IP/user
- Security headers (HSTS, CSP)

### Modern UI Design Principles

### Visual Design System
- **Typography**: Modern font pairing with proper hierarchy
- **Color System**: Accessible color palette with dark/light mode support
- **Spacing**: Consistent spacing scale (8px base unit)
- **Components**: Reusable, accessible UI components
- **Animations**: Smooth transitions and micro-interactions using Framer Motion

### UI Features
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Dark/Light Mode**: System preference detection with manual override
- **Loading States**: Skeleton screens and progressive loading
- **Micro-interactions**: Hover effects, button animations, page transitions
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation
- **Performance**: Optimized images, code splitting, lazy loading

### Performance Optimization

### Caching Strategy
- Redis for session storage and API response caching
- CDN for static assets and media files
- Browser caching with proper cache headers
- Database query optimization with indexes

### Media Optimization
- Image compression and WebP format
- Responsive image generation
- Lazy loading for images with blur-up effects
- Progressive loading for large media
- Modern image galleries with smooth transitions

### Database Optimization
- Composite indexes for common queries
- Pagination for large datasets
- Query optimization with Prisma
- Connection pooling
- Database indexing strategy

## Testing Strategy

### Unit Testing
- Jest for backend services
- React Testing Library for frontend components
- Mock Prisma client and R2 services

### Integration Testing
- API endpoint testing with Supertest
- Database integration tests
- Authentication flow testing

### End-to-End Testing
- Cypress for critical user flows
- Cross-browser testing
- Mobile responsiveness testing

### Performance Testing
- Load testing with Artillery
- Lighthouse audits for frontend
- Database performance monitoring

### Deployment Architecture

### Development Environment
- Next.js development server with hot reload
- Firebase Emulator Suite
- Local environment variables

### Production Environment (Vercel)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel Edge   │───►│   Next.js App   │───►│   PostgreSQL    │
│   Network       │    │   Router        │    │   Production    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel Cache  │    │   Cloudflare R2 │    │   Vercel        │
│   & Redis       │    │   Production    │    │   Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Monitoring and Logging
- Application logging with Winston
- Error tracking with Sentry
- Performance monitoring with New Relic
- Database query performance monitoring
- Uptime monitoring

## Key Design Decisions

### 1. PostgreSQL vs NoSQL Database
**Choice**: PostgreSQL with Prisma ORM for relational data consistency and complex queries
**Rationale**: Better suited for blog content with structured relationships, improved query performance for analytics, mature ecosystem with Prisma

### 2. Cloudflare R2 vs AWS S3
**Choice**: Cloudflare R2 for zero egress fees and global CDN integration
**Rationale**: Cost-effective for media-heavy blog, better integration with Cloudflare's edge network

### 3. Monolithic vs Microservices
**Choice**: Modular monolith with clear service boundaries
**Rationale**: Simpler deployment and debugging while maintaining separation of concerns, suitable for blog scale

### 4. Modern UI Framework Selection
**Choice**: React with Tailwind CSS and Framer Motion
**Rationale**: Provides modern design capabilities, excellent developer experience, and smooth animations for premium user experience

### 5. Unique View Counting Strategy
**Choice**: Session-based unique view counting with browser fingerprinting
**Rationale**: Balances accuracy with privacy concerns, provides meaningful engagement metrics without requiring user accounts

### 6. Next.js App Router vs Pages Router
**Choice**: Next.js App Router with React Server Components
**Rationale**: Modern architecture with server components for performance, client components for interactivity, built-in SEO optimization

## Unique View Counting Implementation

### Session Management
- Generate unique session IDs using browser fingerprinting (user agent, IP, screen resolution)
- Store sessions in Redis with TTL (e.g., 30 minutes of inactivity)
- Track which posts have been viewed in each session
- Count only one view per post per session

### Browser Fingerprinting Components
- User agent string
- IP address (anonymized for privacy)
- Screen resolution
- Timezone
- Language preferences
- Available fonts (limited set)

### Privacy Considerations
- Anonymize IP addresses (remove last octet)
- Provide opt-out mechanism for privacy-conscious users
- Clear session data on browser close
- Respect Do Not Track headers

## Migration and Backup Strategy

### Data Migration
- Migration from Firebase Firestore to PostgreSQL
- Data transformation and validation scripts
- Rollback procedures
- Migration testing strategy

### Backup Procedures
- Automated daily backups of PostgreSQL database
- R2 bucket versioning for media files
- Point-in-time recovery capabilities
- Backup verification processes
- Database dump and restore procedures

This design provides a scalable, secure, and maintainable foundation for the modern blog application with improved data consistency and query performance through PostgreSQL migration.