# Database Seed Script Guide

## Overview

The seed script (`scripts/seed-database.ts`) is designed to populate your database with initial data for development, testing, and production environments. It's now idempotent, meaning it can be safely run multiple times without duplicating data.

## Environment Variables

Configure the following environment variables to customize the seed data:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `ADMIN_EMAIL` | Email address for the admin user | `admin@blogplatform.com` |
| `ADMIN_NAME` | Display name for the admin user | `Admin User` |
| `ADMIN_PASSWORD` | Password for the admin user | `admin123` |
| `EDITOR_EMAIL` | Email address for the editor user | `editor@blogplatform.com` |
| `EDITOR_NAME` | Display name for the editor user | `Editor User` |
| `EDITOR_PASSWORD` | Password for the editor user | `editor123` |
| `FORCE_SEED` | Force re-seeding even if data exists | `false` |

## Usage

### Development

1. **Basic seed** (only seeds if database is empty):
   ```bash
   npm run seed
   ```

2. **Force seed** (clears existing data and re-seeds):
   ```bash
   npm run seed:force
   ```

3. **Custom environment variables**:
   ```bash
   ADMIN_EMAIL="your-email@domain.com" ADMIN_PASSWORD="secure-password" npm run seed
   ```

### Production (Vercel)

For Vercel deployments, add the environment variables in your Vercel project settings:

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add the seed configuration variables:
   - `ADMIN_EMAIL`
   - `ADMIN_NAME` 
   - `ADMIN_PASSWORD`
   - `EDITOR_EMAIL`
   - `EDITOR_NAME`
   - `EDITOR_PASSWORD`

Then run the seed script as part of your deployment process.

### CI/CD Pipeline

The script is designed to be run once in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
jobs:
  seed-database:
    runs-on: ubuntu-latest
    steps:
      - name: Seed Database
        run: npm run seed
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
          # ... other environment variables
```

## What Gets Created

The seed script creates:

### Users
- **Admin User**: Full administrative access
- **Editor User**: Content creation and editing permissions

### Content Structure
- **Categories**: Technology, Web Development, Design
- **Tags**: Next.js, React, JavaScript, UI Design, Security
- **Posts**: 
  - Published: "Getting Started with Next.js 14", "Modern UI Design Patterns for 2024"
  - Draft: "Database Authentication Best Practices"
- **Comments**: Sample comments on published posts
- **Media Files**: Sample images for posts
- **Settings**: Basic blog configuration

## Idempotent Behavior

The script checks for existing data before creating new records:

- **Users**: Creates only if email doesn't exist
- **Categories/Tags**: Creates only if slug doesn't exist  
- **Posts**: Creates only if slug doesn't exist
- **Comments/Media**: Creates only for newly created posts
- **Settings**: Creates only if key doesn't exist

## Security Best Practices

1. **Never use default passwords in production**
2. **Use strong, unique passwords for admin accounts**
3. **Store sensitive credentials in environment variables**
4. **Consider using password managers for team access**
5. **Rotate passwords regularly**

## Troubleshooting

### Common Issues

1. **"Database already contains data"**
   - This is expected behavior - the script detected existing data
   - Use `FORCE_SEED=true` if you need to re-seed

2. **Connection errors**
   - Verify `DATABASE_URL` is correctly set
   - Check database accessibility from your environment

3. **Permission errors**
   - Ensure database user has necessary permissions
   - Check if tables exist (run migrations first)

### Debug Mode

For detailed logging, you can run with debug output:

```bash
DEBUG=true npm run seed
```

## Customization

To customize the seed data:

1. Edit `scripts/seed-database.ts`
2. Modify the arrays for categories, tags, posts, etc.
3. Add your own content structure
4. Update environment variable handling as needed

Remember to test changes in a development environment before deploying to production.