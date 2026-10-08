import { Order, MenuItem, RestaurantSettings } from '../types';

/**
 * Formats a number into standard TZS currency display e.g. 5,000.00
 */
function formatReceiptMoney(amount: number): string {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Generates exact customer receipt text matching the official layout:
 *
 * OLLI'S PIZZA HOUSE & TAKE AWAYS
 * Your favorite slice of comfort!
 *
 * ---
 *
 * CUSTOMER RECEIPT
 *
 * ---
 *
 * Store Details:
 * Village House (Kijiji), Lipangalala Street,
 * The Place Rd., Near Lipangalala Primary School,
 * Ifakara, Tanzania.
 * Tel: +255713057325
 *
 * ---
 *
 * Receipt No: [Insert Number]
 * Date: [Insert Date]
 * Time: [Insert Time]
 * Cashier: [Insert Name]
 *
 * ---
 *
 * ORDER SUMMARY
 *
 * QTY ITEM PRICE (TZS) TOTAL
 * 1 [Item Name] [00.00] [00.00]
 * 1 [Item Name] [00.00] [00.00]
 *    
 *  Subtotal  [00.00]
 *  Tax/VAT  [00.00]
 *  TOTAL DUE  [00.00]
 *
 * ---
 *
 * Payment Method: [Cash / Mobile Money / Card]
 * Amount Paid: [00.00]
 * Change Due: [00.00]
 *
 * ---
 *
 * Thank you for ordering with us!
 * We appreciate your business and look forward to serving you again.
 *
 * For deliveries or inquiries, call: +255713057325
 * Visit us at Village House (Kijiji), Lipangalala Street, Ifakara.
 */
export function generateReceiptText(
  order: Order,
  settings: RestaurantSettings,
  menuItemsMap?: Map<string, MenuItem>
): string {
  const divider = '--------------------------------------------------';
  const headerBar = '==================================================';

  const brandName = settings.restaurantName || "OLLI'S PIZZA HOUSE & TAKE AWAYS";
  const tagline = settings.tagline || 'Your favorite slice of comfort!';
  const address = settings.address || 'Village House (Kijiji), Lipangalala Street,\nThe Place Rd., Near Lipangalala Primary School,\nIfakara, Tanzania.';
  const tel = settings.phone || '+255713057325';

  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr = `${String(orderDate.getDate()).padStart(2, '0')}/${String(orderDate.getMonth() + 1).padStart(2, '0')}/${orderDate.getFullYear()}`;
  const timeStr = `${String(orderDate.getHours()).padStart(2, '0')}:${String(orderDate.getMinutes()).padStart(2, '0')}`;
  const cashierName = order.cashierName || 'Baraka Juma (Cashier)';

  // Payment Method Label mapping
  let paymentMethodLabel = 'Cash';
  if (order.paymentMethod === 'mpesa') {
    paymentMethodLabel = 'Mobile Money (M-Pesa)';
  } else if (order.paymentMethod === 'card') {
    paymentMethodLabel = 'Card';
  } else {
    paymentMethodLabel = 'Cash';
  }

  const subtotal = order.subtotal || order.total || 0;
  const tax = order.tax || 0;
  const totalDue = order.total || 0;
  const paidAmount = order.paidAmount !== undefined ? order.paidAmount : (order.isPaid ? totalDue : 0);
  const changeDue = order.changeDue !== undefined ? order.changeDue : Math.max(0, paidAmount - totalDue);
  const debtAmount = order.debtAmount !== undefined ? order.debtAmount : (order.isPaid ? 0 : Math.max(0, totalDue - paidAmount));

  const lines: string[] = [
    headerBar,
    `        ${brandName.toUpperCase()}`,
    `         ${tagline}`,
    headerBar,
    '',
    '               CUSTOMER RECEIPT',
    '',
    divider,
    'Store Details:',
    ...address.split('\n').map((l) => l.trim()).filter(Boolean),
    `Tel: ${tel}`,
    divider,
    `Receipt No: ${order.orderNumber}`,
    `Date: ${dateStr}`,
    `Time: ${timeStr}`,
    `Cashier: ${cashierName}`,
    ...(order.isMerged ? [`Type: Consolidated Bill (Merged from: ${order.mergedFromOrderNumbers?.join(', ') || 'Tickets'})`] : []),
    ...(order.customerName ? [`Customer: ${order.customerName}`] : []),
    ...(order.phone ? [`Phone: ${order.phone}`] : []),
    ...(order.tableNumber ? [`Table/Seat: ${order.tableNumber}`] : []),
    ...(order.deliveryAddress ? [`Delivery: ${order.deliveryAddress}`] : []),
    divider,
    'ORDER SUMMARY',
    '',
    'QTY  ITEM                             PRICE (TZS)     TOTAL',
  ];

  // List order items with columnar spacing
  order.items.forEach((item) => {
    const itemName = item.name + (item.variantLabel ? ` (${item.variantLabel})` : '');
    const priceStr = formatReceiptMoney(item.unitPrice);
    const totalStr = formatReceiptMoney(item.unitPrice * item.quantity);
    const qtyStr = String(item.quantity).padEnd(4, ' ');
    const truncatedName = itemName.length > 28 ? itemName.substring(0, 26) + '..' : itemName.padEnd(29, ' ');
    lines.push(`${qtyStr} ${truncatedName} ${priceStr.padStart(11, ' ')}  ${totalStr.padStart(11, ' ')}`);
    if (item.specialInstructions) {
      lines.push(`     * Note: ${item.specialInstructions}`);
    }
  });

  lines.push('');
  lines.push(`  Subtotal:                          TZS ${formatReceiptMoney(subtotal)}`);
  if (order.deliveryFee && order.deliveryFee > 0) {
    lines.push(`  Delivery Fee:                      TZS ${formatReceiptMoney(order.deliveryFee)}`);
  }
  lines.push(`  Tax/VAT:                           TZS ${formatReceiptMoney(tax)}`);
  lines.push(`  TOTAL DUE:                         TZS ${formatReceiptMoney(totalDue)}`);
  lines.push(divider);
  lines.push(`Payment Method: ${paymentMethodLabel}`);
  lines.push(`Amount Paid:    TZS ${formatReceiptMoney(paidAmount)}`);
  lines.push(`Change Due:     TZS ${formatReceiptMoney(changeDue)}`);

  if (debtAmount > 0) {
    lines.push(`** REMAINING DEBT: TZS ${formatReceiptMoney(debtAmount)} **`);
    if (order.debtDueDate) {
      const due = new Date(order.debtDueDate);
      lines.push(`Due Date: ${due.toLocaleDateString()}`);
    }
  }

  lines.push(divider);
  lines.push('Thank you for ordering with us!');
  lines.push('We appreciate your business and look forward to serving you again.');
  lines.push('');
  lines.push(`For deliveries or inquiries, call: ${tel}`);
  const firstAddressLine = address.split('\n')[0]?.trim();
  if (firstAddressLine) {
    lines.push(`Visit us at: ${firstAddressLine}`);
  }
  lines.push(headerBar);

  return lines.join('\n');
}

/**
 * Triggers a browser download of the receipt as a .txt file
 */
export function downloadReceiptTxt(order: Order, settings: RestaurantSettings): void {
  const text = generateReceiptText(order, settings);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeNumber = order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.href = url;
  link.download = `receipt_${safeNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
