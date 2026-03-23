# Media Management Documentation

## Overview

The blog application now includes a complete media management system integrated with Cloudflare R2 for file storage. This system allows administrators to upload, manage, and organize media files (images, documents, etc.) that can be used in blog posts.

## Features

### ✅ Completed Features

- **File Upload**: Upload images and documents with validation
- **Media Library**: Browse and search uploaded files
- **File Management**: Delete files from both R2 storage and database
- **File Preview**: Preview images and file information
- **Search & Pagination**: Search files by name and paginate results
- **Admin Interface**: Protected admin-only media management page
- **API Integration**: RESTful API for media operations
- **Type Safety**: Full TypeScript support with proper interfaces

### 📁 Supported File Types

- **Images**: JPEG, JPG, PNG, GIF, WebP, SVG
- **Documents**: PDF, TXT, DOC, DOCX
- **Size Limit**: 10MB per file

## Architecture

### Technology Stack

- **Storage**: Cloudflare R2 (S3-compatible)
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js with React components
- **Authentication**: NextAuth.js with role-based access

### Database Schema

```sql
model MediaFile {
  id          String   @id @default(cuid())
  filename    String      # Unique filename in R2
  originalName String     # Original uploaded filename
  mimeType    String      # File MIME type
  size        Int         # File size in bytes
  url         String      # Public URL for the file
  alt         String?     # Alternative text for images
  caption     String?     # Caption for the file
  width       Int?        # Image width (if applicable)
  height      Int?        # Image height (if applicable)
  postId      String?     # Associated post (if any)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## API Endpoints

### Media Management API

#### GET `/api/admin/media`
List media files with pagination and search
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20)
  - `search` (optional): Search term for filename/alt text
  - `postId` (optional): Filter by associated post

#### POST `/api/admin/media`
Upload a new media file
- **Body**: FormData with file and optional metadata
- **Authentication**: Required (Admin/Editor role)

#### GET `/api/admin/media/[id]`
Get specific media file details

#### PUT `/api/admin/media/[id]`
Update media file metadata
- **Body**: JSON with `alt`, `caption`, `postId`

#### DELETE `/api/admin/media/[id]`
Delete media file (from both R2 and database)

## Usage

### Admin Media Library

1. **Access**: Navigate to `/admin/media` (admin authentication required)
2. **Upload**: Click "Upload" button or drag & drop files
3. **Search**: Use search bar to find files by name
4. **Manage**: Use dropdown menu on each file for actions (view, download, delete)

### Media Upload Component

The `MediaUpload` component can be integrated into post creation/editing forms:

```tsx
import { MediaUpload } from "@/components/media/media-upload";

function PostForm() {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);

  return (
    <MediaUpload
      selectedMedia={selectedMedia}
      onMediaSelect={(media) => setSelectedMedia([...selectedMedia, media])}
      onMediaRemove={(mediaId) => 
        setSelectedMedia(selectedMedia.filter(m => m.id !== mediaId))
      }
      multiple={true}
    />
  );
}
```

## Environment Configuration

### Required Environment Variables

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
```

### Optional Environment Variables

```env
# Custom public URL (if different from default)
R2_PUBLIC_URL=https://your-custom-domain.com
```

## Security

### Authentication & Authorization

- All media API routes require authentication
- Only users with `ADMIN` or `EDITOR` roles can access media management
- File uploads are validated for type and size
- Session-based authentication with NextAuth.js

### File Validation

- **Size Limit**: 10MB maximum file size
- **Type Validation**: Only allowed MIME types are accepted
- **Filename Sanitization**: Unique filenames generated to prevent conflicts

## Error Handling

### Common Error Responses

```json
{
  "error": "File type not allowed",
  "status": 400
}
```

```json
{
  "error": "File size exceeds 10MB limit", 
  "status": 400
}
```

```json
{
  "error": "Unauthorized",
  "status": 401
}
```

## Integration with Blog Posts

Media files can be associated with blog posts through the `postId` field. When creating or editing posts, the media upload component allows selecting files that will be linked to the post.

### Future Enhancements

- [ ] Image optimization and resizing
- [ ] Bulk file operations
- [ ] File organization with folders
- [ ] Advanced search filters
- [ ] File usage analytics
- [ ] Integration with rich text editor for inline images

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check R2 credentials and bucket permissions
2. **Files Not Displaying**: Verify public URL configuration
3. **Authentication Errors**: Ensure user has correct role (ADMIN/EDITOR)
4. **File Type Rejected**: Check allowed MIME types in validation

### Development Notes

- The media service uses AWS SDK v3 for R2 compatibility
- File operations are transactional (database + storage)
- Error logging includes detailed context for debugging