from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Request, status
from backend.database import get_db

router = APIRouter(tags=["Users"])

in_memory_users: List[dict] = []

@router.post("/users/sync-google", status_code=status.HTTP_200_OK)
@router.post("/api/users/sync-google", status_code=status.HTTP_200_OK)
async def sync_google_user(request: Request):
    user_data = await request.json()
    email = user_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    now = datetime.now(timezone.utc)
    db = get_db()

    if db is not None:
        try:
            existing_user = db.users.find_one({"email": email})
            if existing_user:
                update_data = {"updatedAt": now}
                if user_data.get("name"):
                    update_data["name"] = user_data["name"]
                if user_data.get("image"):
                    update_data["image"] = user_data["image"]
                if user_data.get("google_id"):
                    update_data["google_id"] = user_data["google_id"]
                if user_data.get("mobile"):
                    update_data["mobile"] = user_data["mobile"]

                db.users.update_one({"_id": existing_user["_id"]}, {"$set": update_data})
                updated = db.users.find_one({"_id": existing_user["_id"]})
                updated["_id"] = str(updated["_id"])
                return updated
            else:
                new_user_dict = dict(user_data)
                new_user_dict["createdAt"] = now
                new_user_dict["updatedAt"] = now
                result = db.users.insert_one(new_user_dict)
                new_user_dict["_id"] = str(result.inserted_id)
                return new_user_dict
        except Exception:
            pass

    for idx, u in enumerate(in_memory_users):
        if u.get("email") == email:
            if user_data.get("name"):
                u["name"] = user_data["name"]
            if user_data.get("image"):
                u["image"] = user_data["image"]
            u["updatedAt"] = now
            in_memory_users[idx] = u
            return u

    new_user = dict(user_data)
    new_user["_id"] = f"usr_{len(in_memory_users) + 1:04d}"
    new_user["createdAt"] = now
    new_user["updatedAt"] = now
    in_memory_users.append(new_user)
    return new_user

@router.get("/users/")
@router.get("/api/users/")
def list_users(skip: int = 0, limit: int = 20):
    db = get_db()
    if db is not None:
        try:
            cursor = db.users.find().skip(skip).limit(limit)
            users = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                users.append(doc)
            return users
        except Exception:
            pass
    return in_memory_users[skip: skip + limit]

@router.get("/users/{email}")
@router.get("/api/users/{email}")
def get_user_by_email(email: str):
    db = get_db()
    if db is not None:
        try:
            user = db.users.find_one({"email": email})
            if user:
                user["_id"] = str(user["_id"])
                return user
        except Exception:
            pass

    for u in in_memory_users:
        if u.get("email") == email:
            return u

    raise HTTPException(status_code=404, detail=f"User with email '{email}' not found.")
