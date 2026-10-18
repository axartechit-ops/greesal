import json
from bson import ObjectId
from backend.database import get_db

def main():
    db = get_db()
    if db is None:
        print("❌ Failed to connect to MongoDB")
        return

    print("🍃 Connected to MongoDB Atlas")

    # 1. Clean demo salad 'Jsjsj' and any invalid items
    res_salads = db.salads.delete_many({
        "$or": [
            {"name": {"$regex": "jsjsj", "$options": "i"}},
            {"price": "430"},
            {"tag": "Salads and bowls"},
            {"category": "Salads and bowls"}
        ]
    })
    print(f"🗑️ Deleted {res_salads.deleted_count} demo salads")

    # 2. Check salads in DB
    existing_count = db.salads.count_documents({})
    print(f"Current salads in DB: {existing_count}")
    
    # Load authentic salads from local_salads.json
    with open("backend/local_salads.json", "r", encoding="utf-8") as f:
        salads_data = json.load(f)

    if existing_count == 0:
        db.salads.insert_many(salads_data)
        print(f"✅ Inserted {len(salads_data)} authentic Greesal salads into MongoDB Atlas!")
    else:
        print("ℹ️ Existing salads already in DB")

    # 3. Clean demo orders
    res_orders = db.orders.delete_many({
        "$or": [
            {"orderNumber": {"$in": ["GRS-90844", "GRS-84920", "GRS-79214", "GRS-61803"]}},
            {"customerName": {"$regex": "FastAPI Tester", "$options": "i"}}
        ]
    })
    print(f"🗑️ Deleted {res_orders.deleted_count} demo orders")

    # 4. Clean settings in db.settings
    settings = db.settings.find_one({"_id": "homepage"})
    if settings:
        updates = {}
        diff1 = str(settings.get("differenceImage1", ""))
        if diff1.startswith("data:image") or len(diff1) > 500:
            updates["differenceImage1"] = "/images/premium_fresh_ingredients.png"
            print("Resetting differenceImage1 from giant base64 to /images/premium_fresh_ingredients.png")

        slider_ids = settings.get("topSliderSaladIds") or []
        if not slider_ids:
            updates["topSliderSaladIds"] = [
                "chickpea-sprout-fusion-bowl",
                "rich-protein-salad",
                "paneer-garden-salad",
                "premium-high-protein-salad"
            ]
            print("Populated topSliderSaladIds with authentic salads")

        # Restore authentic 6 salad categories if previously overwritten by demo
        cats = settings.get("categories") or []
        if len(cats) <= 2 or any(c.get("id") == "Salads and bowls" for c in cats):
            from backend.routes.settings import DEFAULT_SITE_SETTINGS
            updates["categories"] = DEFAULT_SITE_SETTINGS["categories"]
            print("Restored 6 authentic Greesal salad categories")

        if updates:
            db.settings.update_one({"_id": "homepage"}, {"$set": updates})
            print(f"✅ Updated settings: {list(updates.keys())}")
        else:
            print("ℹ️ Settings already clean")

    # 5. Clean test users
    res_users = db.users.delete_many({"email": "google_tester@greesal.in"})
    print(f"🗑️ Deleted {res_users.deleted_count} test users")

    # Final count check
    print("\n--- Final Status in MongoDB Atlas ---")
    print("Salads count:", db.salads.count_documents({}))
    print("Orders count:", db.orders.count_documents({}))
    print("Reviews count:", db.reviews.count_documents({}))

if __name__ == "__main__":
    main()
