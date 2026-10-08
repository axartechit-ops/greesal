from flask import Blueprint, request, jsonify
from backend.database import get_db

settings_bp = Blueprint('settings', __name__)

DEFAULT_SETTINGS = {
    "siteName": "Greesal",
    "tagline": "Organic Salads & Superbowls",
    "currency": "₹",
    "deliveryFee": 0,
    "minOrderAmount": 199,
    "kitchenStatus": "open",
    "kitchenAddress": "Katargam, Surat, Gujarat 395004",
    "kitchenCoords": {"lat": 21.2266, "lng": 72.8311},
    "supportPhone": "+91 95958 66352",
    "supportEmail": "contact@greesal.com",
    "operatingHours": "9:00 AM - 10:00 PM"
}

@settings_bp.route('/settings', methods=['GET'])
@settings_bp.route('/admin/settings', methods=['GET'])
def get_settings():
    db = get_db()
    if db is None:
        return jsonify(DEFAULT_SETTINGS), 200

    try:
        settings = db.settings.find_one({"_id": "site_settings"})
        if not settings:
            db.settings.insert_one({"_id": "site_settings", **DEFAULT_SETTINGS})
            return jsonify(DEFAULT_SETTINGS), 200
        del settings["_id"]
        return jsonify(settings), 200
    except Exception:
        return jsonify(DEFAULT_SETTINGS), 200

@settings_bp.route('/admin/settings', methods=['PUT', 'POST'])
def update_settings():
    data = request.get_json() or {}
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not available"}), 503

    try:
        if "_id" in data:
            del data["_id"]
        db.settings.update_one({"_id": "site_settings"}, {"$set": data}, upsert=True)
        return jsonify({"message": "Settings updated successfully", "settings": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
