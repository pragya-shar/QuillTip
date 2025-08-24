import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NODE_ENV = 'test'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Global test utilities
global.testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
  hashedPassword: '$2a$10$TEST.HASH.FOR.PASSWORD',
}

global.testArticle = {
  id: 'test-article-id',
  title: 'Test Article',
  content: { type: 'doc', content: [] },
  excerpt: 'This is a test article',
  slug: 'test-article-123456789',
  published: true,
  publishedAt: new Date('2024-01-01T00:00:00.000Z'),
  authorId: 'test-user-id',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
}