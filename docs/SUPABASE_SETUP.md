# Supabase Setup Guide for QuillTip

## Current Setup Status ✅

Your Supabase PostgreSQL database has been configured with the following:

### Database Connection
- **Project Reference**: `glhwyzxbpildwkqpjjcm`
- **Database URL**: `postgresql://postgres:[YOUR-PASSWORD]@db.glhwyzxbpildwkqpjjcm.supabase.co:5432/postgres`

### What's Been Configured

1. ✅ **Environment Variables** (`.env`)
   - DATABASE_URL configured for Supabase
   - DIRECT_URL configured for Prisma migrations

2. ✅ **Prisma Schema** (`prisma/schema.prisma`)
   - PostgreSQL datasource configured
   - Models created for Phase 1:
     - User (authentication & profile with username, bio, avatar)
     - Article (rich text articles with TipTap JSON content)
     - Tag (article organization)
   - Note: Advanced features (collaboration, comments, versions) are for future phases

3. ✅ **Prisma Client Generated**
   - Ready to use in your application code

## Next Steps

### 1. Update Your Password
Replace `[YOUR-PASSWORD]` in the `.env` file with your actual Supabase database password.

### 2. Run Database Migration
Once you've updated the password, run the initial migration to create all tables:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables in your Supabase database
- Generate migration files in `prisma/migrations/`
- Keep your database schema in sync

### 3. Verify Database Setup
You can verify everything is working by:

```bash
npx prisma studio
```

This opens a web interface to view and manage your database.

### 4. Optional: Seed Database
Create sample data for development:

```bash
npx prisma db seed
```

(You'll need to create a seed script first in `prisma/seed.ts`)

## Database Schema Overview (Phase 1)

- **Users**: Store user profiles and authentication data (includes username, bio, avatar, hashedPassword)
- **Articles**: Rich text articles with TipTap JSON content (includes slug, title, content, excerpt, coverImage, published status)
- **Tags**: Organize articles with tags

## Supabase Storage Setup

### Storage Bucket Configuration
1. ✅ **Images Bucket Created**
   - Bucket name: `images`
   - Used for article cover images and inline images
   - Configured for public read access

### Environment Variables for Storage
Add these to your `.env.local` file:
```env
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"  # For server-side operations
SUPABASE_STORAGE_BUCKET="images"
```

Get these values from: Supabase Dashboard → Settings → API

## Troubleshooting

### Connection Issues
- Ensure your password is correctly set in `.env`
- Check that your Supabase project is active
- Verify the connection string format

### Migration Issues
- Use `DIRECT_URL` for migrations (bypasses connection pooler)
- Use `DATABASE_URL` for application queries

## Security Notes
- Never commit `.env` to version control
- Keep your database password secure
- Use environment variables for all sensitive data