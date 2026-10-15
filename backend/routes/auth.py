import random
import re
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, Response, status
from backend.config import ADMIN_COOKIE_NAME
from backend.database import get_db
from backend.security import (
    validate_admin_credentials,
    create_admin_token,
    verify_admin_token,
    hash_password,
    verify_password,
    send_otp_email,
    store_otp,
    verify_stored_otp,
)

router = APIRouter(tags=["Auth"])

# ----------------------------------------------------
# ADMIN AUTH
# ----------------------------------------------------

@router.get("/admin/auth")
@router.get("/api/admin/auth")
def check_admin_auth(request: Request):
    token = request.cookies.get(ADMIN_COOKIE_NAME)
    if not token:
        # Check Authorization header as fallback
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    valid, session = verify_admin_token(token)
    if not valid or not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"authenticated": False, "message": "Not authenticated as admin"}
        )

    return {
        "authenticated": True,
        "user": {
            "username": session.get("username", "admin"),
            "role": session.get("role", "admin")
        }
    }

@router.post("/admin/auth")
@router.post("/api/admin/auth")
@router.post("/admin/auth/login")
@router.post("/api/admin/auth/login")
async def admin_login(request: Request, response: Response):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    remember_me = bool(data.get("rememberMe", False))

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    if not validate_admin_credentials(username, password):
        raise HTTPException(status_code=401, detail="Invalid admin username or password")

    expires_in_days = 30 if remember_me else 7
    token = create_admin_token(username.strip(), expires_in_days)

    max_age_seconds = expires_in_days * 86400
    response.set_cookie(
        key=ADMIN_COOKIE_NAME,
        value=token,
        max_age=max_age_seconds,
        httponly=True,
        samesite="lax",
        path="/"
    )

    return {
        "success": True,
        "message": "Admin login successful",
        "user": {
            "username": username.strip(),
            "role": "admin"
        }
    }

@router.delete("/admin/auth")
@router.delete("/api/admin/auth")
@router.delete("/admin/auth/logout")
@router.delete("/api/admin/auth/logout")
@router.post("/admin/auth/logout")
@router.post("/api/admin/auth/logout")
def admin_logout(response: Response):
    response.delete_cookie(
        key=ADMIN_COOKIE_NAME,
        path="/"
    )
    return {
        "success": True,
        "message": "Admin logged out successfully"
    }

# ----------------------------------------------------
# USER AUTH & OTP
# ----------------------------------------------------

@router.post("/auth/send-otp")
@router.post("/api/auth/send-otp")
async def send_otp(request: Request):
    data = await request.json()
    raw_email = data.get("email") or data.get("identifier") or data.get("mobileNumber")

    if not raw_email:
        raise HTTPException(status_code=400, detail="Email address or phone number is required")

    trimmed = str(raw_email).strip().lower()
    otp_code = str(random.randint(100000, 999999))

    store_otp(trimmed, otp_code)
    send_otp_email(trimmed, otp_code)

    return {
        "success": True,
        "message": f"OTP sent successfully to {trimmed}",
        "otp": otp_code  # Provided for easy local testing
    }

@router.post("/auth/login-verify")
@router.post("/api/auth/login-verify")
@router.post("/auth/verify-otp")
@router.post("/api/auth/verify-otp")
async def login_verify(request: Request):
    data = await request.json()
    identifier = str(data.get("email") or data.get("identifier") or data.get("mobileNumber") or "").strip().lower()
    password = str(data.get("password") or "").strip()
    otp = str(data.get("otp") or "").strip()

    if not identifier:
        raise HTTPException(status_code=400, detail="Email or phone number is required")

    db = get_db()

    # 1. Password verification
    if password:
        user = None
        if db is not None:
            try:
                user = db.users.find_one({"$or": [{"email": identifier}, {"mobile": identifier}]})
            except Exception:
                pass

        if user:
            stored_pw = user.get("password", "")
            if verify_password(password, stored_pw):
                # Password matched! Now send OTP for 2-step verification (or login if OTP also passed)
                if not otp:
                    otp_code = str(random.randint(100000, 999999))
                    store_otp(identifier, otp_code)
                    send_otp_email(identifier, otp_code)
                    return {
                        "success": True,
                        "message": "Password verified. OTP sent successfully to your email.",
                        "otp": otp_code
                    }
                elif verify_stored_otp(identifier, otp):
                    return {
                        "success": True,
                        "message": "Login successful",
                        "user": {
                            "id": str(user.get("_id", "usr-1")),
                            "name": user.get("name", "Greesal Member"),
                            "email": user.get("email", identifier),
                            "mobile": user.get("mobile", identifier)
                        }
                    }
                else:
                    raise HTTPException(status_code=400, detail="Invalid or expired OTP")
            else:
                raise HTTPException(status_code=400, detail="Incorrect password")
        else:
            raise HTTPException(status_code=400, detail="No user found with this email. Please register first.")

    # 2. Direct OTP verification
    if otp:
        if verify_stored_otp(identifier, otp):
            user = None
            if db is not None:
                try:
                    user = db.users.find_one({"$or": [{"email": identifier}, {"mobile": identifier}]})
                except Exception:
                    pass

            return {
                "success": True,
                "message": "OTP verified successfully",
                "user": {
                    "id": str(user.get("_id")) if user else "member-1",
                    "name": user.get("name", "Greesal Member") if user else "Greesal Member",
                    "email": identifier if "@" in identifier else "",
                    "mobile": identifier if "@" not in identifier else ""
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    raise HTTPException(status_code=400, detail="Password or OTP is required")

@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
@router.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
async def register_user(request: Request):
    data = await request.json()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()
    mobile = str(data.get("mobile", "")).strip()
    otp = str(data.get("otp", "")).strip()

    if not email or not password or not mobile or not otp:
        raise HTTPException(status_code=400, detail="Email, password, mobile number, and OTP are required")

    email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address")

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    if not verify_stored_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    db = get_db()
    if db is not None:
        try:
            existing = db.users.find_one({"email": email})
            if existing:
                raise HTTPException(status_code=400, detail="A user with this email already exists")
        except HTTPException:
            raise
        except Exception:
            pass

    hashed_pw = hash_password(password)
    now = datetime.now(timezone.utc)
    new_user = {
        "email": email,
        "password": hashed_pw,
        "mobile": mobile,
        "name": email.split("@")[0],
        "createdAt": now,
        "updatedAt": now
    }

    user_id = "usr-new"
    if db is not None:
        try:
            res = db.users.insert_one(new_user)
            user_id = str(res.inserted_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "message": "User registered successfully",
        "userId": user_id,
        "user": {
            "id": user_id,
            "email": email,
            "name": new_user["name"],
            "mobile": mobile
        }
    }
