from flask import Blueprint, request, jsonify
from bson import ObjectId
from backend.database import get_db
from backend.security import require_internal_key

salads_bp = Blueprint('salads', __name__)

DEFAULT_SALADS_DATA = [
    {
        "name": "Premium High Protein Salad",
        "calories": "387 Kcal",
        "protein": "19g Protein",
        "price": "₹349",
        "tag": "High Protein",
        "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
        "ingredients": ["Boiled Chickpeas", "Beetroot", "Cabbage", "Zucchini - yellow + green", "Carrot", "Capsicum", "Pomegranate", "Pumpkin Seeds", "Watermelon Seeds", "Sunflower Seeds", "Flax Seeds"],
        "gravy": ["Cashew", "Parsley", "Mint", "Honey", "Watermelon Seeds", "Black Pepper Powder", "Basil", "Chilli Flakes", "Chat Masala"],
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
        "ingredients": ["Rajma", "Rice", "Paneer", "Salsa", "Sweet Corn", "Cabbage - green + purple", "Zucchini - yellow + green", "Carrot", "Capsicum - yellow / green / red"],
        "gravy": ["Paneer", "Walnuts", "Pistachios", "Honey", "Watermelon Seeds", "Black Pepper Powder", "Basil", "Chilli Flakes", "Chat Masala"],
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
        "ingredients": ["Mix Sprout Bean", "Masala Peanuts", "Paneer", "Cabbage - green + purple", "Zucchini", "Carrot", "Capsicum", "Beetroot", "Pumpkin Seeds", "Watermelon Seeds", "Sunflower Seeds", "Flax Seeds"],
        "gravy": ["Olive Oil", "Honey", "Oregano", "Black Pepper Powder", "Chilli Flakes", "Chat Masala", "Lemon"],
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
        "ingredients": ["Mix Sprout Bean", "Paneer", "Cabbage - green + purple", "Zucchini", "Carrot", "Capsicum", "Beetroot", "Pomegranate", "Pumpkin Seeds", "Sunflower Seeds", "Flax Seeds"],
        "gravy": ["Cashew", "Parsley", "Mint", "Honey", "Watermelon Seeds", "Black Pepper Powder", "Basil", "Chilli Flakes", "Chat Masala"],
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
        "ingredients": ["Mushroom", "Paneer", "Broccoli", "Cabbage - green + purple", "Zucchini - yellow + green", "Carrot", "Capsicum - yellow + green", "Pumpkin Seeds", "Watermelon Seeds", "Sunflower Seeds", "Flax Seeds"],
        "gravy": ["Tomato Sauce", "Soy Sauce", "Chilli Flakes", "Chat Masala", "Olive Oil"],
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
        "ingredients": ["Rajma", "Salsa", "Sweet Corn", "Cabbage - green + purple", "Zucchini - yellow + green", "Carrot", "Capsicum - yellow + green", "Nachos", "Pumpkin Seeds", "Watermelon Seeds", "Sunflower Seeds", "Flax Seeds"],
        "gravy": ["Olive Oil", "Honey", "Oregano", "Black Pepper Powder", "Chilli Flakes", "Chat Masala", "Lemon"],
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
        "ingredients": ["Avocado", "Quinoa", "Paneer", "Sweet Corn", "Cabbage", "Zucchini", "Carrot", "Capsicum - yellow + green", "Beetroot", "Pomegranate", "Flax Seeds"],
        "gravy": ["Olive Oil", "Honey", "Oregano", "Black Pepper Powder", "Chilli Flakes", "Chat Masala", "Lemon"],
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

def format_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@salads_bp.route('/salads', methods=['GET'])
@salads_bp.route('/admin/salads', methods=['GET'])
def get_salads():
    db = get_db()
    if db is None:
        return jsonify([
            {**s, "_id": f"fallback-{idx+1}"} for idx, s in enumerate(DEFAULT_SALADS_DATA)
        ]), 200

    try:
        collection = db.salads
        salads = list(collection.find({}))
        if not salads:
            collection.insert_many([dict(s) for s in DEFAULT_SALADS_DATA])
            salads = list(collection.find({}))
        return jsonify([format_doc(s) for s in salads]), 200
    except Exception as e:
        return jsonify([
            {**s, "_id": f"fallback-{idx+1}"} for idx, s in enumerate(DEFAULT_SALADS_DATA)
        ]), 200

@salads_bp.route('/salads/<salad_id>', methods=['GET'])
def get_salad(salad_id):
    db = get_db()
    if db is not None:
        try:
            query = {"_id": ObjectId(salad_id)} if ObjectId.is_valid(salad_id) else {"_id": salad_id}
            salad = db.salads.find_one(query)
            if salad:
                return jsonify(format_doc(salad)), 200
        except Exception:
            pass

    # Search in default list by index or name
    for idx, s in enumerate(DEFAULT_SALADS_DATA):
        if str(idx + 1) == str(salad_id) or f"fallback-{idx+1}" == str(salad_id):
            return jsonify({**s, "_id": str(salad_id)}), 200

    return jsonify({"error": "Salad not found"}), 404

@salads_bp.route('/admin/salads', methods=['POST'])
@salads_bp.route('/salads', methods=['POST'])
def create_salad():
    data = request.get_json() or {}
    if not data.get('name') or not data.get('price'):
        return jsonify({"error": "Salad name and price are required"}), 400

    db = get_db()
    if db is None:
        return jsonify({"error": "Database not available"}), 503

    try:
        result = db.salads.insert_one(data)
        data["_id"] = str(result.inserted_id)
        return jsonify({"message": "Salad added successfully", "salad": data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@salads_bp.route('/admin/salads/<salad_id>', methods=['PUT'])
def update_salad(salad_id):
    data = request.get_json() or {}
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not available"}), 503

    try:
        query = {"_id": ObjectId(salad_id)} if ObjectId.is_valid(salad_id) else {"_id": salad_id}
        if "_id" in data:
            del data["_id"]
        db.salads.update_one(query, {"$set": data})
        return jsonify({"message": "Salad updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@salads_bp.route('/admin/salads/<salad_id>', methods=['DELETE'])
def delete_salad(salad_id):
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not available"}), 503

    try:
        query = {"_id": ObjectId(salad_id)} if ObjectId.is_valid(salad_id) else {"_id": salad_id}
        db.salads.delete_one(query)
        return jsonify({"message": "Salad deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
