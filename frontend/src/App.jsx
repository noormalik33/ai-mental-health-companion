import { useState } from 'react';
import './Dashboard.css';

export default function App() {
  const [riskData, setRiskData] = useState({ age: '', gender: '0', anxiety: '0', panic_attacks: '0' });
  const [riskResult, setRiskResult] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  const [journalText, setJournalText] = useState('');
  const [journalResult, setJournalResult] = useState(null);
  const [journalLoading, setJournalLoading] = useState(false);

  const handleRiskSubmit = async (e) => {
    e.preventDefault();
    setRiskLoading(true);
    setRiskResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/predict-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(riskData.age),
          gender: parseInt(riskData.gender),
          anxiety: parseInt(riskData.anxiety),
          panic_attacks: parseInt(riskData.panic_attacks)
        })
      });
      const data = await res.json();
      setRiskResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRiskLoading(true); // Keep simulating state clean
      setRiskLoading(false);
    }
  };

  const handleJournalSubmit = async (e) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    setJournalLoading(true);
    setJournalResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/analyze-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: journalText })
      });
      const data = await res.json();
      setJournalResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setJournalLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* Sidebar Panel */}
      <aside className="sidebar-dock">
        <div>
          <div className="logo-section">
            <span>🧠</span> <strong>Companion AI</strong>
          </div>
          <nav className="nav-menu">
            <div className="nav-item active">📂 Dashboard</div>
            <div className="nav-item">🛡️ Risk Assessment</div>
            <div className="nav-item">📝 Journal Analysis</div>
            <div className="nav-item">📊 Insights Logs</div>
            <div className="nav-item">⚙️ Settings</div>
          </nav>
        </div>
        
        <div className="system-health-box">
          <div style={{color:'#4ADE80', fontWeight:'700', marginBottom:'5px'}}>● Systems Active</div>
          <span style={{color:'#94A3B8'}}>Frontend & FastAPI Online</span>
        </div>
      </aside>

      {/* Main Workspace Arena */}
      <main className="main-workspace">
        
        {/* Top Header Row */}
        {/* Top Header Row */}
<div className="top-navbar">
  <div className="title-area">
    <h1>AI Mental Health Dashboard</h1>
    <p style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>
      Developed by <strong style={{ color: 'var(--primary)', fontWeight: '700' }}>Ghulam Qadir</strong> & <strong style={{ color: 'var(--primary)', fontWeight: '700' }}>Noor Malik</strong>
    </p>
    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
      "Bridging clinical safety guards with deep transformer architectures to engineer a resilient, state-of-the-art mental wellness ecosystem."
    </p>
  </div>
  
</div>

        {/* 2-Column Side-by-Side Grid Layout */}
        <div className="content-grid">
          
          {/* Card 1: Risk Assessment Profile */}
          <section className="app-card">
            <h3 className="card-title">📋 Risk Assessment Profile</h3>
            <form onSubmit={handleRiskSubmit}>
              <div className="field-group">
                <label>Age Target</label>
                <input 
                  type="number" required min="1" max="100" className="text-input" placeholder="e.g. 56"
                  value={riskData.age} onChange={(e) => setRiskData({...riskData, age: e.target.value})}
                />
              </div>

              <div className="field-group">
                <label>Biological Gender</label>
                <select className="select-dropdown" value={riskData.gender} onChange={(e) => setRiskData({...riskData, gender: e.target.value})}>
                  <option value="0">Female</option>
                  <option value="1">Male</option>
                </select>
              </div>

              <div className="field-group">
                <label>Experiencing Clinical Anxiety?</label>
                <select className="select-dropdown" value={riskData.anxiety} onChange={(e) => setRiskData({...riskData, anxiety: e.target.value})}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>

              <div className="field-group">
                <label>Frequent Panic Attacks?</label>
                <select className="select-dropdown" value={riskData.panic_attacks} onChange={(e) => setRiskData({...riskData, panic_attacks: e.target.value})}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>

              <button type="submit" className="submit-btn">
                <span>🧠</span> {riskLoading ? "Querying ML Model..." : "Analyze Profile"}
              </button>
            </form>

            {riskResult && (
              <div className="output-node" style={{borderLeft: riskResult.predicted_risk === 'High Risk' ? '5px solid #EF4444' : '5px solid #22C55E'}}>
                <div className="output-header" style={{color: riskResult.predicted_risk === 'High Risk' ? '#EF4444' : '#22C55E'}}>
                  Result: {riskResult.predicted_risk}
                </div>
                <p className="output-desc">{riskResult.recommendation}</p>
              </div>
            )}
          </section>

          {/* Card 2: BERT Journaling System */}
          <section className="app-card">
            <h3 className="card-title">📝 Text Semantic Journal</h3>
            <form onSubmit={handleJournalSubmit}>
              <div className="field-group">
                <label>Daily Thought Narrative</label>
                <textarea 
                  className="textarea-input" required 
                  placeholder="Type out your thoughts, narrative, or emotional reflections here..."
                  value={journalText} onChange={(e) => setJournalText(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-btn">
                <span>🚀</span> {journalLoading ? "Extracting Layers..." : "Analyze Sentiment Context"}
              </button>
            </form>

            {journalResult && (
              <div className="output-node" style={{borderLeft: '5px solid #3B82F6'}}>
                <div className="output-header" style={{color: '#3B82F6'}}>
                  Detected Emotion: {journalResult.emotion}
                </div>
                <p className="output-desc"><strong>Coping Strategy:</strong> {journalResult.coping_strategy}</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}