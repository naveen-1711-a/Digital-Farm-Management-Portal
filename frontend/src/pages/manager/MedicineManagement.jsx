import React, { useState } from 'react';
import { FaPills, FaSearch, FaFilter, FaPlus, FaExclamationTriangle, FaHistory, FaQrcode, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MedicineManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [medicines, setMedicines] = useState([
    { id: 'M-101', name: 'Amoxicillin', category: 'Antibiotic', stock: 450, unit: 'Vials', expiry: '2027-12-01', status: 'Good' },
    { id: 'M-102', name: 'Ivermectin', category: 'Dewormer', stock: 15, unit: 'Bottles', expiry: '2026-08-15', status: 'Expiring Soon' },
    { id: 'M-103', name: 'Vitamin B Complex', category: 'Supplement', stock: 5, unit: 'Packs', expiry: '2028-01-20', status: 'Low Stock' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentMedId, setCurrentMedId] = useState(null);
  const [addData, setAddData] = useState({ name: '', stock: '' });
  const [useAmount, setUseAmount] = useState('');

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(medicines.filter(m => m.id !== id));
      toast.success('Medicine deleted');
    }
  };

  const handleAddMed = (e) => {
    e.preventDefault();
    if (isEditing) {
      setMedicines(medicines.map(m => m.id === editId ? { ...m, name: addData.name, stock: parseInt(addData.stock) || 0 } : m));
      toast.success('Medicine updated!');
    } else {
      const newMed = { id: `M-${Math.floor(Math.random()*900)+100}`, name: addData.name, category: 'General', stock: parseInt(addData.stock) || 0, unit: 'Units', expiry: '2027-01-01', status: 'Good' };
      setMedicines([...medicines, newMed]);
      toast.success('Medicine added to inventory!');
    }
    setShowAddModal(false);
    setIsEditing(false);
    setEditId(null);
    setAddData({ name: '', stock: '' });
  };

  const openUsage = (id) => {
    setCurrentMedId(id);
    setUseAmount('');
    setShowUseModal(true);
  };

  const handleLogUsage = (e) => {
    e.preventDefault();
    if (useAmount && !isNaN(useAmount)) {
      setMedicines(medicines.map(m => {
        if (m.id === currentMedId) {
          const newStock = Math.max(0, m.stock - parseInt(useAmount));
          const newStatus = newStock < 20 ? 'Low Stock' : m.status;
          return { ...m, stock: newStock, status: newStatus };
        }
        return m;
      }));
      setShowUseModal(false);
      toast.success('Medicine usage logged!');
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaPills style={{ color: '#8b5cf6' }} /> Medicine Management
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Track inventory, usage, and expiry of farm medicines.</p>
        </div>
        <button onClick={() => { setIsEditing(false); setEditId(null); setAddData({ name: '', stock: '' }); setShowAddModal(true); }} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <FaPlus /> Add Medicine
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search medicine name..." 
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <FaFilter /> Filter
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Medicine</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>In Stock</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Expiry Date</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>{item.name} <br/><span style={{fontSize: '0.75rem', color: '#6b7280'}}>{item.id}</span></td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{item.category}</td>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: 'bold' }}>{item.stock} {item.unit}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{item.expiry}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: item.status === 'Good' ? '#dcfce7' : item.status === 'Low Stock' ? '#fef3c7' : '#fee2e2', color: item.status === 'Good' ? '#166534' : item.status === 'Low Stock' ? '#92400e' : '#991b1b', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => openUsage(item.id)} title="Log Usage" style={{ background: '#e0f2fe', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#0284c7', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaExclamationTriangle /></button>
                    <button onClick={() => { setIsEditing(true); setEditId(item.id); setAddData({ name: item.name, stock: item.stock }); setShowAddModal(true); }} title="Edit" style={{ background: '#fef3c7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#d97706', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaEdit /></button>
                    <button onClick={() => handleDelete(item.id)} title="Delete" style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaTrash /></button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px', maxWidth: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{isEditing ? '✏️ Edit Medicine' : '💊 Add Medicine'}</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <form onSubmit={handleAddMed}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Medicine Name *</label>
                  <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={addData.name} onChange={e => setAddData({...addData, name: e.target.value})} placeholder="e.g. Paracetamol" required />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Initial Stock (Units) *</label>
                  <input type="number" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={addData.stock} onChange={e => setAddData({...addData, stock: e.target.value})} placeholder="e.g. 50" required />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{isEditing ? 'Update Medicine' : 'Add to Inventory'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px', maxWidth: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>📝 Log Medicine Usage</h3>
              <button type="button" onClick={() => setShowUseModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <form onSubmit={handleLogUsage}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Amount Used (Units) *</label>
                  <input type="number" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={useAmount} onChange={e => setUseAmount(e.target.value)} placeholder="e.g. 5" required />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowUseModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#4b5563', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Log Usage</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;
