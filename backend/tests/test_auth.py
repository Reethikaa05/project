def test_register_and_login(client):
    email = "newuser@example.com"
    pwd = "secretpassword"
    
    # Register
    reg_resp = client.post("/api/auth/register", json={"email": email, "password": pwd})
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == email

    # Duplicate registration error
    dup_resp = client.post("/api/auth/register", json={"email": email, "password": pwd})
    assert dup_resp.status_code == 400
    assert "already registered" in dup_resp.json()["detail"].lower()

    # Login
    login_resp = client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    
    # Test Refresh Token
    refresh_token = login_data["refresh_token"]
    ref_resp = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_resp.status_code == 200
    assert "access_token" in ref_resp.json()

    # Get Me
    acc_token = ref_resp.json()["access_token"]
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {acc_token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email
