/**
 * ARIS Behavioral Adaptation Engine
 * Detects performance shifts and triggers re-optimization.
 */

exports.detectAndAdapt = (userData, behaviorData) => {
    const { stress_level, consistency_score } = userData;
    const { missed_sessions_rate, completion_speed } = behaviorData;

    const adaptations = [];

    // Rule 1: High Miss Rate -> Micro Load
    if (missed_sessions_rate > 0.3) {
        adaptations.push({
            type: 'STRUCTURE_SHIFT',
            action: 'REDUCE_SESSION_LENGTH',
            reason: 'High dropout rate detected. Shifting to micro-learning blocks.'
        });
    }

    // Rule 2: Stress Spike -> Buffer Strategy
    if (stress_level > 8) {
        adaptations.push({
            type: 'LOAD_SHIFT',
            action: 'INSERT_BUFFER_DAY',
            reason: 'Critical stress levels detected. Prioritizing mental recovery.'
        });
    }

    // Rule 3: Improved Performance -> Progressive Challenge
    if (consistency_score > 0.9 && completion_speed > 1.2) {
        adaptations.push({
            type: 'CHALLENGE_SHIFT',
            action: 'INCREASE_DIFFICULTY',
            reason: 'Consistent high performance. Increasing load for faster recovery.'
        });
    }

    return adaptations;
};
