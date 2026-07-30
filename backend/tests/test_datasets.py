import io

def test_dataset_upload_and_pagination(client, auth_headers):
    # Upload 3 small datasets
    for i in range(1, 4):
        csv_content = f"Item,Value\nProduct{i},100\nProduct{i}_b,200\n"
        file = ("test.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
        resp = client.post(
            "/api/datasets/upload",
            data={"name": f"Dataset {i}"},
            files={"file": file},
            headers=auth_headers
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == f"Dataset {i}"
        assert data["row_count"] == 2

    # Test Genuine Pagination: Page 1 with Limit 2
    p1_resp = client.get("/api/datasets?page=1&limit=2", headers=auth_headers)
    assert p1_resp.status_code == 200
    p1_data = p1_resp.json()
    assert p1_data["page"] == 1
    assert p1_data["limit"] == 2
    assert len(p1_data["items"]) == 2
    assert p1_data["total"] >= 3
    assert p1_data["total_pages"] >= 2

    # Test Genuine Pagination: Page 2 with Limit 2
    p2_resp = client.get("/api/datasets?page=2&limit=2", headers=auth_headers)
    assert p2_resp.status_code == 200
    p2_data = p2_resp.json()
    assert p2_data["page"] == 2
    assert len(p2_data["items"]) >= 1

    # Test Dataset Preview
    first_dataset_id = p1_data["items"][0]["id"]
    prev_resp = client.get(f"/api/datasets/{first_dataset_id}/preview?limit=25", headers=auth_headers)
    assert prev_resp.status_code == 200
    prev_data = prev_resp.json()
    assert prev_data["returned_rows"] == 2
    assert len(prev_data["rows"]) == 2

    # Test Delete Dataset
    del_resp = client.delete(f"/api/datasets/{first_dataset_id}", headers=auth_headers)
    assert del_resp.status_code == 204
