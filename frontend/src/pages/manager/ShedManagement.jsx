import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, FaThermometerHalf, FaTint, FaBroom, FaTools, FaHistory, 
  FaQrcode, FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaChartPie,
  FaShieldAlt, FaSprayCan, FaClipboardList, FaBell, FaSearch, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const ShedManagement = () => {
  const [activeTab, setActiveTab] = useState('sheds');
  const [sheds, setSheds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', number: '', type: 'Open', animalType: 'Poultry', capacity: '', currentAnimals: '0', 
    length: '', width: '', area: '', constructionDate: '', managerInCharge: '', 
    waterConnection: 'Mains', electricityConnection: 'Grid', ventilationType: 'Natural', 
    status: 'Active', remarks: '', nextCleaningDate: '', nextSanitizationDate: ''
  });

  const fetchSheds = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sheds');
      setSheds(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sheds');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheds();
  }, []);

  const handleSaveShed = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/sheds/${editId}`, formData);
        toast.success("Shed updated successfully!");
      } else {
        await axios.post('http://localhost:5000/api/sheds', formData);
        toast.success("New shed added successfully!");
      }
      fetchSheds();
      setShowModal(false);
      setIsEditing(false);
      setEditId(null);
    } catch (err) {
      toast.error('Error saving shed');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shed?")) {
      try {
        await axios.delete(`http://localhost:5000/api/sheds/${id}`);
        toast.error('Shed deleted');
        fetchSheds();
      } catch (err) {
        toast.error('Error deleting shed');
      }
    }
  };

  const handleLogCleaning = async (shed) => {
    try {
      const today = new Date().toISOString();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      await axios.put(`http://localhost:5000/api/sheds/${shed._id}`, { 
        lastCleanedDate: today,
        nextCleaningDate: nextWeek.toISOString()
      });
      toast.success(`Cleaning logged for ${shed.name}`);
      fetchSheds();
    } catch (err) {
      toast.error('Error logging cleaning');
    }
  };

  const openEditModal = (shed) => {
    setFormData({
      ...shed,
      constructionDate: shed.constructionDate ? shed.constructionDate.split('T')[0] : '',
      nextCleaningDate: shed.nextCleaningDate ? shed.nextCleaningDate.split('T')[0] : '',
      nextSanitizationDate: shed.nextSanitizationDate ? shed.nextSanitizationDate.split('T')[0] : ''
    });
    setEditId(shed._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const filteredSheds = sheds.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.number.toLowerCase().includes(searchTerm.toLowerCase()));

  // Automations & Helpers
  const getOccupancy = (current, cap) => cap > 0 ? ((current / cap) * 100).toFixed(1) : 0;
  
  const renderShedsTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" placeholder="Search by name or number..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ name: '', number: '', type: 'Open', animalType: 'Poultry', capacity: '', currentAnimals: '0', length: '', width: '', area: '', constructionDate: '', managerInCharge: '', waterConnection: 'Mains', electricityConnection: 'Grid', ventilationType: 'Natural', status: 'Active', remarks: '', nextCleaningDate: '', nextSanitizationDate: '' }); setShowModal(true); }} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <FaPlus /> Add New Shed
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredSheds.map(shed => {
          const occ = getOccupancy(shed.currentAnimals, shed.capacity);
          const isOverCap = occ > 100;
          const isFull = occ == 100;

          return (
            <div key={shed._id} style={{ background: 'white', borderRadius: '16px', border: isOverCap ? '2px solid #ef4444' : '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', position: 'relative' }}>
              {isOverCap && <div style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.3rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}><FaExclamationTriangle /> OVER CAPACITY ALERT</div>}
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBuilding color="#4f46e5" /> {shed.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>#{shed.number} • {shed.animalType} ({shed.type})</span>
                  </div>
                  <span style={{ background: shed.status === 'Active' ? '#dcfce7' : '#f3f4f6', color: shed.status === 'Active' ? '#166534' : '#4b5563', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>{shed.status}</span>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px dashed #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Occupancy ({occ}%)</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isOverCap ? '#ef4444' : (isFull ? '#f59e0b' : '#10b981') }}>{shed.currentAnimals} / {shed.capacity}</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(occ, 100)}%`, background: isOverCap ? '#ef4444' : (occ > 85 ? '#f59e0b' : '#10b981') }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>🟢 {Math.max(shed.capacity - shed.currentAnimals, 0)} Space Avail.</span>
                    <span>Manager: {shed.managerInCharge || 'Unassigned'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1, background: '#fef3c7', borderRadius: '8px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#92400e', fontWeight: '600' }}><FaThermometerHalf/> {shed.temperature || '--'}°C</div>
                  <div style={{ flex: 1, background: '#e0f2fe', borderRadius: '8px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#0369a1', fontWeight: '600' }}><FaTint/> {shed.waterConnection}</div>
                  <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#374151', fontWeight: '600' }}>{shed.area || '--'} sq.ft</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <button onClick={() => openEditModal(shed)} style={{ flex: 1, padding: '0.5rem', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}><FaEdit /> Edit</button>
                  <button onClick={() => handleDelete(shed._id)} style={{ flex: 1, padding: '0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}><FaTrash /> Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCleaningTab = () => (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBroom color="#8b5cf6" /> Cleaning & Sanitization Management</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem' }}>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Shed</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Last Cleaned</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Next Cleaning Due</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSheds.map(shed => {
            const isDue = shed.nextCleaningDate && new Date(shed.nextCleaningDate) <= new Date();
            return (
              <tr key={shed._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: '700', color: '#0f172a' }}>{shed.name}</td>
                <td style={{ padding: '1rem', color: '#475569' }}>{shed.lastCleanedDate ? new Date(shed.lastCleanedDate).toLocaleDateString() : 'Never'}</td>
                <td style={{ padding: '1rem', color: isDue ? '#ef4444' : '#475569', fontWeight: isDue ? '700' : '400' }}>
                  {shed.nextCleaningDate ? new Date(shed.nextCleaningDate).toLocaleDateString() : 'Not Scheduled'}
                  {isDue && <span style={{ marginLeft: '0.5rem', background: '#fee2e2', color: '#ef4444', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>DUE</span>}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: isDue ? '#fef3c7' : '#dcfce7', color: isDue ? '#d97706' : '#16a34a', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600' }}>
                    {isDue ? 'Cleaning Required' : 'Clean'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleLogCleaning(shed)} style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Log Cleaning</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '2rem' }}>
      
      {/* Premium Header */}
      <div style={{ background: 'linear-gradient(135deg, #8383d2ff, #bbbbc7ff)', padding: '2.5rem', borderRadius: '24px', marginBottom: '2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(49,46,129,0.2)' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.5px' }}>
            <FaBuilding style={{ color: '#e8e9f4ff' }} /> Shed & Infrastructure
          </h1>
          <p style={{ margin: 0, color: '#c7d2fe', fontSize: '1.05rem', maxWidth: '600px' }}>Comprehensive tracking of capacities, occupancies, biosecurity cleaning schedules, and infrastructure maintenance.</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#a5b4fc', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Total Capacity</div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{sheds.reduce((sum, s) => sum + s.currentAnimals, 0)} / {sheds.reduce((sum, s) => sum + s.capacity, 0)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', overflowX: 'auto' }}>
        {[
          { id: 'sheds', label: 'Sheds & Occupancy', icon: <FaBuilding /> },
          { id: 'cleaning', label: 'Cleaning & Sanitization', icon: <FaSprayCan /> },
          { id: 'maintenance', label: 'Maintenance & Repairs', icon: <FaTools /> },
          { id: 'reports', label: 'Reports & Alerts', icon: <FaChartPie /> }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ 
              background: activeTab === tab.id ? '#4f46e5' : '#f8fafc', color: activeTab === tab.id ? 'white' : '#475569', 
              border: activeTab === tab.id ? 'none' : '1px solid #cbd5e1', padding: '0.75rem 1.5rem', 
              borderRadius: '999px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(79,70,229,0.3)' : 'none'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading data...</div> : (
        <>
          {activeTab === 'sheds' && renderShedsTab()}
          {activeTab === 'cleaning' && renderCleaningTab()}
          {activeTab === 'maintenance' && (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <FaTools size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
              <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Maintenance Module</h2>
              <p style={{ color: '#64748b' }}>Automated maintenance scheduling and repair logging is currently under development.</p>
            </div>
          )}
          {activeTab === 'reports' && (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <FaChartPie size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
              <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Occupancy & Biosecurity Reports</h2>
              <p style={{ color: '#64748b' }}>Advanced visual reports will appear here based on shed telemetry and logs.</p>
            </div>
          )}
        </>
      )}

      {/* Massive Shed Registration Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', width: '900px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#111827', fontSize: '1.5rem' }}>
                <FaBuilding color="#4f46e5" /> {isEditing ? 'Edit Shed Details' : 'Shed Registration Form'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.75rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveShed} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              {/* Basic Info */}
              <div style={{ gridColumn: 'span 3', fontSize: '0.9rem', fontWeight: '700', color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>Basic Details</div>
              
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Shed Name *</label><input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} placeholder="e.g. Main Broiler Shed" /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Shed Number *</label><input required type="text" value={formData.number} onChange={e=>setFormData({...formData, number: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} placeholder="e.g. S-01" /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Shed Type</label><select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}}><option>Open</option><option>Closed</option><option>Environment Controlled</option></select></div>
              
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Animal Type *</label><input required type="text" value={formData.animalType} onChange={e=>setFormData({...formData, animalType: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} placeholder="e.g. Poultry / Swine" /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Total Capacity *</label><input required type="number" value={formData.capacity} onChange={e=>setFormData({...formData, capacity: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} placeholder="Max animals" /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Current Animals</label><input type="number" value={formData.currentAnimals} onChange={e=>setFormData({...formData, currentAnimals: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>

              {/* Dimensions */}
              <div style={{ gridColumn: 'span 3', fontSize: '0.9rem', fontWeight: '700', color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginTop: '1rem' }}>Dimensions & Setup</div>
              
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Length (ft/m)</label><input type="number" value={formData.length} onChange={e=>setFormData({...formData, length: e.target.value, area: (e.target.value * formData.width) || ''})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Width (ft/m)</label><input type="number" value={formData.width} onChange={e=>setFormData({...formData, width: e.target.value, area: (formData.length * e.target.value) || ''})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Total Area</label><input type="number" readOnly value={formData.area} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1', background:'#f1f5f9'}} placeholder="Auto-calculated" /></div>

              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Construction Date</label><input type="date" value={formData.constructionDate} onChange={e=>setFormData({...formData, constructionDate: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Manager In Charge</label><input type="text" value={formData.managerInCharge} onChange={e=>setFormData({...formData, managerInCharge: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Status</label><select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}}><option>Active</option><option>Maintenance</option><option>Decommissioned</option></select></div>

              {/* Infrastructure */}
              <div style={{ gridColumn: 'span 3', fontSize: '0.9rem', fontWeight: '700', color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginTop: '1rem' }}>Infrastructure Connections</div>

              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Water Connection</label><select value={formData.waterConnection} onChange={e=>setFormData({...formData, waterConnection: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}}><option>Mains</option><option>Borewell</option><option>Tank</option><option>None</option></select></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Electricity</label><select value={formData.electricityConnection} onChange={e=>setFormData({...formData, electricityConnection: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}}><option>Grid</option><option>Solar</option><option>Generator</option><option>None</option></select></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Ventilation</label><select value={formData.ventilationType} onChange={e=>setFormData({...formData, ventilationType: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}}><option>Natural</option><option>Exhaust Fans</option><option>Tunnel</option></select></div>

              {/* Scheduling */}
              <div style={{ gridColumn: 'span 3', fontSize: '0.9rem', fontWeight: '700', color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginTop: '1rem' }}>Schedules & Remarks</div>
              
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Next Cleaning Date</label><input type="date" value={formData.nextCleaningDate} onChange={e=>setFormData({...formData, nextCleaningDate: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Next Sanitization Date</label><input type="date" value={formData.nextSanitizationDate} onChange={e=>setFormData({...formData, nextSanitizationDate: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.8rem', fontWeight:'600', marginBottom:'0.3rem', color:'#475569'}}>Remarks</label><input type="text" value={formData.remarks} onChange={e=>setFormData({...formData, remarks: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>

              <div style={{ gridColumn: 'span 3', marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '0.8rem 1.5rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#4f46e5', color: 'white', padding: '0.8rem 2rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>{isEditing ? 'Update Shed' : 'Register Shed'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShedManagement;
