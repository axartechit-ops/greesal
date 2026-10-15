import os
import sys
import uvicorn

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    from backend.config import PORT

    print("==================================================")
    print(f" 🥗 Starting Greesal FastAPI Server on http://localhost:{PORT}")
    print(f" 📖 Interactive API Docs at http://localhost:{PORT}/docs")
    print("==================================================")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=PORT, reload=True)
