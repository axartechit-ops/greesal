import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// No demo orders (deleted GRS-84920, GRS-79214, GRS-61803)
const defaultOrders: any[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile')?.trim();
    const email = searchParams.get('email')?.trim();

    const client = await clientPromise;
    const db = client.db();

    const ordersCollection = db.collection('orders');
    
    // Purge deleted demo orders if present in database
    await ordersCollection.deleteMany({
      $or: [
        { orderNumber: { $in: ['GRS-84920', 'GRS-79214', 'GRS-61803'] } },
        { id: { $in: ['GRS-84920', 'GRS-79214', 'GRS-61803'] } }
      ]
    }).catch(() => {});

    const filter: any = {};
    if (mobile) {
      const cleanDigits = mobile.replace(/\D/g, '').slice(-10);
      if (cleanDigits) {
        filter.customerMobile = { $regex: cleanDigits, $options: 'i' };
      }
    } else if (email) {
      filter.customerEmail = { $regex: `^${email}$`, $options: 'i' };
    }

    const orders = await ordersCollection.find(filter).sort({ timestamp: -1 }).toArray();

    const formattedOrders = orders
      .filter((o) => !['GRS-84920', 'GRS-79214', 'GRS-61803'].includes(o.orderNumber || o.id))
      .map((o) => ({
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

    const queryList: any[] = [];
    if (_id) {
      if (ObjectId.isValid(_id)) queryList.push({ _id: new ObjectId(_id) });
      queryList.push({ _id: _id });
      queryList.push({ id: _id });
      queryList.push({ orderNumber: _id });
    }
    if (id) {
      if (ObjectId.isValid(id)) queryList.push({ _id: new ObjectId(id) });
      queryList.push({ _id: id });
      queryList.push({ id: id });
      queryList.push({ orderNumber: id });
    }

    if (queryList.length === 0) {
      return NextResponse.json({ error: 'Valid Order ID is required' }, { status: 400 });
    }

    const updateResult = await db.collection('orders').updateOne(
      { $or: queryList },
      { $set: { status, updatedAt: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

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

    const queryList: any[] = [{ id }, { orderNumber: id }, { _id: id }];
    if (ObjectId.isValid(id)) {
      queryList.push({ _id: new ObjectId(id) });
    }

    const result = await db.collection('orders').deleteOne({ $or: queryList });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
