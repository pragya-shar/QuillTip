// Type definitions for QuillTip

export interface User {
  id: string
  email: string
  username: string
  name?: string
  bio?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Article {
  id: string
  slug: string
  title: string
  content: Record<string, unknown> // TipTap JSON content
  excerpt?: string
  coverImage?: string
  published: boolean
  publishedAt?: Date
  authorId: string
  author?: User
  tags?: Tag[]
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  slug: string
}