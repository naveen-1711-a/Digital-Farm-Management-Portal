import React, { useState } from 'react';
import { FaShieldAlt, FaWalking, FaTruck, FaCheckCircle, FaExclamationTriangle, FaPlus, FaHistory, FaQrcode, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BiosecurityManagement = () => {
  const [activeTab, setActiveTab] = useState('biosecurity');
  const [visitors, setVisitors] = useState([
    { id: 1, type: 'visitor', name: 'Dr. Alice (Vet)', time: '09:15 AM', purpose: 'Routine Checkup' },
    { id: 2, type: 'vehicle', name: 'TRK-9821', time: '10:30 AM', purpose: 'Feed Delivery' }
  ]);

  const [dailyChecks, setDailyChecks] = useState({
    'Shed 1': { footbath: true, sanitization: true, ppe: false },
    'Shed 2': { footbath: true, sanitization: true, ppe: true },
    'Main Gate': { footbath: false, sanitization: true, ppe: true },
    'Feed Store': { footbath: true, sanitization: false, ppe: false }
  });

  const toggleCheck = (area, checkType) => {
    setDailyChecks({
      ...dailyChecks,
      [area]: {
        ...dailyChecks[area],
        [checkType]: !dailyChecks[area][checkType]
      }
    });
  };

  const [showRegModal, setShowRegModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [regData, setRegData] = useState({ type: 'visitor', name: '', purpose: '' });

  const handleAdd = () => {
    if (activeTab === 'biosecurity') {
      toast.success("New biosecurity area added!");
    } else {
      setIsEditing(false);
      setEditId(null);
      setRegData({ type: 'visitor', name: '', purpose: '' });
      setShowRegModal(true);
    }
  };

  const submitRegistration = (e) => {
    e.preventDefault();
    if (isEditing) {
      setVisitors(visitors.map(v => v.id === editId ? { ...v, type: regData.type, name: regData.name, purpose: regData.purpose } : v));
      toast.success(`Entry updated successfully!`);
    } else {
      const newVisitor = { id: Date.now(), type: regData.type, name: regData.name, time: 'Just now', purpose: regData.purpose || 'General' };
      setVisitors([newVisitor, ...visitors]);
      toast.success(`${regData.type} registered successfully!`);
    }
    setShowRegModal(false);
    setIsEditing(false);
    setEditId(null);
  };

  const handleCheckOut = (id) => {
    if (window.confirm("Check out this entry?")) {
      setVisitors(visitors.filter(v => v.id !== id));
      toast.success("Checked out successfully!");
    }
  };

  const updateLog = (area) => toast.success(`Log updated and saved for ${area}`);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaShieldAlt style={{ color: '#8b5cf6' }} /> Biosecurity & Access
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Manage farm sanitation, visitors, and vehicle entries.</p>
        </div>
        <button onClick={handleAdd} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <FaPlus /> {activeTab === 'biosecurity' ? 'Add Record' : 'Register Entry'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <button onClick={() => setActiveTab('biosecurity')} style={{ background: 'none', border: 'none', padding: '0.8rem 1rem', fontSize: '0.95rem', fontWeight: '600', color: activeTab === 'biosecurity' ? '#8b5cf6' : '#6b7280', borderBottom: activeTab === 'biosecurity' ? '3px solid #8b5cf6' : '3px solid transparent', cursor: 'pointer', marginBottom: '-2px' }}>
          Daily Checks
        </button>
        <button onClick={() => setActiveTab('visitors')} style={{ background: 'none', border: 'none', padding: '0.8rem 1rem', fontSize: '0.95rem', fontWeight: '600', color: activeTab === 'visitors' ? '#8b5cf6' : '#6b7280', borderBottom: activeTab === 'visitors' ? '3px solid #8b5cf6' : '3px solid transparent', cursor: 'pointer', marginBottom: '-2px' }}>
          Visitors & Vehicles
        </button>
      </div>

      {activeTab === 'biosecurity' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {['Shed 1', 'Shed 2', 'Main Gate', 'Feed Store'].map((area, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#111827' }}>{area}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleCheck(area, 'footbath')}>
                  <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Footbath Changed</span>
                  {dailyChecks[area].footbath ? <FaCheckCircle style={{ color: '#10b981' }} /> : <FaExclamationTriangle style={{ color: '#f59e0b' }} />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleCheck(area, 'sanitization')}>
                  <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Sanitization</span>
                  {dailyChecks[area].sanitization ? <FaCheckCircle style={{ color: '#10b981' }} /> : <FaExclamationTriangle style={{ color: '#f59e0b' }} />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleCheck(area, 'ppe')}>
                  <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>PPE Compliance</span>
                  {dailyChecks[area].ppe ? <FaCheckCircle style={{ color: '#10b981' }} /> : <FaExclamationTriangle style={{ color: '#f59e0b' }} />}
                </div>
              </div>
              <button onClick={() => updateLog(area)} style={{ width: '100%', marginTop: '1.2rem', padding: '0.6rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Update Log</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'visitors' && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Name / Reg No</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Time In</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Purpose</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', color: v.type === 'visitor' ? '#3b82f6' : '#f59e0b', fontSize: '1.2rem' }}>
                    {v.type === 'visitor' ? <FaWalking title="Visitor" /> : <FaTruck title="Vehicle" />}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>{v.name}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{v.time}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{v.purpose}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => { setIsEditing(true); setEditId(v.id); setRegData({ type: v.type, name: v.name, purpose: v.purpose }); setShowRegModal(true); }} title="Edit" style={{ background: '#fef3c7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#d97706', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaEdit /></button>
                    <button onClick={() => handleCheckOut(v.id)} title="Check Out" style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaTrash /></button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRegModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px', maxWidth: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{isEditing ? '✏️ Edit Entry' : '🛂 Register Gate Entry'}</h3>
              <button type="button" onClick={() => setShowRegModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <form onSubmit={submitRegistration}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Type *</label>
                  <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={regData.type} onChange={e => setRegData({...regData, type: e.target.value})}>
                    <option value="visitor">Visitor</option>
                    <option value="vehicle">Vehicle</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Name / Reg No *</label>
                  <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} placeholder="e.g. John Smith or XY-1234" required />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Purpose *</label>
                  <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={regData.purpose} onChange={e => setRegData({...regData, purpose: e.target.value})} placeholder="e.g. Vet Visit" required />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowRegModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{isEditing ? 'Update Entry' : 'Register Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiosecurityManagement;
