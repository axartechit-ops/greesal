import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  ShoppingBag, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  ReceiptText
} from 'lucide-react';
import { InvoiceModal, InvoiceOrder } from './InvoiceModal';

export interface ConfirmedOrderData {
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  items: Array<{
    id?: string;
    name: string;
    price: string;
    image: string;
    quantity: number;
  }>;
  total: number;
  deliveryAddress: string;
  deliverySlot: string;
  mapsUrl?: string;
  notes?: string;
  paymentMethod?: string;
}

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ConfirmedOrderData | null;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [copied, setCopied] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsAppChat = () => {
    const slotText = order.deliverySlot;
    const itemsText = order.items
      .map((it, idx) => `${idx + 1}. *${it.name}* x ${it.quantity} = ₹${(parseInt(it.price.replace(/[^\d]/g, ''), 10) || 0) * it.quantity}`)
      .join('\n');

    const message = `🥗 *ORDER CONFIRMED - GREESAL* 🥗\n\n` +
      `🆔 *Order ID:* ${order.orderNumber}\n` +
      `👤 *Customer Name:* ${order.customerName}\n` +
      `📞 *Mobile:* ${order.customerMobile}\n` +
      `⏰ *Delivery Slot:* ${slotText}\n` +
      `📍 *Address:* ${order.deliveryAddress}\n` +
      (order.mapsUrl ? `🗺️ *Live GPS Pin:* ${order.mapsUrl}\n` : '') +
      (order.notes ? `📝 *Notes:* ${order.notes}\n` : '') +
      `\n🛒 *ITEMS:*\n${itemsText}\n\n` +
      `💰 *Grand Total:* ₹${order.total} (Free Delivery)\n\n` +
      `✨ *Farm-Fresh Organic Salad Bowls! Please confirm preparation and rider assignment.*`;

    window.open(`https://wa.me/919825144321?text=${encodeURIComponent(message)}`, '_blank');
  };

  const invoiceOrderData: InvoiceOrder = {
    id: order.orderNumber,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerMobile: order.customerMobile,
    date: 'Today',
    status: 'Placed',
    items: order.items.map((it, idx) => ({
      id: it.id || `item-${idx + 1}`,
      name: it.name,
      price: it.price,
      image: it.image,
      quantity: it.quantity,
    })),
    subtotal: order.total,
    deliveryFee: 0,
    total: order.total,
    deliveryAddress: order.deliveryAddress,
    paymentMethod: order.paymentMethod || 'Cash / UPI on Delivery',
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto font-dmsans">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fadeIn"
          onClick={onClose}
        />

        <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
          <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-[#e4eae7] relative animate-fadeIn flex flex-col max-h-[92vh]">
            
            {/* Top Celebration Header */}
            <div className="bg-gradient-to-br from-[#123B2B] via-[#20493c] to-[#1C4D3A] text-white p-6 sm:p-7 relative text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-[#fbce45] text-[#123B2B] flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-white/20 animate-bounce">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#fbce45] text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Order Placed Successfully
              </span>

              <h3 className="font-montserrat font-extrabold text-2xl text-white">
                Sent to Greesal Kitchen!
              </h3>
              <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto font-medium">
                Fresh organic ingredients are being prepped. Farm-Fresh Organic Salad Bowls!
              </p>

              {/* Order ID Tag */}
              <div className="mt-4 inline-flex items-center gap-2 bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold">
                <span className="text-gray-300">Order ID:</span>
                <span className="font-mono text-[#fbce45] font-black">{order.orderNumber}</span>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1 rounded-full hover:bg-white/20 text-gray-200 transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#fbce45]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Scrollable Order Details */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Delivery Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#fbfdfb] p-3.5 rounded-2xl border border-gray-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Customer</span>
                  <p className="font-bold text-[#123B2B] text-xs">{order.customerName}</p>
                  <p className="text-gray-500 font-medium text-[11px]">{order.customerMobile}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Slot</span>
                  <p className="font-bold text-[#20493c] text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#fbce45]" />
                    <span>{order.deliverySlot}</span>
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    ✓ Free Delivery
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#20493c]" />
                  <span>Delivery Address in Surat</span>
                </span>
                <p className="text-gray-900 font-semibold text-xs leading-relaxed">
                  {order.deliveryAddress}
                </p>
                {order.mapsUrl && (
                  <a
                    href={order.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#20493c] hover:underline pt-1"
                  >
                    <span>📍 View Attached Google Maps Location Pin</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#20493c]" />
                  <span>Order Items ({order.items.reduce((sum, it) => sum + it.quantity, 0)})</span>
                </span>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {order.items.map((item, idx) => {
                    const priceNum = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 0;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-white shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="truncate">
                            <p className="font-bold text-[#123B2B] truncate">{item.name}</p>
                            <span className="text-[11px] text-gray-500 font-medium">
                              Qty: {item.quantity} &times; ₹{priceNum}
                            </span>
                          </div>
                        </div>

                        <span className="font-black text-[#123B2B] text-xs flex-shrink-0">
                          ₹{priceNum * item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-2xl bg-[#eef8f3] border border-[#6ac6ac]/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-600 block">Total Amount Paid / COD</span>
                  <span className="text-[10px] text-emerald-800 font-semibold">Payment on delivery accepted</span>
                </div>
                <div className="font-montserrat font-black text-xl text-[#123B2B]">
                  ₹{order.total}
                </div>
              </div>

            </div>

            {/* Action Buttons Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#f8faf9] space-y-2">
              <button
                type="button"
                onClick={handleOpenWhatsAppChat}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>Open WhatsApp Support / Delivery Chat</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-[#123B2B] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ReceiptText className="w-4 h-4 text-[#20493c]" />
                  <span>View / Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Done &amp; Browse Menu</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoiceOpen && (
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          order={invoiceOrderData}
        />
      )}
    </>
  );
};
