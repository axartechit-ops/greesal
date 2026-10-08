import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    from backend.config import PORT
    from backend.main import create_app

    print(f"==================================================")
    print(f" 🥗 Starting Greesal Flask Server on http://localhost:{PORT}")
    print(f"==================================================")
    app = create_app()
    app.run(host="0.0.0.0", port=PORT, debug=True)
