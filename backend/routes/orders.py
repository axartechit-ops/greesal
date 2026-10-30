import time
import random
import re
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Request, status
from bson import ObjectId
from backend.database import get_db

router = APIRouter(tags=["Orders"])

LOCAL_ORDERS_FILE = Path(__file__).parent.parent / "local_orders.json"
LOCAL_SALADS_FILE = Path(__file__).parent.parent / "local_salads.json"

def get_real_salad_image(salad_name: str) -> Optional[str]:
    """Look up original high-resolution salad image from local_salads.json or database."""
    if not salad_name:
        return None
    # Strip (300g), (Without: ...), etc.
    clean_name = re.sub(r"\(.*?\)", "", salad_name).strip().lower()
    if not clean_name:
        return None
    try:
        if LOCAL_SALADS_FILE.exists():
            with open(LOCAL_SALADS_FILE, "r", encoding="utf-8") as f:
                salads_list = json.load(f)
                if isinstance(salads_list, list):
                    for s in salads_list:
                        s_name = str(s.get("name", "")).strip().lower()
                        if s_name and (clean_name in s_name or s_name in clean_name):
                            if s.get("image"):
                                return s.get("image")
    except Exception:
        pass
    return None

def load_local_orders() -> List[Dict[str, Any]]:
    if LOCAL_ORDERS_FILE.exists():
        try:
            with open(LOCAL_ORDERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as e:
            print(f"Warning: Failed to load local orders: {e}")
    return []

def save_local_orders(orders: List[Dict[str, Any]]):
    try:
        with open(LOCAL_ORDERS_FILE, "w", encoding="utf-8") as f:
            json.dump(orders, f, indent=2, default=str)
    except Exception as e:
        print(f"Warning: Failed to save local orders: {e}")

DEFAULT_ORDERS: List[Dict[str, Any]] = []

def format_order_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    res = dict(doc)
    str_id = str(res.get("_id", ""))
    res["_id"] = str_id
    order_id = res.get("orderNumber") or res.get("id") or f"GRS-{str_id[-5:].upper()}"
    res["id"] = order_id
    res["orderNumber"] = order_id
    res["status"] = str(res.get("status") or "Placed")
    res["customerName"] = str(res.get("customerName") or "Greesal Member")
    res["customerMobile"] = str(res.get("customerMobile") or "")
    res["customerEmail"] = str(res.get("customerEmail") or "")
    res["deliveryAddress"] = str(res.get("deliveryAddress") or "Surat Doorstep")
    res["deliverySlot"] = str(res.get("deliverySlot") or "Immediate")
    res["date"] = str(res.get("date") or "Recently")
    res["timestamp"] = int(res.get("timestamp") or time.time() * 1000)
    res["addressMode"] = str(res.get("addressMode") or ("google_map" if (res.get("mapsUrl") or res.get("locationCoords")) else "manual"))
    res["manualAddressDetails"] = res.get("manualAddressDetails") or {}
    
    location_coords = res.get("locationCoords")
    maps_url = res.get("mapsUrl")
    if not maps_url and location_coords and isinstance(location_coords, dict):
        maps_url = f"https://maps.google.com/?q={location_coords.get('lat')},{location_coords.get('lng')}"
    elif not maps_url and res.get("deliveryAddress"):
        maps_url = f"https://www.google.com/maps/search/?api=1&query={res.get('deliveryAddress')}"
    res["mapsUrl"] = maps_url or ""
    res["locationCoords"] = location_coords

    # Normalize items array and ensure actual salad images are retained
    raw_items = res.get("items") or []
    norm_items = []
    for it in raw_items:
        if isinstance(it, dict):
            p = it.get("price", "0")
            p_str = f"₹{str(p).replace('₹', '').strip()}" if p is not None else "₹0"
            img = it.get("image") or ""
            item_name = str(it.get("name") or "Salad Bowl")

            # If image is empty or the generic unsplash placeholder, restore the authentic salad image!
            if not img or "photo-1540420773420-3366772f4999" in str(img):
                real_salad_img = get_real_salad_image(item_name)
                if real_salad_img:
                    img = real_salad_img
                elif not img:
                    img = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80"

            norm_items.append({
                **it,
                "name": item_name,
                "price": p_str,
                "quantity": int(it.get("quantity") or 1),
                "image": img
            })
    res["items"] = norm_items

    try:
        res["total"] = float(str(res.get("total", 0)).replace("₹", "").strip() or 0)
    except Exception:
        res["total"] = 0.0
    try:
        res["subtotal"] = float(str(res.get("subtotal", 0)).replace("₹", "").strip() or res["total"])
    except Exception:
        res["subtotal"] = res["total"]

    return res

@router.get("/orders")
@router.get("/api/orders")
@router.get("/admin/orders")
@router.get("/api/admin/orders")
def get_orders(
    mobile: Optional[str] = Query(None),
    email: Optional[str] = Query(None)
):
    db = get_db()
    if db is None:
        local = load_local_orders()
        if local:
            return local
        return [
            {**o, "_id": f"temp-{idx}", "id": o.get("orderNumber")}
            for idx, o in enumerate(DEFAULT_ORDERS)
        ]

    try:
        # Purge demo orders if present
        db.orders.delete_many({
            "$or": [
                {"orderNumber": {"$in": ["GRS-90844", "GRS-84920", "GRS-79214", "GRS-61803"]}},
                {"id": {"$in": ["GRS-90844", "GRS-84920", "GRS-79214", "GRS-61803"]}},
                {"customerName": {"$regex": "FastAPI Tester", "$options": "i"}}
            ]
        })

        query_filter: Dict[str, Any] = {}
        if mobile:
            clean_digits = re.sub(r"\D", "", mobile)[-10:]
            if clean_digits:
                query_filter["customerMobile"] = {"$regex": clean_digits, "$options": "i"}
        elif email:
            query_filter["customerEmail"] = {"$regex": f"^{re.escape(email.strip())}$", "$options": "i"}

        orders = list(db.orders.find(query_filter).sort("timestamp", -1))
        formatted = []
        for o in orders:
            doc = format_order_doc(o)
            order_id = doc.get("orderNumber") or doc.get("id")
            if order_id in ["GRS-90844", "GRS-84920", "GRS-79214", "GRS-61803"]:
                continue
            formatted.append(doc)

        if not mobile and not email and formatted:
            save_local_orders(formatted)

        return formatted
    except Exception as e:
        print(f"Error fetching orders from DB: {e}")
        local = load_local_orders()
        if local:
            return local
        return [
            {**o, "_id": f"temp-{idx}", "id": o.get("orderNumber")}
            for idx, o in enumerate(DEFAULT_ORDERS)
        ]

@router.post("/orders", status_code=status.HTTP_201_CREATED)
@router.post("/api/orders", status_code=status.HTTP_201_CREATED)
@router.post("/admin/orders", status_code=status.HTTP_201_CREATED)
@router.post("/api/admin/orders", status_code=status.HTTP_201_CREATED)
async def create_order(request: Request):
    data = await request.json()
    items = data.get("items", [])
    if not items or len(items) == 0:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    now = datetime.now()
    formatted_date = data.get("date") or f"Today, {now.strftime('%I:%M %p')}"
    order_num = data.get("orderNumber") or data.get("id") or f"GRS-{random.randint(10000, 99999)}"

    location_coords = data.get("locationCoords")
    maps_url = data.get("mapsUrl")
    if not maps_url and location_coords and isinstance(location_coords, dict):
        maps_url = f"https://maps.google.com/?q={location_coords.get('lat')},{location_coords.get('lng')}"

    address_mode = data.get("addressMode") or ("google_map" if (maps_url or location_coords) else "manual")
    manual_details = data.get("manualAddressDetails") or {}

    new_order = {
        "id": order_num,
        "orderNumber": order_num,
        "customerName": str(data.get("customerName", "Greesal Member")).strip(),
        "customerEmail": str(data.get("customerEmail", "")).strip(),
        "customerMobile": str(data.get("customerMobile", "")).strip(),
        "date": formatted_date,
        "timestamp": int(data.get("timestamp") or time.time() * 1000),
        "status": data.get("status", "Placed"),
        "items": items,
        "subtotal": float(data.get("subtotal", 0)),
        "deliveryFee": float(data.get("deliveryFee", 0)),
        "total": float(data.get("total", 0)),
        "deliveryAddress": str(data.get("deliveryAddress", "")).strip(),
        "deliverySlot": data.get("deliverySlot", "lunch"),
        "addressMode": address_mode,
        "manualAddressDetails": manual_details,
        "mapsUrl": maps_url or "",
        "locationCoords": location_coords,
        "notes": str(data.get("notes", "")).strip(),
        "orderType": data.get("orderType", "salad_order"),
        "dietPreference": data.get("dietPreference", ""),
        "paymentMethod": data.get("paymentMethod", "Cash on Delivery / UPI on Delivery"),
        "createdAt": now
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

    # Sync to local backup
    try:
        current_locals = load_local_orders()
        formatted_new = format_order_doc(new_order)
        current_locals = [formatted_new] + [o for o in current_locals if o.get("id") != formatted_new.get("id")]
        save_local_orders(current_locals)
    except Exception as e:
        print(f"Warning: Failed to save to local backup: {e}")

    return {
        "success": True,
        "message": "Order placed and recorded successfully",
        "order": new_order
    }

@router.put("/orders")
@router.put("/api/orders")
@router.put("/admin/orders")
@router.put("/api/admin/orders")
@router.put("/admin/orders/{order_id}")
@router.put("/api/admin/orders/{order_id}")
async def update_order_status(request: Request, order_id: Optional[str] = None):
    data = await request.json()
    target_id = order_id or data.get("_id") or data.get("id") or data.get("orderNumber")
    new_status = data.get("status")

    if not target_id:
        raise HTTPException(status_code=400, detail="Order ID is required")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")

    # Update in local backup
    try:
        current_locals = load_local_orders()
        for idx, o in enumerate(current_locals):
            if o.get("id") == target_id or o.get("orderNumber") == target_id or o.get("_id") == target_id:
                current_locals[idx]["status"] = new_status
                break
        save_local_orders(current_locals)
    except Exception as e:
        print(f"Warning: Failed to update local backup: {e}")

    db = get_db()
    if db is None:
        return {"message": "Order status updated in local store", "modifiedCount": 1}

    try:
        query_list = [{"id": target_id}, {"orderNumber": target_id}, {"_id": target_id}]
        if ObjectId.is_valid(target_id):
            query_list.append({"_id": ObjectId(target_id)})

        result = db.orders.update_one(
            {"$or": query_list},
            {"$set": {"status": new_status, "updatedAt": int(time.time())}}
        )

        return {"message": "Order status updated successfully", "modifiedCount": result.modified_count}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/orders")
@router.delete("/api/orders")
@router.delete("/admin/orders")
@router.delete("/api/admin/orders")
@router.delete("/admin/orders/{order_id}")
@router.delete("/api/admin/orders/{order_id}")
def delete_order(order_id: Optional[str] = None, id: Optional[str] = Query(None)):
    target_id = order_id or id
    if not target_id:
        raise HTTPException(status_code=400, detail="Order ID is required")

    # Remove from local backup
    try:
        current_locals = load_local_orders()
        current_locals = [o for o in current_locals if o.get("id") != target_id and o.get("orderNumber") != target_id and o.get("_id") != target_id]
        save_local_orders(current_locals)
    except Exception as e:
        print(f"Warning: Failed to delete from local backup: {e}")

    db = get_db()
    if db is None:
        return {"message": "Order deleted from local store"}

    try:
        query_list = [{"id": target_id}, {"orderNumber": target_id}, {"_id": target_id}]
        if ObjectId.is_valid(target_id):
            query_list.append({"_id": ObjectId(target_id)})

        result = db.orders.delete_one({"$or": query_list})
        return {"message": "Order deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
