'use client';

import React from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck, Leaf, Sparkles, MapPin, Phone, Mail, FileText, MessageSquare } from 'lucide-react';
import { GreesalLogo } from './GreesalLogo';
import { sendOrderToWhatsApp } from '@/lib/whatsapp';

export interface InvoiceOrder {
  id: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  date: string;
  timestamp?: number;
  status: string;
  items: Array<{
    id: string;
    name: string;
    price: string;
    image?: string;
    quantity: number;
    selectedAddOns?: Array<{ name: string; price: number }>;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: InvoiceOrder | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  if (!isOpen || !order) return null;

  const invoiceNumber = `INV-${order.orderNumber || order.id}`;
  const orderIdStr = order.orderNumber || order.id;

  const handlePrintDownload = () => {
    const printElement = document.getElementById('greesal-invoice-printable');
    if (!printElement) return;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Greesal_Invoice_${orderIdStr}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
              color: #123B2B;
              background: #ffffff;
              padding: 40px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .invoice-wrapper {
              max-width: 800px;
              margin: 0 auto;
              border: 1.5px solid #EBE2D3;
              border-radius: 24px;
              padding: 40px;
              background: #ffffff;
              box-shadow: 0 10px 30px rgba(0,0,0,0.03);
            }
            .brand-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #123B2B;
              padding-bottom: 24px;
              margin-bottom: 24px;
            }
            .logo-title {
              font-size: 26px;
              font-weight: 800;
              color: #123B2B;
              letter-spacing: -0.5px;
            }
            .tagline {
              font-size: 11px;
              font-weight: 700;
              color: #C89D4B;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 2px;
            }
            .subtext {
              font-size: 11px;
              color: #6B7280;
              margin-top: 6px;
              line-height: 1.4;
            }
            .invoice-badge {
              text-align: right;
            }
            .invoice-title {
              font-size: 22px;
              font-weight: 800;
              color: #123B2B;
              letter-spacing: -0.5px;
            }
            .status-pill {
              display: inline-block;
              padding: 4px 12px;
              background-color: #E8F3EE;
              color: #123B2B;
              font-size: 11px;
              font-weight: 800;
              border-radius: 20px;
              border: 1px solid #237357;
              margin-top: 6px;
              text-transform: uppercase;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
              margin-bottom: 28px;
            }
            .info-box {
              background: #FAF6F0;
              border: 1px solid #EBE2D3;
              border-radius: 16px;
              padding: 16px;
            }
            .box-title {
              font-size: 11px;
              font-weight: 800;
              color: #C89D4B;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .info-line {
              font-size: 12px;
              color: #1F2925;
              margin-bottom: 4px;
              line-height: 1.4;
            }
            .info-line strong {
              color: #123B2B;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th {
              background-color: #123B2B;
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 12px 16px;
              text-align: left;
            }
            th:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
            th:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; text-align: right; }
            td {
              padding: 14px 16px;
              border-bottom: 1px solid #F1F5F9;
              font-size: 13px;
              color: #1F2925;
            }
            td:last-child { text-align: right; font-weight: 700; color: #123B2B; }
            .totals-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 16px;
              padding-top: 16px;
              border-top: 1.5px solid #EBE2D3;
            }
            .seal-box {
              border: 2px dashed #237357;
              padding: 12px 18px;
              border-radius: 14px;
              background: #E8F3EE;
              max-width: 320px;
            }
            .seal-title {
              font-size: 11px;
              font-weight: 800;
              color: #123B2B;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .seal-desc {
              font-size: 10px;
              color: #5B6E66;
              margin-top: 3px;
            }
            .totals-box {
              width: 280px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #5B6E66;
              margin-bottom: 6px;
            }
            .total-row.grand {
              font-size: 16px;
              font-weight: 800;
              color: #123B2B;
              border-top: 2px solid #123B2B;
              padding-top: 8px;
              margin-top: 8px;
            }
            .footer-note {
              text-align: center;
              margin-top: 32px;
              padding-top: 20px;
              border-top: 1px solid #EBE2D3;
              font-size: 11px;
              color: #8C9B93;
            }
            @media print {
              body { padding: 0; }
              .invoice-wrapper { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printElement.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Tax breakdown calculation (5% GST included)
  const gstPercentage = 5;
  const subtotalBeforeTax = Math.round(order.total / (1 + gstPercentage / 100));
  const totalTaxAmount = order.total - subtotalBeforeTax;
  const cgstAmount = (totalTaxAmount / 2).toFixed(2);
  const sgstAmount = (totalTaxAmount / 2).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-[#123B2B]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 text-left animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-greesal-lightgreen border border-greesal-emerald/20 flex items-center justify-center text-[#123B2B]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#123B2B]">
                Tax Invoice &amp; Official Bill
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Order #{orderIdStr} &bull; Auto-Generated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => sendOrderToWhatsApp(order, '9825144321')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Send to Greesal WhatsApp 9825144321"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp (9825144321)</span>
            </button>

            <button
              type="button"
              onClick={handlePrintDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#123B2B] hover:bg-[#1C4D3A] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Container */}
        <div id="greesal-invoice-printable" className="p-6 sm:p-8 bg-white border border-[#EBE2D3] rounded-2xl shadow-2xs space-y-6">
          
          {/* Bill Brand Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#123B2B] pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <GreesalLogo size="sm" />
              </div>
              <p className="text-[11px] font-extrabold text-[#C89D4B] uppercase tracking-widest mt-1">
                Slice of Green &bull; 100% Clean Organic Salads
              </p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Greesal Organic Foods Pvt. Ltd.<br />
                FSSAI Lic No: <strong>10724999000182</strong> &bull; GSTIN: <strong>24AAACG8892P1Z9</strong><br />
                102-105 Organic Park, Katargam, Surat - 395004, Gujarat
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-greesal-lightgreen border border-greesal-emerald/30 text-[#123B2B] font-black text-xs uppercase tracking-wider rounded-full mb-2">
                OFFICIAL TAX INVOICE
              </span>
              <h2 className="text-lg font-black text-[#123B2B]">{invoiceNumber}</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Date: <strong>{order.date}</strong></p>
              <p className="text-xs text-emerald-800 font-bold mt-1">
                Payment: <span className="underline">{order.paymentMethod || 'Paid (Online UPI)'}</span>
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#EBE2D3] space-y-1.5 text-xs text-left">
              <span className="text-[10px] font-extrabold text-[#C89D4B] uppercase tracking-wider block">
                Billed To Customer
              </span>
              <p className="font-extrabold text-sm text-[#123B2B]">
                {order.customerName || 'Greesal Valued Member'}
              </p>
              {order.customerMobile && (
                <p className="text-gray-600 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" /> {order.customerMobile}
                </p>
              )}
              {order.customerEmail && (
                <p className="text-gray-600 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" /> {order.customerEmail}
                </p>
              )}
            </div>

            <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#EBE2D3] space-y-1.5 text-xs text-left">
              <span className="text-[10px] font-extrabold text-[#C89D4B] uppercase tracking-wider block">
                Delivery Destination
              </span>
              <p className="font-extrabold text-sm text-[#123B2B] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Express Organic Delivery</span>
              </p>
              <p className="text-gray-700 font-medium leading-relaxed mt-1">
                {order.deliveryAddress || 'Standard Delivery Location'}
              </p>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#123B2B] text-white">
                  <th className="p-3 font-bold rounded-l-xl">#</th>
                  <th className="p-3 font-bold">Salad Item Description</th>
                  <th className="p-3 font-bold text-center">Qty</th>
                  <th className="p-3 font-bold text-right">Unit Price</th>
                  <th className="p-3 font-bold text-right rounded-r-xl">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, index) => {
                  const numericPrice = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
                  const itemTotal = numericPrice * item.quantity;

                  return (
                    <tr key={index} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3 font-bold text-gray-400">{index + 1}</td>
                      <td className="p-3 font-bold text-[#123B2B]">
                        {item.name}
                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selectedAddOns.map((addon, aIdx) => (
                              <span key={aIdx} className="text-[10px] font-semibold bg-[#E8F3EE] text-[#144C38] px-1.5 py-0.5 rounded border border-[#237357]/20">
                                + {addon.name} (+₹{addon.price})
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="block text-[10px] font-semibold text-emerald-700 mt-0.5">
                          100% Farm Organic &bull; Fresh Chef Prepared
                        </span>
                      </td>
                      <td className="p-3 text-center font-extrabold text-gray-800">{item.quantity}</td>
                      <td className="p-3 text-right font-medium text-gray-600">₹{numericPrice}</td>
                      <td className="p-3 text-right font-black text-[#123B2B]">₹{itemTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Calculation Row */}
          <div className="flex flex-col sm:flex-row justify-between items-end pt-4 border-t border-[#EBE2D3] gap-4">
            
            {/* Authenticity Stamp */}
            <div className="bg-[#E8F3EE] p-3.5 rounded-xl border border-dashed border-[#237357] max-w-sm text-left">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#123B2B]">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Certified Organic Quality Seal</span>
              </div>
              <p className="text-[11px] text-[#5B6E66] mt-1 leading-snug">
                Thank you for choosing Greesal! Prepared fresh with zero preservatives. This computer-generated tax invoice requires no physical signature.
              </p>
            </div>

            {/* Price Calculations */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-gray-800">₹{subtotalBeforeTax}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST (2.5%):</span>
                <span className="font-medium">₹{cgstAmount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (2.5%):</span>
                <span className="font-medium">₹{sgstAmount}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Express Shipping Fee:</span>
                <span className="font-extrabold">FREE (₹0)</span>
              </div>
              <div className="border-t-2 border-[#123B2B] pt-2 flex justify-between text-sm font-black text-[#123B2B]">
                <span>Grand Total Paid:</span>
                <span className="text-base text-[#123B2B]">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
            Greesal Organic Salads &bull; Customer Care: <strong>support@greesal.com</strong> | <strong>+91 98765 43210</strong>
          </div>
        </div>

        {/* Modal Bottom Close Action */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
