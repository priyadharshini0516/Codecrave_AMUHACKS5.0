from services.priority_engine import prioritize_tasks
from services.risk_model import get_risk_assessment
from services.simulation_engine import simulate_recovery
from services.adaptation_engine import detect_and_adapt

def test_priority():
    # ... (existing test)
    pass

def test_risk():
    # ... (existing test)
    pass

def test_simulation():
    print("\n--- Testing Simulation Engine ---")
    data = {
        "pendingTopics": 15,
        "avgTimePerTopic": 2.5,
        "remainingDays": 10,
        "dailyHours": 6,
        "consistencyFactor": 0.8
    }
    result = simulate_recovery(data)
    print(f"Simulation Result: {result}")

def test_adaptation():
    print("\n--- Testing Adaptation Engine ---")
    user_data = {"stress_level": 9, "consistency_score": 0.7}
    behavior_data = {"missed_sessions_rate": 0.4, "completion_speed": 0.9}
    result = detect_and_adapt(user_data, behavior_data)
    print(f"Adaptation Result: {result}")

if __name__ == "__main__":
    try:
        # test_priority()
        # test_risk()
        test_simulation()
        test_adaptation()
    except Exception as e:
        print(f"Error during testing: {e}")
