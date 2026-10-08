import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Initial seed orders if database is fresh
const defaultOrders = [
  {
    orderNumber: 'GRS-84920',
    customerName: 'Sanket Maru',
    customerEmail: 'sanketmaru.50@gmail.com',
    customerMobile: '9595866352',
    date: 'Today, 1:15 PM',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    status: 'Delivered',
    items: [
      {
        id: '1',
        name: 'Premium High Protein Salad',
        price: '₹349',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        quantity: 1
      },
      {
        id: '2',
        name: 'Premium Burrito Salad',
        price: '₹369',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        quantity: 1
      }
    ],
    subtotal: 718,
    deliveryFee: 0,
    total: 718,
    deliveryAddress: 'Flat 402, Green Valley Heights, Katargam, Surat - 395004',
    paymentMethod: 'Google Pay (UPI)'
  },
  {
    orderNumber: 'GRS-79214',
    customerName: 'Pooja Patel',
    customerEmail: 'pooja.patel@gmail.com',
    customerMobile: '9825144321',
    date: 'Yesterday, 7:45 PM',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    status: 'Delivered',
    items: [
      {
        id: '3',
        name: 'Crunchy Peanut Butter Salad',
        price: '₹329',
        image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80',
        quantity: 2
      }
    ],
    subtotal: 658,
    deliveryFee: 0,
    total: 658,
    deliveryAddress: '302, Royal Residency, Adajan, Surat - 395009',
    paymentMethod: 'Online UPI'
  },
  {
    orderNumber: 'GRS-61803',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@yahoo.com',
    customerMobile: '9925836117',
    date: '22 Aug 2026, 12:30 PM',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
    status: 'Preparing',
    items: [
      {
        id: '4',
        name: 'Super Sprout Salad Bowl',
        price: '₹299',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        quantity: 1
      }
    ],
    subtotal: 299,
    deliveryFee: 0,
    total: 299,
    deliveryAddress: 'Katargam, Surat - 395004',
    paymentMethod: 'Cash on Delivery'
  }
];

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const ordersCollection = db.collection('orders');
    let orders = await ordersCollection.find({}).sort({ timestamp: -1 }).toArray();

    // If no orders exist yet in database, seed initial demo orders
    if (orders.length === 0) {
      await ordersCollection.insertMany(defaultOrders);
      orders = await ordersCollection.find({}).sort({ timestamp: -1 }).toArray();
    }

    const formattedOrders = orders.map((o) => ({
      ...o,
      _id: o._id.toString(),
      id: o.orderNumber || o.id || `GRS-${o._id.toString().slice(-5).toUpperCase()}`
    }));

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    // Fallback to default orders if database connection has temporary issue
    return NextResponse.json(defaultOrders.map((o, idx) => ({ ...o, _id: `temp-${idx}`, id: o.orderNumber })));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      orderNumber,
      customerName = 'Greesal Member',
      customerEmail = '',
      customerMobile = '',
      items = [],
      subtotal = 0,
      deliveryFee = 0,
      total = 0,
      deliveryAddress = '',
      deliverySlot = 'lunch',
      mapsUrl = '',
      locationCoords = null,
      notes = '',
      orderType = 'salad_order',
      dietPreference = '',
      paymentMethod = 'Cash on Delivery / UPI on Delivery',
      status = 'Placed'
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = `Today, ${timeString}`;
    const generatedId = orderNumber || id || `GRS-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      id: generatedId,
      orderNumber: generatedId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerMobile: customerMobile.trim(),
      date: formattedDate,
      timestamp: Date.now(),
      status,
      items,
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      total: Number(total) || 0,
      deliveryAddress: deliveryAddress.trim(),
      deliverySlot,
      mapsUrl: mapsUrl || (locationCoords ? `https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}` : ''),
      locationCoords,
      notes: notes.trim(),
      orderType,
      dietPreference,
      paymentMethod,
      createdAt: now
    };

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('orders').insertOne(newOrder);

    return NextResponse.json({
      success: true,
      message: 'Order placed and recorded successfully',
      order: {
        ...newOrder,
        _id: result.insertedId.toString(),
        id: newOrder.orderNumber
      }
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { _id, id, status } = body;

    if (!_id && !id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const query: any = {};
    if (_id && ObjectId.isValid(_id)) {
      query._id = new ObjectId(_id);
    } else if (id) {
      query.$or = [{ orderNumber: id }, { id: id }];
    }

    const updateResult = await db.collection('orders').updateOne(
      query,
      { $set: { status, updatedAt: new Date() } }
    );

    return NextResponse.json({
      message: 'Order status updated successfully',
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    let query: any = {};
    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else {
      query.$or = [{ orderNumber: id }, { id: id }];
    }

    await db.collection('orders').deleteOne(query);

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
