import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Request
from backend.database import get_db

logger = logging.getLogger("greesal.settings")
router = APIRouter(tags=["Settings"])

DEFAULT_SITE_SETTINGS: Dict[str, Any] = {
    # Top Featured Slider
    "showTopSlider": True,
    "topSliderTitle": "Chef's Handcrafted Picks",
    "topSliderSubtitle": "Fresh daily organic bowls prepared fresh & delivered in 30 mins",
    "topSliderBadge": "TRENDING BOWLS",
    "topSliderSaladIds": [
        "chickpea-sprout-fusion-bowl",
        "rich-protein-salad",
        "paneer-garden-salad",
        "1",
        "2",
        "3"
    ],

    # Sticky Bar
    "stickyBarOffer": "Special Offer",
    "stickyBarText": "Weekly Salad At ₹200/- | Monthly Salad At ₹175/- • Free Daily Delivery in Surat",
    "stickyBarBtnText": "Subscribe Now",

    # Hero Section
    "heroBadge": "",
    "heroSlogan": "Farm-Fresh Organic Salad Bowls",
    "heroStoryHeading": "A short story about",
    "heroStoryBrand": "GREESAL",
    "heroStoryP1": "GREESAL, Farm-Fresh Organic Salad Bowls! Idea comes from a small thing and now it’s become a trusted brand of salads and healthy food in Surat, Gujarat.",
    "heroStoryP2": "GREESAL — Slice of Green, where health meets Freshness & Deliciousness! One more thing comes to mind when we talk about healthy food is organic, natural, and fresh — and Greesal is committed to providing only fresh, healthy, and delicious salads with fresh and organic ingredients.",
    "heroStoryP3": "At GREESAL, we bring you 21 varieties of fresh, healthy, and delicious salads, carefully crafted to offer the perfect balance of taste and nutrition. Staying true to our tagline, “Farm-Fresh Organic Salad Bowls”, we deliver wholesome salads right to your doorstep, ensuring you enjoy a guilt-free, nutritious meal every day.",
    "heroStoryP4": "Our handcrafted salads are made using premium-quality ingredients, without onion and garlic, and paired with our signature homemade dressings. Whether you’re on a fitness journey, looking for a quick healthy meal, or simply love fresh greens, Greesal is your go-to destination for healthy eating.",
    "heroImage": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85",
    "heroPill1": "100% Handmade Dressings",
    "heroPill2": "No Onion • No Garlic",
    "heroStatBadge": "Health Lovers",
    "heroStatDelivered": "72,600+ Salads Delivered",

    # Aliases
    "title": "Farm-Fresh Organic Salad Bowls",
    "badgeText": "100% Certified Organic • Hydroponic Greens",
    "description": "Handcrafted clean nutrition made with 100% pesticide-free greens, organic protein, and freeze-dried superfoods. Delivered fresh across Surat in 30 mins.",
    "featuredSaladName": "High Protein Power Bowl",
    "featuredSaladTag": "Signature Salad",
    "pill1Text": "100% Handmade Dressings",
    "pill2Text": "No Onion • No Garlic",
    "highlight1Title": "30-Min Fast Delivery",
    "highlight1Subtitle": "Express in Surat",
    "highlight2Title": "Zero Chemicals",
    "highlight2Subtitle": "100% Certified Organic",
    "highlight3Title": "72,600+ Salads Delivered",
    "highlight3Subtitle": "Health Lovers",
    "ctaText": "Browse Fresh Bowls",
    "ctaLink": "#menu",

    # Difference
    "differenceBadge": "THE GREESAL PROMISE",
    "differenceTitle": "what makes the difference?",
    "differenceSubtitle": "Every bowl is handcrafted from farm-to-table with zero shortcuts, zero chemicals, and uncompromised love.",
    "differenceImage1": "/images/premium_fresh_ingredients.png",
    "differenceImage2": "",
    "differenceImage3": "",
    "differenceImage4": "",
    "differenceCards": [
        {
            "id": 1,
            "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
            "title": "100% In-House Handmade Dressings",
            "desc": "Crafted without chemical preservatives, artificial emulsifiers, or thickeners. Made fresh every morning with cold-pressed olive oil, Greek yogurt, raw seeds, and mountain herbs.",
            "badge": "Cold-Pressed & Clean"
        },
        {
            "id": 2,
            "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
            "title": "Zero Compromise On Purity",
            "desc": "Zero Mayonnaise, Zero Fatty Palm Oils, Zero Preservatives, and Strictly No Onion & Garlic. 100% Satvik, pure, clean nutrition made for daily wellness.",
            "badge": "Satvik Goodness"
        },
        {
            "id": 4,
            "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
            "title": "21+ Chef-Crafted Daily Varieties",
            "desc": "From 22g protein power bowls to keto avocado crunch, detox sprout bowls, and Mediterranean grains — enjoy a fresh, exciting menu that keeps your healthy lifestyle joyful.",
            "badge": "Nutritional Balance"
        }
    ],

    # Stats
    "statsTitle": "what are you waiting for, Get your spot now!",
    "statsSubtitle": "Join thousands of health enthusiasts in Surat enjoying daily fresh clean nutrition",
    "stat1Num": "24 +",
    "stat1Label": "different varieties of salad!",
    "stat1Desc": "Rotating fresh weekly menu",
    "stat2Num": "2.7k +",
    "stat2Label": "happy subscribers!",
    "stat2Desc": "Active fitness & office members",
    "stat3Num": "72.6 K +",
    "stat3Label": "salad delivered!",
    "stat3Desc": "Across Surat doorsteps on time",

    # Services
    "servicesBadge": "CONVENIENT ORDERING OPTIONS",
    "servicesTitle": "Our services",
    "servicesCards": [
        {
            "id": 1,
            "image": "/images/salad_single_order.jpg",
            "title": "Salad - Single Order",
            "desc": "10 Different Types of Fresh Handcrafted Salads with Free Delivery in Surat!",
            "btnText": "Order Now",
            "badge": "Daily Express • 30 Mins"
        },
        {
            "id": 3,
            "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
            "title": "Salad - Subscriptions",
            "desc": "21 Different Types of Salad with Free Delivery! (Weekly & Monthly Plans)",
            "btnText": "Book Now",
            "badge": "Best Value • Save up to ₹25/day"
        }
    ],

    # Categories
    "categories": [
        {"id": "all", "label": "All Salads", "count": "21+ varieties", "icon": "🥗"},
        {"id": "Protein House", "label": "Protein House", "count": "05 protein pack", "icon": "⚡"},
        {"id": "Veggies Salad", "label": "Veggies Salad", "count": "06 fatloss salad", "icon": "🌱"},
        {"id": "Paneer Salad", "label": "Paneer Salad", "count": "05 paneer punch", "icon": "🧀"},
        {"id": "Exotic Salad", "label": "Exotic Salad", "count": "06 exotic salad", "icon": "✨"},
        {"id": "Rice Bowl", "label": "Rice Bowl", "count": "03 hot rice bowls", "icon": "🍚"}
    ],

    # Footer & Contact
    "contactPhone": "+91 99258 36117",
    "contactEmail": "support@greesal.in",
    "kitchenAddress": "Greesal Gourmet Cloud Kitchen, VIP Road, Vesu, Surat, Gujarat 395007",
    "kitchenTiming": "9:00 AM - 8:30 PM (Mon to Sat)",
    "lunchSlot": "11:00 AM - 2:00 PM",
    "eveningSlot": "4:00 PM - 7:00 PM",
    "expressSlot": "Within 30-45 Mins",

    # Shop Timing & Notice
    "isOpen": True,
    "openingTime": "08:00 AM",
    "closingTime": "10:30 PM",
    "shopTimingText": "Open Daily: 8:00 AM – 10:30 PM",
    "notice": "Fresh Organic Harvest Delivered in 30 Mins across Surat • Free Delivery on ₹499+",
    "showNotice": True,
    "noticeType": "announcement",
    "closedMessage": "Our kitchen is currently closed. Opening again at 08:00 AM. Pre-orders are welcome!"
}

