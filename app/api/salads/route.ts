import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DEFAULT_SALADS } from '@/lib/salads';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const dbSalads = await db.collection('salads').find({}).toArray();

    if (dbSalads && dbSalads.length > 0) {
      const formatted = dbSalads.map((s) => ({
        ...s,
        _id: s._id.toString(),
        id: s.id || s._id.toString(),
      }));
      return NextResponse.json(formatted);
    }
  } catch (error: any) {
    console.warn('MongoDB offline or empty, using DEFAULT_SALADS:', error?.message);
  }

  return NextResponse.json(DEFAULT_SALADS);
}
