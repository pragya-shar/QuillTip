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
   - Models created for:
     - User (authentication & profile)
     - Document (rich text documents)
     - Collaboration (shared access)
     - Comment (document comments)
     - Version (document history)
     - Tag (document organization)

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

## Database Schema Overview

- **Users**: Store user profiles and authentication data
- **Documents**: Rich text documents with JSON content
- **Collaborations**: Share documents with role-based permissions (Owner, Editor, Viewer)
- **Comments**: Threaded comments on documents
- **Versions**: Document version history
- **Tags**: Organize documents with tags

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