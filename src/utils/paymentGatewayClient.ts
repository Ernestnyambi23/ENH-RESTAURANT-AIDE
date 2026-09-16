export type TillKey = 'MPESA_OLLI' | 'MIXX_BAHATI' | 'NMB_OLLI' | 'CRDB_BAHATI' | 'UNIVERSAL_BAHATI';

export interface MerchantTillInfo {
  key: TillKey;
  tillNumber: string;
  providerName: string;
  channelType: string;
  endpointPath: string;
  brandColor?: string;
  shortLabel?: string;
}

export const DEFAULT_MERCHANT_TILLS: MerchantTillInfo[] = [
  {
    key: 'MPESA_OLLI',
    tillNumber: '351613137',
    providerName: 'Vodacom M-Pesa',
    channelType: 'MPESA_STK',
    endpointPath: '/mpesa/stkpush',
    brandColor: 'bg-red-600 text-white',
    shortLabel: 'M-Pesa STK',
  },
  {
    key: 'MIXX_BAHATI',
    tillNumber: '19347549',
    providerName: 'Mixx by Yas (Tigo)',
    channelType: 'MIXX_USSD',
    endpointPath: '/mixx/ussdpush',
    brandColor: 'bg-blue-600 text-white',
    shortLabel: 'Mixx USSD',
  },
  {
    key: 'NMB_OLLI',
    tillNumber: '21818882',
    providerName: 'NMB Bank / TIPS',
    channelType: 'BANK_TIPS_NMB',
    endpointPath: '/tips/nmb-push',
    brandColor: 'bg-amber-600 text-white',
    shortLabel: 'NMB TIPS',
  },
  {
    key: 'CRDB_BAHATI',
    tillNumber: '10177357',
    providerName: 'CRDB Lipa Hapa',
    channelType: 'BANK_TIPS_CRDB',
    endpointPath: '/tips/crdb-push',
    brandColor: 'bg-emerald-600 text-white',
    shortLabel: 'CRDB Lipa',
  },
  {
    key: 'UNIVERSAL_BAHATI',
    tillNumber: '65713321',
    providerName: 'Universal TIPS',
    channelType: 'TIPS_UNIVERSAL',
    endpointPath: '/tips/universal-push',
    brandColor: 'bg-purple-600 text-white',
    shortLabel: 'Universal TIPS',
  },
];

export interface AutoPushResponse {
  success: boolean;
  orderId?: string;
  targetTill?: string;
  provider?: string;
  channelUsed?: string;
  status?: string;
  message: string;
  gatewayDetails?: any;
}

export async function sendAutoPush(
  orderId: string,
  amount: number,
  customerPhone: string,
  tillKey: TillKey
): Promise<AutoPushResponse> {
  const res = await fetch('/api/payments/auto-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      amount,
      customerPhone,
      tillKey,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Auto-push failed');
  }
  return data;
}

export async function fetchPushHistory(): Promise<any[]> {
  try {
    const res = await fetch('/api/payments/history');
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
  } catch {
    return [];
  }
}
