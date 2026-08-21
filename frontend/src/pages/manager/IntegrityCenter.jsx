import React, { useState, useEffect, useCallback } from 'react';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`;

const getToken = () => localStorage.getItem('token');

const SEVERITY_CONFIG = {
  Critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '🚨', pulse: true },
  High:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '⚠️', pulse: false },
  Medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🔍', pulse: false },
  Low:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '📋', pulse: false },
  Normal:   { color: '#10b981', bg: 'rgba(16,185,129,0.10)', icon: '✅', pulse: false },
};

const DOMAIN_ICONS = {
  Medicine: '💊', Feed: '🍚', Attendance: '👷', Animal: '🐔',
  Vaccination: '💉', Biosecurity: '🛡️', Inventory: '📦', Audit: '📝',
};

const formatTimeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function RiskMeter({ score }) {
  const cfg = score >= 85 ? SEVERITY_CONFIG.Critical
    : score >= 70 ? SEVERITY_CONFIG.High
    : score >= 50 ? SEVERITY_CONFIG.Medium
    : score >= 30 ? SEVERITY_CONFIG.Low
    : SEVERITY_CONFIG.Normal;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 80, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
      }}>
        <div style={{
          width: `${score}%`, height: '100%', borderRadius: 4,
          background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cfg.color }}>{score}</span>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Normal;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`,
      animation: cfg.pulse ? 'pulse 2s infinite' : 'none',
    }}>
      {cfg.icon} {severity}
    </span>
  );
}

