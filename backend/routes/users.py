from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from datetime import datetime, timezone
from backend.database import get_database
from backend.models import UserCreate, UserUpdate, UserInDB
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/users", tags=["Users"])

# In-memory storage fallback for users
in_memory_users: List[dict] = []

@router.post("/sync-google", response_model=UserInDB, status_code=status.HTTP_200_OK)
async def sync_google_user(
    user_data: UserCreate,
    db: Optional[AsyncIOMotorDatabase] = Depends(get_database)
):
    """
    Sync or create a user when authenticated via Google OAuth.
    """
    now = datetime.now(timezone.utc)

    if db is not None:
        try:
            users_collection = db["users"]
            existing_user = await users_collection.find_one({"email": user_data.email})

            if existing_user:
                update_data = {
                    "updated_at": now
                }
                if user_data.name:
                    update_data["name"] = user_data.name
                if user_data.image:
                    update_data["image"] = user_data.image
                if user_data.google_id:
                    update_data["google_id"] = user_data.google_id
                if user_data.mobile:
                    update_data["mobile"] = user_data.mobile

                await users_collection.update_one(
                    {"_id": existing_user["_id"]},
                    {"$set": update_data}
                )
                updated = await users_collection.find_one({"_id": existing_user["_id"]})
                updated["_id"] = str(updated["_id"])
                return updated
            else:
                new_user_dict = user_data.model_dump()
                new_user_dict["created_at"] = now
                new_user_dict["updated_at"] = now

                result = await users_collection.insert_one(new_user_dict)
                new_user_dict["_id"] = str(result.inserted_id)
                return new_user_dict
        except Exception:
            pass

    # Fallback to in-memory store
    for idx, u in enumerate(in_memory_users):
        if u.get("email") == user_data.email:
            if user_data.name:
                u["name"] = user_data.name
            if user_data.image:
                u["image"] = user_data.image
            if user_data.google_id:
                u["google_id"] = user_data.google_id
            if user_data.mobile:
                u["mobile"] = user_data.mobile
            u["updated_at"] = now
            in_memory_users[idx] = u
            return u

    new_user = user_data.model_dump()
    new_user["_id"] = f"usr_{len(in_memory_users) + 1:04d}"
    new_user["created_at"] = now
    new_user["updated_at"] = now
    in_memory_users.append(new_user)
    return new_user

@router.get("/", response_model=List[UserInDB])
async def list_users(
    skip: int = 0,
    limit: int = 20,
    db: Optional[AsyncIOMotorDatabase] = Depends(get_database)
):
    """
    Get all users from MongoDB collection or in-memory store.
    """
    if db is not None:
        try:
            users_collection = db["users"]
            cursor = users_collection.find().skip(skip).limit(limit)
            users = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                users.append(doc)
            return users
        except Exception:
            pass

    return in_memory_users[skip : skip + limit]

@router.get("/{email}", response_model=UserInDB)
async def get_user_by_email(
    email: str,
    db: Optional[AsyncIOMotorDatabase] = Depends(get_database)
):
    """
    Get a specific user by email.
    """
    if db is not None:
        try:
            user = await db["users"].find_one({"email": email})
            if user:
                user["_id"] = str(user["_id"])
                return user
        except Exception:
            pass

    for u in in_memory_users:
        if u.get("email") == email:
            return u

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"User with email '{email}' not found."
    )
