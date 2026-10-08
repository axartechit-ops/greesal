from functools import wraps
from flask import request, jsonify
from backend.config import INTERNAL_API_KEY

def require_internal_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # If no key is set on server, allow internal dev access or check header
        if INTERNAL_API_KEY:
            incoming_key = request.headers.get("X-Internal-Key", "")
            if incoming_key != INTERNAL_API_KEY:
                return jsonify({"error": "Unauthorized. Invalid or missing internal API key"}), 401
        return f(*args, **kwargs)
    return decorated_function
