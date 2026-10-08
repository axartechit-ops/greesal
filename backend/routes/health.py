import time
from flask import Blueprint, jsonify
from backend.database import get_db

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    db = get_db()
    db_status = "connected" if db is not None else "disconnected (using fallback)"
    return jsonify({
        "status": "healthy",
        "service": "Greesal Flask Backend",
        "framework": "Flask 3.x",
        "timestamp": int(time.time()),
        "database": db_status
    }), 200
