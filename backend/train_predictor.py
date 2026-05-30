import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# Define base directory and paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "Student Mental health", "Student Mental health.csv")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "mental_health_model.pkl")

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

# Encode categorical values to numeric using the dynamically found columns
df[gender_col] = df[gender_col].map({'Female': 0, 'Male': 1}).fillna(0).astype(int)
df[anxiety_col] = df[anxiety_col].map({'No': 0, 'Yes': 1}).fillna(0).astype(int)
df[panic_col] = df[panic_col].map({'No': 0, 'Yes': 1}).fillna(0).astype(int)
df[treatment_col] = df[treatment_col].map({'No': 0, 'Yes': 1}).fillna(0).astype(int)

# Features and Target
X = df[[age_col, gender_col, anxiety_col, panic_col]]
y = df[treatment_col]

# Split data into train and test sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training set size: {len(X_train)} rows, Test set size: {len(X_test)} rows")

# Train Random Forest Model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# --- Evaluate Model ---
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print("\n📊 Model Training Evaluation:")
print(f"🎯 Overall Accuracy: {acc:.2f} (yaani {acc*100:.0f}%)")
print("\n📝 Detailed Classification Report:")
print(classification_report(y_test, y_pred))

# Save the trained model
joblib.dump(model, MODEL_SAVE_PATH)
print(f"Model saved securely at: {MODEL_SAVE_PATH}")