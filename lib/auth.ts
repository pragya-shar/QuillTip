/**
 * @deprecated This file contains legacy authentication utilities.
 * Authentication is now handled by Convex Auth (see convex/auth.ts).
 * These functions are not used and kept only for reference.
 * Safe to delete in future cleanup.
 */

import { compare, hash } from 'bcryptjs'

// Salt rounds for bcrypt password hashing
const SALT_ROUNDS = 10

/**
 * Hash a password using bcrypt
 * @deprecated Use Convex Auth instead - this function is not used
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 * @deprecated Use Convex Auth instead - this function is not used
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}