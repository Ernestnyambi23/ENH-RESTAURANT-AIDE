import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import {
  RestaurantSettings,
  MenuItem,
  Order,
  StaffMember,
  ConnectedDevice,
  Purchase,
  Capital,
  BusinessOwnerAccount,
  OneTimePasscode,
  MpesaTransaction,
} from '../types';
import { getDefaultMenuItemsForTenant } from '../data/restaurantMenus';

// ============================================================================
// RESTAURANT SETTINGS
// ============================================================================
const SETTINGS_DOC_PATH = 'settings/restaurant_settings';

export function subscribeSettings(
  onData: (settings: RestaurantSettings) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    doc(db, 'settings', 'restaurant_settings'),
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as RestaurantSettings);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, SETTINGS_DOC_PATH);
    }
  );
}

export async function saveSettingsToFirestore(settings: RestaurantSettings) {
  try {
    await setDoc(doc(db, 'settings', 'restaurant_settings'), settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, SETTINGS_DOC_PATH);
  }
}

// ============================================================================
// MENU ITEMS
// ============================================================================
const ITEMS_PATH = 'items';

export function subscribeMenuItems(
  onData: (items: MenuItem[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, ITEMS_PATH),
    (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as MenuItem);
      });
      if (items.length > 0) {
        onData(items);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, ITEMS_PATH);
    }
  );
}

