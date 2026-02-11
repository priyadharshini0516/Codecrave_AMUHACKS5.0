import math

def calculate_priority_score(task):
    """
    Calculate priority score based on the formula:
    priority_score = (exam_importance * 0.4) + (1 / days_left * 0.3) + 
                     (backlog_ratio * 0.2) + (stress_adjustment * 0.1)
    """
    exam_importance = task.get('exam_importance', 5) # Default 5/10
    days_left = task.get('days_left', 30)
    backlog_ratio = task.get('backlog_ratio', 0) # 0 to 1
    stress_level = task.get('stress_level', 5) # 1 to 10
    
    # Avoid division by zero
    urgency = 1.0 / max(days_left, 0.5)
    
    # Normalize stress adjustment (higher stress should increase priority or decrease?)
    # Usually stress adjustment in these systems means prioritizing tasks that reduce stress 
    # or accounting for higher pressure.
    stress_adjustment = stress_level / 10.0
    
    score = (exam_importance * 0.4) + \
            (urgency * 0.3 * 10) + \
            (backlog_ratio * 0.2 * 10) + \
            (stress_adjustment * 0.1 * 10)
            
    return round(score, 2)

def prioritize_tasks(tasks):
    """
    Accepts a list of tasks, calculates priority for each, and returns sorted list.
    """
    for task in tasks:
        task['priority_score'] = calculate_priority_score(task)
    
    # Sort tasks descending by priority score
    return sorted(tasks, key=lambda x: x['priority_score'], reverse=True)
