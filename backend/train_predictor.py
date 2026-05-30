import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from imblearn.over_sampling import SMOTE  # <--- SMOTE Import kiya

# Define base directory and paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "Student Mental health", "Student Mental health.csv")

# Folder structure clean rakhne ke liye model ko "models/" directory mein save karenge
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_SAVE_PATH = os.path.join(MODEL_DIR, "mental_health_model.pkl")

print(f"Reading dataset from: {DATASET_PATH}")

if not os.path.exists(DATASET_PATH):
    print(f"❌ Error: Dataset not found at {DATASET_PATH}")
    exit()

# Load dataset
df = pd.read_csv(DATASET_PATH)

# Clean column names (strip trailing spaces)
df.columns = df.columns.str.strip()

# Dynamically find columns using keywords to avoid KeyError
gender_col = [c for c in df.columns if 'gender' in c.lower()][0]
anxiety_col = [c if 'anxiety' in c.lower() else None for c in df.columns]
anxiety_col = [c for c in anxiety_col if c is not None][0]
panic_col = [c if 'panic' in c.lower() else None for c in df.columns]
panic_col = [c for c in panic_col if c is not None][0]
treatment_col = [c if 'treatment' in c.lower() else None for c in df.columns]
treatment_col = [c for c in treatment_col if c is not None][0]
age_col = [c for c in df.columns if 'age' in c.lower()][0]

# Age column mein se NaN values remove/fill karein taake model crash na ho
df[age_col] = df[age_col].fillna(df[age_col].median()).astype(int)

# Encode categorical values to numeric using the dynamically found columns
df[gender_col] = df[gender_col].map({'Female': 0, 'Male': 1}).fillna(0).astype(int)
df[anxiety_col] = df[anxiety_col].map({'No': 0, 'Yes': 1}).fillna(0).astype(int)
df[panic_col] = df[panic_col].map({'No': 0, 'Yes': 1}).fillna(0).astype(int)
df[treatment_col] = df[treatment_col].map({'No': 0, 'Yes': 1}).fillna(0).astype(int)

# Features and Target
X = df[[age_col, gender_col, anxiety_col, panic_col]]
y = df[treatment_col]

print("\n📊 SMOTE se pehle Class Distribution (Treatment needed vs No):")
print(y.value_counts())

# Split data into train and test sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 🔥 FIXED: Added k_neighbors=1 to handle small sample size
print("\n⏳ Applying SMOTE with k_neighbors=1 to balance minority samples...")
smote = SMOTE(k_neighbors=1, random_state=42)  # <--- Changed here
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

print("📈 SMOTE apply karne ke baad Training Class Distribution:")
print(pd.Series(y_train_resampled).value_counts())
print(f"Balanced Training set size: {len(X_train_resampled)} rows")

# Train Random Forest Model on Resampled (Balanced) Data
print("\n⏳ Training Random Forest Classifier on balanced real data...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_resampled, y_train_resampled)

# --- Evaluate Model ---
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print("\n📊 Model Training Evaluation (Tested on Real 20% Data):")
print(f"🎯 Overall Accuracy: {acc:.2f} (yaani {acc*100:.0f}%)")
print("\n📝 Detailed Classification Report:")
print(classification_report(y_test, y_pred))

# Save the trained model binary securely
joblib.dump(model, MODEL_SAVE_PATH)
print(f"\n🎯 Model saved successfully at:\n👉 {MODEL_SAVE_PATH}")