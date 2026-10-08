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

DEFAULT_MONGO_URL = "mongodb://localhost:27017/greesal"

MONGODB_URL: str = os.getenv("MONGODB_URL") or os.getenv("MONGODB_URI") or DEFAULT_MONGO_URL
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "greesal")
PORT: int = int(os.getenv("PORT", "8000"))
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
INTERNAL_API_KEY: str = os.getenv("INTERNAL_API_KEY", "")
SECRET_KEY: str = os.getenv("SECRET_KEY", "greesal_flask_secret_2026")
