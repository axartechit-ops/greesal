import math
import requests
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Request

router = APIRouter(tags=["Location"])

# Kitchen reference coordinates (Katargam, Surat)
KITCHEN_COORDS = {"lat": 21.2266, "lng": 72.8311}
MAX_DELIVERY_DISTANCE_KM = 25.0

# Verified Surat localities with coordinates for proximity detection
SURAT_KNOWN_AREAS = [
    {"name": "Vesu (VIP Road)", "lat": 21.1418, "lng": 72.7758, "pincode": "395007"},
    {"name": "Adajan (LP Savani Road)", "lat": 21.1959, "lng": 72.7933, "pincode": "395009"},
    {"name": "Pal (Gaurav Path)", "lat": 21.1983, "lng": 72.7725, "pincode": "395009"},
    {"name": "Piplod (Dumas Road)", "lat": 21.1565, "lng": 72.7754, "pincode": "395007"},
    {"name": "City Light (Science Centre)", "lat": 21.1685, "lng": 72.7958, "pincode": "395007"},
    {"name": "Althan (VIP Circle)", "lat": 21.1492, "lng": 72.8055, "pincode": "395017"},
    {"name": "Ghod Dod Road", "lat": 21.1762, "lng": 72.8021, "pincode": "395007"},
    {"name": "Athwagate / Athwa Lines", "lat": 21.1780, "lng": 72.8080, "pincode": "395001"},
    {"name": "Nanpura / Timaliawad", "lat": 21.1870, "lng": 72.8150, "pincode": "395001"},
    {"name": "Varachha (Mini Bazar)", "lat": 21.2185, "lng": 72.8595, "pincode": "395006"},
    {"name": "Katargam (Gotalawadi)", "lat": 21.2268, "lng": 72.8315, "pincode": "395004"},
    {"name": "Rander / Jahangirpura", "lat": 21.2182, "lng": 72.7845, "pincode": "395005"},
    {"name": "Majura Gate / Ring Road", "lat": 21.1730, "lng": 72.8210, "pincode": "395002"},
    {"name": "Udhna / Pandesara", "lat": 21.1520, "lng": 72.8380, "pincode": "395021"},
    {"name": "Dindoli", "lat": 21.1650, "lng": 72.8680, "pincode": "395012"},
]

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_closest_surat_area(lat: float, lng: float) -> Dict[str, Any]:
    closest = SURAT_KNOWN_AREAS[0]
    min_dist = float("inf")
    for area in SURAT_KNOWN_AREAS:
        dist = haversine_distance(lat, lng, area["lat"], area["lng"])
        if dist < min_dist:
            min_dist = dist
            closest = area
    return {**closest, "distanceKm": min_dist}

@router.post("/location/check-delivery")
@router.post("/api/location/check-delivery")
async def check_delivery(request: Request):
    data = await request.json()
    user_lat = data.get("lat")
    user_lng = data.get("lng")

    if user_lat is None or user_lng is None:
        return {"deliverable": True, "distanceKm": 0, "deliveryFee": 0, "message": "Address accepted"}

    try:
        lat = float(user_lat)
        lng = float(user_lng)
        distance = haversine_distance(KITCHEN_COORDS["lat"], KITCHEN_COORDS["lng"], lat, lng)
        deliverable = distance <= MAX_DELIVERY_DISTANCE_KM
        fee = 0 if distance <= 5 else int(math.ceil((distance - 5) * 5))

        return {
            "deliverable": deliverable,
            "distanceKm": round(distance, 2),
            "deliveryFee": fee,
            "message": "Delivery available!" if deliverable else f"Location is {round(distance, 1)} km away, outside our 25km radius."
        }
    except Exception:
        return {"deliverable": True, "distanceKm": 0, "deliveryFee": 0, "message": "Standard delivery applied"}

@router.get("/location/reverse-geocode")
@router.get("/api/location/reverse-geocode")
def reverse_geocode(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None)
):
    if lat is None or lng is None:
        raise HTTPException(status_code=400, detail="Latitude and Longitude are required")

    closest_surat = find_closest_surat_area(lat, lng)
    is_within_surat = closest_surat["distanceKm"] < 35

    detected_address = ""
    locality = ""
    city = "Surat"
    postcode = ""
    state = "Gujarat"

    # 1. Try OpenStreetMap Nominatim
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=18&addressdetails=1"
        headers = {"User-Agent": "GreesalSaladSurat/2.0 (order@greesal.in)", "Accept-Language": "en"}
        res = requests.get(url, headers=headers, timeout=3)
        if res.status_code == 200:
            addr = res.json().get("address", {})
            road = addr.get("road") or addr.get("street") or addr.get("suburb") or addr.get("neighbourhood") or ""
            sub = addr.get("suburb") or addr.get("neighbourhood") or addr.get("city_district") or ""
            c = addr.get("city") or addr.get("town") or "Surat"
            p = addr.get("postcode") or closest_surat["pincode"] or ""
            locality = sub or road or closest_surat["name"]
            postcode = p

            area_name = road or sub or (closest_surat["name"] if is_within_surat else "")
            parts = [p for p in [area_name, sub if sub != road and sub != area_name else "", c, p] if p]
            if parts:
                detected_address = ", ".join(parts)
    except Exception:
        pass

    # 2. Fallback to Surat known area if empty or generic
    if not detected_address or len(detected_address) < 5 or "zonal" in detected_address.lower():
        if is_within_surat:
            detected_address = f"{closest_surat['name']}, Surat - {closest_surat['pincode']}"
        else:
            detected_address = f"GPS Pin ({lat:.5f}, {lng:.5f}), Surat"

    return {
        "success": True,
        "address": detected_address,
        "locality": locality or closest_surat["name"],
        "city": city,
        "postcode": postcode or closest_surat["pincode"],
        "state": state,
        "isWithinSuratRegion": is_within_surat,
        "closestSuratArea": closest_surat["name"],
        "distanceToClosestSuratKm": round(closest_surat["distanceKm"], 1),
        "lat": lat,
        "lng": lng,
        "mapsUrl": f"https://maps.google.com/?q={lat},{lng}"
    }