export async function saveMenuItemToFirestore(item: MenuItem, defaultTenantId = 'ollis-pizza') {
  const itemToSave = {
    ...item,
    restaurant_id: item.restaurant_id || defaultTenantId,
  };
  const path = `${ITEMS_PATH}/${item.id}`;
  try {
    await setDoc(doc(db, ITEMS_PATH, item.id), itemToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function seedRestaurantStarterMenuToFirestore(tenantId: string, items?: MenuItem[]) {
  const itemsToSeed = items || getDefaultMenuItemsForTenant(tenantId);
  for (const item of itemsToSeed) {
    await saveMenuItemToFirestore({ ...item, restaurant_id: tenantId }, tenantId);
  }
}

export async function deleteMenuItemFromFirestore(itemId: string) {
  const path = `${ITEMS_PATH}/${itemId}`;
  try {
    await deleteDoc(doc(db, ITEMS_PATH, itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// ORDERS
// ============================================================================
const ORDERS_PATH = 'orders';

export function subscribeOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, ORDERS_PATH),
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      if (orders.length > 0) {
        // Sort by createdAt descending
        orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        onData(orders);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, ORDERS_PATH);
    }
  );
}

export async function saveOrderToFirestore(order: Order) {
  const path = `${ORDERS_PATH}/${order.id}`;
  try {
    await setDoc(doc(db, ORDERS_PATH, order.id), order, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrderFromFirestore(orderId: string) {
  const path = `${ORDERS_PATH}/${orderId}`;
  try {
    await deleteDoc(doc(db, ORDERS_PATH, orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// STAFF
// ============================================================================
const STAFF_PATH = 'staff';

export function subscribeStaff(
  onData: (staff: StaffMember[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, STAFF_PATH),
    (snapshot) => {
      const staff: StaffMember[] = [];
      snapshot.forEach((docSnap) => {
        staff.push({ id: docSnap.id, ...docSnap.data() } as StaffMember);
      });
      if (staff.length > 0) {
        onData(staff);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, STAFF_PATH);
    }
  );
}

export async function saveStaffToFirestore(staff: StaffMember) {
  const path = `${STAFF_PATH}/${staff.id}`;
  try {
    await setDoc(doc(db, STAFF_PATH, staff.id), staff, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStaffFromFirestore(staffId: string) {
  const path = `${STAFF_PATH}/${staffId}`;
  try {
    await deleteDoc(doc(db, STAFF_PATH, staffId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// CONNECTED DEVICES
// ============================================================================
const DEVICES_PATH = 'devices';

export function subscribeDevices(
  onData: (devices: ConnectedDevice[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, DEVICES_PATH),
    (snapshot) => {
      const devices: ConnectedDevice[] = [];
      snapshot.forEach((docSnap) => {
        devices.push({ id: docSnap.id, ...docSnap.data() } as ConnectedDevice);
      });
      if (devices.length > 0) {
        onData(devices);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, DEVICES_PATH);
    }
  );
}

export async function saveDeviceToFirestore(device: ConnectedDevice) {
  const path = `${DEVICES_PATH}/${device.id}`;
  try {
    await setDoc(doc(db, DEVICES_PATH, device.id), device, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDeviceFromFirestore(deviceId: string) {
  const path = `${DEVICES_PATH}/${deviceId}`;
  try {
    await deleteDoc(doc(db, DEVICES_PATH, deviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// PURCHASES
// ============================================================================
const PURCHASES_PATH = 'purchases';

export function subscribePurchases(
  onData: (purchases: Purchase[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, PURCHASES_PATH),
    (snapshot) => {
      const purchases: Purchase[] = [];
      snapshot.forEach((docSnap) => {
        purchases.push({ id: docSnap.id, ...docSnap.data() } as Purchase);
      });
      if (purchases.length > 0) {
        purchases.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        onData(purchases);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, PURCHASES_PATH);
    }
  );
}

export async function savePurchaseToFirestore(purchase: Purchase) {
  const path = `${PURCHASES_PATH}/${purchase.id}`;
  try {
    await setDoc(doc(db, PURCHASES_PATH, purchase.id), purchase, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePurchaseFromFirestore(purchaseId: string) {
  const path = `${PURCHASES_PATH}/${purchaseId}`;
  try {
    await deleteDoc(doc(db, PURCHASES_PATH, purchaseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// CAPITAL
// ============================================================================
const CAPITAL_PATH = 'capital/primary_capital';

export function subscribeCapital(
  onData: (capital: Capital) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    doc(db, 'capital', 'primary_capital'),
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as Capital);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, CAPITAL_PATH);
    }
  );
}

export async function saveCapitalToFirestore(capital: Capital) {
  try {
    await setDoc(doc(db, 'capital', 'primary_capital'), capital, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CAPITAL_PATH);
  }
}

// ============================================================================
// BUSINESS OWNERS
// ============================================================================
const OWNERS_PATH = 'business_owners';

export function subscribeBusinessOwners(
  onData: (owners: BusinessOwnerAccount[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, OWNERS_PATH),
    (snapshot) => {
      const owners: BusinessOwnerAccount[] = [];
      snapshot.forEach((docSnap) => {
        owners.push({ id: docSnap.id, ...docSnap.data() } as BusinessOwnerAccount);
      });
      if (owners.length > 0) {
        onData(owners);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, OWNERS_PATH);
    }
  );
}

export async function saveBusinessOwnerToFirestore(owner: BusinessOwnerAccount) {
  const path = `${OWNERS_PATH}/${owner.id}`;
  try {
    await setDoc(doc(db, OWNERS_PATH, owner.id), owner, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBusinessOwnerFromFirestore(ownerId: string) {
  const path = `${OWNERS_PATH}/${ownerId}`;
  try {
    await deleteDoc(doc(db, OWNERS_PATH, ownerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// ONE-TIME PASSCODES (OTPs)
// ============================================================================
const OTPS_PATH = 'otps';

export function subscribeOTPs(
  onData: (otps: OneTimePasscode[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, OTPS_PATH),
    (snapshot) => {
      const otps: OneTimePasscode[] = [];
      snapshot.forEach((docSnap) => {
        otps.push({ id: docSnap.id, ...docSnap.data() } as OneTimePasscode);
      });
      if (otps.length > 0) {
        onData(otps);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, OTPS_PATH);
    }
  );
}

export async function saveOTPToFirestore(otp: OneTimePasscode) {
  const path = `${OTPS_PATH}/${otp.id}`;
  try {
    await setDoc(doc(db, OTPS_PATH, otp.id), otp, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOTPFromFirestore(otpId: string) {
  const path = `${OTPS_PATH}/${otpId}`;
  try {
    await deleteDoc(doc(db, OTPS_PATH, otpId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// MULTI-TENANT DATA MIGRATION SCRIPT
// ============================================================================
/**
 * Multi-Tenant Data Migration:
 * Inspects all documents across collections in Firestore and guarantees that
 * any document lacking a `restaurant_id` is retrofitted with the primary tenant ID ('ollis-pizza').
 */
export async function migrateFirestoreDataToTenant(defaultTenantId = 'ollis-pizza'): Promise<{
  migratedItems: number;
  migratedOrders: number;
  migratedStaff: number;
  migratedDevices: number;
  migratedPurchases: number;
}> {
  const result = {
    migratedItems: 0,
    migratedOrders: 0,
    migratedStaff: 0,
    migratedDevices: 0,
    migratedPurchases: 0,
  };

  try {
    // 1. Menu items
    const itemsSnap = await getDocs(collection(db, ITEMS_PATH));
    for (const d of itemsSnap.docs) {
      const data = d.data();
      if (!data.restaurant_id) {
        await updateDoc(doc(db, ITEMS_PATH, d.id), { restaurant_id: defaultTenantId });
        result.migratedItems++;
      }
    }

    // 2. Orders
    const ordersSnap = await getDocs(collection(db, ORDERS_PATH));
    for (const d of ordersSnap.docs) {
      const data = d.data();
      if (!data.restaurant_id) {
        await updateDoc(doc(db, ORDERS_PATH, d.id), { restaurant_id: defaultTenantId });
        result.migratedOrders++;
      }
    }

    // 3. Staff roster
    const staffSnap = await getDocs(collection(db, STAFF_PATH));
    for (const d of staffSnap.docs) {
      const data = d.data();
      if (!data.restaurant_id) {
        await updateDoc(doc(db, STAFF_PATH, d.id), { restaurant_id: defaultTenantId });
        result.migratedStaff++;
      }
    }

    // 4. Hardware terminals
    const devicesSnap = await getDocs(collection(db, DEVICES_PATH));
    for (const d of devicesSnap.docs) {
      const data = d.data();
      if (!data.restaurant_id) {
        await updateDoc(doc(db, DEVICES_PATH, d.id), { restaurant_id: defaultTenantId });
        result.migratedDevices++;
      }
    }

    // 5. Purchases
    const purchasesSnap = await getDocs(collection(db, PURCHASES_PATH));
    for (const d of purchasesSnap.docs) {
      const data = d.data();
      if (!data.restaurant_id) {
        await updateDoc(doc(db, PURCHASES_PATH, d.id), { restaurant_id: defaultTenantId });
        result.migratedPurchases++;
      }
    }
  } catch (err) {
    console.warn('Multi-tenant data migration check completed with warning:', err);
  }

  return result;
}

