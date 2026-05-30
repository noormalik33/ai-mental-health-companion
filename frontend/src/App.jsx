import { useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import './Dashboard.css';

// --- Assets Mapping (Ensure these exist in your src/ folder) ---
import maleAnimation from './male-avatar.json'; 
import femaleAnimation from './female-avatar.json';
import navbarAnalyticsAnimation from './analytics-icon.json'; 

// --- UPDATED: Result Lottie Animations ---
// In JSON files ke original naam aur paths apke project ke hisab se change honge
import highRiskAnimation from './high-risk-alert.json'; 
import lowRiskAnimation from './low-risk-check.json';
import highStressJournalAnimation from './high-stress-emotional.json';
import calmJournalAnimation from './calm-peaceful.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // --- Risk Form States ---
  const [riskData, setRiskData] = useState({ name: '', age: '', gender: '0', anxiety: '0', panic_attacks: '0' });
  const [riskResult, setRiskResult] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState(null);

  // --- Journal Form States ---
  const [journalText, setJournalText] = useState('');
  const [journalResult, setJournalResult] = useState(null);
  const [journalLoading, setJournalLoading] = useState(false);

  // --- API Handlers ---
  const handleRiskSubmit = async (e) => {
    e.preventDefault();
    setRiskLoading(true);
    setRiskResult(null);
    setRiskError(null);
    try {
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
      if (!response.ok) throw new Error(`Server status: ${response.status}`);
      const data = await response.json();
      setRiskResult(data); 
    } catch (err) {
      setRiskError("Backend validation failed or server is offline.");
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
      if (!res.ok) throw new Error('Journal analysis failed');
      const data = await res.json();
      setJournalResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setJournalLoading(false);
    }
  };

  // --- 🛠️ Render Helpers (Focus, Execution, and Animation Safe) ---
  const renderRiskForm = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: '1' }}>
          <h3 className="card-title">📋 Risk Assessment Profile</h3>
          <form onSubmit={handleRiskSubmit}>
            <div className="field-group">
              <label>Full Name</label>
              <input 
                type="text" required className="text-input" placeholder="Enter your name"
                value={riskData.name} onChange={(e) => setRiskData({...riskData, name: e.target.value})} 
              />
            </div>
            <div className="field-group">
              <label>Age Vector</label>
              <input 
                type="number" required className="text-input" placeholder="e.g. 24"
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
            <button type="submit" className="submit-btn" disabled={riskLoading}>
              <span>🧠</span> {riskLoading ? "Querying ML Model..." : "Analyze Profile"}
            </button>
          </form>
          
          {riskError && (
            <div className="output-node" style={{ borderLeft: '5px solid #EF4444', color: '#EF4444', marginTop: '20px' }}>
              {riskError}
            </div>
          )}

          {riskResult && (
            <div className="output-node" style={{ borderLeft: riskResult.predicted_risk === 'High Risk' ? '6px solid var(--accent)' : '6px solid #22C55E', marginTop: '20px' }}>
              <div className="output-header" style={{ color: riskResult.predicted_risk === 'High Risk' ? 'var(--accent)' : '#22C55E' }}>
                Patient: {riskData.name || 'Anonymous'} — Result: {riskResult.predicted_risk}
              </div>
              <p className="output-desc">{riskResult.recommendation}</p>
              
              {/* --- NEW: Dynamic Risk Result Lottie Animation --- */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                <Player 
                  autoplay 
                  loop 
                  src={riskResult.predicted_risk === 'High Risk' ? highRiskAnimation : lowRiskAnimation} 
                  style={{ height: '100px', width: '100px' }} 
                />
              </div>
            </div>
          )}
        </div>
        
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: '30px', marginTop: '20px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px', textAlign: 'center', letterSpacing: '0.5px' }}>
            👤 {riskData.name ? `${riskData.name}'s Avatar` : "Live Avatar State"}
          </span>
          <Player autoplay loop src={riskData.gender === '1' ? maleAnimation : femaleAnimation} style={{ height: '200px', width: '200px' }} />
        </div>
      </div>
    );
  };

  const renderJournalForm = () => {
    return (
      <div>
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
          <button type="submit" className="submit-btn" disabled={journalLoading || !journalText.trim()}>
            <span>🚀</span> {journalLoading ? "Extracting Layers..." : "Analyze Sentiment Context"}
          </button>
        </form>

        {journalResult && (
          <div className="output-node" style={{ borderLeft: '6px solid var(--primary)', marginTop: '20px' }}>
            <div className="output-header" style={{ color: 'var(--primary)' }}>
              Detected Emotion: {journalResult.emotion}
            </div>
            <p className="output-desc"><strong>Coping Strategy:</strong> {journalResult.coping_strategy}</p>
            
            {/* --- NEW: Dynamic Journal Result Lottie Animation --- */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
              <Player 
                autoplay 
                loop 
                // Yahan apke FastAPI backend ke emotional category mapping ke mutabiq condition change hogi
                // Misaal ke taur par: Agar 'Depression' ya 'Anxiety' detected ho
                src={journalResult.emotion === 'Depression' || journalResult.emotion === 'Anxiety' ? highStressJournalAnimation : calmJournalAnimation} 
                style={{ height: '100px', width: '100px' }} 
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* ========================== SIDEBAR DOCK ========================== */}
      <aside className="sidebar-dock">
        <div>
          <div className="logo-section"><span>🧠</span> <strong>Companion AI</strong></div>
          <nav className="nav-menu">
            <div className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('Dashboard')}>📂 Dashboard</div>
            <div className={`nav-item ${activeTab === 'Risk Assessment' ? 'active' : ''}`} onClick={() => setActiveTab('Risk Assessment')}>🛡️ Risk Assessment</div>
            <div className={`nav-item ${activeTab === 'Journal Analysis' ? 'active' : ''}`} onClick={() => setActiveTab('Journal Analysis')}>📝 Journal Analysis</div>
            <div className={`nav-item ${activeTab === 'Insights Logs' ? 'active' : ''}`} onClick={() => setActiveTab('Insights Logs')}>📊 Insights Logs</div>
            <div className={`nav-item ${activeTab === 'Settings' ? 'active' : ''}`} onClick={() => setActiveTab('Settings')}>⚙️ Settings</div>
          </nav>
        </div>
        <div className="system-health-box">
          <div style={{ color: '#4ADE80', fontWeight: '700' }}>● Systems Active</div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>FastAPI & React Online</span>
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
          </div>
          
          <div className="badge-row" style={{ display: 'flex', alignItems: 'center' }}>
            <Player autoplay loop src={navbarAnalyticsAnimation} style={{ height: '75px', width: '75px' }} />
          </div>
        </div>

        {/* --- Dynamic Content Router --- */}
        {activeTab === 'Dashboard' && (
          <div className="content-grid">
            <section className="app-card">{renderRiskForm()}</section>
            <section className="app-card">{renderJournalForm()}</section>
          </div>
        )}

        {activeTab === 'Risk Assessment' && (
          <div style={{ width: '100%' }}><section className="app-card">{renderRiskForm()}</section></div>
        )}

        {activeTab === 'Journal Analysis' && (
          <div style={{ width: '100%' }}><section className="app-card">{renderJournalForm()}</section></div>
        )}

        {activeTab === 'Insights Logs' && (
          <div className="app-card"><h3>📊 Analytical Insights Reports</h3><p style={{color: 'var(--text-secondary)'}}>Historical trends tracking metrics go here.</p></div>
        )}
        
        {activeTab === 'Settings' && (
          <div className="app-card"><h3>⚙️ System Core Settings</h3><p style={{color: 'var(--text-secondary)'}}>Manage endpoints and algorithm parameters.</p></div>
        )}
      </main>
    </div>
  );
}