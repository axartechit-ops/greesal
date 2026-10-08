import logging
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import FRONTEND_URL, PORT
from backend.database import connect_to_mongo, close_mongo_connection
from backend.routes import (
    health_bp,
    salads_bp,
    orders_bp,
    reviews_bp,
    settings_bp,
    auth_bp,
    location_bp
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("greesal")

def create_app():
    app = Flask(__name__)

    # Enable CORS
    CORS(
        app,
        origins=[
            FRONTEND_URL,
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001"
        ],
        supports_credentials=True
    )

    # Initialize Database Connection
    connect_to_mongo()

    # Register Route Blueprints (both root & /api prefixes for flexibility)
    app.register_blueprint(health_bp)
    app.register_blueprint(salads_bp)
    app.register_blueprint(salads_bp, url_prefix='/api')
    app.register_blueprint(orders_bp)
    app.register_blueprint(orders_bp, url_prefix='/api')
    app.register_blueprint(reviews_bp)
    app.register_blueprint(reviews_bp, url_prefix='/api')
    app.register_blueprint(settings_bp)
    app.register_blueprint(settings_bp, url_prefix='/api')
    app.register_blueprint(auth_bp)
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(location_bp)
    app.register_blueprint(location_bp, url_prefix='/api')

    @app.route("/")
    def index():
        return jsonify({
            "app": "Greesal Flask Backend API",
            "status": "online",
            "framework": "Flask 3.x",
            "endpoints": [
                "/health",
                "/salads",
                "/admin/salads",
                "/orders",
                "/admin/orders",
                "/reviews",
                "/admin/reviews",
                "/settings",
                "/admin/settings",
                "/auth/send-otp",
                "/auth/login-verify",
                "/location/check-delivery"
            ]
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    logger.info(f"Starting Greesal Flask server on port {PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=True)
