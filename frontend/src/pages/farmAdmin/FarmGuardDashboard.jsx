import React, { useState, useEffect, useCallback, useRef } from 'react';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`;
const getToken = () => localStorage.getItem('token');

// ── Sensor display config ──────────────────────────────────────────────────
const SENSOR_CONFIG = {
  feed_consumption:  { label: 'Feed Consumed',   icon: '🍚', unit: 'kg',    color: '#f59e0b', safe: [0, 200] },
  water_consumption: { label: 'Water Used',       icon: '💧', unit: 'L',     color: '#38bdf8', safe: [0, 300] },
  animal_count:      { label: 'Animal Count',     icon: '🐔', unit: '',      color: '#a78bfa', safe: null },
  mortality_count:   { label: 'Mortality Today',  icon: '💀', unit: '',      color: '#ef4444', safe: [0, 4] },
  temperature:       { label: 'Temperature',      icon: '🌡️', unit: '°C',   color: '#f97316', safe: [18, 32] },
  humidity:          { label: 'Humidity',          icon: '💨', unit: '%',     color: '#6ee7b7', safe: [30, 80] },
  rfid_attendance:   { label: 'Worker Entries',   icon: '👷', unit: '',      color: '#818cf8', safe: null },
  feed_bin_level:    { label: 'Feed Bin Level',   icon: '📦', unit: '%',     color: '#fbbf24', safe: [15, 100] },
};

const TRIGGER_LABELS = {
  feed_deviation:       '🍚 Feed Deviation',
  health_alert:         '🏥 Health Alert',
  disease_risk:         '🦠 Disease Risk',
  mortality_spike:      '💀 Mortality Spike',
  vaccination_due:      '💉 Vaccination Due',
  biosecurity_breach:   '🛡️ Biosecurity',
  inventory_mismatch:   '📦 Inventory Issue',
  attendance_auto:      '👷 Auto Attendance',
  environmental_alert:  '🌡️ Environmental',
};

const LEVEL_CONFIG = {
  1: { label: 'L1 Auto',     color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '🟢' },
  2: { label: 'L2 Notify',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🟡' },
  3: { label: 'L3 Approval', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '🔴' },
};

const fmtAgo = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

// ── Sub-components ─────────────────────────────────────────────────────────

function GlowCard({ children, style = {}, glow = '#6366f1' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? glow + '55' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16, backdropFilter: 'blur(12px)',
        boxShadow: hovered ? `0 4px 30px ${glow}18` : 'none',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >{children}</div>
  );
}

function SensorGauge({ type, value, isAnomaly }) {
  const cfg = SENSOR_CONFIG[type] || { label: type, icon: '📡', unit: '', color: '#6366f1', safe: null };
  const [safe] = cfg.safe ? [cfg.safe] : [null];
  const pct = cfg.safe ? Math.min(100, Math.max(0, ((value - cfg.safe[0]) / (cfg.safe[1] - cfg.safe[0])) * 100)) : 50;
  const isOutOfRange = cfg.safe && (value < cfg.safe[0] || value > cfg.safe[1]);

  return (
    <GlowCard glow={isAnomaly || isOutOfRange ? '#ef4444' : cfg.color} style={{ padding: '1rem 1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{cfg.label}</span>
        </div>
        {(isAnomaly || isOutOfRange) && (
          <span style={{
            fontSize: '0.65rem', padding: '2px 7px', borderRadius: 10,
            background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)',
            animation: 'blink 1.5s infinite',
          }}>⚠ ANOMALY</span>
        )}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isAnomaly || isOutOfRange ? '#ef4444' : cfg.color, lineHeight: 1 }}>
        {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : '--'}
        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b', marginLeft: 4 }}>{cfg.unit}</span>
      </div>
      {cfg.safe && (
        <div style={{ marginTop: '0.6rem' }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%', borderRadius: 2,
              background: `linear-gradient(90deg, ${cfg.color}80, ${isOutOfRange ? '#ef4444' : cfg.color})`,
              transition: 'width 0.8s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            <span style={{ fontSize: '0.6rem', color: '#475569' }}>{cfg.safe[0]}{cfg.unit}</span>
            <span style={{ fontSize: '0.6rem', color: '#475569' }}>{cfg.safe[1]}{cfg.unit}</span>
          </div>
        </div>
      )}
    </GlowCard>
  );
}

function ApprovalCard({ action, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handle = async (type) => {
    setLoading(true);
    await (type === 'approve' ? onApprove(action._id) : onReject(action._id, reason));
    setLoading(false);
  };

  return (
    <div style={{
      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 14, padding: '1.1rem', marginBottom: '0.75rem',
      animation: 'slideUp 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.95rem' }}>{TRIGGER_LABELS[action.triggerType] || action.triggerType}</span>
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
              🔴 AWAITING APPROVAL
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
            {action.actionType?.replace(/_/g, ' ').toUpperCase()}
          </div>

          {/* AI Reasoning */}
          {action.aiReasoning && (
            <div style={{
              padding: '0.6rem 0.8rem', borderRadius: 8,
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              fontSize: '0.78rem', color: '#c7d2fe', marginBottom: '0.6rem',
              lineHeight: 1.5,
            }}>
              🤖 <em>{action.aiReasoning}</em>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
            <span>Risk: <strong style={{ color: '#ef4444' }}>{action.riskScore}/100</strong></span>
            <span>Confidence: <strong style={{ color: '#a78bfa' }}>{((action.confidence || 0) * 100).toFixed(0)}%</strong></span>
            <span>{fmtAgo(action.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Reject with reason */}
      {expanded && (
        <div style={{ marginTop: '0.75rem' }}>
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for rejection (optional)..."
            style={{
              width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: '0.78rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0', boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button onClick={() => handle('approve')} disabled={loading} style={{
          flex: 1, padding: '0.55rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
          background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', color: '#fff',
          opacity: loading ? 0.7 : 1,
        }}>✅ Approve</button>
        <button onClick={() => expanded ? handle('reject') : setExpanded(true)} disabled={loading} style={{
          flex: 1, padding: '0.55rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
          background: expanded ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${expanded ? '#ef444488' : 'rgba(255,255,255,0.1)'}`,
          color: expanded ? '#fca5a5' : '#94a3b8',
        }}>{expanded ? '❌ Confirm Reject' : '✕ Reject'}</button>
      </div>
    </div>
  );
}

