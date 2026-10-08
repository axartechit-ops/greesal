import time
from flask import Blueprint, request, jsonify
from bson import ObjectId
from backend.database import get_db

reviews_bp = Blueprint('reviews', __name__)

DEFAULT_REVIEWS = [
    {
        "author": "Pooja Patel",
        "role": "Verified Customer",
        "rating": 5,
        "comment": "The Burrito Bowl was bursting with authentic flavors. Super fresh and delivered hot!",
        "date": "2 days ago",
        "approved": True
    },
    {
        "author": "Dr. Aarav Mehta",
        "role": "Nutritionist & Dietitian",
        "rating": 5,
        "comment": "The protein breakdown on the High Protein Power Bowl is spot-on. I frequently recommend Greesal to my clients.",
        "date": "1 week ago",
        "approved": True
    }
]

def format_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@reviews_bp.route('/reviews', methods=['GET'])
@reviews_bp.route('/admin/reviews', methods=['GET'])
def get_reviews():
    db = get_db()
    if db is None:
        return jsonify([
            {**r, "_id": f"review-{idx+1}"} for idx, r in enumerate(DEFAULT_REVIEWS)
        ]), 200

    try:
        reviews = list(db.reviews.find({}))
        if not reviews:
            db.reviews.insert_many([dict(r) for r in DEFAULT_REVIEWS])
            reviews = list(db.reviews.find({}))
        return jsonify([format_doc(r) for r in reviews]), 200
    except Exception as e:
        return jsonify([
            {**r, "_id": f"review-{idx+1}"} for idx, r in enumerate(DEFAULT_REVIEWS)
        ]), 200

@reviews_bp.route('/reviews', methods=['POST'])
def add_review():
    data = request.get_json() or {}
    author = data.get("author", "Valued Customer").strip()
    comment = data.get("comment", "").strip()
    rating = int(data.get("rating", 5))

    if not comment:
        return jsonify({"error": "Review comment cannot be empty"}), 400

    new_review = {
        "author": author,
        "role": data.get("role", "Verified Customer"),
        "rating": rating,
        "comment": comment,
        "date": "Just now",
        "approved": True,
        "createdAt": int(time.time())
    }

    db = get_db()
    if db is not None:
        try:
            res = db.reviews.insert_one(new_review)
            new_review["_id"] = str(res.inserted_id)
        except Exception:
            new_review["_id"] = f"rev-{int(time.time())}"
    else:
        new_review["_id"] = f"rev-{int(time.time())}"

    return jsonify({"success": True, "message": "Review submitted successfully", "review": new_review}), 201

@reviews_bp.route('/admin/reviews/<review_id>', methods=['PUT'])
def update_review(review_id):
    data = request.get_json() or {}
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not available"}), 503

    try:
        query = {"_id": ObjectId(review_id)} if ObjectId.is_valid(review_id) else {"_id": review_id}
        db.reviews.update_one(query, {"$set": data})
        return jsonify({"message": "Review updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reviews_bp.route('/admin/reviews/<review_id>', methods=['DELETE'])
def delete_review(review_id):
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not available"}), 503

    try:
        query = {"_id": ObjectId(review_id)} if ObjectId.is_valid(review_id) else {"_id": review_id}
        db.reviews.delete_one(query)
        return jsonify({"message": "Review deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
