import { NextRequest, NextResponse } from 'next/server';

// Verified Surat localities with coordinates for proximity detection
const SURAT_KNOWN_AREAS = [
  { name: 'Vesu (VIP Road)', lat: 21.1418, lng: 72.7758, pincode: '395007' },
  { name: 'Adajan (LP Savani Road)', lat: 21.1959, lng: 72.7933, pincode: '395009' },
  { name: 'Pal (Gaurav Path)', lat: 21.1983, lng: 72.7725, pincode: '395009' },
  { name: 'Piplod (Dumas Road)', lat: 21.1565, lng: 72.7754, pincode: '395007' },
  { name: 'City Light (Science Centre)', lat: 21.1685, lng: 72.7958, pincode: '395007' },
  { name: 'Althan (VIP Circle)', lat: 21.1492, lng: 72.8055, pincode: '395017' },
  { name: 'Ghod Dod Road', lat: 21.1762, lng: 72.8021, pincode: '395007' },
  { name: 'Athwagate / Athwa Lines', lat: 21.1780, lng: 72.8080, pincode: '395001' },
  { name: 'Nanpura / Timaliawad', lat: 21.1870, lng: 72.8150, pincode: '395001' },
  { name: 'Varachha (Mini Bazar)', lat: 21.2185, lng: 72.8595, pincode: '395006' },
  { name: 'Katargam (Gotalawadi)', lat: 21.2268, lng: 72.8315, pincode: '395004' },
  { name: 'Rander / Jahangirpura', lat: 21.2182, lng: 72.7845, pincode: '395005' },
  { name: 'Majura Gate / Ring Road', lat: 21.1730, lng: 72.8210, pincode: '395002' },
  { name: 'Udhna / Pandesara', lat: 21.1520, lng: 72.8380, pincode: '395021' },
  { name: 'Dindoli', lat: 21.1650, lng: 72.8680, pincode: '395012' },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findClosestSuratArea(lat: number, lng: number) {
  let closest = SURAT_KNOWN_AREAS[0];
  let minDistance = Infinity;

  for (const area of SURAT_KNOWN_AREAS) {
    const dist = getDistanceKm(lat, lng, area.lat, area.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = area;
    }
  }

  return { ...closest, distanceKm: minDistance };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    let detectedAddress = '';
    let locality = '';
    let city = 'Surat';
    let postcode = '';
    let state = 'Gujarat';

    const closestSurat = findClosestSuratArea(latitude, longitude);
    const isWithinSuratRegion = closestSurat.distanceKm < 35;

    // 1. Try OpenStreetMap Nominatim First (Very detailed street-level & neighbourhood for Surat)
    try {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'GreesalSaladSurat/2.0 (order@greesal.in)',
            'Accept-Language': 'en',
          },
          cache: 'no-store',
        }
      );
      if (osmRes.ok) {
        const osmData = await osmRes.json();
        const addr = osmData.address || {};
        const road = addr.road || addr.street || addr.residential || addr.suburb || addr.neighbourhood || '';
        const sub = addr.suburb || addr.neighbourhood || addr.city_district || '';
        const c = addr.city || addr.town || 'Surat';
        const p = addr.postcode || closestSurat.pincode || '';
        locality = sub || road || closestSurat.name;
        postcode = p;

        const areaName = road || sub || (isWithinSuratRegion ? closestSurat.name : '');
        const parts = [
          areaName,
          sub && sub !== road && sub !== areaName ? sub : '',
          c,
          p ? `${p}` : '',
        ].filter(Boolean);

        if (parts.length > 0) {
          detectedAddress = parts.join(', ');
        }
      }
    } catch (osmErr) {
      console.warn('OSM Nominatim geocode failed:', osmErr);
    }

    // 2. Fallback to BigDataCloud Reverse Geocoding
    if (!detectedAddress || detectedAddress.length < 5) {
      try {
        const bdcRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
        );
        if (bdcRes.ok) {
          const bdcData = await bdcRes.json();
          locality = bdcData.locality || bdcData.subLocality || closestSurat.name;
          city = bdcData.city || 'Surat';
          postcode = bdcData.postcode || closestSurat.pincode || '';
          state = bdcData.principalSubdivision || 'Gujarat';

          const informative = bdcData.localityInfo?.informative || [];
          const areaInfo = informative
            .filter((i: any) => 
              i.order >= 5 && 
              i.name && 
              !i.name.toLowerCase().includes('india') &&
              !i.name.toLowerCase().includes('railway') &&
              !i.name.toLowerCase().includes('council') &&
              !i.name.toLowerCase().includes('zonal') &&
              !i.name.toLowerCase().includes('gujarat')
            )
            .map((i: any) => i.name)
            .slice(0, 2)
            .join(', ');

          const resolvedArea = areaInfo || locality || closestSurat.name;
          const parts = [resolvedArea, city, postcode ? `${postcode}` : ''].filter(Boolean);
          detectedAddress = parts.join(', ');
        }
      } catch (e) {
        console.warn('BigDataCloud geocode failed:', e);
      }
    }

    // 3. Clean fallback if coordinates are in Surat
    if (!detectedAddress || detectedAddress.length < 4 || detectedAddress.toLowerCase().includes('zonal')) {
      if (isWithinSuratRegion) {
        detectedAddress = `${closestSurat.name}, Surat - ${closestSurat.pincode}`;
      } else {
        detectedAddress = `GPS Pin (${latitude.toFixed(5)}, ${longitude.toFixed(5)}), Surat`;
      }
    }

    return NextResponse.json({
      success: true,
      address: detectedAddress,
      locality: locality || closestSurat.name,
      city: city || 'Surat',
      postcode: postcode || closestSurat.pincode,
      state: state || 'Gujarat',
      isWithinSuratRegion,
      closestSuratArea: closestSurat.name,
      distanceToClosestSuratKm: Math.round(closestSurat.distanceKm * 10) / 10,
      lat: latitude,
      lng: longitude,
      mapsUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to detect location' },
      { status: 500 }
    );
  }
}
