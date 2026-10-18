import time
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Request, status
from bson import ObjectId
from backend.database import get_db

logger = logging.getLogger("greesal.reviews")
router = APIRouter(tags=["Reviews"])

DEFAULT_REVIEWS = [
    {
        "id": "1",
        "name": "Pooja Patel",
        "author": "Pooja Patel",
        "location": "Vesu, Surat",
        "role": "Verified Customer",
        "rating": 5,
        "text": "The Burrito Bowl was bursting with authentic flavors. Super fresh and delivered in 25 mins!",
        "comment": "The Burrito Bowl was bursting with authentic flavors. Super fresh and delivered in 25 mins!",
        "isPinned": True,
        "order": 1,
        "status": "approved",
        "date": "2 days ago"
    },
    {
        "id": "2",
        "name": "Dr. Aarav Mehta",
        "author": "Dr. Aarav Mehta",
        "location": "City Light, Surat",
        "role": "Nutritionist & Dietitian",
        "rating": 5,
        "text": "The protein breakdown on the High Protein Power Bowl is spot-on. I frequently recommend Greesal to my clients.",
        "comment": "The protein breakdown on the High Protein Power Bowl is spot-on. I frequently recommend Greesal to my clients.",
        "isPinned": True,
        "order": 2,
        "status": "approved",
        "date": "1 week ago"
    }
]

def format_review_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    res = dict(doc)
    str_id = str(res.get("_id", ""))
    res["_id"] = str_id
    res["id"] = res.get("id") or str_id
    # Ensure compatibility between text/comment and name/author
    if "text" not in res and "comment" in res:
        res["text"] = res["comment"]
    if "comment" not in res and "text" in res:
        res["comment"] = res["text"]
    if "name" not in res and "author" in res:
        res["name"] = res["author"]
    if "author" not in res and "name" in res:
        res["author"] = res["name"]
    return res

_public_reviews_cache: Optional[List[Dict[str, Any]]] = None
_public_reviews_cache_time: float = 0.0
REVIEWS_CACHE_TTL: float = 60.0

def invalidate_reviews_cache():
    global _public_reviews_cache
    _public_reviews_cache = None

@router.get("/reviews")
@router.get("/api/reviews")
def get_public_reviews():
    global _public_reviews_cache, _public_reviews_cache_time
    now = time.time()
    if _public_reviews_cache is not None and (now - _public_reviews_cache_time < REVIEWS_CACHE_TTL):
        return _public_reviews_cache

    db = get_db()
    if db is None:
        formatted = [format_review_doc({**r, "_id": f"rev-{idx+1}"}) for idx, r in enumerate(DEFAULT_REVIEWS)]
        _public_reviews_cache = formatted
        _public_reviews_cache_time = now
        return formatted

    try:
        count = db.reviews.count_documents({})
        if count == 0:
            logger.info("No reviews in MongoDB — seeding defaults")
            db.reviews.insert_many([dict(r) for r in DEFAULT_REVIEWS])

        reviews = list(db.reviews.find({"status": {"$ne": "hidden"}}).sort([
            ("isPinned", -1),
            ("order", 1),
            ("createdAt", -1)
        ]))

        logger.info(f"Loaded {len(reviews)} public reviews from MongoDB")
        formatted = [format_review_doc(r) for r in reviews]
        _public_reviews_cache = formatted
        _public_reviews_cache_time = now
        return formatted
    except Exception as e:
        logger.error(f"Error reading reviews from MongoDB: {e}")
        formatted = [format_review_doc({**r, "_id": f"rev-{idx+1}"}) for idx, r in enumerate(DEFAULT_REVIEWS)]
        _public_reviews_cache = formatted
        _public_reviews_cache_time = now
        return formatted

@router.get("/admin/reviews")
@router.get("/api/admin/reviews")
def get_admin_reviews():
    db = get_db()
    if db is None:
        return [format_review_doc({**r, "_id": f"rev-{idx+1}"}) for idx, r in enumerate(DEFAULT_REVIEWS)]

    try:
        count = db.reviews.count_documents({})
        if count == 0:
            db.reviews.insert_many([dict(r) for r in DEFAULT_REVIEWS])

        reviews = list(db.reviews.find({}).sort([
            ("isPinned", -1),
            ("order", 1),
            ("createdAt", -1)
        ]))
        logger.info(f"Loaded {len(reviews)} admin reviews from MongoDB")
        return [format_review_doc(r) for r in reviews]
    except Exception as e:
        logger.error(f"Error reading admin reviews from MongoDB: {e}")
        return [format_review_doc({**r, "_id": f"rev-{idx+1}"}) for idx, r in enumerate(DEFAULT_REVIEWS)]