def sanitize_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(settings, dict):
        return settings
    res = dict(settings)
    if not res.get("differenceImage1"):
        res["differenceImage1"] = "/images/premium_fresh_ingredients.png"
    phone = str(res.get("contactPhone", ""))
    if not phone or "98251" in phone or "95958" in phone:
        res["contactPhone"] = "+91 99258 36117"
    return res

@router.get("/settings")
@router.get("/api/settings")
@router.get("/admin/settings")
@router.get("/api/admin/settings")
def get_settings():
    db = get_db()
    if db is None:
        logger.warning("MongoDB not available — returning default settings")
        return sanitize_settings(DEFAULT_SITE_SETTINGS)

    try:
        settings = db.settings.find_one({"_id": "homepage"})
        if not settings:
            logger.info("No settings document found in MongoDB — seeding defaults with _id='homepage'")
            seed_data = {k: v for k, v in DEFAULT_SITE_SETTINGS.items() if k != "_id"}
            seed_data["_id"] = "homepage"
            db.settings.replace_one(
                {"_id": "homepage"},
                seed_data,
                upsert=True
            )
            settings = db.settings.find_one({"_id": "homepage"})
            logger.info(f"Seeded default settings to MongoDB ({len(seed_data)} fields)")

        if settings:
            merged = {**DEFAULT_SITE_SETTINGS, **settings}
            if "_id" in merged:
                del merged["_id"]
            logger.info(f"Settings loaded from MongoDB ({len(merged)} fields)")
            return sanitize_settings(merged)
    except Exception as e:
        logger.error(f"Error reading settings from MongoDB: {e}", exc_info=True)

    logger.warning("Returning hardcoded default settings (MongoDB read failed)")
    return sanitize_settings(DEFAULT_SITE_SETTINGS)

