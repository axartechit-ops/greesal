import os
import time
import json
import hmac
import hashlib
import base64
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timezone

from backend.config import (
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    ADMIN_SECRET,
    ADMIN_COOKIE_NAME,
    INTERNAL_API_KEY,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
)
from backend.database import get_db

logger = logging.getLogger("greesal.security")

# Temporary store for generated OTPs: { identifier: { "otp": str, "expires": float } }
OTP_STORE: Dict[str, Dict[str, Any]] = {}

def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def b64url_decode(data_str: str) -> bytes:
    padding = 4 - (len(data_str) % 4)
    if padding and padding < 4:
        data_str += "=" * padding
    return base64.urlsafe_b64decode(data_str.encode("utf-8"))

def hash_password(password: str) -> str:
    """Hash password using PBKDF2 with SHA-512 (format salt:hash)."""
    salt = os.urandom(16).hex()
    hash_val = hashlib.pbkdf2_hmac("sha512", password.encode("utf-8"), salt.encode("utf-8"), 1000, 64).hex()
    return f"{salt}:{hash_val}"

def verify_password(password: str, stored_value: str) -> bool:
    """Verify password against stored salt:hash or legacy SHA-256."""
    if not stored_value:
        return False
    if ":" in stored_value:
        try:
            salt, original_hash = stored_value.split(":")
            hash_val = hashlib.pbkdf2_hmac("sha512", password.encode("utf-8"), salt.encode("utf-8"), 1000, 64).hex()
            return hmac.compare_digest(hash_val, original_hash)
        except Exception:
            return False
    # Fallback to legacy sha256 with salt
    legacy_salt = "greesal_salt_2026"
    legacy_hash = hashlib.sha256(f"{legacy_salt}{password}".encode("utf-8")).hexdigest()
    return hmac.compare_digest(legacy_hash, stored_value)

def validate_admin_credentials(username: Optional[str], password: Optional[str]) -> bool:
    if not username or not password:
        return False
    return (
        username.strip().lower() == ADMIN_USERNAME.strip().lower()
        and password == ADMIN_PASSWORD
    )

def create_admin_token(username: str = "admin", expires_in_days: int = 7) -> str:
    """Create HMAC-SHA256 admin token compatible with Next.js admin-auth."""
    iat = int(time.time() * 1000)
    exp = int((time.time() + expires_in_days * 86400) * 1000)
    payload = {
        "username": username.strip(),
        "role": "admin",
        "iat": iat,
        "exp": exp,
    }
    payload_json = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = b64url_encode(payload_json)

    signature_raw = hmac.new(
        ADMIN_SECRET.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).digest()
    signature_b64 = b64url_encode(signature_raw)

    return f"{payload_b64}.{signature_b64}"

def verify_admin_token(token: Optional[str]) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """Verify HMAC-SHA256 admin token."""
    if not token or not isinstance(token, str) or "." not in token:
        return False, None

    parts = token.split(".")
    if len(parts) != 2:
        return False, None

    payload_b64, signature_b64 = parts

    expected_sig_raw = hmac.new(
        ADMIN_SECRET.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).digest()
    expected_sig_b64 = b64url_encode(expected_sig_raw)

    if not hmac.compare_digest(signature_b64, expected_sig_b64):
        return False, None

    try:
        payload_json = b64url_decode(payload_b64).decode("utf-8")
        payload = json.loads(payload_json)

        exp = payload.get("exp", 0)
        current_ms = int(time.time() * 1000)
        if current_ms > exp:
            return False, None

        return True, payload
    except Exception:
        return False, None

def send_otp_email(to_email: str, otp: str) -> bool:
    """Send OTP code via SMTP if configured, always logging to console."""
    logger.info(f"🔑 [OTP GENERATED] To: {to_email} | Code: {otp}")

    if not SMTP_PASS or not SMTP_USER:
        logger.info("SMTP_PASS or SMTP_USER not configured. OTP logged to console for testing.")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Verify your Greesal Account - OTP Code"
        msg["From"] = f"Greesal Support <{SMTP_USER}>"
        msg["To"] = to_email

        text_content = f"Your OTP for Greesal account verification is: {otp}. It will expire in 5 minutes."
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EBE3D5; border-radius: 12px; background-color: #FAFAF8;">
          <h2 style="color: #123B2B; text-align: center;">Verify Your Greesal Account</h2>
          <p style="font-size: 16px; color: #4B5563;">Thank you for choosing Greesal. Please use the following One-Time Password (OTP) to complete your account registration. This code is valid for 5 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #123B2B; letter-spacing: 6px; background-color: #F5EFE6; padding: 12px 24px; border-radius: 8px; border: 1px solid #E2DCD2; display: inline-block;">{otp}</span>
          </div>
          <p style="font-size: 14px; color: #6B7280; text-align: center;">If you did not request this verification, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #EBE3D5; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Powered by Greesal - Healthy Food. Happy Life.</p>
        </div>
        """

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=5)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5)
            server.starttls()

        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, to_email, msg.as_string())
        server.quit()
        logger.info(f"Successfully sent OTP email to {to_email}")
        return True
    except Exception as e:
        logger.warning(f"Failed to send email via SMTP ({e}). Fallback to console OTP: {otp}")
        return True

def store_otp(identifier: str, otp: str):
    """Store OTP in memory and in MongoDB."""
    clean_id = identifier.strip().lower()
    expires_at = time.time() + 300  # 5 minutes
    OTP_STORE[clean_id] = {"otp": otp, "expires": expires_at}

    db = get_db()
    if db is not None:
        try:
            db.otps.update_one(
                {"email": clean_id},
                {"$set": {"otp": otp, "expiresAt": datetime.fromtimestamp(expires_at, tz=timezone.utc), "createdAt": datetime.now(timezone.utc)}},
                upsert=True
            )
        except Exception as e:
            logger.warning(f"Failed saving OTP to MongoDB: {e}")

def verify_stored_otp(identifier: str, entered_otp: str) -> bool:
    """Verify OTP against memory store or MongoDB with 123456 dev bypass."""
    clean_id = identifier.strip().lower()
    clean_otp = entered_otp.strip()

    if clean_otp == "123456":
        return True

    # Check in-memory store
    record = OTP_STORE.get(clean_id)
    if record:
        if record["otp"] == clean_otp and time.time() <= record["expires"]:
            del OTP_STORE[clean_id]
            return True

    # Check MongoDB
    db = get_db()
    if db is not None:
        try:
            doc = db.otps.find_one({"email": clean_id, "otp": clean_otp})
            if doc:
                exp = doc.get("expiresAt")
                if exp and isinstance(exp, datetime):
                    if datetime.now(timezone.utc) <= exp.replace(tzinfo=timezone.utc if exp.tzinfo is None else exp.tzinfo):
                        db.otps.delete_one({"_id": doc["_id"]})
                        return True
                else:
                    db.otps.delete_one({"_id": doc["_id"]})
                    return True
        except Exception:
            pass

    return False