@router.post("/reviews", status_code=status.HTTP_201_CREATED)
@router.post("/api/reviews", status_code=status.HTTP_201_CREATED)
async def submit_public_review(request: Request):
    data = await request.json()
    name = str(data.get("name") or data.get("author") or "Valued Customer").strip()[:80]
    text = str(data.get("text") or data.get("comment") or "").strip()[:1000]

    if not text:
        raise HTTPException(status_code=400, detail="Review text is required")

    rating = int(data.get("rating", 5))
    if rating < 1 or rating > 5:
        rating = 5

    new_review = {
        "name": name,
        "author": name,
        "location": str(data.get("location") or "Surat").strip()[:80],
        "role": str(data.get("role") or "Verified Customer").strip()[:80],
        "text": text,
        "comment": text,
        "rating": rating,
        "isPinned": False,
        "order": 99,
        "status": "approved",
        "date": "Just now",
        "createdAt": datetime.now().isoformat()
    }

    db = get_db()
    if db is not None:
        try:
            res = db.reviews.insert_one(new_review)
            new_review["_id"] = str(res.inserted_id)
            new_review["id"] = new_review["_id"]
            logger.info(f"Review by '{name}' saved to MongoDB (id={new_review['_id']})")
        except Exception as e:
            logger.error(f"Failed to insert review into MongoDB: {e}", exc_info=True)
            new_review["_id"] = f"rev-{int(time.time())}"
            new_review["id"] = new_review["_id"]
    else:
        logger.warning("MongoDB not available — review NOT persisted to database")
        new_review["_id"] = f"rev-{int(time.time())}"
        new_review["id"] = new_review["_id"]

    return {
        "success": True,
        "message": "Thank you! Your review has been submitted.",
        "review": new_review
    }

@router.post("/admin/reviews")
@router.post("/api/admin/reviews")
async def handle_admin_review_action(request: Request):
    body = await request.json()
    action = body.get("action")
    review_id = body.get("reviewId")
    data = body.get("data")
    ordered_ids = body.get("orderedIds")

    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # 1. Action: setTopFour
        if action == "setTopFour" and isinstance(ordered_ids, list):
            db.reviews.update_many({}, {"$set": {"isPinned": False, "order": 99}})
            for idx, id_str in enumerate(ordered_ids):
                query_list = [{"id": id_str}, {"_id": id_str}]
                if ObjectId.is_valid(id_str):
                    query_list.append({"_id": ObjectId(id_str)})
                db.reviews.update_one(
                    {"$or": query_list},
                    {"$set": {"isPinned": True, "order": idx + 1, "status": "approved"}}
                )

            updated = list(db.reviews.find({}).sort([("isPinned", -1), ("order", 1), ("createdAt", -1)]))
            return {"success": True, "reviews": [format_review_doc(r) for r in updated]}

        # 2. Action: update
        if action == "update" and review_id:
            id_str = str(review_id)
            query_list = [{"id": id_str}, {"_id": id_str}]
            if ObjectId.is_valid(id_str):
                query_list.append({"_id": ObjectId(id_str)})

            update_fields = dict(data or {})
            if "_id" in update_fields:
                del update_fields["_id"]
            if "id" in update_fields:
                del update_fields["id"]

            if "rating" in update_fields:
                update_fields["rating"] = int(update_fields["rating"])
            if "isPinned" in update_fields:
                update_fields["isPinned"] = bool(update_fields["isPinned"])
                if update_fields["isPinned"] and "order" not in update_fields:
                    update_fields["order"] = 1

            update_fields["updatedAt"] = datetime.now().isoformat()
            db.reviews.update_one({"$or": query_list}, {"$set": update_fields})

            updated = list(db.reviews.find({}).sort([("isPinned", -1), ("order", 1), ("createdAt", -1)]))
            return {"success": True, "reviews": [format_review_doc(r) for r in updated]}

        # 3. Action: create
        if action == "create" or (not action and (data or body).get("name")):
            payload = data or body
            new_review = {
                "name": payload.get("name", "Valued Customer"),
                "author": payload.get("name", "Valued Customer"),
                "location": payload.get("location", "Surat"),
                "role": payload.get("role", "Verified Customer"),
                "text": payload.get("text") or payload.get("comment", ""),
                "comment": payload.get("text") or payload.get("comment", ""),
                "rating": int(payload.get("rating", 5)),
                "isPinned": bool(payload.get("isPinned", False)),
                "order": int(payload.get("order", 99)),
                "status": payload.get("status", "approved"),
                "createdAt": datetime.now().isoformat()
            }
            res = db.reviews.insert_one(new_review)
            inserted_id = str(res.inserted_id)
            new_review["_id"] = inserted_id
            new_review["id"] = inserted_id
            return {"success": True, "review": new_review}

        raise HTTPException(status_code=400, detail="Invalid action")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin review action '{action}' failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/reviews")
@router.delete("/api/admin/reviews")
@router.delete("/admin/reviews/{review_id}")
@router.delete("/api/admin/reviews/{review_id}")
def delete_review(review_id: Optional[str] = None, id: Optional[str] = Query(None)):
    target_id = review_id or id
    if not target_id:
        raise HTTPException(status_code=400, detail="Review ID is required")

    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        query_list = [{"id": target_id}, {"_id": target_id}]
        if ObjectId.is_valid(target_id):
            query_list.append({"_id": ObjectId(target_id)})

        result = db.reviews.delete_one({"$or": query_list})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")

        return {"success": True, "message": "Review deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
