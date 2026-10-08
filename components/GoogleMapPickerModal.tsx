import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Check, 
  Loader2, 
  Search, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface GoogleMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (locationData: { address: string; lat: number; lng: number; mapsUrl: string }) => void;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
}

// Popular Surat Localities with Exact Verified Coordinates
const SURAT_PRESET_LOCATIONS = [
  { name: 'Vesu (VIP Road / Someshwara)', lat: 21.1418, lng: 72.7758, address: 'VIP Road, Vesu, Surat - 395007' },
  { name: 'Adajan (LP Savani Road / Prime)', lat: 21.1959, lng: 72.7933, address: 'LP Savani Road, Adajan, Surat - 395009' },
  { name: 'Pal (Gaurav Path / Pal Gam)', lat: 21.1983, lng: 72.7725, address: 'Gaurav Path, Pal, Surat - 395009' },
  { name: 'Piplod (Dumas Road / VR Mall)', lat: 21.1565, lng: 72.7754, address: 'Dumas Road, Piplod, Surat - 395007' },
  { name: 'City Light (Science Centre)', lat: 21.1685, lng: 72.7958, address: 'City Light Town, Surat - 395007' },
  { name: 'Althan (VIP Circle / Bhimrad)', lat: 21.1492, lng: 72.8055, address: 'Althan VIP Circle, Surat - 395017' },
  { name: 'Ghod Dod Road (Kakadiya)', lat: 21.1762, lng: 72.8021, address: 'Ghod Dod Road, Surat - 395007' },
  { name: 'Athwagate / Athwa Lines', lat: 21.1780, lng: 72.8080, address: 'Athwagate, Athwa Lines, Surat - 395001' },
  { name: 'Nanpura / Timaliawad', lat: 21.1870, lng: 72.8150, address: 'Nanpura, Timaliawad, Surat - 395001' },
  { name: 'Varachha (Mini Bazar / Hirabaug)', lat: 21.2185, lng: 72.8595, address: 'Varachha Main Road, Surat - 395006' },
  { name: 'Katargam (Gotalawadi / Kiran)', lat: 21.2268, lng: 72.8315, address: 'Katargam, Surat - 395004' },
  { name: 'Rander / Jahangirpura', lat: 21.2182, lng: 72.7845, address: 'Rander Road, Jahangirpura, Surat - 395005' },
  { name: 'Majura Gate / Ring Road', lat: 21.1730, lng: 72.8210, address: 'Majura Gate, Ring Road, Surat - 395002' },
  { name: 'Udhna / Pandesara', lat: 21.1520, lng: 72.8380, address: 'Udhna Main Road, Surat - 395021' },
  { name: 'Dindoli', lat: 21.1650, lng: 72.8680, address: 'Dindoli, Surat - 395012' },
];

