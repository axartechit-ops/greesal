import os
import re
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, Response, status
from bson import ObjectId
from backend.database import get_db

logger = logging.getLogger("greesal.salads")
router = APIRouter(tags=["Salads"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

DEFAULT_SALADS_DATA = [
    {
        "name": "Premium High Protein Salad",
        "calories": "387 Kcal",
        "protein": "19g Protein",
        "price": "₹349",
        "tag": "High Protein",
        "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
        "ingredients": ["Boiled Chickpeas", "Beetroot", "Cabbage", "Zucchini - yellow + green", "Carrot", "Capsicum", "Pomegranate"],
        "dressing": ["Cashew & Mint Dressing", "Honey Lime Dressing", "Basil Herb Vinaigrette", "Black Pepper & Rock Salt"],
        "crunch": ["Roasted Pumpkin Seeds", "Watermelon Seeds", "Sunflower Seeds", "Crispy Flax Seeds"],
        "healthBenefits": [
            "High Protein Boost: The body has a strong supply of protein. Helps in muscle building & recovery.",
            "Energy Increase: All-day energy from natural carbs & healthy fats. Reduces fatigue & irritability.",
            "Heart Health Support: Flax seeds, sunflower seeds & nuts contain healthy fats. Helps in cholesterol control.",
            "Digestion Improve: Fiber-rich veggies (cabbage, carrots, beetroot). Improves gut health & reduces constipation.",
            "Blood Purification: Beetroot & Pomegranate improve blood circulation. Helps improve hemoglobin levels."
        ],
        "additionalBenefits": ["Immunity Boost", "Skin & Hair Health", "Brain Function Support", "Detox & Refreshing"],
        "perfectFor": ["Diet", "Fitness", "Healthy"],
        "nutrition": {
            "carbs": "67g",
            "fiber": "13g",
            "sugarAdded": "5g",
            "sugarTotal": "4g",
            "totalFat": "5g",
            "saturatedFat": "5g",
            "transFat": "0.68g",
            "cholesterol": "0g",
            "vitaminA": "42.14 µg",
            "vitaminC": "3.61 mg",
            "vitaminD": "0 µg",
            "vitaminE": "1.15 mg",
            "sodium": "42 mg",
            "calcium": "124 mg",
            "iron": "6 mg",
            "potassium": "685 mg"
        }
    },
    {
        "name": "Premium Burrito Salad",
        "calories": "367 Kcal",
        "protein": "13g Protein",
        "price": "₹369",
        "tag": "Chef Choice",
        "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
        "ingredients": ["Spiced Rajma", "Brown Rice", "Fresh Paneer", "Zesty Salsa", "Sweet Corn", "Cabbage - green + purple", "Zucchini - yellow + green", "Carrot", "Capsicum - yellow / green / red"],
        "dressing": ["Creamy Paneer & Herb Dressing", "Honey Lime Vinaigrette", "Mild Mexican Spice Glaze"],
        "crunch": ["Roasted Walnuts & Pistachios", "Toasted Watermelon Seeds", "Crisp Tortilla Bites"],
        "healthBenefits": [
            "High Protein Boost: Supports muscle building and keeps you full for longer duration.",
            "Rich in Fiber: Improves digestion and helps maintain a healthy gut system.",
            "Weight Management: Low-calorie and filling meal that helps in controlling hunger cravings.",
            "Energy Provider: Balanced mix of carbs, protein, and fats gives sustained energy.",
            "Heart Health Support: Contains healthy fats and nutrients that help maintain good heart function."
        ],
        "additionalBenefits": ["Improves Metabolism", "Vitamin Rich", "Blood Sugar Control", "Hydration Support"],
        "perfectFor": ["Diet", "Fitness", "Healthy"],
        "nutrition": {
            "carbs": "72g",
            "fiber": "11g",
            "sugarTotal": "6g",
            "sugarAdded": "4g",
            "totalFat": "3g",
            "saturatedFat": "0g",
            "transFat": "0g",
            "cholesterol": "0mg",
            "vitaminA": "185.51 µg",
            "vitaminC": "24.8 mg",
            "vitaminD": "0 µg",
            "vitaminE": "1.25 mg",
            "sodium": "52 mg",
            "calcium": "64 mg",
            "iron": "6 mg",
            "potassium": "785 mg"
        }
    },
    {
        "name": "Premium Peanut Salad",
        "calories": "495 Kcal",
        "protein": "17g Protein",
        "price": "₹329",
        "tag": "Bestseller",
        "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80",
        "ingredients": ["Mix Sprout Beans", "Fresh Paneer", "Cabbage - green + purple", "Zucchini", "Carrot", "Capsicum", "Beetroot"],
        "dressing": ["Cold Pressed Olive Oil Dressing", "Honey Mustard Glaze", "Oregano & Lemon Herb Splash"],
        "crunch": ["Roasted Masala Peanuts", "Toasted Pumpkin & Sunflower Seeds", "Golden Flax Seeds"],
        "healthBenefits": [
            "Rich Protein Source: Peanuts provide high-quality plant protein that helps build muscles and keeps you energized throughout the day.",
            "Heart Health Support: Healthy fats in peanuts help reduce bad cholesterol (LDL) and improve heart health.",
            "Boosts Energy Levels: Peanuts are calorie-dense with good fats and carbs, giving quick and long-lasting energy.",
            "Improves Digestion: Salad ingredients like veggies + peanuts add fiber, which supports smooth digestion.",
            "Weight Management: Protein and fiber keep you full for longer, reducing unnecessary snacking."
        ],
        "additionalBenefits": ["Rich in Antioxidants", "Supports Skin Health", "Regulates Blood Sugar", "Strengthens Immunity"],
        "perfectFor": ["Diet", "Fitness", "Healthy"],
        "nutrition": {
            "carbs": "52g",
            "fiber": "9g",
            "sugarTotal": "6g",
            "sugarAdded": "4g",
            "totalFat": "25g",
            "saturatedFat": "3.95g",
            "transFat": "0g",
            "cholesterol": "0mg",
            "vitaminA": "145.51 µg",
            "vitaminC": "4.88 mg",
            "vitaminD": "0 µg",
            "vitaminE": "6.23 mg",
            "sodium": "32 mg",
            "calcium": "68 mg",
            "iron": "4 mg",
            "potassium": "542 mg"
        }
    },
    {
        "name": "Premium Sprout Salad",
        "calories": "379 Kcal",
        "protein": "21g Protein",
        "price": "₹339",
        "tag": "Organic",
        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        "ingredients": ["Mix Sprout Beans (Moong & Chana)", "Fresh Organic Paneer", "Cabbage - green + purple", "Zucchini", "Carrot", "Capsicum", "Beetroot", "Pomegranate Pearls"],
        "dressing": ["Cashew Herb Dressing", "Fresh Mint-Coriander Dressing", "Lemon Zing & Rock Salt"],
        "crunch": ["Toasted Pumpkin Seeds", "Roasted Sunflower Seeds", "Crunchy Flaxseeds"],
        "healthBenefits": [
            "High Protein Power: Helps in muscle building and body repair, making it great for strength and growth.",
            "Boosts Digestion: Rich in fiber, it improves gut health and prevents constipation.",
            "Weight Loss Friendly: Low-calorie and nutrient-dense, helping control cravings.",
            "Increases Energy Levels: Provides natural energy due to rich nutrients and enzymes.",
            "Good for Heart Health: Helps reduce bad cholesterol and supports a healthy heart."
        ],
        "additionalBenefits": ["Controls Blood Sugar", "Supports Hair Growth", "Detoxifies Body", "Improves Immunity"],
        "perfectFor": ["Diet", "Fitness", "Healthy"],
        "nutrition": {
            "carbs": "66g",
            "fiber": "15g",
            "sugarTotal": "5g",
            "sugarAdded": "3g",
            "totalFat": "3g",
            "saturatedFat": "0g",
            "transFat": "0g",
            "cholesterol": "0mg",
            "vitaminA": "118.12 µg",
            "vitaminC": "12.49 mg",
            "vitaminD": "0 µg",
            "vitaminE": "1.86 mg",
            "sodium": "39 mg",
            "calcium": "94 mg",
            "iron": "8 mg",
            "potassium": "742 mg"
        }
    },
    {
        "name": "Premium Mushroom Fry Salad",
        "calories": "366 Kcal",
        "protein": "15g Protein",
        "price": "₹389",
        "tag": "New Item",
        "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
        "ingredients": ["Pan-Seared Fresh Mushrooms", "Organic Paneer", "Steamed Broccoli", "Cabbage - green + purple", "Zucchini - yellow + green", "Carrot", "Capsicum - yellow + green"],
        "dressing": ["Herbed Olive Oil Glaze", "Tangy Tomato Dip", "Lemon Herb Dressing"],
        "crunch": ["Roasted Pumpkin & Sunflower Seeds", "Toasted Watermelon Seeds", "Herb Croutons"],
        "healthBenefits": [
            "Boosts Immunity: Mushrooms contain antioxidants and beta-glucans that help strengthen the immune system.",
            "Supports Weight Loss: Low in calories and high in fiber, this salad keeps you full longer and reduces overeating.",
            "Improves Digestion: Fiber-rich ingredients support smooth digestion and promote healthy gut bacteria.",
            "Rich in Protein: Mushrooms provide plant-based protein which helps in muscle repair and strength.",
            "Good for Heart Health: It helps reduce bad cholesterol (LDL) and supports overall cardiovascular health."
        ],
        "additionalBenefits": ["Boosts Energy Levels", "Supports Skin Health", "Controls Blood Sugar", "Detoxifies Body"],
        "perfectFor": ["Diet", "Fitness", "Healthy"],
        "nutrition": {
            "carbs": "72g",
            "fiber": "18g",
            "sugarTotal": "5g",
            "sugarAdded": "2g",
            "totalFat": "2g",
            "saturatedFat": "0g",
            "transFat": "0g",
            "cholesterol": "0mg",
            "vitaminA": "215.46 µg",
            "vitaminC": "32.45 mg",
            "vitaminD": "3.21 µg",
            "vitaminE": "1.12 mg",
            "sodium": "51 mg",
            "calcium": "58 mg",
            "iron": "4 mg",
            "potassium": "1245 mg"
        }
    },
    {
        "name": "Premium Mexican Fry Salad",
        "calories": "379 Kcal",
        "protein": "19g Protein",
        "price": "₹359",
        "tag": "Spicy & Tangy",
        "image": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80",
        "ingredients": ["Mexican Spiced Rajma", "Sweet Corn", "Cabbage - green + purple", "Zucchini - yellow + green", "Carrot", "Capsicum - yellow + green"],
        "dressing": ["Cold Pressed Olive Dressing", "Tangy Mexican Dip", "Lemon Chili Glaze"],
        "crunch": ["Crunchy Tortilla Crisps", "Roasted Pumpkin & Sunflower Seeds", "Toasted Flax Seeds"],
        "healthBenefits": [
            "Energy Boost: Provides instant energy due to carbs from fries and corn.",
            "Rich in Fiber: Vegetables like cabbage, lettuce, and corn improve digestion.",
            "Good Taste Satisfaction: Balanced mix of spicy, tangy, and crunchy flavors satisfies cravings.",
            "Vitamin Support: Fresh veggies provide essential vitamins like A, C, and K.",
            "Improves Digestion: Fiber and spices help maintain a healthy digestive system."
        ],
        "additionalBenefits": ["Mood Booster", "Hydration Support", "Quick Filling Meal", "Customizable Nutrition"],
        "perfectFor": ["Diet", "Fitness", "Healthy"],
        "nutrition": {
            "carbs": "69g",
            "fiber": "13g",
            "sugarTotal": "6g",
            "sugarAdded": "3g",
            "totalFat": "3g",
            "saturatedFat": "0g",
            "transFat": "0g",
            "cholesterol": "0mg",
            "vitaminA": "132.31 µg",
            "vitaminC": "15.63 mg",
            "vitaminD": "0 µg",
            "vitaminE": "1.45 mg",
            "sodium": "45 mg",
            "calcium": "82 mg",
            "iron": "6 mg",
            "potassium": "815 mg"
        }
    },
    {
        "name": "Premium Quinoa with Avocado Salad",
        "calories": "446 Kcal",
        "protein": "8.54g Protein",
        "price": "₹399",
        "tag": "Superfood",
        "image": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80",
        "ingredients": ["Peruvian Quinoa", "Fresh Ripe Avocado", "Organic Paneer", "Sweet Corn", "Cabbage", "Zucchini", "Carrot", "Capsicum - yellow + green", "Beetroot", "Pomegranate Pearls"],
        "dressing": ["Cold Pressed Extra Virgin Olive Oil", "Honey Lime Dressing", "Cracked Black Pepper & Pink Salt"],
        "crunch": ["Golden Roasted Flaxseeds", "Toasted Pumpkin Seeds", "Toasted Almond Slivers"],
        "healthBenefits": [
            "High Protein Support: Helps in muscle growth and repair because quinoa is a complete protein source.",
            "Heart Health Boost: Supports healthy heart function with avocado's good fats (monounsaturated fats).",
            "Rich in Fiber: Improves digestion and gut health, keeping your stomach clean and active.",
            "Energy Booster: Provides long-lasting energy due to complex carbs in quinoa.",
            "Weight Management: Helps in weight control by keeping you full for a longer time."
        ],
        "additionalBenefits": ["Brain Function Support", "Cholesterol Control", "Skin Health Improvement", "Bone Strength"],
        "perfectFor": ["Diet", "Fitness", "Healthy"],
        "nutrition": {
            "carbs": "66g",
            "fiber": "11g",
            "sugarTotal": "9g",
            "sugarAdded": "6g",
            "totalFat": "18g",
            "saturatedFat": "2.68g",
            "transFat": "0g",
            "cholesterol": "0mg",
            "vitaminA": "162.62 µg",
            "vitaminC": "84.58 mg",
            "vitaminD": "0 µg",
            "vitaminE": "3.87 mg",
            "sodium": "19 mg",
            "calcium": "42 mg",
            "iron": "1 mg",
            "potassium": "924 mg"
        }
    }
]

# Local JSON Store path for persistence across reboots
LOCAL_STORAGE_FILE = Path(__file__).parent.parent / "local_salads.json"

def load_local_salads() -> List[Dict[str, Any]]:
    if LOCAL_STORAGE_FILE.exists():
        try:
            with open(LOCAL_STORAGE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception as e:
            logger.error(f"Failed to parse local_salads.json: {e}")

    # Initialize from DEFAULT_SALADS_DATA
    initial = [
        {**s, "_id": f"fallback-{idx+1}", "id": f"fallback-{idx+1}", "slug": slugify(s["name"])}
        for idx, s in enumerate(DEFAULT_SALADS_DATA)
    ]
    save_local_salads(initial)
    return initial

def save_local_salads(salads: List[Dict[str, Any]]):
    try:
        def json_serial(obj):
            if hasattr(obj, "isoformat"):
                return obj.isoformat()
            return str(obj)

        with open(LOCAL_STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(salads, f, indent=2, ensure_ascii=False, default=json_serial)
    except Exception as e:
        print(f"Warning: Failed saving local salads: {e}")

local_salads_store: List[Dict[str, Any]] = load_local_salads()
_local_store_synced_from_db = False

def sync_local_store_from_mongodb():
    """One-time sync: replace local salads store with MongoDB data on first request."""
    global local_salads_store, _local_store_synced_from_db
    if _local_store_synced_from_db:
        return
    _local_store_synced_from_db = True

    db = get_db()
    if db is None:
        logger.info("MongoDB not available for startup sync — keeping local salads store")
        return

    try:
        salads = list(db.salads.find({}))
        if salads:
            local_salads_store = [format_salad_doc(s) for s in salads]
            save_local_salads(local_salads_store)
            logger.info(f"✅ Synced {len(salads)} salads from MongoDB → local store")
        else:
            logger.info("MongoDB salads collection is empty — keeping local store as-is")
    except Exception as e:
        logger.error(f"Failed to sync salads from MongoDB: {e}")

def format_salad_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    res = dict(doc)
    str_id = str(res.get("_id", ""))
    res["_id"] = str_id
    res["id"] = res.get("id") or str_id
    if not res.get("slug") and res.get("name"):
        res["slug"] = slugify(res["name"])
    # Ensure category and tag are always synchronized
    if not res.get("category") and res.get("tag"):
        res["category"] = res.get("tag")
    elif not res.get("tag") and res.get("category"):
        res["tag"] = res.get("category")

    # 3-Part Ingredients Structure: ingredients, dressing, crunch
    if "ingredients" not in res or not isinstance(res.get("ingredients"), list):
        res["ingredients"] = []
    if "dressing" not in res:
        # Fallback from legacy gravy if present
        res["dressing"] = res.get("gravy", []) if isinstance(res.get("gravy"), list) else []
    elif not isinstance(res.get("dressing"), list):
        res["dressing"] = []
    if "crunch" not in res or not isinstance(res.get("crunch"), list):
        res["crunch"] = []
    # Always remove legacy gravy key
    res.pop("gravy", None)

    return res

import time

_salads_cache: Optional[List[Dict[str, Any]]] = None
_salads_cache_time: float = 0.0
SALADS_CACHE_TTL: float = 30.0

def invalidate_salads_cache():
    global _salads_cache
    _salads_cache = None

@router.get("/salads")
@router.get("/api/salads")
@router.get("/admin/salads")
@router.get("/api/admin/salads")
def get_salads():
    global local_salads_store, _salads_cache, _salads_cache_time
    now = time.time()
    if _salads_cache is not None and (now - _salads_cache_time < SALADS_CACHE_TTL):
        return _salads_cache

    sync_local_store_from_mongodb()

    db = get_db()
    if db is not None:
        try:
            salads = list(db.salads.find({}))
            if salads:
                formatted = [format_salad_doc(s) for s in salads]
                _salads_cache = formatted
                _salads_cache_time = now
                return formatted
        except Exception as e:
            logger.error(f"Error reading salads from MongoDB: {e}")

    formatted = [format_salad_doc(s) for s in local_salads_store]
    _salads_cache = formatted
    _salads_cache_time = now
    return formatted

@router.get("/salads/{salad_id}")
@router.get("/api/salads/{salad_id}")
def get_salad(salad_id: str):
    global local_salads_store
    db = get_db()
    if db is not None:
        try:
            query_list = [{"id": salad_id}, {"slug": salad_id}, {"_id": salad_id}]
            if ObjectId.is_valid(salad_id):
                query_list.append({"_id": ObjectId(salad_id)})
            salad = db.salads.find_one({"$or": query_list})
            if salad:
                return format_salad_doc(salad)
        except Exception:
            pass

    for s in local_salads_store:
        if s.get("id") == salad_id or s.get("_id") == salad_id or s.get("slug") == salad_id:
            return format_salad_doc(s)

    raise HTTPException(status_code=404, detail="Salad not found")

@router.post("/salads", status_code=status.HTTP_201_CREATED)
@router.post("/api/salads", status_code=status.HTTP_201_CREATED)
@router.post("/admin/salads", status_code=status.HTTP_201_CREATED)
@router.post("/api/admin/salads", status_code=status.HTTP_201_CREATED)
async def create_salad(request: Request):
    global local_salads_store
    data = await request.json()
    if not data or not data.get("name") or not data.get("price"):
        raise HTTPException(status_code=400, detail="Salad name and price are required")

    new_salad = dict(data)
    new_salad.pop("gravy", None)
    if "dressing" not in new_salad or not isinstance(new_salad["dressing"], list):
        new_salad["dressing"] = []
    if "crunch" not in new_salad or not isinstance(new_salad["crunch"], list):
        new_salad["crunch"] = []
    if "slug" not in new_salad or not new_salad["slug"]:
        new_salad["slug"] = slugify(new_salad["name"])
    if new_salad.get("category") and not new_salad.get("tag"):
        new_salad["tag"] = new_salad["category"]
    elif new_salad.get("tag") and not new_salad.get("category"):
        new_salad["category"] = new_salad["tag"]
    new_salad["createdAt"] = datetime.now(timezone.utc).isoformat()

    db = get_db()
    if db is not None:
        try:
            result = db.salads.insert_one(new_salad)
            new_salad["_id"] = str(result.inserted_id)
            new_salad["id"] = new_salad.get("id") or new_salad["_id"]
            logger.info(f"Salad '{new_salad['name']}' saved to MongoDB Atlas (id={new_salad['_id']})")
        except Exception as e:
            logger.error(f"Failed to save salad to MongoDB: {e}")
            new_salad["_id"] = f"salad-{len(local_salads_store) + 1}"
            new_salad["id"] = new_salad["_id"]
    else:
        logger.warning("MongoDB not available — salad NOT persisted to database!")
        new_salad["_id"] = f"salad-{len(local_salads_store) + 1}"
        new_salad["id"] = new_salad["_id"]

    local_salads_store.append(new_salad)
    save_local_salads(local_salads_store)
    invalidate_salads_cache()

    return {"message": "Salad added successfully", "salad": new_salad}

@router.put("/admin/salads/{salad_id}")
@router.put("/api/admin/salads/{salad_id}")
async def update_salad(salad_id: str, request: Request):
    global local_salads_store
    data = await request.json()
    update_data = dict(data)
    if "_id" in update_data:
        del update_data["_id"]
    update_data.pop("gravy", None)
    if "dressing" in update_data and not isinstance(update_data["dressing"], list):
        update_data["dressing"] = []
    if "crunch" in update_data and not isinstance(update_data["crunch"], list):
        update_data["crunch"] = []
    if update_data.get("category") and not update_data.get("tag"):
        update_data["tag"] = update_data["category"]
    elif update_data.get("tag") and not update_data.get("category"):
        update_data["category"] = update_data["tag"]
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()

    db = get_db()
    db_updated = False
    if db is not None:
        try:
            query_list = [{"id": salad_id}, {"slug": salad_id}, {"_id": salad_id}]
            if ObjectId.is_valid(salad_id):
                query_list.append({"_id": ObjectId(salad_id)})
            update_op: Dict[str, Any] = {"$set": update_data, "$unset": {"gravy": ""}}
            result = db.salads.update_one({"$or": query_list}, update_op)
            if result.matched_count > 0:
                db_updated = True
                logger.info(f"Salad '{salad_id}' updated in MongoDB Atlas (modified={result.modified_count})")
            else:
                logger.warning(f"Salad '{salad_id}' not found in MongoDB for update")
        except Exception as e:
            logger.error(f"Error updating salad in MongoDB: {e}")

    # Update in local store
    matched_local = False
    for idx, s in enumerate(local_salads_store):
        if s.get("id") == salad_id or s.get("_id") == salad_id or s.get("slug") == salad_id:
            updated_item = {**s, **update_data}
            updated_item.pop("gravy", None)
            local_salads_store[idx] = updated_item
            matched_local = True
            break

    if not db_updated and not matched_local:
        raise HTTPException(status_code=404, detail="Salad not found")

    save_local_salads(local_salads_store)
    invalidate_salads_cache()
    return {"message": "Salad updated successfully"}

@router.delete("/admin/salads/{salad_id}")
@router.delete("/api/admin/salads/{salad_id}")
def delete_salad(salad_id: str):
    global local_salads_store
    db = get_db()
    db_deleted = False

    if db is not None:
        try:
            query_list = [{"id": salad_id}, {"slug": salad_id}, {"_id": salad_id}]
            if ObjectId.is_valid(salad_id):
                query_list.append({"_id": ObjectId(salad_id)})
            result = db.salads.delete_one({"$or": query_list})
            if result.deleted_count > 0:
                db_deleted = True
        except Exception:
            pass

    # Delete from local store (handles fallback-1, fallback-2, etc.)
    original_len = len(local_salads_store)
    local_salads_store = [
        s for s in local_salads_store
        if s.get("id") != salad_id and s.get("_id") != salad_id and s.get("slug") != salad_id
    ]
    local_deleted = len(local_salads_store) < original_len

    if not db_deleted and not local_deleted:
        raise HTTPException(status_code=404, detail="Salad not found")

    save_local_salads(local_salads_store)
    invalidate_salads_cache()
    return {"message": "Salad deleted successfully"}
