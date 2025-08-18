import { z } from 'zod';

/**
 * Article Validation Schemas
 * 
 * Centralized validation schemas for article operations using Zod.
 * These schemas ensure consistent validation across the application.
 */

// Slug validation regex pattern
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * TipTap content validation schema
 * Validates the basic structure of TipTap JSON content
 */
export const tipTapContentSchema = z.object({
  type: z.string(),
  content: z.array(z.any()).optional(),
  attrs: z.record(z.any()).optional(),
  marks: z.array(z.any()).optional(),
  text: z.string().optional(),
});

/**
 * Article creation validation schema
 */
export const createArticleSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  content: tipTapContentSchema,
  excerpt: z.string()
    .max(500, 'Excerpt must be at most 500 characters')
    .optional(),
  coverImage: z.string()
    .url('Invalid cover image URL')
    .optional(),
  published: z.boolean()
    .default(false),
  slug: z.string()
    .regex(SLUG_REGEX, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(100, 'Slug must be at most 100 characters')
    .optional(),
  tags: z.array(z.string()
    .min(1, 'Tag cannot be empty')
    .max(50, 'Tag must be at most 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  seoDescription: z.string()
    .max(160, 'SEO description must be at most 160 characters')
    .optional(),
  publishedAt: z.string()
    .datetime('Invalid date format')
    .optional(),
});

/**
 * Article update validation schema
 */
export const updateArticleSchema = createArticleSchema.partial();

/**
 * Article draft validation schema
 * More lenient validation for draft saves
 */
export const draftArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.any(), // TipTap JSON content - less strict for drafts
  excerpt: z.string().optional(),
  coverImage: z.string().url('Invalid cover image URL').optional(),
});

/**
 * Article query parameters validation schema
 */
export const articleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  published: z.enum(['true', 'false']).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  authorId: z.string().optional(),
});

// Type exports for form data and API parameters
export type CreateArticleData = z.infer<typeof createArticleSchema>;
export type UpdateArticleData = z.infer<typeof updateArticleSchema>;
export type DraftArticleData = z.infer<typeof draftArticleSchema>;
export type ArticleQueryParams = z.infer<typeof articleQuerySchema>;
export type TipTapContent = z.infer<typeof tipTapContentSchema>;