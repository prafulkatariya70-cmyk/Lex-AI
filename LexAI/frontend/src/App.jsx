import { useState } from "react";
import axios from "axios";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0b;
    --surface: #111113;
    --surface2: #18181c;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.14);
    --text: #f0efe8;
    --text-muted: #6b6a65;
    --text-dim: #3a3a3d;
    --accent: #c8a96e;
    --accent-dim: rgba(200,169,110,0.12);
    --accent-glow: rgba(200,169,110,0.25);
    --green: #4ade80;
    --green-bg: rgba(74,222,128,0.08);
    --yellow: #fbbf24;
    --yellow-bg: rgba(251,191,36,0.08);
    --red: #f87171;
    --red-bg: rgba(248,113,113,0.08);
    --radius: 12px;
    --radius-sm: 8px;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
    opacity: 0.4;
  }

  .glow-orb {
    position: fixed; width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 70%);
    top: -200px; left: 50%; transform: translateX(-50%);
    pointer-events: none; z-index: 0;
  }

  .app { position: relative; z-index: 1; max-width: 780px; margin: 0 auto; padding: 0 24px 80px; }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 0 32px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 48px;
  }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, #c8a96e, #a07840);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .logo-text { font-family: 'Instrument Serif', serif; font-size: 20px; color: var(--text); letter-spacing: -0.3px; }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .nav-badge {
    font-size: 11px; font-weight: 500; padding: 4px 10px;
    border: 1px solid var(--border); border-radius: 20px;
    color: var(--text-muted); letter-spacing: 0.5px;
  }

  /* LANDING */
  .landing { text-align: center; padding: 80px 0; }
  .landing-label {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; color: var(--accent);
    letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px;
  }
  .landing-label::before, .landing-label::after { content: ''; width: 20px; height: 1px; background: var(--accent); }
  .landing h1 {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(40px, 7vw, 64px);
    font-weight: 400; line-height: 1.1; letter-spacing: -1.5px;
    color: var(--text); margin-bottom: 20px;
  }
  .landing h1 em { font-style: italic; color: var(--accent); }
  .landing p { font-size: 17px; color: var(--text-muted); line-height: 1.6; max-width: 480px; margin: 0 auto 40px; }
  .signin-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px;
    background: linear-gradient(135deg, #c8a96e, #a07840);
    color: #1a1208; font-size: 15px; font-weight: 600;
    border: none; border-radius: var(--radius); cursor: pointer;
    transition: all 0.2s; letter-spacing: 0.2px;
  }
  .signin-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 32px var(--accent-glow); }

  .features {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 64px;
  }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px; text-align: left;
  }
  .feature-icon { font-size: 22px; margin-bottom: 10px; }
  .feature-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .feature-desc { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

  /* DASHBOARD */
  .dashboard-header { margin-bottom: 32px; }
  .welcome { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; }
  .dashboard-title {
    font-family: 'Instrument Serif', serif;
    font-size: 32px; color: var(--text); letter-spacing: -0.5px;
  }

  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px;
  }
  .stat-label { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-value { font-size: 28px; font-weight: 600; color: var(--text); }
  .stat-value.accent { color: var(--accent); }
  .stat-value.green { color: var(--green); }
  .stat-value.red { color: var(--red); }

  /* UPLOAD */
  .section-title {
    font-size: 13px; font-weight: 600; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .upload-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px; margin-bottom: 32px;
  }
  .drop-zone {
    border: 1.5px dashed var(--border-hover); border-radius: var(--radius);
    padding: 36px 24px; text-align: center; cursor: pointer;
    transition: all 0.2s; position: relative; background: var(--surface2);
  }
  .drop-zone:hover, .drop-zone.active { border-color: var(--accent); background: var(--accent-dim); }
  .drop-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .drop-icon { font-size: 28px; margin-bottom: 10px; }
  .drop-title { font-size: 15px; font-weight: 500; color: var(--text); margin-bottom: 4px; }
  .drop-sub { font-size: 13px; color: var(--text-muted); }
  .drop-sub span { color: var(--accent); }

  .file-selected {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; margin-top: 14px;
    background: var(--accent-dim); border: 1px solid rgba(200,169,110,0.2);
    border-radius: var(--radius-sm);
  }
  .file-name { font-size: 14px; font-weight: 500; color: var(--text); flex: 1; }
  .file-remove { font-size: 18px; color: var(--text-muted); cursor: pointer; }
  .file-remove:hover { color: var(--red); }

  .analyze-btn {
    width: 100%; margin-top: 16px; padding: 15px;
    background: linear-gradient(135deg, #c8a96e, #a07840);
    color: #1a1208; font-size: 15px; font-weight: 600;
    border: none; border-radius: var(--radius); cursor: pointer;
    transition: all 0.2s;
  }
  .analyze-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px var(--accent-glow); }
  .analyze-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .analyze-btn.loading { background: var(--surface2); color: var(--text-muted); border: 1px solid var(--border); }

  .loading-row { display: flex; align-items: center; justify-content: center; gap: 10px; }
  .spinner {
    width: 16px; height: 16px; border: 2px solid var(--border-hover);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* RESULTS */
  .results { display: flex; flex-direction: column; gap: 12px; animation: fadeUp 0.4s ease; margin-bottom: 40px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .results-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;
  }
  .results-title { font-family: 'Instrument Serif', serif; font-size: 22px; color: var(--text); }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 22px; transition: border-color 0.2s;
  }
  .card:hover { border-color: var(--border-hover); }
  .card-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .card-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .summary-text { font-size: 15px; line-height: 1.7; color: var(--text); }

  .risk-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: 24px; font-size: 14px; font-weight: 600;
  }
  .risk-dot { width: 8px; height: 8px; border-radius: 50%; }
  .risk-low { background: var(--green-bg); color: var(--green); }
  .risk-low .risk-dot { background: var(--green); }
  .risk-medium { background: var(--yellow-bg); color: var(--yellow); }
  .risk-medium .risk-dot { background: var(--yellow); }
  .risk-high { background: var(--red-bg); color: var(--red); }
  .risk-high .risk-dot { background: var(--red); }

  .tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag {
    padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 500;
    background: var(--surface2); border: 1px solid var(--border); color: var(--text);
  }

  .flag-item {
    display: flex; gap: 10px; align-items: flex-start;
    padding: 12px 14px; border-radius: var(--radius-sm);
    background: var(--red-bg); border: 1px solid rgba(248,113,113,0.12);
    margin-bottom: 8px; font-size: 13px; color: #fca5a5; line-height: 1.5;
  }
  .flag-item:last-child { margin-bottom: 0; }

  .rec-item {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 12px 0; border-bottom: 1px solid var(--border);
    font-size: 14px; color: var(--text); line-height: 1.6;
  }
  .rec-item:last-child { border-bottom: none; padding-bottom: 0; }
  .rec-num {
    font-size: 11px; font-weight: 600; color: var(--accent);
    background: var(--accent-dim); border-radius: 4px;
    padding: 2px 7px; flex-shrink: 0; margin-top: 2px;
  }

  .no-flags { display: flex; align-items: center; gap: 8px; color: var(--green); font-size: 14px; font-weight: 500; }

  /* HISTORY */
  .history-list { display: flex; flex-direction: column; gap: 10px; }
  .history-item {
    display: flex; align-items: center; gap: 16px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 16px 20px; transition: border-color 0.2s;
  }
  .history-item:hover { border-color: var(--border-hover); }
  .history-icon { font-size: 20px; }
  .history-info { flex: 1; }
  .history-name { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
  .history-date { font-size: 12px; color: var(--text-muted); }
  .history-risk {
    font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px;
  }
  .history-risk.low { background: var(--green-bg); color: var(--green); }
  .history-risk.medium { background: var(--yellow-bg); color: var(--yellow); }
  .history-risk.high { background: var(--red-bg); color: var(--red); }

  .empty-state {
    text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px;
    background: var(--surface); border: 1px dashed var(--border); border-radius: 12px;
  }
  .empty-icon { font-size: 32px; margin-bottom: 10px; }

  .error-card {
    background: var(--red-bg); border: 1px solid rgba(248,113,113,0.2);
    border-radius: var(--radius); padding: 14px 18px;
    color: var(--red); font-size: 14px; margin-top: 12px;
  }

  .reset-btn {
    background: none; border: 1px solid var(--border);
    color: var(--text-muted); font-size: 13px; padding: 7px 14px;
    border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .reset-btn:hover { border-color: var(--border-hover); color: var(--text); }

  .divider { height: 1px; background: var(--border); margin: 40px 0; }
  .footer { text-align: center; font-size: 12px; color: var(--text-dim); padding-top: 24px; }

  @media (max-width: 600px) {
    .features { grid-template-columns: 1fr; }
    .stats-row { grid-template-columns: 1fr; }
  }
`;

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [history, setHistory] = useState([]);
  const { user } = useUser();

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") { setFile(f); setError(null); }
    else setError("Please upload a PDF file.");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("https://lex-ai-backend-epyt.onrender.com/analyze", formData);
      const parsed = JSON.parse(response.data.analysis);
      setResult(parsed);
      setHistory(prev => [{
        name: file.name,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        risk: parsed.risk_level
      }, ...prev]);
    } catch {
      setError("Analysis failed. Make sure the backend is running.");
    } finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  const highRisk = history.filter(h => h.risk === "High").length;
  const lowRisk = history.filter(h => h.risk === "Low").length;

  return (
    <>
      <style>{styles}</style>
      <div className="noise" />
      <div className="glow-orb" />
      <div className="app">

        {/* Nav */}
        <nav className="nav">
          <div className="logo">
            <div className="logo-icon">⚖️</div>
            <span className="logo-text">LexAI</span>
          </div>
          <div className="nav-right">
            <span className="nav-badge">BETA</span>
            <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="signin-btn" style={{ padding: "8px 18px", fontSize: "13px" }}>Sign in</button>
              </SignInButton>
            </SignedOut>
          </div>
        </nav>

        {/* Landing page for signed out users */}
        <SignedOut>
          <div className="landing">
            <div className="landing-label">AI Legal Intelligence</div>
            <h1>Review contracts in <em>seconds,</em> not hours</h1>
            <p>Upload any contract and get instant risk analysis, key clause extraction, and actionable recommendations — powered by AI.</p>
            <SignInButton mode="modal">
              <button className="signin-btn">Get started free →</button>
            </SignInButton>
            <div className="features">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <div className="feature-title">Instant Analysis</div>
                <div className="feature-desc">Get full contract review in under 60 seconds</div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚩</div>
                <div className="feature-title">Risk Detection</div>
                <div className="feature-desc">AI flags risky clauses before you sign</div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <div className="feature-title">Plain English</div>
                <div className="feature-desc">Complex legal language explained simply</div>
              </div>
            </div>
          </div>
        </SignedOut>

        {/* Dashboard for signed in users */}
        <SignedIn>
          <div className="dashboard-header">
            <div className="welcome">Welcome back,</div>
            <div className="dashboard-title">{user?.firstName || "Counselor"} 👋</div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total Analyzed</div>
              <div className="stat-value accent">{history.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">High Risk Found</div>
              <div className="stat-value red">{highRisk}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Low Risk</div>
              <div className="stat-value green">{lowRisk}</div>
            </div>
          </div>

          {/* Upload */}
          <div className="section-title">Analyze a contract</div>
          <div className="upload-card">
            <div
              className={`drop-zone${dragging ? " active" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <input type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files[0])} />
              <div className="drop-icon">📄</div>
              <div className="drop-title">Drop your contract here</div>
              <div className="drop-sub">or <span>browse files</span> · PDF only</div>
            </div>

            {file && (
              <div className="file-selected">
                <span>📎</span>
                <span className="file-name">{file.name}</span>
                <span className="file-remove" onClick={reset}>×</span>
              </div>
            )}

            {error && <div className="error-card">⚠️ {error}</div>}

            <button
              className={`analyze-btn${loading ? " loading" : ""}`}
              onClick={handleAnalyze}
              disabled={!file || loading}
            >
              {loading ? (
                <div className="loading-row"><div className="spinner" />Analyzing contract...</div>
              ) : "Analyze Contract →"}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="results">
              <div className="results-header">
                <div className="results-title">Analysis complete</div>
                <button className="reset-btn" onClick={reset}>← New contract</button>
              </div>

              <div className="card">
                <div className="card-label">Summary</div>
                <p className="summary-text">{result.summary}</p>
              </div>

              <div className="card">
                <div className="card-label">Risk Level</div>
                <div className={`risk-badge risk-${result.risk_level?.toLowerCase()}`}>
                  <div className="risk-dot" />{result.risk_level} Risk
                </div>
              </div>

              <div className="card">
                <div className="card-label">Key Clauses</div>
                <div className="tag-list">
                  {result.key_clauses?.map((c, i) => <span key={i} className="tag">{c}</span>)}
                </div>
              </div>

              <div className="card">
                <div className="card-label">Red Flags</div>
                {!result.red_flags?.length ? (
                  <div className="no-flags">✓ No red flags detected</div>
                ) : result.red_flags.map((f, i) => (
                  <div key={i} className="flag-item"><span>⚑</span> {f}</div>
                ))}
              </div>

              <div className="card">
                <div className="card-label">Recommendations</div>
                {result.recommendations?.map((r, i) => (
                  <div key={i} className="rec-item">
                    <span className="rec-num">0{i + 1}</span>{r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="section-title">Contract history</div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                No contracts analyzed yet. Upload your first one above.
              </div>
            ) : history.map((h, i) => (
              <div key={i} className="history-item">
                <span className="history-icon">📄</span>
                <div className="history-info">
                  <div className="history-name">{h.name}</div>
                  <div className="history-date">{h.date}</div>
                </div>
                <span className={`history-risk ${h.risk?.toLowerCase()}`}>{h.risk} Risk</span>
              </div>
            ))}
          </div>
        </SignedIn>

        <div className="divider" />
        <div className="footer">LexAI · AI-powered legal intelligence for modern law firms</div>
      </div>
    </>
  );
}