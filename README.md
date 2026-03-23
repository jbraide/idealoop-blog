# Blog App

A modern blog application built with Next.js, featuring a clean admin interface and responsive public pages.

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (local or Supabase)
- **Authentication**: NextAuth.js
- **Editor**: CKEditor 5

## Database Configuration

This application supports both local PostgreSQL and Supabase:

### Local PostgreSQL Setup
```env
DATABASE_URL="postgresql://username:password@localhost:5432/blog_app"
```

### Supabase Setup
```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

The application will work with just `DATABASE_URL` for local development. When using Supabase, add the `DIRECT_URL` for optimal performance.

## Getting Started

First, set up your environment variables:

1. Copy `.env.example` to `.env`
2. Configure your database connection as shown above
3. Set up authentication providers if needed

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- **Admin Dashboard**: Create, edit, and manage blog posts
- **Media Library**: Upload and manage images and files
- **Categories & Tags**: Organize content with categories and tags
- **Comments**: Moderated comment system with reply functionality
- **SEO Optimization**: Built-in SEO features with Open Graph and Twitter Cards
- **Responsive Design**: Mobile-friendly interface
- **Post Previews**: Preview posts before publishing
- **Comment Controls**: Enable/disable comments per post

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
