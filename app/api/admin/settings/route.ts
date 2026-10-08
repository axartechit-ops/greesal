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
  if (typeof settings.heroStatBadge === 'string' && settings.heroStatBadge.toLowerCase().includes('surat health')) {
    settings.heroStatBadge = settings.heroStatBadge.replace(/surat\s*health/gi, 'Health').trim();
  }
  if (typeof settings.highlight3Subtitle === 'string' && settings.highlight3Subtitle.toLowerCase().includes('surat health')) {
    settings.highlight3Subtitle = settings.highlight3Subtitle.replace(/surat\s*health/gi, 'Health').trim();
  }
  if (typeof settings.heroBadge === 'string' && (settings.heroBadge.toLowerCase().includes('surat') || settings.heroBadge.toLowerCase().includes('fresh & organic'))) {
    settings.heroBadge = '';
  }
  if (typeof settings.badgeText === 'string' && (settings.badgeText.toLowerCase().includes('surat') || settings.badgeText.toLowerCase().includes('fresh & organic'))) {
    settings.badgeText = '';
  }
  if (settings.differenceImage2 === '/images/reference_ui.png' || settings.differenceImage2 === '/images/reference_ui_retina.png') {
    settings.differenceImage2 = '';
  }
  if (!settings.differenceImage1) {
    settings.differenceImage1 = '/images/premium_fresh_ingredients.png';
  }
  if (settings.servicesCards && Array.isArray(settings.servicesCards)) {
    settings.servicesCards = settings.servicesCards
      .filter((card: any) => card.id !== 2)
      .map((card: any) => {
        if (card.id === 1 && (!card.image || card.image.includes('photo-1540420773420-3366772f4999'))) {
          return { ...card, image: '/images/salad_single_order.jpg' };
        }
        return card;
      });
  }
  return settings;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const settings = await db.collection('settings').findOne({ _id: 'homepage' as any });

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

    // Deep merge incoming updates with current settings
    const updatedData: SiteSettings = {
      ...inMemorySettings,
      ...body,
    };

    // Bidirectional sync between Hero Banner studio fields and Homepage Hero settings
    if (body.title && !body.heroSlogan) updatedData.heroSlogan = body.title;
    if (body.heroSlogan && !body.title) updatedData.title = body.heroSlogan;
    if (body.badgeText && !body.heroBadge) updatedData.heroBadge = body.badgeText;
    if (body.heroBadge && !body.badgeText) updatedData.badgeText = body.heroBadge;
    if (body.pill1Text && !body.heroPill1) updatedData.heroPill1 = body.pill1Text;
    if (body.heroPill1 && !body.pill1Text) updatedData.pill1Text = body.heroPill1;
    if (body.pill2Text && !body.heroPill2) updatedData.heroPill2 = body.pill2Text;
    if (body.heroPill2 && !body.pill2Text) updatedData.pill2Text = body.heroPill2;
    if (body.highlight3Title && !body.heroStatDelivered) updatedData.heroStatDelivered = body.highlight3Title;
    if (body.highlight3Subtitle && !body.heroStatBadge) updatedData.heroStatBadge = body.highlight3Subtitle;
    if (body.description && !body.heroStoryP1) updatedData.heroStoryP1 = body.description;

    // Ensure array objects are preserved if not provided
    if (!body.categories || !Array.isArray(body.categories)) {
      updatedData.categories = inMemorySettings.categories || DEFAULT_SITE_SETTINGS.categories;
    }
    if (!body.differenceCards || !Array.isArray(body.differenceCards)) {
      updatedData.differenceCards = inMemorySettings.differenceCards || DEFAULT_SITE_SETTINGS.differenceCards;
    }
    if (!body.servicesCards || !Array.isArray(body.servicesCards)) {
      updatedData.servicesCards = inMemorySettings.servicesCards || DEFAULT_SITE_SETTINGS.servicesCards;
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
