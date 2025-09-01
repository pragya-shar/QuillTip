// Legacy authentication utilities
// NOTE: NextAuth has been replaced with Convex Auth
// These password utilities are kept for potential future use

import { compare, hash } from 'bcryptjs'

/**
 * Authentication Utilities
 * 
 * This file contains legacy authentication utilities.
 * Current authentication is handled by Convex Auth.
 */

// Salt rounds for bcrypt password hashing
const SALT_ROUNDS = 10

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Legacy NextAuth configuration removed - now using Convex Auth