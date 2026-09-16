/**
 * Formats a number into localized currency string, e.g. "15,000 TZS"
 */
export function formatCurrency(amount: number, currency: string = 'TZS'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `0 ${currency}`;
  }
  return `${amount.toLocaleString('en-US')} ${currency}`;
}

/**
 * Returns human-readable relative time (e.g., "3m ago", "Just now")
 */
export function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${Math.floor(diffHour / 24)}d ago`;
}

/**
 * Formats timestamp to clock time e.g. "14:35" or "2:35 PM"
 */
export function formatClockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if order is overdue (pending or preparing longer than threshold)
 */
export function isOrderOverdue(
  createdAt: number,
  status: string,
  thresholdMinutes: number = 20
): boolean {
  if (status === 'completed' || status === 'cancelled' || status === 'ready') {
    return false;
  }
  const diffMinutes = (Date.now() - createdAt) / (1000 * 60);
  return diffMinutes > thresholdMinutes;
}

/**
 * Generate next Order Number e.g. "#1043"
 */
export function generateOrderNumber(lastNumberStr?: string): string {
  if (!lastNumberStr) {
    return `#${Math.floor(1000 + Math.random() * 9000)}`;
  }
  const num = parseInt(lastNumberStr.replace(/\D/g, ''), 10);
  if (isNaN(num)) return `#${Math.floor(1000 + Math.random() * 9000)}`;
  return `#${num + 1}`;
}
