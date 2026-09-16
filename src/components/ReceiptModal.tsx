import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, FileText } from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import { formatCurrency, formatClockTime } from '../utils/formatters';
import { BrandLogo } from './BrandLogo';
import { generateReceiptText, downloadReceiptTxt } from '../utils/receipt';

interface ReceiptModalProps {
  order: Order | null;
  settings: RestaurantSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  settings,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadReceiptTxt(order, settings);
  };

  const handleCopy = () => {
    const text = generateReceiptText(order, settings);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawReceipt = generateReceiptText(order, settings);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#e2e4dc] flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-3.5 px-4 bg-gray-50 border-b border-[#e2e4dc] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1f4d3e]">Receipt #{order.orderNumber}</span>
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              {showRawText ? 'Visual View' : 'Raw .txt View'}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-[#4c5a52]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Content Container */}
        {showRawText ? (
          <div className="p-4 overflow-y-auto flex-1 bg-gray-900 text-emerald-400 font-mono text-xs whitespace-pre select-all leading-relaxed">
            {rawReceipt}
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 bg-white font-mono text-xs text-[#1b2620]" id="printable-receipt">
            {/* Header / Brand */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
              <div className="flex justify-center mb-1">
                <BrandLogo size="lg" src={settings.logoUrl || '/logo.jpg'} shape="circle" />
              </div>
              <h2 className="text-sm font-extrabold uppercase tracking-wide font-sans text-black">
                {settings.restaurantName || "OLLI'S PIZZA HOUSE & TAKE AWAYS"}
              </h2>
              <p className="text-[11px] font-sans font-medium text-emerald-800 italic">
                {settings.tagline || 'Your favorite slice of comfort!'}
              </p>
            </div>

            {/* Receipt Title Badge */}
            <div className="py-2.5 text-center border-b border-dashed border-gray-400">
              <span className="text-xs font-black uppercase tracking-widest text-[#143529] font-sans">
                CUSTOMER RECEIPT
              </span>
            </div>

            {/* Store Details */}
            <div className="py-3 border-b border-dashed border-gray-400 text-[11px] space-y-0.5">
              <p className="font-bold text-[#143529] font-sans uppercase text-[10px] tracking-wider">Store Details:</p>
              {(settings.address || 'Village House (Kijiji), Lipangalala Street,\nThe Place Rd., Near Lipangalala Primary School,\nIfakara, Tanzania.')
                .split('\n')
                .map((line, idx) => (
                  <p key={idx} className="text-gray-700">{line.trim()}</p>
                ))}
              <p className="text-gray-900 font-bold">Tel: {settings.phone || '+255713057325'}</p>
            </div>

            {/* Meta: Receipt No, Date, Time, Cashier */}
            <div className="py-3 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt No:</span>
                <span className="font-bold font-mono">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span>{formatClockTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cashier:</span>
                <span className="font-bold">{order.cashierName || 'Baraka Juma (Cashier)'}</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-semibold">{order.customerName}</span>
                </div>
              )}
              {order.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{order.phone}</span>
                </div>
              )}
              {order.tableNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Table / Seat:</span>
                  <span className="font-bold">{order.tableNumber}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Address:</span>
                  <span className="font-bold">{order.deliveryAddress}</span>
                </div>
              )}
            </div>

            {/* ORDER SUMMARY */}
            <div className="py-3 border-b border-dashed border-gray-400 space-y-2">
              <div className="font-black text-[11px] uppercase tracking-wider text-[#143529] font-sans">
                ORDER SUMMARY
              </div>

              {/* Table Column Headers */}
              <div className="grid grid-cols-12 font-bold text-[10px] uppercase text-gray-500 pb-1 border-b border-gray-200">
                <span className="col-span-2">QTY</span>
                <span className="col-span-5">ITEM</span>
                <span className="col-span-2 text-right">PRICE (TZS)</span>
                <span className="col-span-3 text-right">TOTAL</span>
              </div>

              {/* Items List */}
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5 pt-0.5">
                  <div className="grid grid-cols-12 text-[11px] items-start">
                    <span className="col-span-2 font-bold">{item.quantity}</span>
                    <span className="col-span-5 pr-1 break-words">
                      {item.name}
                      {item.variantLabel && <span className="text-[10px] text-gray-500 block">({item.variantLabel})</span>}
                    </span>
                    <span className="col-span-2 text-right font-mono text-[10px]">
                      {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="col-span-3 text-right font-mono font-bold">
                      {(item.unitPrice * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {item.specialInstructions && (
                    <p className="text-[10px] text-gray-500 pl-4 italic">
                      * {item.specialInstructions}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Subtotal, Tax/VAT, TOTAL DUE */}
            <div className="py-3 border-b border-dashed border-gray-400 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-mono">
                  TZS {(order.subtotal || order.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-mono">
                    TZS {order.deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax/VAT:</span>
                <span className="font-mono">
                  TZS {(order.tax || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-gray-300 font-sans text-black">
                <span>TOTAL DUE:</span>
                <span className="font-mono">
                  TZS {order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-3 border-b border-dashed border-gray-400 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-bold">
                  {order.paymentMethod === 'tips'
                    ? 'TIPS (Bank QR / Lipa Namba)'
                    : order.paymentMethod === 'mpesa'
                    ? 'Mobile Money (M-Pesa / Airtel / Tigo)'
                    : order.paymentMethod === 'card'
                    ? 'Card (POS)'
                    : order.paymentMethod === 'other'
                    ? 'Direct Bank / Other'
                    : 'Cash'}
                </span>
              </div>
              {order.selcomTransId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Trans / Ref ID:</span>
                  <span className="font-mono font-bold text-[#143529]">
                    {order.selcomTransId}
                  </span>
                </div>
              )}
              {order.selcomReference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-gray-700">
                    {order.selcomReference}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold font-mono text-emerald-800">
                  TZS {(order.paidAmount ?? (order.isPaid ? order.total : 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Change Due:</span>
                <span className="font-bold font-mono text-gray-900">
                  TZS {(order.changeDue ?? Math.max(0, (order.paidAmount ?? 0) - order.total)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {(order.debtAmount ?? 0) > 0 && (
                <div className="pt-1 text-[10px] text-gray-600 bg-red-50 p-2 rounded-xl border border-red-200 mt-2 space-y-0.5">
                  <div className="flex justify-between text-red-700 font-black">
                    <span>Remaining Debt:</span>
                    <span className="font-mono">
                      TZS {order.debtAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="font-bold text-red-800 block">Debtor: {order.debtorName || order.customerName}</span>
                  {order.debtNotes && <span className="italic block text-red-700">Note: {order.debtNotes}</span>}
                  {order.debtDueDate && (
                    <span className="block font-semibold text-red-700">
                      Due: {new Date(order.debtDueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer Notes & Call to action */}
            <div className="text-center pt-4 space-y-2 text-[11px] text-gray-700">
              <p className="font-sans font-bold text-black text-xs">
                Thank you for ordering with us!
              </p>
              <p className="text-[10px] text-gray-600 font-sans">
                We appreciate your business and look forward to serving you again.
              </p>
              <div className="pt-2 border-t border-dotted border-gray-300 space-y-1 text-[10px] text-gray-600">
                <p className="font-semibold text-emerald-900">
                  For deliveries or inquiries, call: <span className="font-bold">{settings.phone || '+255713057325'}</span>
                </p>
                <p>
                  Visit us at: {settings.address?.split('\n')[0]?.trim() || 'Village House (Kijiji), Lipangalala Street, Ifakara.'}
                </p>
              </div>
              <div className="py-1 tracking-widest text-xs font-bold text-gray-400 select-none">
                ||| ||||| || |||| ||| |||||||
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="p-3.5 px-4 bg-gray-50 border-t border-[#e2e4dc] flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            title="Download receipt as .txt file matching Python receipt export"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="py-2 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            title="Copy formatted receipt text to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-3 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3 rounded-xl border border-[#e2e4dc] bg-white text-[#4c5a52] text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

