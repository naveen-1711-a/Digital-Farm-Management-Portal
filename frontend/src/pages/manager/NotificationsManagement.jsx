import React, { useState } from 'react';
import { FaBell, FaPaperPlane, FaExclamationCircle, FaHistory, FaQrcode, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NotificationsManagement = () => {
  const alerts = [
    { title: 'Vaccination Due', msg: 'FMD Vaccine due for Shed 1 Cattle.', type: 'warning', time: '1 hr ago' },
    { title: 'Low Feed', msg: 'Grower Mash stock below 1 Ton.', type: 'danger', time: '3 hrs ago' },
    { title: 'Task Completed', msg: 'Jane Smith completed Shed 2 cleaning.', type: 'info', time: '4 hrs ago' },
  ];

  const [showModal, setShowModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const handleSendAlert = (e) => {
    e.preventDefault();
    setShowModal(false);
    setAlertMsg('');
    toast.success("Alert broadcasted successfully!");
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaBell style={{ color: '#f59e0b' }} /> Notifications & Alerts
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>System alerts and manual messaging.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <FaPaperPlane /> Send Alert to Workers
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'white', padding: '1.25rem', borderRadius: '12px', borderLeft: `4px solid ${a.type === 'danger' ? '#ef4444' : a.type === 'warning' ? '#f59e0b' : '#3b82f6'}`, borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <FaExclamationCircle style={{ fontSize: '1.5rem', color: a.type === 'danger' ? '#ef4444' : a.type === 'warning' ? '#f59e0b' : '#3b82f6', marginTop: '0.2rem' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.2rem 0', color: '#111827', fontSize: '1.05rem' }}>{a.title}</h4>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem' }}>{a.msg}</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>{a.time}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px', maxWidth: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>📢 Send Broadcast Alert</h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSendAlert}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Alert Message *</label>
                  <textarea style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '80px' }} value={alertMsg} onChange={e => setAlertMsg(e.target.value)} placeholder="Type alert to broadcast to all workers..." required />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;
