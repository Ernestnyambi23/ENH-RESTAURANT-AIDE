import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'olli-pizza-saas-jwt-secret-key-2026-secure';

export type UserRoleScope = 'developer' | 'owner' | 'staff' | 'customer';

export interface JwtTokenPayload {
  uid: string;
  email: string;
  role: UserRoleScope;
  restaurant_id: string; // "ALL" for Developer/Super Admin, or specific ID like "ollis-pizza"
  name: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

/**
 * Signs and generates a standard JWT containing the user's role and assigned scope.
 */
export function signUserToken(payload: Omit<JwtTokenPayload, 'iat' | 'exp'>, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

/**
 * Verifies and decodes a JWT token. Returns null if invalid or expired.
 */
export function verifyUserToken(token: string): JwtTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtTokenPayload;
  } catch (error) {
    return null;
  }
}
