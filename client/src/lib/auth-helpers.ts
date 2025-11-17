/**
 * Authentication helpers for API routes
 */

import { NextRequest } from 'next/server';

export interface UserInfo {
  userAddr: string;
  email?: string;
  name?: string;
}

/**
 * Get authenticated user from request headers
 * In production, this should validate JWT or session token
 */
export function getUserFromRequest(request: NextRequest): UserInfo | null {
  // For now, we expect the user address to be passed in headers
  // This is a simplified approach - in production, validate session/JWT
  const userAddr = request.headers.get('x-user-address');
  const email = request.headers.get('x-user-email');
  const name = request.headers.get('x-user-name');

  if (!userAddr) {
    return null;
  }

  return {
    userAddr,
    email: email || undefined,
    name: name || undefined,
  };
}

/**
 * Require authenticated user or throw error
 */
export function requireAuth(request: NextRequest): UserInfo {
  const user = getUserFromRequest(request);

  if (!user) {
    throw new Error('Authentication required. Please login first.');
  }

  return user;
}
