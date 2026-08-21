import React, { useState, useEffect } from 'react';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`;
const getToken = () => localStorage.getItem('token');

const RISK_LEVEL = (score) => {
  if (score >= 85) return { label: 'Critical', color: '#ef4444', emoji: '🔴', bg: 'rgba(239,68,68,0.1)' };
  if (score >= 70) return { label: 'High',     color: '#f97316', emoji: '🟠', bg: 'rgba(249,115,22,0.1)' };
  if (score >= 50) return { label: 'Medium',   color: '#f59e0b', emoji: '🟡', bg: 'rgba(245,158,11,0.1)' };
  if (score >= 30) return { label: 'Low',      color: '#3b82f6', emoji: '🔵', bg: 'rgba(59,130,246,0.1)' };
  return             { label: 'Safe',     color: '#10b981', emoji: '🟢', bg: 'rgba(16,185,129,0.1)' };
};

const DOMAIN_ICONS = {
  Medicine: '💊', Feed: '🍚', Attendance: '👷', Animal: '🐔',
  Vaccination: '💉', Biosecurity: '🛡️', Inventory: '📦', Audit: '📝',
};

function RiskGauge({ score }) {
  const lvl = RISK_LEVEL(score);
  const angle = (score / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="100" height="60" viewBox="0 0 100 60">
        {/* Track */}
        <path d="M 10 55 A 40 40 0 0 1 90 55" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" strokeLinecap="round"/>
        {/* Score arc */}
        <path
          d="M 10 55 A 40 40 0 0 1 90 55"
          stroke={lvl.color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 125.6} 125.6`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        {/* Needle */}
        <line
          x1="50" y1="55"
          x2={50 + 32 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={55 + 32 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke={lvl.color} strokeWidth="2.5" strokeLinecap="round"
        />
        <circle cx="50" cy="55" r="4" fill={lvl.color} />
      </svg>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: lvl.color, marginTop: -4 }}>{score}</div>
      <div style={{ fontSize: '0.72rem', color: lvl.color, fontWeight: 600 }}>{lvl.label}</div>
    </div>
  );
}

function FarmCard({ farm, onViewDetails }) {
  const lvl = RISK_LEVEL(Math.round(farm.maxRisk || 0));
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${lvl.color}33`,
      borderRadius: 16, padding: '1.5rem', cursor: 'pointer',
      transition: 'all 0.2s', backdropFilter: 'blur(10px)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${lvl.color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      onClick={() => onViewDetails && onViewDetails(farm._id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2 }}>Farm ID</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', fontFamily: 'monospace' }}>
            {String(farm._id).slice(-8).toUpperCase()}
          </div>
        </div>
        <div style={{ padding: '4px 12px', borderRadius: 20, background: lvl.bg, color: lvl.color, fontSize: '0.78rem', fontWeight: 700 }}>
          {lvl.emoji} {lvl.label}
        </div>
      </div>

      <RiskGauge score={Math.round(farm.maxRisk || 0)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Open Cases</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{farm.openCases}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Critical</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>{farm.criticalCases}</div>
        </div>
      </div>
    </div>
  );
}

export default function IntegrityOverview() {
  const [stats, setStats] = useState(null);
  const [multiFarm, setMultiFarm] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };

    Promise.all([
      fetch(`${API}/integrity/stats`, { headers }).then(r => r.json()),
      fetch(`${API}/integrity/multi-farm`, { headers }).then(r => r.json()),
      fetch(`${API}/integrity/incidents?limit=5&status=open`, { headers }).then(r => r.json()),
    ]).then(([s, mf, inc]) => {
      if (s.success) setStats(s.data);
      if (mf.success) setMultiFarm(mf.data);
      if (inc.success) setIncidents(inc.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", padding: '1.5rem 2rem', color: '#e2e8f0', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem', animation: 'slideUp 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '2rem' }}>🛡️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b, #ef4444, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Farm Integrity Overview
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
              AI-powered integrity monitoring across all farms
            </p>
          </div>
          <div style={{
            marginLeft: 'auto', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
            background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)',
            animation: 'pulse 3s infinite',
          }}>● AGENT ACTIVE</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#475569' }}>
          <div style={{ fontSize: '2.5rem', animation: 'pulse 1.5s infinite' }}>🔍</div>
          <div style={{ marginTop: '0.5rem' }}>Loading integrity data...</div>
        </div>
      ) : (
        <>
          {/* Global stats */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Incidents', value: stats.totalIncidents, color: '#6366f1', icon: '📊' },
                { label: 'Open Cases', value: stats.openIncidents, color: '#f59e0b', icon: '🔓' },
                { label: 'Critical Alerts', value: stats.criticalIncidents, color: '#ef4444', icon: '🚨' },
                { label: 'Confirmed', value: stats.confirmedFraud, color: '#10b981', icon: '✅' },
                { label: 'Agent Precision', value: `${stats.precision}%`, color: '#a78bfa', icon: '🎯' },
                { label: 'Memory Records', value: stats.memoryStats?.total || 0, color: '#38bdf8', icon: '🧠' },
              ].map(card => (
                <div key={card.label} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '1.1rem', animation: 'slideUp 0.4s ease',
                }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{card.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{card.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Multi-Farm Grid */}
          {multiFarm.length > 0 ? (
            <>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏭 Farm Risk Heatmap
                <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#475569' }}>({multiFarm.length} farms monitored)</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                {multiFarm.map(farm => (
                  <FarmCard key={farm._id} farm={farm} />
                ))}
              </div>
            </>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '2rem', color: '#475569',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
              No active integrity issues across farms.
            </div>
          )}

          {/* Domain breakdown */}
          {stats?.domainStats?.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '1.5rem', marginBottom: '2rem',
            }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                📊 Incidents by Domain
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.domainStats.sort((a, b) => b.avgRisk - a.avgRisk).map(d => {
                  const col = d.avgRisk >= 70 ? '#ef4444' : d.avgRisk >= 50 ? '#f59e0b' : '#10b981';
                  const pct = Math.min(100, d.avgRisk);
                  return (
                    <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 90, fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                        <span>{DOMAIN_ICONS[d._id]}</span><span>{d._id}</span>
                      </div>
                      <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${col}88, ${col})`, borderRadius: 4, transition: 'width 0.8s ease' }} />
                      </div>
                      <div style={{ width: 40, fontSize: '0.8rem', fontWeight: 700, color: col, flexShrink: 0 }}>{Math.round(d.avgRisk)}</div>
                      <div style={{ width: 35, fontSize: '0.72rem', color: '#475569', flexShrink: 0 }}>({d.count})</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent open incidents */}
          {incidents.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '1.5rem',
            }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🔓 Recent Open Incidents
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {incidents.map(inc => {
                  const lvl = RISK_LEVEL(inc.riskScore);
                  return (
                    <div key={inc._id} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.7rem 0.9rem',
                      background: 'rgba(255,255,255,0.04)', borderRadius: 10,
                      borderLeft: `3px solid ${lvl.color}`,
                    }}>
                      <span style={{ fontSize: '1rem' }}>{DOMAIN_ICONS[inc.domain]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{inc.incidentId}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{inc.domain} · {inc.evidence?.[0]?.description?.slice(0, 60) || 'Anomaly detected'}</div>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: lvl.color }}>{inc.riskScore}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
