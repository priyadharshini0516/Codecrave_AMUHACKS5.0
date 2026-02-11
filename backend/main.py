from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.priority_engine import prioritize_tasks
from services.risk_model import get_risk_assessment
from services.simulation_engine import simulate_recovery
from services.adaptation_engine import detect_and_adapt
from services.burnout_engine import calculate_burnout_status
from services.plan_optimizer import optimize_recovery_plan
from services.ai_coach import get_ai_advice
import uvicorn

app = FastAPI(title="Personalized Academic Recovery AI Engine")

class Task(BaseModel):
    id: Optional[str] = None
    subject_name: str
    exam_importance: int # 1-10
    days_left: int
    backlog_ratio: float # 0.0-1.0
    stress_level: int # 1-10

class TaskList(BaseModel):
    tasks: List[Task]

class UserRiskData(BaseModel):
    backlog_ratio: float
    stress_level: float
    completion_rate: float
    days_remaining: int

class SimulationData(BaseModel):
    pendingTopics: int
    avgTimePerTopic: float
    remainingDays: int
    dailyHours: float
    consistencyFactor: float

class AdaptationData(BaseModel):
    user_data: dict
    behavior_data: dict

class BurnoutData(BaseModel):
    stress_level: int
    low_sleep_penalty: int
    missed_tasks_ratio: float

class OptimizationInput(BaseModel):
    sorted_tasks: List[dict]
    burnout_data: dict
    available_days: Optional[int] = 7
    max_daily_hours: Optional[int] = 6

class CoachInput(BaseModel):
    stress_level: int
    days_to_exam: int

@app.get("/")
async def root():
    return {"message": "ARIS AI Engine is running"}

@app.post("/ai/prioritize")
async def prioritize(data: TaskList):
    try:
        tasks_dict = [t.dict() for t in data.tasks]
        prioritized = prioritize_tasks(tasks_dict)
        return {"status": "success", "tasks": prioritized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/predict-risk")
async def predict_risk(data: UserRiskData):
    try:
        assessment = get_risk_assessment(data.dict())
        return {"status": "success", "assessment": assessment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/simulate-recovery")
async def simulate(data: SimulationData):
    try:
        result = simulate_recovery(data.dict())
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/detect-adaptations")
async def adapt(data: AdaptationData):
    try:
        result = detect_and_adapt(data.user_data, data.behavior_data)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/calculate-burnout")
async def burnout(data: BurnoutData):
    try:
        result = calculate_burnout_status(data.dict())
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/optimize-plan")
async def optimize(data: OptimizationInput):
    try:
        result = optimize_recovery_plan(
            data.sorted_tasks, 
            data.burnout_data, 
            data.available_days, 
            data.max_daily_hours
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/coach")
async def coach(data: CoachInput):
    try:
        result = get_ai_advice(data.stress_level, data.days_to_exam)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
