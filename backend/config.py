import os
from pathlib import Path
from dotenv import load_dotenv

# Load from backend/.env, root .env.local, and root .env
backend_env = Path(__file__).parent / ".env"
root_env_local = Path(__file__).parent.parent / ".env.local"
root_env = Path(__file__).parent.parent / ".env"

if backend_env.exists():
    load_dotenv(backend_env, override=True)
if root_env_local.exists():
    load_dotenv(root_env_local, override=False)
if root_env.exists():
    load_dotenv(root_env, override=False)

DEFAULT_MONGO_URL = "mongodb+srv://info_db_user:E50Uk0B0scjdJEXV@cluster0.9gjtwsn.mongodb.net/greesal?retryWrites=true&w=majority"

MONGODB_URL: str = os.getenv("MONGODB_URL") or os.getenv("MONGODB_URI") or DEFAULT_MONGO_URL
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "greesal")
PORT: int = int(os.getenv("BACKEND_PORT") or "8000")
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
INTERNAL_API_KEY: str = os.getenv("INTERNAL_API_KEY", "")
SECRET_KEY: str = os.getenv("SECRET_KEY") or os.getenv("NEXTAUTH_SECRET") or "greesal_fastapi_secret_2026"

# Admin Auth Credentials
ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
ADMIN_SECRET: str = os.getenv("ADMIN_SECRET") or os.getenv("NEXTAUTH_SECRET") or "greesal_admin_auth_secret_key_2026"
ADMIN_COOKIE_NAME: str = "greesal_admin_session"

# SMTP Email Configuration
SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER: str = os.getenv("SMTP_USER", "")
SMTP_PASS: str = os.getenv("SMTP_PASS", "")
