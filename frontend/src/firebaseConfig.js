import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAswdtER1AiHhT37UcKiUgQpKEu29R1P8I",
  authDomain: "aimentalhealth-556ce.firebaseapp.com",
  projectId: "aimentalhealth-556ce",
  storageBucket: "aimentalhealth-556ce.firebasestorage.app",
  messagingSenderId: "458344105230",
  appId: "1:458344105230:web:b6754bdad97efefcc8035f",
  measurementId: "G-5XR38PPNYK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore Database Instance
export const db = getFirestore(app);

// Export Function 1: Save Journal Logs to Cloud
export const saveJournalLog = async (emotion, strategy) => {
  try {
    await addDoc(collection(db, "mood_logs"), {
      emotion: emotion,
      strategy: strategy,
      timestamp: new Date(),
      dateString: new Date().toLocaleDateString('en-US', { weekday: 'short' }) // e.g., "Mon", "Tue"
    });
    console.log("Log cloud par save ho gaya!");
  } catch (error) {
    console.error("Firebase database error: ", error);
  }
};

// Export Function 2: Fetch Journal Logs for Recharts Analysis
export const fetchJournalLogs = async () => {
  try {
    const q = query(collection(db, "mood_logs"), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    const logs = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  } catch (error) {
    console.error("Firebase fetch error: ", error);
    return [];
  }
}; // <-- FIXED: Bracket completely closed here safely!

// Export Function 3: Save Risk Assessment Logs to Cloud
export const saveRiskLog = async (name, age, gender, riskResult) => {
  try {
    await addDoc(collection(db, "risk_logs"), {
      patientName: name || 'Anonymous',
      age: parseInt(age),
      gender: gender === '1' ? 'Male' : 'Female',
      predictedRisk: riskResult,
      timestamp: new Date()
    });
    console.log("Risk Assessment Cloud par save ho gaya!");
  } catch (error) {
    console.error("Firebase Risk saving error: ", error);
  }
};