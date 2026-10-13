import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/siteSettings';

export const dynamic = 'force-dynamic';

// Global in-memory cache fallback for development without MongoDB
let inMemorySettings: SiteSettings = { ...DEFAULT_SITE_SETTINGS };

function sanitizeBrandSlogans(settings: any): SiteSettings {
  if (!settings || typeof settings !== 'object') return settings;
  const isOld = (txt?: string) =>
    typeof txt === 'string' &&
    (txt.toLowerCase().includes('apka salad apke dwar') ||
      txt.toLowerCase().includes('aapka salad aapke dwar'));

  if (isOld(settings.heroSlogan)) settings.heroSlogan = 'Farm-Fresh Organic Salad Bowls';
  if (isOld(settings.title)) settings.title = 'Farm-Fresh Organic Salad Bowls';
  if (isOld(settings.heroStoryP1)) {
    settings.heroStoryP1 = settings.heroStoryP1.replace(/a?apka salad a?apke dwar/gi, 'Farm-Fresh Organic Salad Bowls');
  }
  if (isOld(settings.description)) {
    settings.description = settings.description.replace(/a?apka salad a?apke dwar/gi, 'Farm-Fresh Organic Salad Bowls');
  }
  if (isOld(settings.heroStoryP3)) {
    settings.heroStoryP3 = settings.heroStoryP3.replace(/a?apka salad a?apke dwar/gi, 'Farm-Fresh Organic Salad Bowls');
  }
  if (!settings.differenceImage1) {
    settings.differenceImage1 = '/images/premium_fresh_ingredients.png';
  }
  if (!settings.contactPhone || settings.contactPhone.includes('98251') || settings.contactPhone.includes('95958')) {
    settings.contactPhone = '+91 99258 36117';
  }
  return settings;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    let settings = await db.collection('settings').findOne({ _id: 'homepage' as any });

    if (!settings) {
      // Seed initial homepage settings into MongoDB so database is populated
      const { _id, ...initialData } = DEFAULT_SITE_SETTINGS as any;
      await db.collection('settings').updateOne(
        { _id: 'homepage' as any },
        { $setOnInsert: initialData },
        { upsert: true }
      );
      settings = await db.collection('settings').findOne({ _id: 'homepage' as any });
    }

    if (settings) {
      const merged: SiteSettings = sanitizeBrandSlogans({ ...DEFAULT_SITE_SETTINGS, ...settings });
      inMemorySettings = merged;
      return NextResponse.json(merged);
    }
  } catch (error: any) {
    console.warn('Using in-memory settings store:', error?.message);
  }

  return NextResponse.json(sanitizeBrandSlogans(inMemorySettings));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Query DB first for existing stored settings so partial updates don't overwrite other tabs
    let existingSettings: Partial<SiteSettings> = inMemorySettings;
    try {
      const client = await clientPromise;
      const db = client.db();
      const dbSettings = await db.collection('settings').findOne({ _id: 'homepage' as any });
      if (dbSettings) {
        existingSettings = { ...DEFAULT_SITE_SETTINGS, ...inMemorySettings, ...dbSettings };
      }
    } catch (e) {
      // Fallback to in-memory if DB is offline
    }

    // Deep merge incoming updates with existing settings
    const updatedData: SiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...existingSettings,
      ...body,
    };

    // Bidirectional sync between Hero Banner studio fields and Homepage Hero settings
    if (body.title !== undefined) updatedData.heroSlogan = body.title;
    if (body.heroSlogan !== undefined) updatedData.title = body.heroSlogan;
    if (body.badgeText !== undefined) updatedData.heroBadge = body.badgeText;
    if (body.heroBadge !== undefined) updatedData.badgeText = body.heroBadge;
    if (body.pill1Text !== undefined) updatedData.heroPill1 = body.pill1Text;
    if (body.heroPill1 !== undefined) updatedData.pill1Text = body.heroPill1;
    if (body.pill2Text !== undefined) updatedData.heroPill2 = body.pill2Text;
    if (body.heroPill2 !== undefined) updatedData.pill2Text = body.heroPill2;
    if (body.highlight3Title !== undefined) updatedData.heroStatDelivered = body.highlight3Title;
    if (body.heroStatDelivered !== undefined) updatedData.highlight3Title = body.heroStatDelivered;
    if (body.highlight3Subtitle !== undefined) updatedData.heroStatBadge = body.highlight3Subtitle;
    if (body.heroStatBadge !== undefined) updatedData.highlight3Subtitle = body.heroStatBadge;
    if (body.description !== undefined) updatedData.heroStoryP1 = body.description;
    if (body.heroStoryP1 !== undefined) updatedData.description = body.heroStoryP1;

    // Ensure array objects are preserved if not provided in partial updates
    if (!body.categories || !Array.isArray(body.categories)) {
      updatedData.categories = existingSettings.categories || DEFAULT_SITE_SETTINGS.categories;
    }
    if (!body.differenceCards || !Array.isArray(body.differenceCards)) {
      updatedData.differenceCards = existingSettings.differenceCards || DEFAULT_SITE_SETTINGS.differenceCards;
    }
    if (!body.servicesCards || !Array.isArray(body.servicesCards)) {
      updatedData.servicesCards = existingSettings.servicesCards || DEFAULT_SITE_SETTINGS.servicesCards;
    }

    inMemorySettings = updatedData;

    const { _id, ...dataToSave } = updatedData as any;

    try {
      const client = await clientPromise;
      const db = client.db();

      await db.collection('settings').updateOne(
        { _id: 'homepage' as any },
        { $set: dataToSave },
        { upsert: true }
      );
    } catch (dbError) {
      console.warn('Saved to in-memory settings (MongoDB offline)');
    }

    return NextResponse.json({
      success: true,
      message: 'Store settings, categories and site texts saved successfully',
      settings: inMemorySettings,
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update store settings' }, { status: 500 });
  }
}
