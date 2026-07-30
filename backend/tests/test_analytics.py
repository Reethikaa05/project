import io

def test_compute_edge_cases(client, auth_headers):
    # Create dataset with numeric, text, and all-null columns
    csv_content = (
        "Name,Age,Salary,Notes,EmptyCol\n"
        "Alice,25,50000.0,Engineer,\n"
        "Bob,30,60000.0,Manager,\n"
        "Charlie,35,75000.0,Director,\n"
    )
    file = ("edge_test.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    upload_resp = client.post(
        "/api/datasets/upload",
        data={"name": "Analytics Edge Test"},
        files={"file": file},
        headers=auth_headers
    )
    assert upload_resp.status_code == 201
    dataset_id = upload_resp.json()["id"]

    # 1. Normal Numeric Stat: Sum of Salary
    sum_resp = client.post(
        "/api/analytics/compute",
        json={"dataset_id": dataset_id, "column_name": "Salary", "stat_type": "sum"},
        headers=auth_headers
    )
    assert sum_resp.status_code == 200
    assert sum_resp.json()["value"] == 185000.0

    # 2. Normal Numeric Stat: Min of Age
    min_resp = client.post(
        "/api/analytics/compute",
        json={"dataset_id": dataset_id, "column_name": "Age", "stat_type": "min"},
        headers=auth_headers
    )
    assert min_resp.status_code == 200
    assert min_resp.json()["value"] == 25.0

    # 3. Edge Case: Non-numeric column requested for numeric stat (e.g. sum of 'Name') -> 400 Bad Request
    err_resp = client.post(
        "/api/analytics/compute",
        json={"dataset_id": dataset_id, "column_name": "Name", "stat_type": "sum"},
        headers=auth_headers
    )
    assert err_resp.status_code == 400
    assert "non-numeric" in err_resp.json()["detail"].lower()

    # 4. Edge Case: All-null column requested for numeric stat -> 400 Bad Request
    null_resp = client.post(
        "/api/analytics/compute",
        json={"dataset_id": dataset_id, "column_name": "EmptyCol", "stat_type": "mean"},
        headers=auth_headers
    )
    assert null_resp.status_code == 400
    assert "all null" in null_resp.json()["detail"].lower()

    # 5. All-null column requested for 'null_count' -> 200 OK with value 3
    null_cnt_resp = client.post(
        "/api/analytics/compute",
        json={"dataset_id": dataset_id, "column_name": "EmptyCol", "stat_type": "null_count"},
        headers=auth_headers
    )
    assert null_cnt_resp.status_code == 200
    assert null_cnt_resp.json()["value"] == 3

    # 6. Test Chart Generation (Scatter Plot: Age vs Salary)
    chart_resp = client.post(
        "/api/analytics/chart-data",
        json={
            "dataset_id": dataset_id,
            "x_column": "Age",
            "y_column": "Salary",
            "chart_type": "scatter"
        },
        headers=auth_headers
    )
    assert chart_resp.status_code == 200
    c_data = chart_resp.json()
    assert c_data["chart_type"] == "scatter"
    assert "option" in c_data
