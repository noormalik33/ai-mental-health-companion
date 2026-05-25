import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# 1. Define the correct path to the CSV file
csv_path = os.path.join("dataset", "Student Mental health", "Student Mental health.csv")

print("Reading dataset from:", csv_path)

# 2. Load the data using pandas
df = pd.read_csv(csv_path)

# Clean column names (remove leading/trailing spaces)
df.columns = df.columns.str.strip()

# 3. Preprocessing: Convert Text columns into Numbers using LabelEncoder
le = LabelEncoder()

# We will predict if the user has Depression risk based on other factors
df['Gender'] = le.fit_transform(df['Choose your gender'])
df['Anxiety_Status'] = le.fit_transform(df['Do you have Anxiety?'])
df['Panic_Status'] = le.fit_transform(df['Do you have Panic attack?'])

# Target variable (What we want to predict)
df['Depression_Risk'] = le.fit_transform(df['Do you have Depression?'])

# 4. Select Features (X) and Target (y)
X = df[['Age', 'Gender', 'Anxiety_Status', 'Panic_Status']]
y = df['Depression_Risk']

# Drop rows with missing values if any
X = X.fillna(X.mean())

# 5. FIXED: Changed 'test_test_size' to 'test_size'
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training set size: {X_train.shape[0]} rows")

# 6. Initialize and Train the Machine Learning Model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
print("Machine Learning model trained successfully!")

# 7. FIXED: Save securely with an absolute directory path
current_dir = os.path.dirname(os.path.abspath(__file__))
model_output_path = os.path.join(current_dir, "mental_health_model.pkl")
joblib.dump(model, model_output_path)
print(f"Model saved securely at: {model_output_path}")