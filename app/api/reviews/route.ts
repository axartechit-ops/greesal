import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DEFAULT_REVIEWS, CustomerReview } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Check if collection has documents
    const count = await db.collection('reviews').countDocuments();
    if (count === 0) {
      // Seed default reviews
      await db.collection('reviews').insertMany(DEFAULT_REVIEWS.map(r => {
        const { _id, ...rest } = r as any;
        return {
          ...rest,
          createdAt: new Date().toISOString(),
        };
      }) as any);
    }

    // Fetch approved reviews sorted by isPinned (desc), order (asc), and createdAt (desc)
    const reviews = await db.collection('reviews')
      .find({ status: { $ne: 'hidden' } })
      .sort({ isPinned: -1, order: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(DEFAULT_REVIEWS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, location, role, text, rating } = body;

    if (!name || !text) {
      return NextResponse.json(
        { error: 'Name and review text are required.' },
        { status: 400 }
      );
    }

    const newReview = {
      name: String(name).trim().slice(0, 80),
      location: location ? String(location).trim().slice(0, 80) : 'Surat',
      role: role ? String(role).trim().slice(0, 80) : 'Verified Customer',
      text: String(text).trim().slice(0, 1000),
      rating: Number(rating) >= 1 && Number(rating) <= 5 ? Number(rating) : 5,
      isPinned: false,
      order: 99,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('reviews').insertOne(newReview as any);

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      review: { ...newReview, _id: result.insertedId },
    });
  } catch (error: any) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
