import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from main import app

client = TestClient(app)

def test_cors_headers():
    response = client.options("/run-task", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers

def test_run_task_endpoint():
    response = client.post("/run-task", json={"prompt": "test prompt"})
    assert response.status_code == 200
    assert response.json()["message"] == "Task started"

def test_websocket_status_stream():
    with client.websocket_connect("/ws") as websocket:
        # Start a task which uses WS broadcast
        client.post("/run-task", json={"prompt": "Say hello!"})
        data = websocket.receive_json()
        assert "type" in data
        assert data["type"] in ["status", "result"]
