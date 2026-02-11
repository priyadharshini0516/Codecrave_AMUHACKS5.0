import requests
import json

BASE_URL = "http://localhost:8000"

def test_simulation():
    print("\n--- Testing AI Simulation Engine ---")
    data = {
        "pendingTopics": 15,
        "avgTimePerTopic": 2.5,
        "remainingDays": 10,
        "dailyHours": 6,
        "consistencyFactor": 0.8
    }
    response = requests.post(f"{BASE_URL}/ai/simulate-recovery", json=data)
    print(f"Status: {response.status_code}")
    print(f"Result: {json.dumps(response.json(), indent=2)}")

def test_adaptation():
    print("\n--- Testing AI Adaptation Engine ---")
    data = {
        "user_data": {
            "stress_level": 9,
            "consistency_score": 0.7
        },
        "behavior_data": {
            "missed_sessions_rate": 0.4,
            "completion_speed": 0.9
        }
    }
    response = requests.post(f"{BASE_URL}/ai/detect-adaptations", json=data)
    print(f"Status: {response.status_code}")
    print(f"Result: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    try:
        test_simulation()
        test_adaptation()
    except Exception as e:
        print(f"Error: {e}")
