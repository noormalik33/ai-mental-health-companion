from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

# 1. FastAPI App initialize karna
app = FastAPI(title="AI Mental Health Companion API")

# 2. CORS Bypass (Taake React frontend is backend se baat kar sake)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # React Vite ka default URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Trained Machine Learning Model ko connect/load karna
MODEL_PATH = "mental_health_model.pkl"
try:
    ml_model = joblib.load(MODEL_PATH)
    print("🧠 Mental Health Predictor Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Error loading model: {e}")
    ml_model = None

# 4. Input Data Format Validation (User kya data bhej sakta hai)
class AssessmentInput(BaseModel):
    age: int
    gender: int          # 0: Female, 1: Male
    anxiety: int         # 0: No, 1: Yes
    panic_attacks: int   # 0: No, 1: Yes

@app.get("/")
def home():
    return {"status": "success", "message": "Backend is running smoothly with ML Predictor!"}

# 5. Live AI Endpoint jo input lekar output predict karega
@app.post("/api/predict-risk")
def predict_mental_health_risk(data: AssessmentInput):
    if ml_model is None:
        return {"status": "error", "message": "ML Model is not loaded on server."}
    
    # Data ko array format mein convert karna jesa model ko chahiye
    input_data = np.array([[data.age, data.gender, data.anxiety, data.panic_attacks]])
    
    # Model se prediction lena (0 = Low Risk, 1 = High Risk)
    prediction = int(ml_model.predict(input_data)[0])
    
    # Cognitive Behavioral Therapy (CBT) ke mutabiq suggestion generate karna
    if prediction == 1:
        risk_level = "High Risk"
        suggestion = "We notice patterns of high stress. Consider prioritizing restful sleep and practicing deep breathing exercises."
    else:
        risk_level = "Low Risk"
        suggestion = "Your tracking patterns look stable! Keep practicing regular self-care routines to maintain emotional well-being."
        
    return {
        "status": "success",
        "predicted_risk": risk_level,
        "recommendation": suggestion
    }