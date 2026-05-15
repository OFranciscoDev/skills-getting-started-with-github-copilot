import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

# Test GET /activities
def test_get_activities():
    # Arrange
    # (No setup needed, just call endpoint)
    # Act
    response = client.get("/activities")
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

# Test POST /activities/{activity_name}/signup
def test_signup_for_activity():
    # Arrange
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # Clean up: remove test user
    client.delete(f"/activities/{activity}/participant?email={email}")

# Test DELETE /activities/{activity_name}/participant
def test_remove_participant():
    # Arrange
    activity = "Chess Club"
    email = "removeuser@mergington.edu"
    # Add user first
    client.post(f"/activities/{activity}/signup?email={email}")
    # Act
    response = client.delete(f"/activities/{activity}/participant?email={email}")
    # Assert
    assert response.status_code == 200
    assert f"Removed {email} from {activity}" in response.json()["message"]
    # Try removing again (should 404)
    response2 = client.delete(f"/activities/{activity}/participant?email={email}")
    assert response2.status_code == 404