export const GoogleMapPickerModal: React.FC<GoogleMapPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirmLocation,
  initialAddress = '',
  initialLat = 21.1702,
  initialLng = 72.8311,
}) => {
  const [lat, setLat] = useState<number>(initialLat || 21.1702);
  const [lng, setLng] = useState<number>(initialLng || 72.8311);
  const [address, setAddress] = useState<string>(initialAddress || '');
  const [flatNumber, setFlatNumber] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng) {
        setLat(initialLat);
        setLng(initialLng);
      }
      if (initialAddress) {
        setAddress(initialAddress);
      }
      setGpsError(null);
    }
  }, [isOpen, initialLat, initialLng, initialAddress]);

  if (!isOpen) return null;

  // Handle GPS Live Current Location Detection
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please choose your Surat locality below.');
      return;
    }

    setIsDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const curLat = position.coords.latitude;
        const curLng = position.coords.longitude;
        setLat(curLat);
        setLng(curLng);
        const acc = Math.round(position.coords.accuracy || 15);
        setAccuracy(acc);

        try {
          const res = await fetch(`/api/location/reverse-geocode?lat=${curLat}&lng=${curLng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.address) {
              setAddress(data.address);
            } else if (data.closestSuratArea) {
              setAddress(`Near ${data.closestSuratArea}, Surat`);
            } else {
              setAddress(`GPS Pin (${curLat.toFixed(5)}, ${curLng.toFixed(5)}), Surat`);
            }
          }
        } catch (e) {
          setAddress(`GPS Pin (${curLat.toFixed(5)}, ${curLng.toFixed(5)}), Surat`);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('GPS permission was denied. Please pick your Surat area from the list below.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('GPS request timed out. Please pick your Surat area from the list below.');
        } else {
          setGpsError('Could not detect GPS location. Please choose your Surat locality below.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Handle selecting a preset Surat locality
  const handleSelectPreset = (preset: typeof SURAT_PRESET_LOCATIONS[0]) => {
    setLat(preset.lat);
    setLng(preset.lng);
    setAddress(preset.address);
    setAccuracy(null);
    setGpsError(null);
  };

  const handleConfirm = () => {
    const fullCombinedAddress = flatNumber.trim()
      ? `${flatNumber.trim()}, ${address.trim() || 'Surat'}`
      : address.trim() || 'Surat Doorstep';

    // Persist to localStorage
    try {
      localStorage.setItem('greesal_user_address', fullCombinedAddress);
      localStorage.setItem('greesal_user_lat', lat.toString());
      localStorage.setItem('greesal_user_lng', lng.toString());
    } catch (e) {
      // ignore
    }

    onConfirmLocation({
      address: fullCombinedAddress,
      lat,
      lng,
      mapsUrl: `https://maps.google.com/?q=${lat},${lng}`,
    });
    onClose();
  };

  const filteredPresets = searchQuery.trim()
    ? SURAT_PRESET_LOCATIONS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SURAT_PRESET_LOCATIONS;

  const embedMapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-dmsans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-[#e4eae7] relative animate-fadeIn flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#f8faf9]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#20493c] text-white flex items-center justify-center shadow-xs">
                <MapPin className="w-5 h-5 text-[#fbce45]" />
              </div>
              <div>
                <h3 className="font-montserrat font-extrabold text-base sm:text-lg text-[#20493c]">
                  Google Map Delivery Location
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  Pinpoint your live GPS coordinates in Surat for exact doorstep delivery
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
            
            {/* Live GPS Detection Button & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleDetectLiveLocation}
                disabled={isDetecting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#20493c] hover:bg-[#15342a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer flex-shrink-0 active:scale-95"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#fbce45]" />
                    <span>Detecting GPS Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-[#fbce45]" />
                    <span>🎯 Detect My Current Live Location</span>
                  </>
                )}
              </button>

              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter Surat areas (e.g. Vesu, Adajan, Pal, Piplod)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#20493c]"
                />
              </div>
            </div>

            {gpsError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Quick Surat Area Selector Chips */}
            <div>
              <span className="text-[11px] font-bold text-gray-600 block mb-1.5">
                📍 Tap Your Surat Area / Locality:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {filteredPresets.map((preset) => {
                  const isSelected = Math.abs(preset.lat - lat) < 0.006 && Math.abs(preset.lng - lng) < 0.006;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#20493c] text-white border-[#20493c] shadow-xs ring-2 ring-[#fbce45]/60'
                          : 'bg-[#f7faf8] text-gray-700 border-gray-200 hover:border-[#6ac6ac] hover:bg-white'
                      }`}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Google Map Live Visual Embed */}
            <div className="rounded-2xl overflow-hidden border border-gray-300 shadow-inner bg-gray-100 relative h-48 sm:h-56">
              <iframe
                title="Google Maps Location Pin"
                src={embedMapUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200 text-[10px] font-bold text-[#123B2B] shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>GPS Pin: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
                {accuracy && <span className="text-gray-400 font-normal">(&plusmn;{accuracy}m)</span>}
              </div>
            </div>

            {/* Address Details Fields */}
            <div className="space-y-2.5 bg-[#fbfdfb] p-3.5 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-[11px] font-bold text-[#123B2B] mb-1">
                  Flat / House No. / Building Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Green Orchid Heights"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#20493c]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#123B2B] mb-1">
                  Street, Locality &amp; Pincode in Surat
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. VIP Road, Vesu, Surat - 395007"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#20493c] font-medium"
                />
              </div>

              {/* Status / Link Preview */}
              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Map live link attached for delivery rider</span>
                </span>
                <a
                  href={`https://maps.google.com/?q=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#20493c] font-bold underline flex items-center gap-0.5 hover:text-[#123B2B]"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 bg-[#f8faf9] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl bg-[#20493c] hover:bg-[#15342a] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 text-[#fbce45]" />
              <span>Confirm &amp; Use This Google Map Location</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

