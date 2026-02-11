def calculate_burnout_status(data):
    """
    Detects burnout based on stress and performance.
    Expects data: {stress_level, low_sleep_penalty, missed_tasks_ratio}
    formula: (stress_level * 0.4) + (low_sleep_penalty * 0.3) + (missed_tasks_ratio * 0.3)
    """
    stress_level = data.get('stress_level', 5) / 10.0 # Normalize 1-10 to 0.1-1.0
    low_sleep_penalty = data.get('low_sleep_penalty', 0) # 0 or 1 usually, or 0.0-1.0
    missed_tasks_ratio = data.get('missed_tasks_ratio', 0.0)

    burnout_score = (stress_level * 0.4) + \
                    (low_sleep_penalty * 0.3) + \
                    (missed_tasks_ratio * 0.3)

    classification = "Low"
    workload_multiplier = 1.0
    action = None

    if burnout_score > 0.7:
        classification = "High"
        workload_multiplier = 0.8 # Reduce by 20%
        action = "REDUCE_WORKLOAD_20"
    elif burnout_score > 0.4:
        classification = "Moderate"
        workload_multiplier = 0.9 # Optional slight reduction
        action = "MONITOR_STRESS"

    return {
        'burnout_score': round(burnout_score, 2),
        'classification': classification,
        'workload_multiplier': workload_multiplier,
        'suggested_action': action,
        'needs_recovery_breaks': burnout_score > 0.7
    }
