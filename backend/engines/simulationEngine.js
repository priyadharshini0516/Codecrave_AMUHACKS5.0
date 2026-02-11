/**
 * ARIS Predictive Simulation Engine
 * Simulates probability of syllabus completion.
 */

exports.simulateRecovery = (data) => {
    const {
        pendingTopics,
        avgTimePerTopic,
        remainingDays,
        dailyHours,
        consistencyFactor // rolling avg of completed/planned hours
    } = data;

    const requiredHours = pendingTopics * avgTimePerTopic;
    const availableProductiveHours = remainingDays * dailyHours * consistencyFactor;

    const probability = Math.min(100, (availableProductiveHours / requiredHours) * 100);

    // Expected completion date
    const dailyVelocity = dailyHours * consistencyFactor;
    const daysToComplete = dailyVelocity > 0 ? requiredHours / dailyVelocity : Infinity;

    const expectedCompletionDate = new Date();
    expectedCompletionDate.setDate(expectedCompletionDate.getDate() + daysToComplete);

    return {
        completionProbability: Math.round(probability),
        requiredHours,
        availableProductiveHours,
        expectedCompletionDate,
        isAtRisk: probability < 70
    };
};
