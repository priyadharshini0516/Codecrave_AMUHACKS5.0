const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI System Utility
 * Handles communication with Google Gemini for academic recovery insights.
 */

let genAI = null;

const getGenAI = () => {
    if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

exports.generateStudyInsight = async (studentData) => {
    const ai = getGenAI();
    if (!ai) {
        return "AI is currently offline. Please add your `GEMINI_API_KEY` to the `.env` file to enable personalized recovery insights.";
    }

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an AI Academic Recovery Assistant for the "PARE" platform. 
            Analyze the following student data and provide a personalized, encouraging, and tactical recovery insight (2-3 sentences max).
            
            Student Data:
            - Subjects: ${JSON.stringify(studentData.subjects)}
            - Current Stress Level: ${studentData.stressLevel}/10
            - Completion Rate: ${Math.round(studentData.completionRate * 100)}%
            - Days Remaining for closest deadline: ${Math.round(studentData.daysRemaining)} days
            
            Talk directly to the student. Be specific but concise. Focus on how their stress level affects their path.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "The AI engine encountered an error while analyzing your data. Keep focusing on your highest priority topics!";
    }
};
