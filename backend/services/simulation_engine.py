from datetime import datetime, timedelta

def simulate_recovery(data):
    """
    Simulates probability of syllabus completion.
    Expects: pendingTopics, avgTimePerTopic, remainingDays, dailyHours, consistencyFactor
    """
    pending_topics = data.get('pendingTopics', 0)
    avg_time_per_topic = data.get('avgTimePerTopic', 3)
    remaining_days = data.get('remainingDays', 30)
    daily_hours = data.get('dailyHours', 6)
    consistency_factor = data.get('consistencyFactor', 0.5)

    required_hours = pending_topics * avg_time_per_topic
    available_productive_hours = remaining_days * daily_hours * consistency_factor

    probability = min(100.0, (available_productive_hours / max(required_hours, 1)) * 100)

    # Expected completion date
    daily_velocity = daily_hours * consistency_factor
    days_to_complete = required_hours / daily_velocity if daily_velocity > 0 else 999

    expected_completion_date = datetime.now() + timedelta(days=days_to_complete)

    return {
        'completionProbability': round(probability, 2),
        'requiredHours': required_hours,
        'availableProductiveHours': round(available_productive_hours, 2),
        'expectedCompletionDate': expected_completion_date.isoformat(),
        'isAtRisk': probability < 70
    }
