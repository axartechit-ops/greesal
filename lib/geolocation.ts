/**
 * Enhanced Geolocation & Reverse Geocoding Utility for Greesal
 * Formats detailed Indian delivery addresses including building, society, landmark, road, area, city, and pincode.
 */

export interface DetailedAddress {
  formattedAddress: string;
  buildingOrSociety?: string;
  roadOrStreet?: string;
  areaOrSuburb?: string;
  city?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
}

export async function getLiveDetailedLocation(): Promise<DetailedAddress> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 1. Query Nominatim with maximum address detail resolution
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=19&addressdetails=1&extratags=1&namedetails=1`,
            {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const namedetails = data.namedetails || {};

            // Extract Society / Building / Apartment / Landmark name
            const societyOrBuilding =
              addr.building ||
              addr.house_name ||
              addr.residential ||
              addr.apartments ||
              addr.commercial ||
              addr.amenity ||
              addr.office ||
              addr.leisure ||
              addr.place ||
              namedetails.name ||
              '';

            // Extract Road / Street / Landmark
            const road =
              addr.road ||
              addr.street ||
              addr.pedestrian ||
              addr.neighbourhood ||
              '';

            // Extract Area / Suburb / Locality (e.g. Katargam, Adajan, Vesu, Varachha)
            const area =
              addr.suburb ||
              addr.city_district ||
              addr.quarter ||
              addr.neighbourhood ||
              addr.residential ||
              'Katargam';

            // Extract City
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.state_district ||
              'Surat';

            // Extract Pincode
            const pincode = addr.postcode || '';

            // Assemble structured address components
            const parts: string[] = [];

            if (societyOrBuilding) {
              parts.push(societyOrBuilding);
            }

            if (road && road !== societyOrBuilding) {
              parts.push(road);
            }

            if (area && area !== road && area !== societyOrBuilding) {
              parts.push(area);
            }

            if (city && !parts.includes(city)) {
              parts.push(city);
            }

            let fullFormatted = parts.filter(Boolean).join(', ');

            if (pincode) {
              fullFormatted += ` - ${pincode}`;
            }

            // Fallback to display name if parts array was too sparse
            if (!fullFormatted || parts.length <= 1) {
              fullFormatted = data.display_name
                ? data.display_name.split(',').slice(0, 4).join(', ')
                : `Near Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}, ${city} - ${pincode || '395004'}`;
            }

            resolve({
              formattedAddress: fullFormatted,
              buildingOrSociety: societyOrBuilding,
              roadOrStreet: road,
              areaOrSuburb: area,
              city,
              pincode,
              latitude,
              longitude,
            });
            return;
          }
        } catch (fetchErr) {
          console.warn('Reverse geocoding fetch error, using coordinate fallback:', fetchErr);
        }

        // Fallback if reverse geocode service fails
        resolve({
          formattedAddress: `Live GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Katargam, Surat - 395004`,
          city: 'Surat',
          pincode: '395004',
          latitude,
          longitude,
        });
      },
      (error) => {
        let msg = 'Could not detect your live location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location permissions in your browser.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again or enter manually.';
        }
        reject(new Error(msg));
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  });
}
