import time
import random
from flask import Blueprint, request, jsonify
from bson import ObjectId
from backend.database import get_db

orders_bp = Blueprint('orders', __name__)

# No demo orders (deleted GRS-84920, GRS-79214, GRS-61803)
DEFAULT_ORDERS = []

def format_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@orders_bp.route('/orders', methods=['GET'])
@orders_bp.route('/admin/orders', methods=['GET'])
def get_orders():
    db = get_db()
    if db is None:
        return jsonify([
            {**o, "_id": f"temp-{idx}", "id": o.get("orderNumber")} for idx, o in enumerate(DEFAULT_ORDERS)
        ]), 200

    try:
        # Purge deleted demo orders if present in database
        db.orders.delete_many({
            "$or": [
                {"orderNumber": {"$in": ["GRS-84920", "GRS-79214", "GRS-61803"]}},
                {"id": {"$in": ["GRS-84920", "GRS-79214", "GRS-61803"]}}
            ]
        })

        orders = list(db.orders.find({}).sort("timestamp", -1))
        if not orders and DEFAULT_ORDERS:
            db.orders.insert_many([dict(o) for o in DEFAULT_ORDERS])
            orders = list(db.orders.find({}).sort("timestamp", -1))

        formatted = []
        for o in orders:
            doc = format_doc(o)
            order_id = doc.get("orderNumber") or doc.get("id") or f"GRS-{doc['_id'][-5:].upper()}"
            if order_id in ["GRS-84920", "GRS-79214", "GRS-61803"]:
                continue
            doc["id"] = order_id
            formatted.append(doc)

        return jsonify(formatted), 200
    except Exception as e:
        return jsonify([
            {**o, "_id": f"temp-{idx}", "id": o.get("orderNumber")} for idx, o in enumerate(DEFAULT_ORDERS)
        ]), 200

@orders_bp.route('/orders', methods=['POST'])
@orders_bp.route('/admin/orders', methods=['POST'])
def create_order():
    data = request.get_json() or {}
    items = data.get("items", [])
    if not items:
        return jsonify({"error": "Order must contain at least one item"}), 400

    order_num = data.get("orderNumber") or data.get("id") or f"GRS-{random.randint(10000, 99999)}"
    new_order = {
        "id": order_num,
        "orderNumber": order_num,
        "customerName": data.get("customerName", "Greesal Member").strip(),
        "customerEmail": data.get("customerEmail", "").strip(),
        "customerMobile": data.get("customerMobile", "").strip(),
        "date": data.get("date", "Today"),
        "timestamp": int(time.time() * 1000),
        "status": data.get("status", "Placed"),
        "items": items,
        "subtotal": float(data.get("subtotal", 0)),
        "deliveryFee": float(data.get("deliveryFee", 0)),
        "total": float(data.get("total", 0)),
        "deliveryAddress": data.get("deliveryAddress", "").strip(),
        "deliverySlot": data.get("deliverySlot", "lunch"),
        "mapsUrl": data.get("mapsUrl", ""),
        "locationCoords": data.get("locationCoords"),
        "notes": data.get("notes", "").strip(),
        "orderType": data.get("orderType", "salad_order"),
        "dietPreference": data.get("dietPreference", ""),
        "paymentMethod": data.get("paymentMethod", "Cash on Delivery / UPI on Delivery")
    }

    db = get_db()
    if db is not None:
        try:
            result = db.orders.insert_one(new_order)
            new_order["_id"] = str(result.inserted_id)
        except Exception:
            new_order["_id"] = f"order-{int(time.time())}"
    else:
        new_order["_id"] = f"order-{int(time.time())}"

    return jsonify({
        "success": True,
        "message": "Order placed and recorded successfully",
        "order": new_order
    }), 201

@orders_bp.route('/admin/orders/<order_id>', methods=['PUT'])
@orders_bp.route('/admin/orders', methods=['PUT'])
def update_order_status(order_id=None):
    data = request.get_json() or {}
    target_id = order_id or data.get("_id") or data.get("id")
    status = data.get("status")

    if not target_id:
        return jsonify({"error": "Order ID is required"}), 400

    db = get_db()
    if db is None:
        return jsonify({"error": "Database not available"}), 503

    try:
        query = {"_id": ObjectId(target_id)} if ObjectId.is_valid(target_id) else {"$or": [{"orderNumber": target_id}, {"id": target_id}]}
        db.orders.update_one(query, {"$set": {"status": status, "updatedAt": int(time.time())}})
        return jsonify({"message": "Order status updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@orders_bp.route('/admin/orders/<order_id>', methods=['DELETE'])
@orders_bp.route('/admin/orders', methods=['DELETE'])
def delete_order(order_id=None):
    target_id = order_id or request.args.get("id")
    if not target_id:
        return jsonify({"error": "Order ID is required"}), 400

    db = get_db()
    if db is None:
        return jsonify({"error": "Database not available"}), 503

    try:
        query = {"_id": ObjectId(target_id)} if ObjectId.is_valid(target_id) else {"$or": [{"orderNumber": target_id}, {"id": target_id}]}
        db.orders.delete_one(query)
        return jsonify({"message": "Order deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
