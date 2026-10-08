import math
from flask import Blueprint, request, jsonify

location_bp = Blueprint('location', __name__)

# Kitchen reference coordinates (Katargam, Surat)
KITCHEN_COORDS = {"lat": 21.2266, "lng": 72.8311}
MAX_DELIVERY_DISTANCE_KM = 25.0

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@location_bp.route('/location/check-delivery', methods=['POST'])
@location_bp.route('/api/location/check-delivery', methods=['POST'])
def check_delivery():
    data = request.get_json() or {}
    user_lat = data.get("lat")
    user_lng = data.get("lng")

    if user_lat is None or user_lng is None:
        return jsonify({"deliverable": True, "distanceKm": 0, "deliveryFee": 0, "message": "Address accepted"}), 200

    try:
        lat = float(user_lat)
        lng = float(user_lng)
        distance = haversine_distance(KITCHEN_COORDS["lat"], KITCHEN_COORDS["lng"], lat, lng)
        deliverable = distance <= MAX_DELIVERY_DISTANCE_KM
        fee = 0 if distance <= 5 else int(math.ceil((distance - 5) * 5))

        return jsonify({
            "deliverable": deliverable,
            "distanceKm": round(distance, 2),
            "deliveryFee": fee,
            "message": "Delivery available!" if deliverable else f"Location is {round(distance,1)} km away, outside our 25km radius."
        }), 200
    except Exception as e:
        return jsonify({"deliverable": True, "distanceKm": 0, "deliveryFee": 0, "message": "Standard delivery applied"}), 200
