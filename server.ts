import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { paymentGatewayService, PushRequest } from './src/server/paymentGateway';
import { AI_ORDER_ASSISTANT_SYSTEM_INSTRUCTION } from './src/data/menuDatabase';
import { generateFallbackAiOrderResponse } from './src/server/aiAssistant';
import { signUserToken, verifyUserToken } from './src/server/jwtAuth';
import { tenantManager } from './src/server/tenantManager';
import { authenticateJwt, requireTenantScope, requireSuperAdmin, ScopedRequest } from './src/middleware/tenantScope';
import { processAiChatMessage, ChatServiceRequest } from './src/server/geminiChatService';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(authenticateJwt);

// =========================================================================
// TILL CONFIGURATION WITH AUTO-ROUTING CHANNELS (PAYMENT CONTROLLER)
// =========================================================================

/**
 * 1. Automatic Push Trigger Endpoint
 * Matches POST /api/payments/auto-push from Java Spring Boot PaymentController
 */
app.post('/api/payments/auto-push', async (req, res) => {
  try {
    const { orderId, amount, customerPhone, tillKey } = req.body as PushRequest;

    if (!orderId || !amount || !customerPhone || !tillKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount, customerPhone, or tillKey',
      });
    }

    const response = await paymentGatewayService.triggerAutoPushNotification({
      orderId,
      amount: Number(amount),
      customerPhone: String(customerPhone),
      tillKey: String(tillKey),
    });

    return res.json(response);
  } catch (error: any) {
    if (error?.message === 'Invalid tillKey provided.') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tillKey provided.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * 2. Get Configured Merchant Tills
 */
app.get('/api/payments/tills', (_req, res) => {
  res.json({
    success: true,
    baseUrl: paymentGatewayService.getBaseUrl(),
    tills: paymentGatewayService.getTills(),
  });
});

/**
 * 3. Get Push Notification History
 */
app.get('/api/payments/history', (_req, res) => {
  res.json({
    success: true,
    history: paymentGatewayService.getHistory(),
  });
});

// Lazy-initialized Gemini AI client
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// =========================================================================
// CLOUD SQL & AUTHENTICATION ENDPOINTS
// =========================================================================
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUsers } from './src/db/users.ts';
import {
  getDbMenuItems,
  upsertDbMenuItem,
  getDbOrders,
  upsertDbOrder,
  deleteDbOrder,
  getDbStaff,
  upsertDbStaff,
  getDbPurchases,
  insertDbPurchase,
  getDbSettings,
  upsertDbSettings,
} from './src/db/queries.ts';

// Synchronize or register current authenticated user in Cloud SQL
app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'Unauthorized: missing user token payload' });
    }
    const user = await getOrCreateUser(req.user.uid, req.user.email || '', req.user.name || '');
    return res.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to sync user:', error);
    return res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// List users (Cloud SQL)
app.get('/api/users', requireAuth, async (req: AuthRequest, res) => {
  try {
    const users = await getUsers();
    return res.json(users);
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// Cloud SQL Database endpoints
app.get('/api/db/menu-items', async (_req, res) => {
  try {
    const items = await getDbMenuItems();
    return res.json(items);
  } catch (error: any) {
    console.error('Failed to get menu items:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch menu items' });
  }
});

app.post('/api/db/menu-items', async (req, res) => {
  try {
    const item = await upsertDbMenuItem(req.body);
    return res.json({ success: true, item });
  } catch (error: any) {
    console.error('Failed to save menu item:', error);
    return res.status(500).json({ error: error.message || 'Failed to save menu item' });
  }
});

app.get('/api/db/orders', async (_req, res) => {
  try {
    const ordersList = await getDbOrders();
    return res.json(ordersList);
  } catch (error: any) {
    console.error('Failed to get orders:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch orders' });
  }
});

app.post('/api/db/orders', async (req, res) => {
  try {
    const order = await upsertDbOrder(req.body);
    return res.json({ success: true, order });
  } catch (error: any) {
    console.error('Failed to save order:', error);
    return res.status(500).json({ error: error.message || 'Failed to save order' });
  }
});

app.delete('/api/db/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDbOrder(id);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete order:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete order' });
  }
});

app.get('/api/db/staff', async (_req, res) => {
  try {
    const staffList = await getDbStaff();
    return res.json(staffList);
  } catch (error: any) {
    console.error('Failed to get staff:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch staff' });
  }
});

