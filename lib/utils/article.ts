import prisma from '@/lib/prisma';
import { TipTapContent } from '@/lib/validations/article';

/**
 * Article utility functions
 * 
 * Centralized utility functions for article operations including
 * slug generation, tag handling, and content validation.
 */

/**
 * Generate a unique slug from a title
 */
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length

  if (!baseSlug) {
    throw new Error('Cannot generate slug from title');
  }

  // Check if base slug is unique
  const existing = await prisma.article.findFirst({
    where: { 
      slug: baseSlug,
      ...(excludeId && { NOT: { id: excludeId } })
    },
  });

  if (!existing) {
    return baseSlug;
  }

  // Generate unique slug with timestamp
  const timestamp = Date.now().toString().slice(-6);
  const uniqueSlug = `${baseSlug}-${timestamp}`;

  // Double-check uniqueness (very rare collision)
  const stillExists = await prisma.article.findFirst({
    where: { 
      slug: uniqueSlug,
      ...(excludeId && { NOT: { id: excludeId } })
    },
  });

  if (stillExists) {
    // Use random suffix as final fallback
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomSuffix}`;
  }

  return uniqueSlug;
}

/**
 * Handle tag creation and association
 */
export async function handleTags(tagNames: string[]): Promise<{ id: string }[]> {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }

  const tagConnections = [];

  for (const tagName of tagNames) {
    const normalizedName = tagName.trim();
    if (!normalizedName) continue;

    const tagSlug = normalizedName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!tagSlug) continue;

    // Use upsert to create tag if it doesn't exist
    const tag = await prisma.tag.upsert({
      where: { slug: tagSlug },
      create: {
        name: normalizedName,
        slug: tagSlug,
      },
      update: {}, // Don't update existing tags
    });

    tagConnections.push({ id: tag.id });
  }

  return tagConnections;
}

/**
 * Validate TipTap JSON content structure
 */
export function validateTipTapContent(content: TipTapContent): boolean {
  try {
    // Basic TipTap structure validation
    if (!content || typeof content !== 'object') {
      return false;
    }

    // Must have type property
    if (!content.type || typeof content.type !== 'string') {
      return false;
    }

    // If it has content, it should be an array
    if (content.content && !Array.isArray(content.content)) {
      return false;
    }

    // Recursively validate nested content
    if (content.content) {
      for (const item of content.content) {
        if (!validateTipTapContent(item as TipTapContent)) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Generate excerpt from TipTap content if not provided
 */
export function generateExcerptFromContent(content: TipTapContent, maxLength = 200): string {
  try {
    let text = '';

    function extractText(node: TipTapContent): void {
      if (node.text) {
        text += node.text + ' ';
      }
      
      if (node.content) {
        for (const child of node.content) {
          extractText(child as TipTapContent);
        }
      }
    }

    extractText(content);
    
    // Clean up and trim
    const cleanText = text
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    // Find the last word boundary within the limit
    const truncated = cleanText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
      
  } catch {
    return 'Article excerpt not available.';
  }
}