@router.post("/admin/settings")
@router.post("/api/admin/settings")
@router.put("/admin/settings")
@router.put("/api/admin/settings")
async def update_settings(request: Request):
    body = await request.json()
    logger.info(f"Received settings update with {len(body)} keys: {list(body.keys())[:10]}...")
    db = get_db()

    existing_settings = dict(DEFAULT_SITE_SETTINGS)
    if db is not None:
        try:
            stored = db.settings.find_one({"_id": "homepage"})
            if stored:
                if "_id" in stored:
                    del stored["_id"]
                existing_settings.update(stored)
        except Exception:
            pass

    # Deep merge incoming updates
    updated_data = {**existing_settings, **body}

    # Bidirectional sync between Hero Banner studio fields and Homepage Hero settings
    if "title" in body:
        updated_data["heroSlogan"] = body["title"]
    if "heroSlogan" in body:
        updated_data["title"] = body["heroSlogan"]
    if "badgeText" in body:
        updated_data["heroBadge"] = body["badgeText"]
    if "heroBadge" in body:
        updated_data["badgeText"] = body["heroBadge"]
    if "pill1Text" in body:
        updated_data["heroPill1"] = body["pill1Text"]
    if "heroPill1" in body:
        updated_data["pill1Text"] = body["heroPill1"]
    if "pill2Text" in body:
        updated_data["heroPill2"] = body["pill2Text"]
    if "heroPill2" in body:
        updated_data["pill2Text"] = body["heroPill2"]
    if "highlight3Title" in body:
        updated_data["heroStatDelivered"] = body["highlight3Title"]
    if "heroStatDelivered" in body:
        updated_data["highlight3Title"] = body["heroStatDelivered"]
    if "highlight3Subtitle" in body:
        updated_data["heroStatBadge"] = body["highlight3Subtitle"]
    if "heroStatBadge" in body:
        updated_data["highlight3Subtitle"] = body["heroStatBadge"]
    if "description" in body:
        updated_data["heroStoryP1"] = body["description"]
    if "heroStoryP1" in body:
        updated_data["description"] = body["heroStoryP1"]

    # Preserve array collections if not provided in partial update
    if "categories" not in body or not isinstance(body["categories"], list):
        updated_data["categories"] = existing_settings.get("categories", DEFAULT_SITE_SETTINGS["categories"])
    if "differenceCards" not in body or not isinstance(body["differenceCards"], list):
        updated_data["differenceCards"] = existing_settings.get("differenceCards", DEFAULT_SITE_SETTINGS["differenceCards"])
    if "servicesCards" not in body or not isinstance(body["servicesCards"], list):
        updated_data["servicesCards"] = existing_settings.get("servicesCards", DEFAULT_SITE_SETTINGS["servicesCards"])

    if "_id" in updated_data:
        del updated_data["_id"]

    if db is not None:
        try:
            result = db.settings.update_one(
                {"_id": "homepage"},
                {"$set": updated_data},
                upsert=True
            )
            logger.info(
                f"Settings saved to MongoDB Atlas (matched={result.matched_count}, "
                f"modified={result.modified_count}, upserted={result.upserted_id is not None})"
            )
        except Exception as e:
            logger.error(f"❌ Failed to save settings to MongoDB: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        logger.warning("MongoDB not available — settings NOT persisted to database!")

    return {
        "success": True,
        "message": "Store settings, categories and site texts saved successfully",
        "settings": sanitize_settings(updated_data)
    }