app.post('/api/db/staff', async (req, res) => {
  try {
    const staffMember = await upsertDbStaff(req.body);
    return res.json({ success: true, staffMember });
  } catch (error: any) {
    console.error('Failed to save staff member:', error);
    return res.status(500).json({ error: error.message || 'Failed to save staff member' });
  }
});

app.get('/api/db/purchases', async (_req, res) => {
  try {
    const purchasesList = await getDbPurchases();
    return res.json(purchasesList);
  } catch (error: any) {
    console.error('Failed to get purchases:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch purchases' });
  }
});

app.post('/api/db/purchases', async (req, res) => {
  try {
    const purchase = await insertDbPurchase(req.body);
    return res.json({ success: true, purchase });
  } catch (error: any) {
    console.error('Failed to save purchase:', error);
    return res.status(500).json({ error: error.message || 'Failed to save purchase' });
  }
});

app.get('/api/db/settings', async (_req, res) => {
  try {
    const dbSettings = await getDbSettings();
    return res.json(dbSettings);
  } catch (error: any) {
    console.error('Failed to get settings:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch settings' });
  }
});

app.post('/api/db/settings', async (req, res) => {
  try {
    const saved = await upsertDbSettings(req.body);
    return res.json({ success: true, settings: saved });
  } catch (error: any) {
    console.error('Failed to save settings:', error);
    return res.status(500).json({ error: error.message || 'Failed to save settings' });
  }
});


// Payroll calculation interface
interface PayrollRequestItem {
  staffId?: string;
  staffName: string;
  monthlyGrossSalary: number;
  daysAbsent: number;
  month: number;
  year: number;
}

/**
 * Endpoint to calculate dynamic calendar-month staff payroll deductions
 * using Gemini API (with deterministic fallback formula)
 */
