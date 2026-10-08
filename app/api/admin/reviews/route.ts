import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { DEFAULT_REVIEWS, CustomerReview } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const count = await db.collection('reviews').countDocuments();
    if (count === 0) {
      await db.collection('reviews').insertMany(DEFAULT_REVIEWS.map(r => {
        const { _id, ...rest } = r as any;
        return {
          ...rest,
          createdAt: new Date().toISOString(),
        };
      }) as any);
    }

    const reviews = await db.collection('reviews')
      .find({})
      .sort({ isPinned: -1, order: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('Admin GET reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, reviewId, data, orderedIds } = body;
    const client = await clientPromise;
    const db = client.db();

    // 1. Set top 4 pinned reviews order
    if (action === 'setTopFour' && Array.isArray(orderedIds)) {
      // First unpin all
      await db.collection('reviews').updateMany({}, { $set: { isPinned: false, order: 99 } });
      
      // Pin the top selected ones with order 1..N
      for (let i = 0; i < orderedIds.length; i++) {
        const idStr = orderedIds[i];
        let query: any = { id: idStr };
        if (ObjectId.isValid(idStr)) {
          query = { $or: [{ _id: new ObjectId(idStr) }, { id: idStr }] };
        }
        await db.collection('reviews').updateOne(query, {
          $set: { isPinned: true, order: i + 1, status: 'approved' }
        });
      }

      const updated = await db.collection('reviews')
        .find({})
        .sort({ isPinned: -1, order: 1, createdAt: -1 })
        .toArray();

      return NextResponse.json({ success: true, reviews: updated });
    }

    // 2. Update specific review
    if (action === 'update' && reviewId) {
      const idStr = String(reviewId);
      const queryList: any[] = [{ id: idStr }, { _id: idStr }];
      if (ObjectId.isValid(idStr)) {
        queryList.push({ _id: new ObjectId(idStr) });
      }
      const query = { $or: queryList };

      const updateFields: any = { ...data, updatedAt: new Date().toISOString() };
      delete updateFields._id;
      delete updateFields.id;

      if (updateFields.rating !== undefined) {
        updateFields.rating = Number(updateFields.rating) || 5;
      }
      if (updateFields.isPinned !== undefined) {
        updateFields.isPinned = Boolean(updateFields.isPinned);
        if (updateFields.isPinned && updateFields.order === undefined) {
          updateFields.order = 1;
        }
      }

      await db.collection('reviews').updateOne(query, { $set: updateFields });

      const updated = await db.collection('reviews')
        .find({})
        .sort({ isPinned: -1, order: 1, createdAt: -1 })
        .toArray();

      return NextResponse.json({ success: true, reviews: updated });
    }

    // 3. Create new review as Admin
    if (action === 'create' || (!action && data?.name)) {
      const reviewPayload = data || body;
      const newReview: CustomerReview = {
        name: reviewPayload.name,
        location: reviewPayload.location || 'Surat',
        role: reviewPayload.role || 'Verified Customer',
        text: reviewPayload.text,
        rating: Number(reviewPayload.rating) || 5,
        isPinned: Boolean(reviewPayload.isPinned),
        order: Number(reviewPayload.order) || 99,
        status: reviewPayload.status || 'approved',
        createdAt: new Date().toISOString(),
      };

      const result = await db.collection('reviews').insertOne(newReview as any);
      return NextResponse.json({ success: true, review: { ...newReview, _id: result.insertedId } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin POST reviews error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }] };
    }

    await db.collection('reviews').deleteOne(query);

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Admin DELETE review error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
