import React, { useState } from 'react';
import {
  FaUserShield, FaEnvelope, FaPhone, FaCalendarAlt, FaEdit,
  FaKey, FaSignOutAlt, FaCheckCircle, FaBuilding, FaUsers,
  FaPaw, FaShieldAlt, FaCog, FaBell, FaSave, FaTimes, FaCamera
} from 'react-icons/fa';

const AdminProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [editMode, setEditMode] = useState(false);
  const [pwdMode, setPwdMode] = useState(false);
  const [profile, setProfile] = useState({
    name: user.ownerName || 'System Admin',
    email: user.ownerEmail || 'mohamukemuranava@gmail.com',
    phone: '+91 98765 43210',
    role: 'Overall Admin',
    joinedDate: 'July 2026',
    location: 'Tamil Nadu, India',
    bio: 'Overall administrator of the Digital Farm Management Portal. Responsible for overseeing all farm registrations, approvals, and platform operations.',
  });
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const statsCards = [
    { icon: <FaBuilding />, label: 'Total Farms', value: '1,248', color: '#4f46e5', bg: '#e0e7ff' },
    { icon: <FaUsers />, label: 'Total Users', value: '3,850', color: '#059669', bg: '#d1fae5' },
    { icon: <FaPaw />, label: 'Total Animals', value: '16.5K', color: '#0284c7', bg: '#e0f2fe' },
    { icon: <FaCheckCircle />, label: 'Approvals', value: '1,102', color: '#d97706', bg: '#fef3c7' },
  ];

  const activities = [
    { action: 'Approved farm registration', target: 'Green Valley Farm', time: '2 hours ago', icon: <FaCheckCircle />, color: '#10b981', bg: '#d1fae5' },
    { action: 'Updated system settings', target: 'Notification Config', time: '1 day ago', icon: <FaCog />, color: '#4f46e5', bg: '#e0e7ff' },
    { action: 'Reviewed pending farm', target: 'Sunrise Pigs', time: '2 days ago', icon: <FaBuilding />, color: '#d97706', bg: '#fef3c7' },
    { action: 'Sent system notification', target: 'All Farm Admins', time: '3 days ago', icon: <FaBell />, color: '#0284c7', bg: '#e0f2fe' },
    { action: 'Login from new device', target: 'Chrome / Windows', time: '4 days ago', icon: <FaShieldAlt />, color: '#9333ea', bg: '#f3e8ff' },
  ];

  const inputStyle = {
    width: '100%', padding: '0.65rem 1rem', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '0.875rem', color: '#0f172a',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    background: '#f9fafb', transition: 'border-color 0.2s'
  };

  const labelStyle = { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

      {/* Saved Toast */}
      {saved && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#064e3b', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '600', fontSize: '0.875rem', zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <FaCheckCircle /> Profile saved successfully!
        </div>
      )}

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #065f46 100%)', borderRadius: '20px', padding: '2.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(16,185,129,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-30px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#fff', fontWeight: '800', border: '4px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <button style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', border: '2px solid #0f172a', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
              <FaCamera />
            </button>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em' }}>{profile.name}</h1>
              <span style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399', fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.65rem', borderRadius: '999px', border: '1px solid rgba(52,211,153,0.3)' }}>● ONLINE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FaUserShield style={{ color: '#34d399' }} />
              <span style={{ color: '#34d399', fontWeight: '600', fontSize: '0.875rem' }}>Overall Admin — Super Administrator</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaEnvelope style={{ color: '#34d399' }} />{profile.email}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaCalendarAlt style={{ color: '#34d399' }} />Joined {profile.joinedDate}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaShieldAlt style={{ color: '#34d399' }} />{profile.location}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button onClick={() => { setEditMode(!editMode); setPwdMode(false); }} style={{ background: editMode ? '#ef4444' : 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
              {editMode ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
            </button>
            <button onClick={() => { setPwdMode(!pwdMode); setEditMode(false); }} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaKey /> Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {statsCards.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: `1px solid #e5e7eb`, borderLeft: `5px solid ${s.color}`, borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{s.icon}</div>
            <div><div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', fontWeight: '500' }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Profile Info / Edit */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '1.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Profile Information</h3>
            {editMode && <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '600', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>✎ Editing</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { label: 'Full Name', key: 'name', icon: '👤' },
              { label: 'Email Address', key: 'email', icon: '✉️' },
              { label: 'Phone Number', key: 'phone', icon: '📞' },
              { label: 'Location', key: 'location', icon: '📍' },
            ].map(({ label, key, icon }) => (
              <div key={key}>
                <label style={labelStyle}>{icon} {label}</label>
                {editMode ? (
                  <input
                    style={inputStyle}
                    value={profile[key]}
                    onChange={e => setProfile({ ...profile, [key]: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                ) : (
                  <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>{profile[key]}</div>
                )}
              </div>
            ))}

            <div>
              <label style={labelStyle}>📝 Bio</label>
              {editMode ? (
                <textarea
                  style={{ ...inputStyle, height: '80px', resize: 'none' }}
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6' }}>{profile.bio}</div>
              )}
            </div>

            {editMode && (
              <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(5,150,105,0.3)', transition: 'all 0.2s' }}>
                <FaSave /> Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Change Password / Account Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Change Password */}
          {pwdMode ? (
            <div style={{ background: '#fff', borderRadius: '18px', padding: '1.75rem', border: '1.5px solid #fde68a', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaKey style={{ color: '#d97706' }} /> Change Password</h3>
              {[
                { label: 'Current Password', key: 'current' },
                { label: 'New Password', key: 'newPwd' },
                { label: 'Confirm New Password', key: 'confirm' },
              ].map(({ label, key }) => (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type="password"
                    style={inputStyle}
                    placeholder="••••••••••"
                    value={pwdForm[key]}
                    onChange={e => setPwdForm({ ...pwdForm, [key]: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ flex: 1, background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#fff', border: 'none', padding: '0.7rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}>Update Password</button>
                <button onClick={() => setPwdMode(false)} style={{ background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', padding: '0.7rem 1rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '18px', padding: '1.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Account Details</h3>
              {[
                { label: 'Account Type', val: 'Super Administrator', icon: <FaUserShield style={{ color: '#4f46e5' }} /> },
                { label: 'Account Status', val: 'Active & Verified', icon: <FaCheckCircle style={{ color: '#10b981' }} /> },
                { label: 'Last Login', val: 'Today, ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), icon: <FaCalendarAlt style={{ color: '#0284c7' }} /> },
                { label: 'Access Level', val: 'Full Platform Access', icon: <FaShieldAlt style={{ color: '#9333ea' }} /> },
                { label: 'Security', val: '2FA Not Enabled', icon: <FaKey style={{ color: '#d97706' }} /> },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{row.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</div>
                    <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: '600', marginTop: '0.1rem' }}>{row.val}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Danger Zone */}
          <div style={{ background: '#fff', borderRadius: '18px', padding: '1.5rem', border: '1.5px solid #fee2e2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: '700', color: '#dc2626' }}>⚠️ Danger Zone</h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b' }}>These actions are irreversible. Please proceed with caution.</p>
            <button onClick={() => { localStorage.clear(); window.location.hash = 'home'; }} style={{ background: '#fff', color: '#dc2626', border: '1.5px solid #fca5a5', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
              <FaSignOutAlt /> Logout from All Devices
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '1.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Recent Account Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {activities.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', borderBottom: i < activities.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>{a.action}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>{a.target}</div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500', whiteSpace: 'nowrap' }}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
