import { db } from './index.ts';
import { menuItems, orders, staffMembers, purchases, settings } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// Menu items
export async function getDbMenuItems() {
  try {
    return await db.select().from(menuItems);
  } catch (error) {
    console.error('Failed to get menu items from database:', error);
    throw new Error('Database query failed for menu items.', { cause: error });
  }
}

export async function upsertDbMenuItem(item: typeof menuItems.$inferInsert) {
  try {
    const result = await db
      .insert(menuItems)
      .values(item)
      .onConflictDoUpdate({
        target: menuItems.id,
        set: {
          name: item.name,
          category: item.category,
          stock: item.stock,
          price: item.price,
          description: item.description,
          icon: item.icon,
          imageUrl: item.imageUrl,
          isPopular: item.isPopular,
          isChefSpecial: item.isChefSpecial,
          isSaturdaySpecial: item.isSaturdaySpecial,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to upsert menu item in database:', error);
    throw new Error('Database operation failed for menu item.', { cause: error });
  }
}

// Orders
export async function getDbOrders() {
  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error('Failed to get orders from database:', error);
    throw new Error('Database query failed for orders.', { cause: error });
  }
}

export async function upsertDbOrder(order: typeof orders.$inferInsert) {
  try {
    const result = await db
      .insert(orders)
      .values(order)
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          customerName: order.customerName,
          phone: order.phone,
          orderType: order.orderType,
          tableNumber: order.tableNumber,
          subtotal: order.subtotal,
          tax: order.tax,
          deliveryFee: order.deliveryFee,
          total: order.total,
          paidAmount: order.paidAmount,
          debtAmount: order.debtAmount,
          isPaid: order.isPaid,
          isCompleted: order.isCompleted,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          status: order.status,
          source: order.source,
          estimatedPrepMinutes: order.estimatedPrepMinutes,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to upsert order in database:', error);
    throw new Error('Database operation failed for order.', { cause: error });
  }
}

export async function deleteDbOrder(id: string) {
  try {
    await db.delete(orders).where(eq(orders.id, id));
  } catch (error) {
    console.error('Failed to delete order from database:', error);
    throw new Error('Database delete operation failed for order.', { cause: error });
  }
}

// Staff
export async function getDbStaff() {
  try {
    return await db.select().from(staffMembers);
  } catch (error) {
    console.error('Failed to get staff from database:', error);
    throw new Error('Database query failed for staff.', { cause: error });
  }
}

export async function upsertDbStaff(staff: typeof staffMembers.$inferInsert) {
  try {
    const result = await db
      .insert(staffMembers)
      .values(staff)
      .onConflictDoUpdate({
        target: staffMembers.id,
        set: {
          name: staff.name,
          username: staff.username,
          roleTitle: staff.roleTitle,
          age: staff.age,
          emergencyPhone1: staff.emergencyPhone1,
          emergencyPhone2: staff.emergencyPhone2,
          guardianName: staff.guardianName,
          agreedSalary: staff.agreedSalary,
          employmentDate: staff.employmentDate,
          salaryPaymentStatus: staff.salaryPaymentStatus,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to upsert staff in database:', error);
    throw new Error('Database operation failed for staff.', { cause: error });
  }
}

// Purchases
export async function getDbPurchases() {
  try {
    return await db.select().from(purchases).orderBy(desc(purchases.createdAt));
  } catch (error) {
    console.error('Failed to get purchases from database:', error);
    throw new Error('Database query failed for purchases.', { cause: error });
  }
}

export async function insertDbPurchase(purchase: typeof purchases.$inferInsert) {
  try {
    const result = await db.insert(purchases).values(purchase).returning();
    return result[0];
  } catch (error) {
    console.error('Failed to insert purchase in database:', error);
    throw new Error('Database operation failed for purchase.', { cause: error });
  }
}

// Settings
export async function getDbSettings() {
  try {
    const result = await db.select().from(settings).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get settings from database:', error);
    throw new Error('Database query failed for settings.', { cause: error });
  }
}

export async function upsertDbSettings(settingData: typeof settings.$inferInsert) {
  try {
    const existing = await db.select().from(settings).limit(1);
    if (existing.length > 0) {
      const result = await db
        .update(settings)
        .set({
          restaurantName: settingData.restaurantName,
          tagline: settingData.tagline,
          currency: settingData.currency,
          phone: settingData.phone,
          address: settingData.address,
          taxRate: settingData.taxRate,
          defaultDeliveryFee: settingData.defaultDeliveryFee,
          defaultPrepMinutes: settingData.defaultPrepMinutes,
          overdueThresholdMinutes: settingData.overdueThresholdMinutes,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(settings).values(settingData).returning();
      return result[0];
    }
  } catch (error) {
    console.error('Failed to save settings in database:', error);
    throw new Error('Database operation failed for settings.', { cause: error });
  }
}