app.post('/api/payroll/calculate', async (req, res) => {
  try {
    const { items, month, year } = req.body as {
      items: PayrollRequestItem[];
      month: number;
      year: number;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid items array' });
    }

    const targetMonth = Number(month) || new Date().getMonth() + 1;
    const targetYear = Number(year) || new Date().getFullYear();
    // Dynamically calculate exact days in the calendar month (day 0 of next month)
    const totalDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();

    const ai = getGeminiClient();
    const calculatedResults = [];

    for (const item of items) {
      const gross = Number(item.monthlyGrossSalary) || 0;
      const absent = Math.max(0, Math.min(totalDaysInMonth, Number(item.daysAbsent) || 0));
      const staffName = item.staffName || 'Staff Member';

      // Mathematical exact baseline:
      const fallbackDailyRate = Number((gross / totalDaysInMonth).toFixed(2));
      const fallbackDeduction = Number((fallbackDailyRate * absent).toFixed(2));
      const fallbackNetSalary = Number((gross - fallbackDeduction).toFixed(2));

      let calculatedDailyRate = fallbackDailyRate;
      let totalDeduction = fallbackDeduction;
      let netPayableSalary = fallbackNetSalary;
      let calculatedByAi = false;

      if (ai) {
        try {
          const prompt = `
            Calculate staff payroll deductions strictly based on calendar-month flow:
            - Staff Name: ${staffName}
            - Monthly Gross Salary: ${gross}
            - Days Absent: ${absent}
            - Target Month: ${targetMonth}/${targetYear}
            - Total Days in Month: ${totalDaysInMonth}

            Rules:
            1. Daily Rate = Monthly Gross Salary / ${totalDaysInMonth}
            2. Total Deduction = Daily Rate * Days Absent
            3. Net Payable Salary = Monthly Gross Salary - Total Deduction
            4. Return values rounded to 2 decimal places.
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  calculatedDailyRate: { type: Type.NUMBER },
                  totalDeduction: { type: Type.NUMBER },
                  netPayableSalary: { type: Type.NUMBER },
                },
                required: ['calculatedDailyRate', 'totalDeduction', 'netPayableSalary'],
              },
              temperature: 0.1,
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            if (
              typeof parsed.calculatedDailyRate === 'number' &&
              typeof parsed.totalDeduction === 'number' &&
              typeof parsed.netPayableSalary === 'number'
            ) {
              calculatedDailyRate = Number(parsed.calculatedDailyRate.toFixed(2));
              totalDeduction = Number(parsed.totalDeduction.toFixed(2));
              netPayableSalary = Number(parsed.netPayableSalary.toFixed(2));
              calculatedByAi = true;
            }
          }
        } catch (aiErr) {
          console.warn(`[Gemini Payroll API] Fallback to formula for ${staffName}:`, aiErr);
        }
      }

      calculatedResults.push({
        staffId: item.staffId,
        staffName,
        monthlyGrossSalary: gross,
        daysAbsent: absent,
        month: targetMonth,
        year: targetYear,
        totalDaysInMonth,
        calculatedDailyRate,
        totalDeduction,
        netPayableSalary,
        calculatedByAi,
      });
    }

    return res.json({
      success: true,
      month: targetMonth,
      year: targetYear,
      totalDaysInMonth,
      results: calculatedResults,
    });
  } catch (error) {
    console.error('Payroll API Error:', error);
    return res.status(500).json({
      error: 'Failed to compute staff payroll',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Comprehensive Multi-Turn AI Chat Endpoint (Gemini API)
 * Supports:
 * - Maps Grounding (gemini-3.5-flash with googleMaps tool)
 * - Search Grounding (gemini-3.5-flash with googleSearch tool)
 * - General Restaurant Concierge & Order Assistant (gemini-3.5-flash)
 * - Complex Strategic & Operations Analysis (gemini-3.1-pro-preview with fallback)
 * - Fast Kitchen & Instant Lookup (gemini-3.1-flash-lite)
 */
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, role, userLocation } = req.body as ChatServiceRequest;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const result = await processAiChatMessage({
      message,
      history,
      role,
      userLocation,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('API /api/ai/chat error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * AI Order Assistant Endpoint (Gemini API) - Backward Compatible
 * Utilizes the official MENU_DATABASE and system instructions
 * to answer inquiries & calculate totals
 */
app.post('/api/ai/order-assistant', async (req, res) => {
  try {
    const { message, history, role, userLocation } = req.body as {
      message: string;
      history?: { role: 'user' | 'model'; text: string }[];
      role?: any;
      userLocation?: any;
    };

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await processAiChatMessage({
      message,
      history: history as any,
      role: role || 'general',
      userLocation,
    });

    return res.json({
      success: result.success,
      reply: result.reply,
      suggestedItems: result.suggestedItems,
      calculatedTotal: result.calculatedTotal,
      mapsSources: result.mapsSources,
      searchSources: result.searchSources,
      modelUsed: result.modelUsed,
      source: result.source,
    });
  } catch (error: any) {
    console.error('AI Order Assistant Error:', error);
    const fallbackReply = generateFallbackAiOrderResponse(req.body?.message || '');
    return res.json({
      success: true,
      reply: fallbackReply.reply,
      suggestedItems: fallbackReply.suggestedItems,
      calculatedTotal: fallbackReply.calculatedTotal,
      source: 'fallback_after_error',
    });
  }
});

// =========================================================================
// MULTI-TENANT ARCHITECTURE & JWT-BASED ROLE-BASED ACCESS CONTROL (RBAC)
// =========================================================================

/**
 * 1. Issue JWT Token with Assigned Role & Scope
 * POST /api/auth/jwt-token
 * Body: { uid, email, role, restaurant_id, name }
 */
app.post('/api/auth/jwt-token', (req: ScopedRequest, res) => {
  try {
    const { uid, email, role, restaurant_id, name } = req.body;

    if (!uid || !role || !name) {
      return res.status(400).json({ error: 'Missing required parameters: uid, role, or name' });
    }

    // Role validation
    const validRoles = ['developer', 'owner', 'staff', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role: ${role}. Must be one of ${validRoles.join(', ')}` });
    }

    // Scope enforcement
    let assignedScope = restaurant_id || 'ollis-pizza';
    if (role === 'developer') {
      // Developer / Super Admin has Global scope across ALL restaurants
      assignedScope = 'ALL';
    } else {
      // Non-developer role must have valid single-tenant restaurant_id
      const tenant = tenantManager.getTenant(assignedScope);
      if (!tenant) {
        return res.status(404).json({ error: `Assigned restaurant '${assignedScope}' does not exist` });
      }
    }

    const permissions: string[] = [];
    if (role === 'developer') {
      permissions.push(
        'global:read',
        'global:write',
        'tenants:create',
        'tenants:manage_features',
        'system:metrics',
        'orders:all',
        'config:override'
      );
    } else if (role === 'owner') {
      permissions.push(
        'tenant:read',
        'tenant:write',
        'menu:manage',
        'reports:view',
        'staff:manage',
        'orders:manage'
      );
    } else if (role === 'staff') {
      permissions.push('orders:read', 'orders:update_status', 'kitchen:tick');
    } else {
      permissions.push('menu:read', 'orders:create');
    }

    const payload = {
      uid: String(uid),
      email: String(email || ''),
      role: role as 'developer' | 'owner' | 'staff' | 'customer',
      restaurant_id: assignedScope,
      name: String(name),
      permissions,
    };

    const token = signUserToken(payload);

    return res.json({
      success: true,
      token,
      user: payload,
    });
  } catch (error: any) {
    console.error('JWT generation error:', error);
    return res.status(500).json({ error: 'Failed to generate JWT authentication token' });
  }
});

