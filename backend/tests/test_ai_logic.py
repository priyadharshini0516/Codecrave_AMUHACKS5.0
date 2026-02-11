from services.priority_engine import prioritize_tasks
from services.risk_model import get_risk_assessment

def test_priority():
    print("\n--- Testing Priority Engine ---")
    tasks = [
        {"subject_name": "Math", "exam_importance": 9, "days_left": 5, "backlog_ratio": 0.8, "stress_level": 8},
        {"subject_name": "History", "exam_importance": 4, "days_left": 20, "backlog_ratio": 0.2, "stress_level": 3},
        {"subject_name": "Physics", "exam_importance": 7, "days_left": 2, "backlog_ratio": 0.5, "stress_level": 9}
    ]
    
    prioritized = prioritize_tasks(tasks)
    for task in prioritized:
        print(f"Task: {task['subject_name']}, Priority Score: {task['priority_score']}")

def test_risk():
    print("\n--- Testing Risk Model ---")
    user_data = {
        "backlog_ratio": 0.7,
        "stress_level": 8,
        "completion_rate": 0.3,
        "days_remaining": 5
    }
    
    assessment = get_risk_assessment(user_data)
    print(f"Risk Assessment: {assessment}")

if __name__ == "__main__":
    try:
        test_priority()
        test_risk()
    except Exception as e:
        print(f"Error during testing: {e}")
