# Emotions dataset for NLP

import os
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# 1. Define paths for the dataset files
dataset_dir = os.path.join("dataset", "Emotions dataset for NLP")
train_path = os.path.join(dataset_dir, "train.txt")
test_path = os.path.join(dataset_dir, "test.txt")

print("⏳ Loading Emotions NLP Dataset...")

# 2. Read dataset files delimited by ';' with no initial headers
try:
    train_df = pd.read_csv(train_path, sep=";", names=["Text", "Emotion"], header=None)
    test_df = pd.read_csv(test_path, sep=";", names=["Text", "Emotion"], header=None)
    print(f"✅ Dataset Loaded! Train rows: {len(train_df)}, Test rows: {len(test_df)}")
except Exception as e:
    print(f"❌ Error loading dataset files: {e}")
    exit()

# 3. Separate features (X) and target labels (y)
X_train, y_train = train_df["Text"], train_df["Emotion"]
X_test, y_test = test_df["Text"], test_df["Emotion"]

print("🧹 Vectorizing text data using TF-IDF...")

# 4. Convert text features into numerical values using TF-IDF Vectorization
vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

print("🧠 Training AI Emotion Classifier Model (Logistic Regression)...")

# 5. Initialize and fit the multiclass classification model
nlp_model = LogisticRegression(max_iter=1000, random_state=42)
nlp_model.fit(X_train_vec, y_train)
print("🎯 NLP Model trained successfully!")

# 6. Evaluate model performance on the independent test split
predictions = nlp_model.predict(X_test_vec)
print("\n📊 Classification Report on Test Data:")
print(classification_report(y_test, predictions))

# 7. Serialize and save both the model and vectorizer binaries for FastAPI deployment
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "emotion_nlp_model.pkl")
vectorizer_path = os.path.join(current_dir, "emotion_vectorizer.pkl")

joblib.dump(nlp_model, model_path)
joblib.dump(vectorizer, vectorizer_path)

print(f"\n💾 Saved NLP Model to: {model_path}")
print(f"💾 Saved Vectorizer to: {vectorizer_path}")