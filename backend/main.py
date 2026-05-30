import os
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Mental Health Companion API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define directories and absolute file paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PREDICTOR_MODEL_PATH = os.path.join(BASE_DIR, "models", "mental_health_model.pkl")
NLP_MODEL_PATH = os.path.join(BASE_DIR, "models", "emotion_nlp_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "emotion_vectorizer.pkl")

# Initialize models as None global variables
predictor_model = None
nlp_model = None
vectorizer = None

# 1. Load the Risk Predictor Model
if os.path.exists(PREDICTOR_MODEL_PATH):
    predictor_model = joblib.load(PREDICTOR_MODEL_PATH)
    print("🧠 Mental Health Predictor Model loaded successfully!")
else:
    print("⚠️ Warning: mental_health_model.pkl not found.")

# 2. Load the Emotion NLP Model and Vectorizer
if os.path.exists(NLP_MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
    nlp_model = joblib.load(NLP_MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("📝 Journal Emotion NLP Model and Vectorizer loaded successfully!")
else:
    print("⚠️ Warning: Emotion NLP binaries missing.")


# --- Request/Response Pydantic Schemas ---
class AssessmentInput(BaseModel):
    age: int
    gender: int
    anxiety: int
    panic_attacks: int

class JournalInput(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "Welcome to the AI Mental Health Companion Backend!"}


# --- Endpoint 1: Lifestyle Risk Predictor ---
@app.post("/api/predict-risk")
def predict_risk(data: AssessmentInput):
    if predictor_model is None:
        return {"status": "error", "message": "ML Model is not loaded on server."}
    
    try:
        features = [[data.age, data.gender, data.anxiety, data.panic_attacks]]
        prediction = predictor_model.predict(features)[0]
        
        risk_status = "High Risk" if prediction == 1 else "Low Risk"
        recommendation = (
            "We notice patterns of high stress. Consider prioritizing restful sleep and practicing deep breathing exercises."
            if risk_status == "High Risk"
            else "Your tracking patterns look stable! Keep practicing regular self-care routines to maintain emotional well-being."
        )
        
        return {
            "status": "success",
            "predicted_risk": risk_status,
            "recommendation": recommendation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint 2: Journal Emotion NLP Analyzer ---
@app.post("/api/analyze-journal")
def analyze_journal(data: JournalInput):
    if nlp_model is None or vectorizer is None:
        return {"status": "error", "message": "Emotion NLP Model is not loaded on server."}
    
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Journal text cannot be empty.")
    
    try:
        # Vectorize input raw text
        text_vec = vectorizer.transform([data.text])
        # Predict the underlying emotion string
        detected_emotion = nlp_model.predict(text_vec)[0]
        
        # Structure customized coping responses based on predicted emotion
        coping_tips = {
            "sadness": "It's completely okay to feel down. Try jotting down three minor details you feel grateful for right now.",
            "anger": "Take a deep breath. Count slowly backwards from ten before re-evaluating the current situation.",
            "fear": "Anxiety can blur things. Focus entirely on your immediate physical surroundings to anchor yourself.",
            "joy": "Wonderful energy! Consider pinning down this moment so you can revisit this headspace later.",
            "love": "Nurturing close bonds boosts mental resilience immensely. Spread that warmth around today!",
            "surprise": "Unanticipated events shift our rhythm. Take a moment to pause, process, and adjust your pace."
        }
        
        feedback = coping_tips.get(detected_emotion, "Thank you for documenting your thoughts. Keep reflecting regularly.")
        
        # FIXED: Added the missing return statement
        return {
            "status": "success",
            "detected_emotion": detected_emotion,
            "coping_strategy": feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))