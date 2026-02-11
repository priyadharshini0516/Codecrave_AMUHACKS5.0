import os
# This is a placeholder for LLM integration (Groq/OpenRouter)
# The user mentioned Groq or OpenRouter.

def get_ai_advice(stress_level, days_to_exam):
    """
    Returns short, structured advice based on student state.
    """
    # In a real scenario, this would call the LLM API.
    # For now, we'll provide a template response.
    
    prompt = f"You are an academic recovery assistant. The student has stress level {stress_level} and upcoming exam in {days_to_exam} days. Suggest a study method."
    
    # Mock LLM response
    advice = {
        "advice": f"Based on your stress level of {stress_level}, I recommend the Pomodoro technique with extended breaks (15 mins).",
        "motivation": "Focus on the smallest task first. You've got this!",
        "prompt_used": prompt
    }
    
    return advice
