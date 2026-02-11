/**
 * ARIS Risk Modeling Engine
 * Calculates Academic Risk Score (ARS) based on backlog, urgency, stress, and performance.
 */

exports.calculateARS = (data) => {
    const {
        pendingTopics,
        totalTopics,
        daysRemaining,
        stressLevel, // 1-10
        completionRate // 0-1 (rolling average)
    } = data;

    // 1. Backlog Percentage (35% weight)
    const backlogPercentage = (pendingTopics / totalTopics) * 100;

    // 2. Deadline Urgency (25% weight)
    // Normalized: 1 day left = 100, 30+ days = 0
    const deadlineUrgency = Math.min(100, Math.max(0, (1 / daysRemaining) * 500));

    // 3. Stress Index (20% weight)
    const stressIndex = stressLevel * 10;

    // 4. Performance Trend (20% weight)
    // Low completion rate increases risk
    const performanceTrendScore = (1 - completionRate) * 100;

    const ars = (backlogPercentage * 0.35) +
        (deadlineUrgency * 0.25) +
        (stressIndex * 0.20) +
        (performanceTrendScore * 0.20);

    let riskLevel = 'Low';
    if (ars > 60) riskLevel = 'High';
    else if (ars > 30) riskLevel = 'Moderate';

    return {
        score: Math.round(ars),
        level: riskLevel,
        breakdown: {
            backlogFactor: Math.round(backlogPercentage * 0.35),
            urgencyFactor: Math.round(deadlineUrgency * 0.25),
            stressFactor: Math.round(stressIndex * 0.20),
            trendFactor: Math.round(performanceTrendScore * 0.20)
        }
    };
};
