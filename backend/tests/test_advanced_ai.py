import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_full_pipeline():
    print("\n--- Testing Advanced AI Pipeline ---")
    
    # 1. Risk Assessment (Logistic Regression)
    print("\n1. Testing Risk Prediction (Logistic Regression)...")
    risk_data = {
        "completion_percentage": 0.2,
        "days_remaining": 5,
        "missed_tasks_ratio": 0.8,
        "stress_level": 9,
        "consistency_score": 0.2
    }
    risk_res = requests.post(f"{BASE_URL}/ai/predict-risk", json=risk_data)
    print(f"Risk Result: {json.dumps(risk_res.json(), indent=2)}")
    risk_assessment = risk_res.json().get('assessment', {})

    # 2. Burnout Detection
    print("\n2. Testing Burnout Detection...")
    burnout_data = {
        "stress_level": 9,
        "low_sleep_penalty": 1,
        "missed_tasks_ratio": 0.8
    }
    burnout_res = requests.post(f"{BASE_URL}/ai/calculate-burnout", json=burnout_data)
    print(f"Burnout Result: {json.dumps(burnout_res.json(), indent=2)}")
    burnout_result = burnout_res.json().get('data', {})

    # 3. Plan Optimization
    print("\n3. Testing Plan Optimization...")
    opt_data = {
        "sorted_tasks": [
            {"subject_name": "Math", "priority_score": 9.5, "duration": 3},
            {"subject_name": "Physics", "priority_score": 8.2, "duration": 2},
            {"subject_name": "History", "priority_score": 4.1, "duration": 2}
        ],
        "burnout_data": burnout_result,
        "available_days": 7,
        "max_daily_hours": 6
    }
    opt_res = requests.post(f"{BASE_URL}/ai/optimize-plan", json=opt_data)
    print(f"Optimization Result (truncated): {json.dumps(opt_res.json().get('data')[:2], indent=2)}")

    # 4. AI Coach
    print("\n4. Testing AI Coach...")
    coach_data = {"stress_level": 9, "days_to_exam": 5}
    coach_res = requests.post(f"{BASE_URL}/ai/coach", json=coach_data)
    print(f"Coach Advice: {json.dumps(coach_res.json(), indent=2)}")

if __name__ == "__main__":
    try:
        test_full_pipeline()
    except Exception as e:
        print(f"Error: {e}")
