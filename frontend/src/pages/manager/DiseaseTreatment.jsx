import React, { useState } from 'react';
import { FaNotesMedical, FaSearch, FaFilter, FaPlus, FaCheckDouble, FaStethoscope, FaHistory, FaQrcode, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DiseaseTreatment = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [records, setRecords] = useState([
    { id: 'D-001', animalId: 'A-1002', disease: 'Mastitis', dateReported: '2026-07-22', status: 'Under Treatment', vet: 'Dr. Smith', isolation: true },
    { id: 'D-002', animalId: 'P-2010', disease: 'Swine Flu', dateReported: '2026-07-18', status: 'Recovered', vet: 'Dr. Adams', isolation: false },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ animalId: '', disease: '' });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
      toast.success('Record deleted');
    }
  };

  const handleReport = (e) => {
    e.preventDefault();
    if (isEditing) {
      setRecords(records.map(r => r.id === editId ? { ...r, animalId: formData.animalId, disease: formData.disease } : r));
      toast.success('Treatment record updated!');
    } else {
      const newRecord = { id: `D-00${records.length + 1}`, animalId: formData.animalId, disease: formData.disease, dateReported: new Date().toISOString().split('T')[0], status: 'Under Treatment', vet: 'Unassigned', isolation: true };
      setRecords([newRecord, ...records]);
      toast.success('Sick animal reported & isolated!');
    }
    setShowModal(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({ animalId: '', disease: '' });
  };

  const handleUpdate = (id) => {
    toast.success(`Treatment updated for record ${id}`);
  };

  const markRecovered = (id) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'Recovered', isolation: false } : r));
    toast.success('Animal marked as recovered!');
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaNotesMedical style={{ color: '#ef4444' }} /> Disease & Treatment
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Report sickness, assign treatments, and track recovery.</p>
        </div>
        <button onClick={() => { setIsEditing(false); setEditId(null); setFormData({ animalId: '', disease: '' }); setShowModal(true); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <FaPlus /> Report Sick Animal
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search disease, animal tag..." 
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
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Animal Tag</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Disease</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Date Reported</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Assigned Vet</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Status & Location</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>{item.animalId}</td>
                  <td style={{ padding: '1rem', color: '#374151', fontWeight: '500' }}>{item.disease}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{item.dateReported}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{item.vet}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                      <span style={{ background: item.status === 'Recovered' ? '#dcfce7' : '#fef3c7', color: item.status === 'Recovered' ? '#166534' : '#92400e', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600' }}>
                        {item.status}
                      </span>
                      {item.isolation && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600' }}>Isolated</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {item.status !== 'Recovered' && (
                      <button onClick={() => markRecovered(item.id)} title="Mark Recovered" style={{ background: '#dcfce7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#166534', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaCheckDouble /></button>
                    )}
                    <button onClick={() => { setIsEditing(true); setEditId(item.id); setFormData({ animalId: item.animalId, disease: item.disease }); setShowModal(true); }} title="Edit" style={{ background: '#fef3c7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#d97706', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaEdit /></button>
                    <button onClick={() => handleDelete(item.id)} title="Delete" style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaTrash /></button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px', maxWidth: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{isEditing ? '✏️ Edit Treatment' : '🤒 Report Sick Animal'}</h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <form onSubmit={handleReport}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Animal ID *</label>
                  <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.animalId} onChange={e => setFormData({...formData, animalId: e.target.value})} placeholder="e.g. A-1002" required />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Suspected Disease *</label>
                  <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.disease} onChange={e => setFormData({...formData, disease: e.target.value})} placeholder="e.g. Swine Flu, Foot Rot" required />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{isEditing ? 'Update Treatment' : 'Report Animal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseTreatment;