function EvidenceTimeline({ evidence = [], crossModuleFindings = [] }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Evidence Chain
      </div>
      {evidence.map((e, i) => (
        <div key={i} style={{
          display: 'flex', gap: '0.75rem', marginBottom: '0.5rem',
          padding: '0.6rem 0.8rem', borderRadius: 8,
          background: 'rgba(239,68,68,0.06)', borderLeft: '3px solid #ef444466',
        }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔴</span>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 500 }}>{e.description || e.type}</div>
            {e.points > 0 && <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: 2 }}>+{e.points} risk pts</div>}
          </div>
        </div>
      ))}
      {crossModuleFindings.length > 0 && (
        <>
          <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.8rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cross-Module Analysis
          </div>
          {crossModuleFindings.map((f, i) => {
            const col = f.supports === 'suspicious' ? '#f97316' : f.supports === 'legitimate' ? '#10b981' : '#64748b';
            return (
              <div key={i} style={{
                display: 'flex', gap: '0.75rem', marginBottom: '0.5rem',
                padding: '0.6rem 0.8rem', borderRadius: 8,
                background: `${col}11`, borderLeft: `3px solid ${col}66`,
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                  {f.supports === 'suspicious' ? '🟠' : f.supports === 'legitimate' ? '🟢' : '⚪'}
                </span>
                <div>
                  <div style={{ fontSize: '0.72rem', color: col, fontWeight: 600, marginBottom: 2 }}>{f.module}</div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{f.finding}</div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function IncidentModal({ incident, onClose, onDecision }) {
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!decision) return;
    setSubmitting(true);
    await onDecision(incident._id, decision, reason);
    setSubmitting(false);
    onClose();
  };

  if (!incident) return null;
  const cfg = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.Normal;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
        width: '100%', maxWidth: 680, maxHeight: '88vh', overflowY: 'auto',
        padding: '2rem', position: 'relative',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{DOMAIN_ICONS[incident.domain] || '🔍'}</span>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#f1f5f9' }}>{incident.incidentId}</h2>
              <SeverityBadge severity={incident.severity} />
              {incident.isFrozen && (
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid #6366f144' }}>
                  🔒 FROZEN
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {incident.domain} • {formatTimeAgo(incident.createdAt)}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8',
            width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: '1rem',
          }}>✕</button>
        </div>

        {/* Risk score */}
        <div style={{
          background: `${cfg.color}10`, border: `1px solid ${cfg.color}30`,
          borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>RISK SCORE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: cfg.color }}>{incident.riskScore}<span style={{ fontSize: '1rem', color: '#64748b' }}>/100</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>CONFIDENCE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a5b4fc' }}>{((incident.confidence || 0) * 100).toFixed(0)}%</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>AI RECOMMENDATION</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: cfg.color }}>{incident.recommendedAction?.replace(/_/g, ' ')}</div>
          </div>
        </div>

        {/* Important disclaimer */}
        <div style={{
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem',
          fontSize: '0.78rem', color: '#93c5fd',
        }}>
          ℹ️ <strong>Suspicious activity detected.</strong> This is an AI-generated alert for human review. No action has been taken against any individual. The final determination rests with you.
        </div>

        {/* Evidence timeline */}
        <EvidenceTimeline evidence={incident.evidence} crossModuleFindings={incident.crossModuleFindings} />

        {/* Human decision */}
        {incident.humanDecision === 'pending' && (
          <div style={{ marginTop: '1.5rem', padding: '1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600 }}>YOUR DECISION</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {[
                { val: 'confirmed', label: '✅ Confirm Incident', color: '#ef4444' },
                { val: 'false_positive', label: '❌ False Positive', color: '#10b981' },
                { val: 'needs_more_evidence', label: '🔎 Need More Evidence', color: '#f59e0b' },
                { val: 'assigned', label: '👤 Assign Investigation', color: '#6366f1' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setDecision(opt.val)} style={{
                  padding: '0.6rem 0.75rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                  border: `1.5px solid ${decision === opt.val ? opt.color : 'rgba(255,255,255,0.1)'}`,
                  background: decision === opt.val ? `${opt.color}20` : 'rgba(255,255,255,0.04)',
                  color: decision === opt.val ? opt.color : '#94a3b8',
                  transition: 'all 0.15s',
                }}>{opt.label}</button>
              ))}
            </div>
            <textarea
              placeholder="Optional: Add a reason or notes for this decision..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#e2e8f0', padding: '0.6rem 0.75rem', fontSize: '0.8rem',
                resize: 'vertical', minHeight: 60, boxSizing: 'border-box',
              }}
            />
            <button onClick={handleSubmit} disabled={!decision || submitting} style={{
              marginTop: '0.6rem', width: '100%', padding: '0.75rem',
              background: decision ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700,
              cursor: decision ? 'pointer' : 'not-allowed', fontSize: '0.9rem',
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? '⏳ Submitting...' : 'Submit Decision'}
            </button>
          </div>
        )}

        {/* Already resolved */}
        {incident.humanDecision !== 'pending' && (
          <div style={{
            marginTop: '1.5rem', padding: '1rem', borderRadius: 10,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            fontSize: '0.82rem', color: '#6ee7b7',
          }}>
            ✅ Decision recorded: <strong>{incident.humanDecision?.replace(/_/g, ' ')}</strong>
            {incident.humanReason && <> — {incident.humanReason}</>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function IntegrityCenter() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchIncidents = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filterSeverity) params.append('severity', filterSeverity);
      if (filterDomain) params.append('domain', filterDomain);
      if (filterStatus) params.append('status', filterStatus);

      const r = await fetch(`${API}/integrity/incidents?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await r.json();
      if (data.success) {
        setIncidents(data.data);
        setPagination(data.pagination || {});
      }
    } catch (e) { console.error(e); }
  }, [page, filterSeverity, filterDomain, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/integrity/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await r.json();
      if (data.success) setStats(data.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchIncidents(), fetchStats()]).finally(() => setLoading(false));
  }, [fetchIncidents, fetchStats, lastRefresh]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setLastRefresh(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleDecision = async (id, decision, reason) => {
    try {
      await fetch(`${API}/integrity/incidents/${id}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ decision, reason }),
      });
      setLastRefresh(Date.now());
    } catch (e) { console.error(e); }
  };

  const openDetail = async (incident) => {
    try {
      const r = await fetch(`${API}/integrity/incidents/${incident._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await r.json();
      if (data.success) setSelectedIncident(data.data);
    } catch (e) { setSelectedIncident(incident); }
  };

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      minHeight: '100vh', padding: '1.5rem 2rem', color: '#e2e8f0',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .incident-row { transition: all 0.15s; animation: fadeIn 0.25s ease; }
        .incident-row:hover { background: rgba(255,255,255,0.06) !important; cursor: pointer; transform: translateX(2px); }
        .filter-btn { transition: all 0.15s; }
        .filter-btn:hover { border-color: rgba(99,102,241,0.5) !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🛡️</span>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Farm Integrity Center
          </h1>
          <div style={{
            padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
            background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)',
            animation: 'pulse 3s infinite',
          }}>● LIVE</div>
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
          Autonomous anomaly detection across 8 farm modules · Auto-refreshes every 30s
        </p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Total Incidents" value={stats.totalIncidents} icon="📊" color="#6366f1" />
          <StatCard label="Open Cases" value={stats.openIncidents} icon="🔓" color="#f59e0b" />
          <StatCard label="Critical" value={stats.criticalIncidents} icon="🚨" color="#ef4444" />
          <StatCard label="Confirmed" value={stats.confirmedFraud} sub={`${stats.precision}% precision`} icon="✅" color="#10b981" />
          <StatCard label="False Positives" value={stats.falsePositives} icon="❌" color="#94a3b8" />
          <StatCard label="Events Processed" value={stats.agentStats?.processed || 0} icon="⚡" color="#a78bfa" />
        </div>
      )}

      {/* Domain breakdown */}
      {stats?.domainStats?.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '1.2rem 1.5rem', marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Risk by Domain</div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {stats.domainStats.map(d => {
              const col = d.maxRisk >= 85 ? '#ef4444' : d.maxRisk >= 70 ? '#f97316' : d.maxRisk >= 50 ? '#f59e0b' : '#10b981';
              return (
                <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{DOMAIN_ICONS[d._id] || '📌'}</span>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{d._id}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: col }}>{Math.round(d.maxRisk)}</span>
                  <span style={{ fontSize: '0.72rem', color: '#475569' }}>({d.count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Filter:</span>
        {['', 'Critical', 'High', 'Medium', 'Low'].map(s => (
          <button key={s} className="filter-btn" onClick={() => { setFilterSeverity(s); setPage(1); }} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', cursor: 'pointer',
            background: filterSeverity === s ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${filterSeverity === s ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
            color: filterSeverity === s ? '#a5b4fc' : '#94a3b8',
          }}>{s || 'All Severity'}</button>
        ))}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
        {['', ...Object.keys(DOMAIN_ICONS)].map(d => (
          <button key={d} className="filter-btn" onClick={() => { setFilterDomain(d); setPage(1); }} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', cursor: 'pointer',
            background: filterDomain === d ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${filterDomain === d ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
            color: filterDomain === d ? '#fcd34d' : '#94a3b8',
          }}>{d ? `${DOMAIN_ICONS[d]} ${d}` : 'All Domains'}</button>
        ))}
        <button onClick={() => setLastRefresh(Date.now())} style={{
          marginLeft: 'auto', padding: '4px 14px', borderRadius: 20, fontSize: '0.75rem',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
          color: '#a5b4fc', cursor: 'pointer',
        }}>↻ Refresh</button>
      </div>

      {/* Incident Table */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 90px 100px 120px 80px 90px',
          gap: '0.5rem', padding: '0.75rem 1.2rem',
          background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)',
          fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <span>Incident</span><span>Domain</span><span>Severity</span>
          <span>Risk Score</span><span>Status</span><span>Time</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }}>🔍</div>
            Loading incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
            No incidents found — farm integrity looks good!
          </div>
        ) : (
          incidents.map(inc => {
            const cfg = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.Normal;
            return (
              <div key={inc._id} className="incident-row" onClick={() => openDetail(inc)} style={{
                display: 'grid', gridTemplateColumns: '1fr 90px 100px 120px 80px 90px',
                gap: '0.5rem', padding: '0.9rem 1.2rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: inc.isFrozen ? 'rgba(99,102,241,0.06)' : 'transparent',
                alignItems: 'center',
              }}>
                {/* Incident ID + description */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 2 }}>
                    {inc.isFrozen && <span style={{ fontSize: '0.65rem', color: '#a5b4fc' }}>🔒</span>}
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0' }}>{inc.incidentId}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                    {inc.evidence?.[0]?.description || inc.classification}
                  </div>
                </div>
                {/* Domain */}
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {DOMAIN_ICONS[inc.domain]} {inc.domain}
                </div>
                {/* Severity */}
                <div><SeverityBadge severity={inc.severity} /></div>
                {/* Risk score */}
                <div><RiskMeter score={inc.riskScore} /></div>
                {/* Status */}
                <div style={{ fontSize: '0.72rem', color: inc.humanDecision === 'pending' ? '#f59e0b' : '#10b981' }}>
                  {inc.humanDecision === 'pending' ? '⏳ Review' : '✅ Done'}
                </div>
                {/* Time */}
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>{formatTimeAgo(inc.createdAt)}</div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem',
                background: page === p ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${page === p ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                color: page === p ? '#a5b4fc' : '#64748b',
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}
