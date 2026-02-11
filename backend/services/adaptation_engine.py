def detect_and_adapt(user_data, behavior_data):
    """
    Detects performance shifts and triggers re-optimization.
    Expects user_data: {stress_level, consistency_score}
    Expects behavior_data: {missed_sessions_rate, completion_speed}
    """
    stress_level = user_data.get('stress_level', 5)
    consistency_score = user_data.get('consistency_score', 0.5)
    
    missed_sessions_rate = behavior_data.get('missed_sessions_rate', 0)
    completion_speed = behavior_data.get('completion_speed', 1.0)

    adaptations = []

    # Rule 1: High Miss Rate -> Micro Load
    if missed_sessions_rate > 0.3:
        adaptations.append({
            'type': 'STRUCTURE_SHIFT',
            'action': 'REDUCE_SESSION_LENGTH',
            'reason': 'High dropout rate detected. Shifting to micro-learning blocks.'
        })

    # Rule 2: Stress Spike -> Buffer Strategy
    if stress_level > 8:
        adaptations.append({
            'type': 'LOAD_SHIFT',
            'action': 'INSERT_BUFFER_DAY',
            'reason': 'Critical stress levels detected. Prioritizing mental recovery.'
        })

    # Rule 3: Improved Performance -> Progressive Challenge
    if consistency_score > 0.9 and completion_speed > 1.2:
        adaptations.append({
            'type': 'CHALLENGE_SHIFT',
            'action': 'INCREASE_DIFFICULTY',
            'reason': 'Consistent high performance. Increasing load for faster recovery.'
        })

    return adaptations
