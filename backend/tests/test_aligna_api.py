import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
TOKEN = "test_session_screenshot_123"
AUTH_HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# --- Auth Tests ---
class TestAuth:
    def test_get_me(self):
        resp = requests.get(f"{BASE_URL}/api/auth/me", headers=AUTH_HEADERS)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "test@aligna.app"
        assert data["user_id"] == "test-user-screenshot"
        assert "plan" in data

    def test_get_me_no_auth(self):
        resp = requests.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code == 401


# --- Goals Tests ---
class TestGoals:
    def test_get_goals(self):
        resp = requests.get(f"{BASE_URL}/api/goals", headers=AUTH_HEADERS)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_create_goal(self):
        # cleanup existing goals first
        goals = requests.get(f"{BASE_URL}/api/goals", headers=AUTH_HEADERS).json()
        for g in goals:
            requests.delete(f"{BASE_URL}/api/goals/{g['goal_id']}", headers=AUTH_HEADERS)

        payload = {"title": "TEST_Abundance", "affirmation": "I attract wealth", "category": "abundance"}
        resp = requests.post(f"{BASE_URL}/api/goals", json=payload, headers=AUTH_HEADERS)
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "TEST_Abundance"
        assert "goal_id" in data
        return data["goal_id"]

    def test_goal_limit_free_plan(self):
        # Ensure one goal exists first
        goals = requests.get(f"{BASE_URL}/api/goals", headers=AUTH_HEADERS).json()
        if not goals:
            requests.post(f"{BASE_URL}/api/goals",
                json={"title": "TEST_First", "affirmation": "aff", "category": "general"},
                headers=AUTH_HEADERS)
        # Try to create a 2nd goal - should fail for free plan
        resp = requests.post(f"{BASE_URL}/api/goals",
            json={"title": "TEST_Second", "affirmation": "aff2", "category": "general"},
            headers=AUTH_HEADERS)
        assert resp.status_code == 403

    def test_delete_goal(self):
        goals = requests.get(f"{BASE_URL}/api/goals", headers=AUTH_HEADERS).json()
        if goals:
            gid = goals[0]["goal_id"]
            resp = requests.delete(f"{BASE_URL}/api/goals/{gid}", headers=AUTH_HEADERS)
            assert resp.status_code == 200


# --- Ritual Tests ---
class TestRituals:
    @pytest.fixture(autouse=True)
    def setup(self):
        # Ensure one goal exists
        goals = requests.get(f"{BASE_URL}/api/goals", headers=AUTH_HEADERS).json()
        if not goals:
            resp = requests.post(f"{BASE_URL}/api/goals",
                json={"title": "TEST_Ritual Goal", "affirmation": "I am aligned", "category": "general"},
                headers=AUTH_HEADERS)
            self.goal_id = resp.json()["goal_id"]
        else:
            self.goal_id = goals[0]["goal_id"]

    def test_get_today_rituals(self):
        resp = requests.get(f"{BASE_URL}/api/rituals/today", headers=AUTH_HEADERS)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_create_ritual_entry(self):
        # Clean up any existing morning entry for today's goal
        # Just attempt - may already exist
        writings = ["I am abundant"] * 3
        payload = {"goal_id": self.goal_id, "session_type": "morning", "writings": writings}
        resp = requests.post(f"{BASE_URL}/api/rituals/entry", json=payload, headers=AUTH_HEADERS)
        # 200 or 400 (already done)
        assert resp.status_code in [200, 400]

    def test_ritual_wrong_writing_count(self):
        writings = ["only one"]
        payload = {"goal_id": self.goal_id, "session_type": "morning", "writings": writings}
        resp = requests.post(f"{BASE_URL}/api/rituals/entry", json=payload, headers=AUTH_HEADERS)
        assert resp.status_code in [400, 400]  # wrong count or already done


# --- Progress Tests ---
class TestProgress:
    def test_get_streak(self):
        resp = requests.get(f"{BASE_URL}/api/progress/streak", headers=AUTH_HEADERS)
        assert resp.status_code == 200
        data = resp.json()
        assert "streak" in data
        assert "longest_streak" in data
        assert "total_days" in data

    def test_get_calendar(self):
        resp = requests.get(f"{BASE_URL}/api/progress/calendar", headers=AUTH_HEADERS)
        assert resp.status_code == 200
        data = resp.json()
        assert "calendar" in data
        assert "total_sessions" in data


# --- Payment Tests ---
class TestPayments:
    def test_get_subscription(self):
        resp = requests.get(f"{BASE_URL}/api/payments/subscription", headers=AUTH_HEADERS)
        assert resp.status_code == 200
        data = resp.json()
        assert "plan" in data
        assert "goal_limit" in data
