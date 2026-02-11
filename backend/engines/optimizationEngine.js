/**
 * ARIS Constrained Optimization Engine
 * Allocates study time to maximize completion score under constraints.
 */

exports.optimizeSchedule = (subjects, constraints) => {
    const { availableDailyHours, stressLevel, maxConsecutiveDays = 2 } = constraints;

    // Adjust daily hours by stress
    const stressModifier = 1 - (stressLevel - 1) / 20;
    const effectiveDailyHours = availableDailyHours * stressModifier;

    // Calculate dynamic priority for each subject
    const weightedSubjects = subjects.map(s => {
        // Priority = Urgency * Weightage * Difficulty
        const daysToExam = Math.max(1, (new Date(s.exam_date) - new Date()) / (1000 * 60 * 60 * 24));
        const urgency = 1 / daysToExam;
        const priority = urgency * s.weightage * s.difficulty_score;
        return { ...s, dynamicPriority: priority };
    });

    // Sort by priority descending
    weightedSubjects.sort((a, b) => b.dynamicPriority - a.dynamicPriority);

    const schedule = [];
    const daysToPlan = 7; // Weekly rolling optimization

    for (let d = 0; d < daysToPlan; d++) {
        const date = new Date();
        date.setDate(date.getDate() + d);

        let dayHoursRemaining = effectiveDailyHours;
        const dailySessions = [];

        for (const subject of weightedSubjects) {
            if (dayHoursRemaining <= 0.5) break; // Minimum session block

            // Simple greedy allocation: fill top priorities first
            // In a real system, we'd check 'maxConsecutiveDays' constraint here
            const timeToAllocate = Math.min(2, dayHoursRemaining); // Max 2h per session block

            dailySessions.push({
                subjectId: subject.id,
                subjectName: subject.subject_name,
                duration: timeToAllocate,
                startTime: formatTime(9 + (effectiveDailyHours - dayHoursRemaining)), // Start at 9am
                endTime: formatTime(9 + (effectiveDailyHours - dayHoursRemaining) + timeToAllocate)
            });

            dayHoursRemaining -= timeToAllocate;
        }

        schedule.push({ date, sessions: dailySessions });
    }

    return schedule;
};

function formatTime(decimalHours) {
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
