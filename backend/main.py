import os
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline

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

# Initialize models as None global variables
predictor_model = None
emotion_classifier = None

# 1. Load the Risk Predictor Model (Random Forest)
if os.path.exists(PREDICTOR_MODEL_PATH):
    predictor_model = joblib.load(PREDICTOR_MODEL_PATH)
    print("🧠 Mental Health Predictor Model loaded successfully!")
else:
    print("⚠️ Warning: mental_health_model.pkl not found.")

# 2. Load the Emotion NLP Model using HuggingFace BERT Pipeline
try:
    print("⏳ Loading Deep Learning BERT Emotion Model (This may take a few seconds)...")
    emotion_classifier = pipeline(
        "text-classification", 
        model="bhadresh-savani/distilbert-base-uncased-emotion", 
        return_all_scores=False
    )
    print("🚀 BERT Emotion Model Loaded Successfully!")
except Exception as e:
    print(f"⚠️ Warning: Failed to load BERT model. Error: {str(e)}")


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
        # 1. Model Prediction chalaein (Features list standard formats mein pass karein)
        features = [[data.age, data.gender, data.anxiety, data.panic_attacks]]
        prediction = predictor_model.predict(features)[0]
        
        # 2. Base status set karein model ke mutabiq
        risk_status = "High Risk" if prediction == 1 else "Low Risk"
        
        # 🔥 3. Robust Logical Safety Guards (Bypassing Small Dataset/SMOTE Anomalies)
        
        # Guard A: Agar anxiety AUR panic attacks dono zero hain, to model noise ko strict bypass karein -> Low Risk
        if data.anxiety == 0 and data.panic_attacks == 0:
            risk_status = "Low Risk"
            
        # Guard B: Agar anxiety AUR panic attacks dono high (1) hain, to hamesha -> High Risk
        elif data.anxiety == 1 and data.panic_attacks == 1:
            risk_status = "High Risk"
            
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

# --- Endpoint 2: Journal Emotion NLP Analyzer (BERT Integrated + Safety Guard) ---
@app.post("/api/analyze-journal")
def analyze_journal(data: JournalInput):
    if emotion_classifier is None:
        return {"status": "error", "message": "Deep Learning BERT Model is not loaded on server."}
    
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Journal text cannot be empty.")
    
    try:
        # 1. Base Text processing
        user_text = data.text.lower().strip()
        
        # 2. Model Prediction chalaein
        predictions = emotion_classifier(data.text)
        detected_emotion = predictions[0]['label']
        
        # 🔥 3. Logical Safety Guard for Negative Phrases (Bypass Server Cache/Bias)
        # Agar text mein negative combinations hon to emotion ko direct sadness par override karein
        negative_keywords = ["not feeling good", "not good", "feeling bad", "sad", "depressed", "unhappy"]
        if any(keyword in user_text for keyword in negative_keywords):
            detected_emotion = "sadness"
        
        coping_tips = {
            "sadness": "It's completely okay to feel down. Try jotting down three minor details you feel grateful for right now.",
            "anger": "Take a deep breath. Count slowly backwards from ten before re-evaluating the current situation.",
            "fear": "Anxiety can blur things. Focus entirely on your immediate physical surroundings to anchor yourself.",
            "joy": "Wonderful energy! Consider pinning down this moment so you can revisit this headspace later.",
            "love": "Nurturing close bonds boosts mental resilience immensely. Spread that warmth around today!",
            "surprise": "Unanticipated events shift our rhythm. Take a moment to pause, process, and adjust your pace."
        }
        
        feedback = coping_tips.get(detected_emotion, "Thank you for documenting your thoughts. Keep reflecting regularly.")
        
        return {
            "status": "success",
            "detected_emotion": detected_emotion,
            "coping_strategy": feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))