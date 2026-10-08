import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      name,
      calories,
      protein,
      price,
      tag,
      image,
      ingredients = [],
      gravy = [],
      healthBenefits = [],
      additionalBenefits = [],
      perfectFor = [],
      nutrition = {},
      addOns = [],
    } = body;

    if (!id || !name || !calories || !protein || !price || !tag || !image) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('salads').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          calories,
          protein,
          price,
          tag,
          image,
          ingredients,
          gravy,
          healthBenefits,
          additionalBenefits,
          perfectFor,
          nutrition,
          addOns,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Salad not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Salad updated successfully' });
  } catch (error: any) {
    console.error('Update salad error:', error);
    return NextResponse.json({ error: 'Failed to update salad' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('salads').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Salad not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Salad deleted successfully' });
  } catch (error: any) {
    console.error('Delete salad error:', error);
    return NextResponse.json({ error: 'Failed to delete salad' }, { status: 500 });
  }
}
