from datetime import datetime, timedelta

def optimize_recovery_plan(sorted_tasks, burnout_data, available_days=7, max_daily_hours=6):
    """
    Redistributes tasks across available days based on priority and workload limits.
    """
    multiplier = burnout_data.get('workload_multiplier', 1.0)
    adjusted_max_hours = max_daily_hours * multiplier
    
    plan = []
    current_date = datetime.now()
    
    # Initialize days
    days = []
    for i in range(available_days):
        days.append({
            'date': (current_date + timedelta(days=i)).isoformat(),
            'sessions': [],
            'current_hours': 0
        })
    
    # Greedy allocation of tasks to days
    for task in sorted_tasks:
        duration = task.get('duration', 2) # Default 2 hours per task
        allocated = False
        
        for day in days:
            if day['current_hours'] + duration <= adjusted_max_hours:
                day['sessions'].append({
                    'subjectName': task.get('subject_name'),
                    'taskName': task.get('name', 'Study Session'),
                    'duration': duration,
                    'startTime': f"{9 + int(day['current_hours'])}:00",
                    'endTime': f"{9 + int(day['current_hours'] + duration)}:00"
                })
                day['current_hours'] += duration
                allocated = True
                break
        
        # If task couldn't fit in any day within limits, it remains unallocated or pushed to overflow
        # For academic recovery, we might want to prioritize it anyway or warn.
        
    # If burnout is high, insert recovery breaks (simplified as empty space or specific tags)
    if burnout_data.get('needs_recovery_breaks'):
        for day in days:
            if day['sessions']:
                # Tag sessions with "Reduced Load"
                for session in day['sessions']:
                    session['notes'] = "Burnout Adjustment Applied"

    return days
