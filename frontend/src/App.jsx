import { useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import './Dashboard.css';

// --- Assets Mapping (Ensure these exist in your src/ folder) ---
import maleAnimation from './male-avatar.json'; 
import femaleAnimation from './female-avatar.json';
import navbarAnalyticsAnimation from './analytics-icon.json'; 
import highRiskAnimation from './high-risk-alert.json'; 
import lowRiskAnimation from './low-risk-check.json';
import highStressJournalAnimation from './high-stress-emotional.json';
import calmJournalAnimation from './calm-peaceful.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false); // Dynamic Theme Hook

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
            <div className="output-node risk-high-override" style={{ borderLeft: riskResult.predicted_risk === 'High Risk' ? '6px solid var(--accent)' : '6px solid #22C55E', marginTop: '20px' }}>
              <div className="output-header" style={{ color: riskResult.predicted_risk === 'High Risk' ? 'var(--accent)' : '#22C55E' }}>
                Patient: {riskData.name || 'Anonymous'} — Result: {riskResult.predicted_risk}
              </div>
              <p className="output-desc">{riskResult.recommendation}</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                <Player autoplay loop src={riskResult.predicted_risk === 'High Risk' ? highRiskAnimation : lowRiskAnimation} style={{ height: '100px', width: '100px' }} />
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
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
              <Player autoplay loop src={journalResult.emotion === 'Depression' || journalResult.emotion === 'Anxiety' ? highStressJournalAnimation : calmJournalAnimation} style={{ height: '100px', width: '100px' }} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`dashboard-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      
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

        {/* --- DYNAMIC HUB ROUTER --- */}
        
        {activeTab === 'Dashboard' && (
          <div style={{ animation: 'popIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
            
            {/* Main Welcome Hero Card */}
            <section className="app-card">
              <h2 style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: '800', marginBottom: '15px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>
                👋 Welcome to Our Tech Hub!
              </h2>
              <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '15px', fontWeight: '500' }}>
                We are <strong>Ghulam Qadir</strong> and <strong>Noor Malik</strong>—Full-Stack Developers, Mobile App Innovators, and Tech Creators studying Information Technology at Air University. Together, we architect scalable web ecosystems, build secure cross-platform mobile applications, and automate deployment workflows from the ground up.
              </p>
              <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '20px' }}>
                Driven by a security-first mindset and a passion for modern DevOps practices, we love turning complex problems into clean, high-performance digital solutions. Beyond building software, we run <strong>CoreIT Tech</strong>, where we share our development journey, insights, and technical tutorials with the wider developer community.
              </p>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Explore our individual portfolios, check out our open-source contributions, or connect with our community channels below!
              </p>
            </section>

            {/* Content Split: Channels & Quick Mode Badge */}
            <div className="content-grid">
              <section className="app-card">
                <h3 className="card-title">🎥 Tech Community & Content Channels</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ padding: '12px', background: 'var(--output-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    🔴 <strong>CoreIT Tech (Primary YouTube):</strong> <a href="https://youtube.com/@CoreITTech1" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>youtube.com/@CoreITTech1</a>
                  </li>
                  <li style={{ padding: '12px', background: 'var(--output-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    体积 <strong>CoreIT Tech (Secondary YouTube):</strong> <a href="https://youtube.com/@coreittech" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>youtube.com/@coreittech</a>
                  </li>
                  <li style={{ padding: '12px', background: 'var(--output-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    📸 <strong>Instagram Community:</strong> <a href="https://instagram.com/coreit.tech" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>instagram.com/coreit.tech</a>
                  </li>
                  <li style={{ padding: '12px', background: 'var(--output-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    🔵 <strong>Facebook Page:</strong> <a href="https://facebook.com/share/1AmgLDUnc9/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>facebook.com/share/1AmgLDUnc9/</a>
                  </li>
                </ul>
              </section>

              <section className="app-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(33,94,97,0.05), rgba(254,127,45,0.05))' }}>
                <span style={{ fontSize: '3rem' }}>🚀</span>
                <h4 style={{ color: 'var(--primary)', fontSize: '1.3rem', fontWeight: '700', marginTop: '15px' }}>Clinical Assessment Mode</h4>
                <p style={{ color: 'var(--text-secondary)', padding: '0 20px', marginTop: '8px', lineHeight: '1.5' }}>
                  Use the left sidebar docks to launch independent pipeline interfaces for **ML Risk Models** or **BERT Transformers** analytics.
                </p>
              </section>
            </div>

            {/* Meet the Developers Portfolio Blocks */}
            <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '800', marginTop: '10px' }}>💼 Meet the Developers</h3>
            <div className="content-grid">
              
              {/* Ghulam Qadir Portfolio */}
              <section className="app-card" style={{ borderTop: '5px solid var(--accent)' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '4px' }}>Ghulam Qadir</h4>
                <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Backend Specialist & Cross-Platform Developer</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                  A goal-oriented IT student specializing in robust backend logic, responsive web engineering, and native/cross-platform mobile app development.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  <div>🌐 <strong>Portfolio:</strong> <a href="https://ghulam-qadir.netlify.app" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>ghulam-qadir.netlify.app</a></div>
                  <div>💻 <strong>GitHub:</strong> <a href="https://github.com/G-Qadir9988" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>github.com/G-Qadir9988</a></div>
                  <div>🤝 <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/ghulam-qadir-07a982365" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>linkedin.com/in/ghulam-qadir</a></div>
                </div>
              </section>

              {/* Noor Malik Portfolio */}
              <section className="app-card" style={{ borderTop: '5px solid var(--primary)' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '4px' }}>Noor Malik</h4>
                <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Full-Stack Developer & DevOps Specialist</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                  An academic high achiever and freelance engineer focused on the MERN stack, modular architecture, Infrastructure as Code (IaC), and continuous integration pipelines.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  <div>🌐 <strong>Portfolio:</strong> <a href="https://noor-malik-portfolio.netlify.app" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>noor-malik-portfolio.netlify.app</a></div>
                  <div>💻 <strong>GitHub:</strong> <a href="https://github.com/noormalik33" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>github.com/noormalik33</a></div>
                  <div>🤝 <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/noormalik33" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>linkedin.com/in/noormalik33</a></div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Dedicated view panels for core AI functional processing loops */}
        {activeTab === 'Risk Assessment' && (
          <div style={{ width: '100%', animation: 'popIn 0.3s ease' }}><section className="app-card">{renderRiskForm()}</section></div>
        )}

        {activeTab === 'Journal Analysis' && (
          <div style={{ width: '100%', animation: 'popIn 0.3s ease' }}><section className="app-card">{renderJournalForm()}</section></div>
        )}

        {activeTab === 'Insights Logs' && (
          <div className="app-card" style={{ animation: 'popIn 0.3s ease' }}><h3>📊 Analytical Insights Reports</h3><p style={{color: 'var(--text-secondary)'}}>Historical data models inference tracking parameters filter logs.</p></div>
        )}
        
        {/* SETTINGS MODE: Fully Integrated Dark/Light Theme Switching Station */}
        {activeTab === 'Settings' && (
          <section className="app-card" style={{ animation: 'popIn 0.3s ease' }}>
            <h3 className="card-title">⚙️ System Core Settings</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: 'var(--output-bg)', borderRadius: '18px', border: '1px solid var(--border)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Interface Canvas Theme</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0 0' }}>Toggle between high-contrast light mode and specialized low-light dev-slate mode.</p>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="submit-btn" 
                style={{ width: '180px', background: isDarkMode ? 'var(--primary)' : 'var(--accent)', boxShadow: 'none' }}
              >
                {isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}