/**
 * 2. Verify and Get Current User Token Profile
 * GET /api/auth/me
 */
app.get('/api/auth/me', (req: ScopedRequest, res) => {
  if (!req.jwtUser) {
    return res.status(401).json({ authenticated: false, error: 'No valid JWT token provided' });
  }

  return res.json({
    authenticated: true,
    user: req.jwtUser,
  });
});

/**
 * 3. List All Tenants (SaaS Model)
 * GET /api/tenants
 * Public list for Customer Restaurant Selector, or full data for Super Admin
 */
app.get('/api/tenants', (req: ScopedRequest, res) => {
  const isDev = req.jwtUser?.role === 'developer';
  const allTenants = tenantManager.getAllTenants();

  if (isDev) {
    return res.json({ success: true, tenants: allTenants });
  }

  // Filter for active tenants and omit sensitive owner details for public customers
  const publicTenants = allTenants
    .filter((t) => t.status === 'active')
    .map((t) => ({
      id: t.id,
      uniqueCode: t.uniqueCode,
      name: t.name,
      slug: t.slug,
      branchName: t.branchName || 'Main Branch',
      ownerId: t.ownerId,
      ownerEmail: t.ownerEmail,
      ownerName: t.ownerName,
      tagline: t.tagline,
      currency: t.currency,
      logoUrl: t.logoUrl,
      themeColor: t.themeColor,
      status: t.status,
      categories: t.categories,
      paymentMethods: t.paymentMethods,
      phone: t.phone,
      address: t.address,
      featureFlags: t.featureFlags,
      isUnderMaintenance: t.isUnderMaintenance || false,
      maintenanceMessage: t.maintenanceMessage,
      layoutConfig: t.layoutConfig,
    }));

  return res.json({ success: true, tenants: publicTenants });
});

/**
 * 3.5. Verify Unique Tenant Code (Entry Flow)
 * GET /api/tenants/verify-code/:code
 */
app.get('/api/tenants/verify-code/:code', (req, res) => {
  const { code } = req.params;
  const tenant = tenantManager.getTenantByCode(code);
  if (!tenant) {
    return res.status(404).json({
      success: false,
      error: `Invalid or unknown Unique Tenant Code: '${code}'. Please check your assigned code with ENH RESTAURANT MANAGEMENT AIDE LTD.`,
    });
  }

  return res.json({
    success: true,
    tenant,
    isUnderMaintenance: tenant.isUnderMaintenance || false,
  });
});

/**
 * 4. Get Single Tenant Information & Feature Flags
 * GET /api/tenants/:restaurantId
 */
app.get('/api/tenants/:restaurantId', requireTenantScope(true), (req: ScopedRequest, res) => {
  const tenant = tenantManager.getTenant(req.params.restaurantId);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  return res.json({ success: true, tenant });
});

/**
 * 5. Onboard / Create New Tenant Restaurant (Super Admin Only)
 * POST /api/tenants
 */
