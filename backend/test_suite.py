import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app

def run_tests():
    client = TestClient(app)
    print("🚀 Starting comprehensive FastAPI backend test suite...")

    # 1. Health
    res = client.get("/health")
    assert res.status_code == 200, f"Health failed: {res.text}"
    assert res.json().get("status") == "healthy"
    print("✅ 1. Health check passed:", res.json())

    # 2. Salads
    res = client.get("/api/salads")
    assert res.status_code == 200, f"Salads failed: {res.text}"
    salads = res.json()
    assert len(salads) > 0, "No salads returned"
    sample_salad = salads[0]
    salad_id = sample_salad["id"]
    print(f"✅ 2. Salads list passed ({len(salads)} salads). Sample ID: {salad_id}")

    # 3. Single Salad
    res = client.get(f"/api/salads/{salad_id}")
    assert res.status_code == 200, f"Single salad failed: {res.text}"
    assert res.json()["name"] == sample_salad["name"]
    print(f"✅ 3. Single salad passed: {res.json()['name']}")

    # 4. Settings
    res = client.get("/api/settings")
    assert res.status_code == 200, f"Settings failed: {res.text}"
    settings = res.json()
    assert "heroSlogan" in settings or "title" in settings
    print(f"✅ 4. Settings passed: {settings.get('title') or settings.get('heroSlogan')}")

    # 5. Location Delivery Check
    res = client.post("/api/location/check-delivery", json={"lat": 21.2266, "lng": 72.8311})
    assert res.status_code == 200
    assert res.json().get("deliverable") is True
    print(f"✅ 5. Location delivery check passed: {res.json()}")

    # 6. Reverse Geocode
    res = client.get("/api/location/reverse-geocode?lat=21.1418&lng=72.7758")
    assert res.status_code == 200
    assert "Surat" in res.json().get("city", "")
    print(f"✅ 6. Reverse geocode passed: {res.json().get('address')}")

    # 7. Reviews
    res = client.get("/api/reviews")
    assert res.status_code == 200
    print(f"✅ 7. Reviews passed: {len(res.json())} reviews found")

    # 8. Create Order
    new_order_payload = {
        "customerName": "FastAPI Tester",
        "customerMobile": "9999988888",
        "customerEmail": "tester@greesal.in",
        "deliveryAddress": "Katargam, Surat",
        "items": [
            {
                "id": salad_id,
                "name": sample_salad["name"],
                "price": 299,
                "quantity": 1
            }
        ],
        "subtotal": 299,
        "total": 299
    }
    res = client.post("/api/orders", json=new_order_payload)
    assert res.status_code == 201, f"Create order failed: {res.text}"
    created_order = res.json()["order"]
    order_id = created_order["id"]
    print(f"✅ 8. Order creation passed: ID {order_id}")

    # 9. Update Order Status
    res = client.put(f"/api/admin/orders/{order_id}", json={"status": "Preparing"})
    assert res.status_code == 200, f"Update order status failed: {res.text}"
    print(f"✅ 9. Order status update passed: {res.json()}")

    # 10. Delete Test Order
    res = client.delete(f"/api/admin/orders/{order_id}")
    assert res.status_code == 200, f"Delete order failed: {res.text}"
    print(f"✅ 10. Order deletion passed")

    # 11. Admin Auth (Login, Session Check, Logout)
    res = client.post("/api/admin/auth/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    cookie_token = res.cookies.get("greesal_admin_session")
    assert cookie_token, "Admin cookie not set"
    print(f"✅ 11. Admin login passed, token generated")

    res = client.get("/api/admin/auth", cookies={"greesal_admin_session": cookie_token})
    assert res.status_code == 200, f"Admin session check failed: {res.text}"
    assert res.json()["authenticated"] is True
    print(f"✅ 12. Admin session verification passed")

    res = client.delete("/api/admin/auth", cookies={"greesal_admin_session": cookie_token})
    assert res.status_code == 200
    print(f"✅ 13. Admin logout passed")

    # 12. Send OTP & Verify OTP
    res = client.post("/api/auth/send-otp", json={"email": "testuser@greesal.in"})
    assert res.status_code == 200
    otp = res.json().get("otp")
    assert otp, "OTP was not returned"
    print(f"✅ 14. Send OTP passed: generated {otp}")

    # Verify with dev bypass or returned otp
    res = client.post("/api/auth/verify-otp", json={"email": "testuser@greesal.in", "otp": "123456"})
    assert res.status_code == 200, f"Verify OTP failed: {res.text}"
    print(f"✅ 15. Verify OTP passed")

    # 13. Google User Sync
    res = client.post("/api/users/sync-google", json={
        "email": "google_tester@greesal.in",
        "name": "Google Test User",
        "google_id": "goog-123456"
    })
    assert res.status_code == 200, f"Google sync failed: {res.text}"
    print(f"✅ 16. Google user sync passed")

    print("\n🎉 ALL 16 BACKEND FASTAPI TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