function ActivityFeed({ actions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {actions.map(a => {
        const lvl = LEVEL_CONFIG[a.automationLevel] || LEVEL_CONFIG[1];
        return (
          <div key={a._id} style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.65rem 0.9rem', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${lvl.color}55`,
            animation: 'slideUp 0.25s ease',
          }}>
            <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{lvl.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 500, marginBottom: 2 }}>
                {TRIGGER_LABELS[a.triggerType] || a.triggerType}
                <span style={{ marginLeft: 8, fontSize: '0.68rem', color: lvl.color, fontFamily: 'monospace' }}>
                  {a.actionType?.replace(/_/g, ' ')}
                </span>
              </div>
              {a.aiReasoning && (
                <div style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.aiReasoning}
                </div>
              )}
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#475569' }}>{fmtAgo(a.createdAt)}</div>
              <div style={{
                fontSize: '0.65rem', marginTop: 2, padding: '1px 7px', borderRadius: 8,
                background: lvl.bg, color: lvl.color, fontWeight: 600,
              }}>{lvl.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main FarmGuard Dashboard ───────────────────────────────────────────────

export default function FarmGuardDashboard() {
  const [sensors, setSensors] = useState([]);
  const [actions, setActions] = useState([]);
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [activeTab, setActiveTab] = useState('live');
  const pollRef = useRef(null);

  const headers = { Authorization: `Bearer ${getToken()}` };

  const fetchAll = useCallback(async () => {
    try {
      const [sRes, aRes, pRes, stRes] = await Promise.all([
        fetch(`${API}/farmguard/sensors/latest`, { headers }),
        fetch(`${API}/farmguard/actions?limit=20`, { headers }),
        fetch(`${API}/farmguard/actions/pending`, { headers }),
        fetch(`${API}/farmguard/stats`, { headers }),
      ]);
      const [s, a, p, st] = await Promise.all([sRes.json(), aRes.json(), pRes.json(), stRes.json()]);
      if (s.success) setSensors(s.data);
      if (a.success) setActions(a.data);
      if (p.success) setPending(p.data);
      if (st.success) setStats(st.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    // Live polling every 20 seconds
    pollRef.current = setInterval(fetchAll, 20000);
    return () => clearInterval(pollRef.current);
  }, [fetchAll, lastRefresh]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await fetch(`${API}/farmguard/simulate-sensors`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      setTimeout(fetchAll, 2000);
    } catch (e) { console.error(e); }
    finally { setTimeout(() => setSimulating(false), 3000); }
  };

  const handleRunCycle = async () => {
    await fetch(`${API}/farmguard/run-cycle`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    setTimeout(fetchAll, 3000);
  };

  const handleApprove = async (id) => {
    await fetch(`${API}/farmguard/actions/${id}/approve`, { method: 'PATCH', headers });
    fetchAll();
  };

  const handleReject = async (id, reason) => {
    await fetch(`${API}/farmguard/actions/${id}/reject`, { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
    fetchAll();
  };

  // Group sensor readings by type
  const sensorMap = {};
  sensors.forEach(s => { sensorMap[s._id] = { value: s.latestValue, isAnomaly: s.isAnomaly }; });

  const SENSOR_ORDER = ['feed_consumption', 'water_consumption', 'animal_count', 'mortality_count', 'temperature', 'humidity', 'rfid_attendance', 'feed_bin_level'];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', padding: '1.5rem 2rem', color: '#e2e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '2rem' }}>🤖</span>
            <h1 style={{
              margin: 0, fontSize: '1.7rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1, #a78bfa, #38bdf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>FarmGuard AI</h1>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', animation: 'pulse 2.5s infinite' }}>● AUTONOMOUS</span>
              {pending.length > 0 && (
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', animation: 'blink 1.5s infinite' }}>
                  🔴 {pending.length} AWAITING APPROVAL
                </span>
              )}
            </div>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
            Autonomous Farm Operations Agent · 3-Level Policy Engine · Groq AI Reasoning
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={handleSimulate} disabled={simulating} style={{
            padding: '0.55rem 1rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            background: simulating ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc',
          }}>
            {simulating ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙</span> : '📡'} {simulating ? 'Simulating...' : 'Simulate Sensors'}
          </button>
          <button onClick={handleRunCycle} style={{
            padding: '0.55rem 1rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff',
          }}>🤖 Run AI Cycle</button>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Actions', value: stats.totalActions, color: '#6366f1', icon: '⚡' },
            { label: '🟢 L1 Auto', value: stats.l1Count, color: '#10b981', icon: '' },
            { label: '🟡 L2 Notify', value: stats.l2Count, color: '#f59e0b', icon: '' },
            { label: '🔴 L3 Pending', value: stats.pendingApprovals, color: '#ef4444', icon: '' },
            { label: 'Sensor Events', value: stats.totalSensorEvents, color: '#38bdf8', icon: '📡' },
            { label: 'Anomaly Rate', value: `${stats.anomalyRate}%`, color: '#f97316', icon: '⚠️' },
          ].map(c => (
            <GlowCard key={c.label} glow={c.color} style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{c.icon} {c.label}</div>
            </GlowCard>
          ))}
        </div>
      )}

      {/* ── Automation Level Legend ────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
        padding: '0.75rem 1rem', borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.75rem', color: '#475569', alignSelf: 'center' }}>Automation Levels:</span>
        {Object.entries(LEVEL_CONFIG).map(([lvl, cfg]) => (
          <span key={lvl} style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
            {cfg.icon} {cfg.label}
          </span>
        ))}
        <span style={{ fontSize: '0.72rem', color: '#475569', alignSelf: 'center', marginLeft: 'auto' }}>
          Groq: <span style={{ color: process.env.REACT_APP_GROQ_ENABLED === 'true' ? '#34d399' : '#64748b' }}>
            Powered by llama-3.1-8b-instant
          </span>
        </span>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'live',     label: '📡 Live Sensors' },
          { id: 'actions',  label: `⚡ AI Actions (${actions.length})` },
          { id: 'approval', label: `🔴 Approvals (${pending.length})`, alert: pending.length > 0 },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '0.5rem 1.1rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            background: activeTab === t.id ? 'rgba(99,102,241,0.2)' : 'transparent',
            border: `1px solid ${activeTab === t.id ? '#6366f188' : 'transparent'}`,
            color: activeTab === t.id ? '#a5b4fc' : '#64748b',
            animation: t.alert && activeTab !== t.id ? 'pulse 2s infinite' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────── */}
      {activeTab === 'live' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {SENSOR_ORDER.map(type => {
              const reading = sensorMap[type];
              return (
                <SensorGauge
                  key={type}
                  type={type}
                  value={reading?.value ?? null}
                  isAnomaly={reading?.isAnomaly}
                />
              );
            })}
          </div>
          {sensors.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📡</div>
              <div>No sensor data yet. Click <strong>"Simulate Sensors"</strong> to generate readings.</div>
            </div>
          )}
          <div style={{ fontSize: '0.72rem', color: '#475569', textAlign: 'right' }}>
            Auto-refresh every 20s · Last: {new Date(lastRefresh).toLocaleTimeString()}
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div>
          {actions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
              No AI actions recorded yet. Run a cycle to start.
            </div>
          ) : (
            <ActivityFeed actions={actions} />
          )}
        </div>
      )}

      {activeTab === 'approval' && (
        <div>
          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              No pending approvals — FarmGuard AI is operating within autonomous limits.
            </div>
          ) : (
            <div>
              <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1rem', fontSize: '0.8rem', color: '#fca5a5' }}>
                🔴 These Level-3 actions require your explicit approval before execution. FarmGuard AI has prepared everything — you decide.
              </div>
              {pending.map(action => (
                <ApprovalCard
                  key={action._id}
                  action={action}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