app.post('/api/tenants', requireSuperAdmin, (req: ScopedRequest, res) => {
  try {
    const {
      name,
      uniqueCode,
      ownerEmail,
      ownerName,
      branchName,
      categories,
      paymentMethods,
      tagline,
      currency,
      phone,
      address,
      themeColor,
      logoUrl,
      featureFlags,
    } = req.body;

    if (!name || !ownerEmail || !ownerName) {
      return res.status(400).json({ error: 'Missing required fields: name, ownerEmail, ownerName' });
    }

    const newTenant = tenantManager.createTenant({
      name,
      uniqueCode,
      ownerEmail,
      ownerName,
      branchName,
      categories,
      paymentMethods,
      tagline,
      currency,
      phone,
      address,
      themeColor,
      logoUrl,
      featureFlags,
    });

    return res.status(201).json({
      success: true,
      message: `Tenant '${newTenant.name}' onboarded successfully under ENH RESTAURANT MANAGEMENT AIDE LTD. with Code '${newTenant.uniqueCode}'`,
      tenant: newTenant,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create tenant restaurant' });
  }
});

/**
 * 5.5. Cascaded Permanent Tenant Deletion (Super Admin Only)
 * DELETE /api/tenants/:restaurantId
 */
app.delete('/api/tenants/:restaurantId', requireSuperAdmin, (req: ScopedRequest, res) => {
  const { restaurantId } = req.params;
  const deleted = tenantManager.deleteTenant(restaurantId);
  if (!deleted) {
    return res.status(404).json({ error: `Restaurant '${restaurantId}' not found` });
  }
  return res.json({
    success: true,
    message: `Tenant '${restaurantId}' and all isolated records purged successfully.`,
  });
});

/**
 * 5.6. Toggle Maintenance Mode (Super Admin Only)
 * PUT /api/tenants/:restaurantId/maintenance
 */
app.put('/api/tenants/:restaurantId/maintenance', requireSuperAdmin, (req: ScopedRequest, res) => {
  const { restaurantId } = req.params;
  const { isUnderMaintenance, maintenanceMessage } = req.body;
  const updated = tenantManager.updateTenant(restaurantId, {
    isUnderMaintenance: !!isUnderMaintenance,
    maintenanceMessage: maintenanceMessage || 'System maintenance in progress by ENH RESTAURANT MANAGEMENT AIDE LTD.',
  });
  if (!updated) {
    return res.status(404).json({ error: `Restaurant '${restaurantId}' not found` });
  }
  return res.json({
    success: true,
    isUnderMaintenance: updated.isUnderMaintenance,
    tenant: updated,
  });
});

/**
 * 6. Update Feature Flags per Restaurant (Super Admin Only)
 * PUT /api/tenants/:restaurantId/features
 */
app.put('/api/tenants/:restaurantId/features', requireSuperAdmin, (req: ScopedRequest, res) => {
  const { restaurantId } = req.params;
  const flags = req.body;

  const updated = tenantManager.updateFeatureFlags(restaurantId, flags);
  if (!updated) {
    return res.status(404).json({ error: `Restaurant '${restaurantId}' not found` });
  }

  return res.json({
    success: true,
    message: `Feature flags updated for '${updated.name}'`,
    featureFlags: updated.featureFlags,
  });
});

/**
 * 7. Update Restaurant Configuration (Owner or Super Admin)
 * PUT /api/tenants/:restaurantId
 */
app.put('/api/tenants/:restaurantId', requireTenantScope(false), (req: ScopedRequest, res) => {
  const { restaurantId } = req.params;
  const updated = tenantManager.updateTenant(restaurantId, req.body);
  if (!updated) {
    return res.status(404).json({ error: `Restaurant '${restaurantId}' not found` });
  }

  return res.json({
    success: true,
    tenant: updated,
  });
});

/**
 * 8. Centralized Developer Super-Admin Metrics
 * GET /api/super-admin/metrics
 */
app.get('/api/super-admin/metrics', requireSuperAdmin, (_req: ScopedRequest, res) => {
  const metrics = tenantManager.getGlobalMetrics();
  return res.json({
    success: true,
    metrics,
  });
});

/**
 * 9. Scoped Orders for Tenant
 * GET /api/tenants/:restaurantId/orders
 */
app.get('/api/tenants/:restaurantId/orders', requireTenantScope(false), (req: ScopedRequest, res) => {
  const orders = tenantManager.getOrders(req.params.restaurantId);
  return res.json({ success: true, restaurant_id: req.params.restaurantId, orders });
});

/**
 * 10. Place Order for Specific Tenant
 * POST /api/tenants/:restaurantId/orders
 */
app.post('/api/tenants/:restaurantId/orders', requireTenantScope(true), (req: ScopedRequest, res) => {
  const { restaurantId } = req.params;
  tenantManager.recordOrder(restaurantId, req.body);
  return res.status(201).json({ success: true, message: `Order recorded for ${restaurantId}` });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Restaurant System & AI Studio running on http://0.0.0.0:${PORT}`);
  });
}

start();
