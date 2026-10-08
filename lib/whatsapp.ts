export interface WhatsAppOrder {
  id: string;
  orderNumber?: string;
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  total: number;
  date?: string;
  paymentMethod?: string;
}

export function formatWhatsAppMessage(order: WhatsAppOrder): string {
  const orderId = order.orderNumber || order.id || 'GRS-ORDER';
  const itemsList = order.items
    .map(item => `• ${item.quantity}x ${item.name} (${item.price})`)
    .join('\n');

  return `*GREESAL ORGANIC SALADS - ORDER CONFIRMATION*
----------------------------------------
*Order ID:* #${orderId}
*Date:* ${order.date || 'Today'}

*Customer Information:*
- Name: ${order.customerName || 'Greesal Member'}
- Phone: ${order.customerMobile || 'Not provided'}
- Delivery Address: ${order.deliveryAddress || 'Standard Delivery Location'}

*Ordered Items:*
${itemsList}

*Total Amount:* ₹${order.total}
*Payment Method:* ${order.paymentMethod || 'Cash on Delivery / UPI'}
----------------------------------------
Freshly prepared upon order and delivered in 30 mins across Surat.`;
}

export function sendOrderToWhatsApp(order: WhatsAppOrder, targetMobile: string = '9825144321') {
  const cleanNumber = targetMobile.replace(/\D/g, '');
  // Default to India country code 91 if 10 digits
  const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
  const message = formatWhatsAppMessage(order);
  const encodedText = encodeURIComponent(message);
  
  const whatsappUrl = `https://wa.me/${fullNumber}?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
}
