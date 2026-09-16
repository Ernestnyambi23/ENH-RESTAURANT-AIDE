import { Request, Response, NextFunction } from 'express';
import { verifyUserToken, JwtTokenPayload } from '../server/jwtAuth';
import { tenantManager } from '../server/tenantManager';

export interface ScopedRequest extends Request {
  jwtUser?: JwtTokenPayload;
  tenantId?: string;
}

/**
 * Middleware that authenticates a JWT token and attaches user payload.
 */
export const authenticateJwt = (req: ScopedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    const decoded = verifyUserToken(token);
    if (decoded) {
      req.jwtUser = decoded;
    }
  }
  next();
};

/**
 * Middleware that enforces tenant scoping.
 * Developer/Super Admin (restaurant_id = ALL) can access any restaurant.
 * Owners/Staff (restaurant_id = X) can ONLY access their specific restaurant.
 * Customers/Public can access public endpoints (menu, order placement) if tenant exists and is active.
 */
export const requireTenantScope = (allowPublic = false) => {
  return (req: ScopedRequest, res: Response, next: NextFunction) => {
    // Determine target tenant ID from URL params, query, or body
    const targetTenantId = (
      req.params.restaurantId ||
      req.params.tenantId ||
      req.query.restaurant_id ||
      req.query.tenant_id ||
      req.body.restaurant_id ||
      req.body.restaurantId
    ) as string | undefined;

    if (!targetTenantId) {
      // If endpoint requires tenant scoping and none provided
      return res.status(400).json({ error: 'Missing required restaurant_id / tenant parameter' });
    }

    // Verify tenant exists in system
    const tenant = tenantManager.getTenant(targetTenantId);
    if (!tenant) {
      return res.status(404).json({ error: `Restaurant not found: ${targetTenantId}` });
    }

    if (tenant.status === 'suspended') {
      return res.status(403).json({ error: `Restaurant '${tenant.name}' is currently suspended by Super Admin` });
    }

    req.tenantId = targetTenantId;

    // Check JWT authentication
    const user = req.jwtUser;

    if (!user) {
      if (allowPublic) {
        // Public customer access (e.g. view menu, place order)
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized: Valid JWT Bearer token required' });
    }

    // Developer / Super Admin: Global Scope (restaurant_id = ALL)
    if (user.role === 'developer' || user.restaurant_id === 'ALL' || user.restaurant_id === '*') {
      return next();
    }

    // Single Tenant check (Owner or Staff)
    if (user.restaurant_id !== targetTenantId) {
      return res.status(403).json({
        error: 'Forbidden: Tenant Scope Mismatch',
        message: `Your account credentials are valid only for tenant '${user.restaurant_id}', but attempted to access '${targetTenantId}'`,
        userScope: user.restaurant_id,
        targetTenant: targetTenantId,
      });
    }

    next();
  };
};

/**
 * Middleware strictly requiring Developer / Super Admin role
 */
export const requireSuperAdmin = (req: ScopedRequest, res: Response, next: NextFunction) => {
  const user = req.jwtUser;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Super Admin JWT token required' });
  }

  if (user.role !== 'developer') {
    return res.status(403).json({
      error: 'Forbidden: Super Admin privileges required',
      currentRole: user.role,
    });
  }

  next();
};
