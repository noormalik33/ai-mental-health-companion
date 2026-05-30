import { useState } from 'react';
import './Dashboard.css';

export default function App() {
  // Navigation State to control which view is active
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Risk Form States (Added 'name' field)
  const [riskData, setRiskData] = useState({ name: '', age: '', gender: '0', anxiety: '0', panic_attacks: '0' });
  const [riskResult, setRiskResult] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState(null);

  // Journal Form States
  const [journalText, setJournalText] = useState('');
  const [journalResult, setJournalResult] = useState(null);
  const [journalLoading, setJournalLoading] = useState(false);

  const handleRiskSubmit = async (e) => {
    e.preventDefault();
    setRiskLoading(true);
    setRiskResult(null);
    setRiskError(null);
    try {
      // Noor Malik ke chaltay hue backend API pipeline ko trigger karna
      const response = await fetch('http://127.0.0.1:8000/api/predict-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(riskData.age),
          gender: parseInt(riskData.gender),
          anxiety: parseInt(riskData.anxiety),
          panic_attacks: parseInt(riskData.panic_attacks)
        }),
      });

      if (!response.ok) throw new Error('Backend server responded with an error');
      const data = await response.json();
      setResult(data);
      setRiskResult(data);
    } catch (err) {
      setRiskError("Backend se connection nahi ho saka. Ensure karein ke uvicorn server chal raha hai.");
      console.error(err);
    } finally {
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
      
      {/* ========================== SIDEBAR DOCK ========================== */}
      <aside className="sidebar-dock">
        <div>
          <div className="logo-section">
            <span>🧠</span> <strong>Companion AI</strong>
          </div>
          <nav className="nav-menu">
            <div 
              className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Dashboard')}
            >
              📂 Dashboard
            </div>
            <div 
              className={`nav-item ${activeTab === 'Risk Assessment' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Risk Assessment')}
            >
              🛡️ Risk Assessment
            </div>
            <div 
              className={`nav-item ${activeTab === 'Journal Analysis' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Journal Analysis')}
            >
              📝 Journal Analysis
            </div>
            <div 
              className={`nav-item ${activeTab === 'Insights Logs' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Insights Logs')}
            >
              📊 Insights Logs
            </div>
            <div 
              className={`nav-item ${activeTab === 'Settings' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Settings')}
            >
              ⚙️ Settings
            </div>
          </nav>
        </div>
        
        <div className="system-health-box">
          <div style={{color:'#4ADE80', fontWeight:'700', marginBottom:'5px'}}>● Systems Active</div>
          <span style={{color:'rgba(255,255,255,0.6)', fontSize:'0.8rem'}}>Frontend & FastAPI Online</span>
        </div>
      </aside>

      {/* ========================== MAIN WORKSPACE ========================== */}
      <main className="main-workspace">
        
        {/* Top Navbar Row */}
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
          <div className="badge-row">
            <div className="top-badge"><span style={{color:'#4ADE80'}}>●</span> {activeTab} View</div>
            <div className="top-badge">⚡ Backend: FastAPI</div>
          </div>
        </div>

        {/* DYNAMIC CONTENT RENDERING BASED ON ACTIVE TAB */}
        
        {activeTab === 'Dashboard' && (
          <div className="content-grid">
            
            {/* Card 1: Risk Assessment Profile */}
            <section className="app-card">
              <h3 className="card-title">📋 Risk Assessment Profile</h3>
              <form onSubmit={handleRiskSubmit}>
                
                {/* NEW FIELD: User Name Input */}
                <div className="field-group">
                  <label>Full Name</label>
                  <input 
                    type="text" required className="text-input" placeholder="Enter your name"
                    value={riskData.name} onChange={(e) => setRiskData({...riskData, name: e.target.value})}
                  />
                </div>

                <div className="field-group">
                  <label>Age Target</label>
                  <input 
                    type="number" required min="1" max="120" className="text-input" placeholder="e.g. 24"
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
                  <label>Are you experiencing Anxiety?</label>
                  <select className="select-dropdown" value={riskData.anxiety} onChange={(e) => setRiskData({...riskData, anxiety: e.target.value})}>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>Frequent Panic Attacks?</label>
                  <select className="select-dropdown" value={riskData.panic_attacks} onChange={(e) => setRiskData({...riskData, panic_attacks: e.target.value})}>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                <button type="submit" className="submit-btn">
                  <span>🧠</span> {riskLoading ? "Querying ML Model..." : "Analyze Profile"}
                </button>
              </form>

              {riskError && (
                <div className="output-node" style={{borderLeft: '5px solid #EF4444', color: '#EF4444'}}>
                  {riskError}
                </div>
              )}

              {riskResult && (
                <div className={`output-node ${riskResult.predicted_risk === 'High Risk' ? 'risk-high' : ''}`} style={{borderLeft: riskResult.predicted_risk === 'High Risk' ? '6px solid var(--accent)' : '6px solid #22C55E'}}>
                  <div className="output-header" style={{color: riskResult.predicted_risk === 'High Risk' ? 'var(--accent)' : '#22C55E'}}>
                    Patient: {riskData.name || 'Anonymous'} — {riskResult.predicted_risk}
                  </div>
                  <p className="output-desc">{riskResult.recommendation}</p>
                </div>
              )}
            </section>

            {/* Card 2: Text Semantic Journal */}
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
                <div className="output-node" style={{borderLeft: '6px solid var(--primary)'}}>
                  <div className="output-header" style={{color: 'var(--primary)'}}>
                    Detected Emotion: {journalResult.emotion}
                  </div>
                  <p className="output-desc"><strong>Coping Strategy:</strong> {journalResult.coping_strategy}</p>
                </div>
              )}
            </section>

          </div>
        )}

        {activeTab === 'Risk Assessment' && (
          <div className="app-card" style={{width: '100%'}}>
            <h3 className="card-title">🛡️ Risk Assessment Dedicated Panel</h3>
            <p style={{color: 'var(--text-secondary)'}}>Detailed standalone configuration logs for clinical evaluation schemas and parametric datasets.</p>
          </div>
        )}

        {activeTab === 'Journal Analysis' && (
          <div className="app-card" style={{width: '100%'}}>
            <h3 className="card-title">📝 BERT Transformer Semantic Logs</h3>
            <p style={{color: 'var(--text-secondary)'}}>Deep NLP processing logs, emotional density statistics, and fine-tuning sequences.</p>
          </div>
        )}

        {activeTab === 'Insights Logs' && (
          <div className="app-card" style={{width: '100%'}}>
            <h3 className="card-title">📊 Analytical Insights Reports</h3>
            <p style={{color: 'var(--text-secondary)'}}>Graphical representation of historical data trends and system inference tracking metrics.</p>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="app-card" style={{width: '100%'}}>
            <h3 className="card-title">⚙️ System Core Settings</h3>
            <p style={{color: 'var(--text-secondary)'}}>Manage endpoints, toggle model parameters (SMOTE / Class Weight thresholds), and adjust styling states.</p>
          </div>
        )}

      </main>
    </div>
  );
}