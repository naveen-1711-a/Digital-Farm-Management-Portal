import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaUserTie, FaPhone, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AllFarmManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farm-dashboard/managers');
      if (res.data.success) {
        setManagers(res.data.managers);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const filteredManagers = managers.filter(manager => 
    manager.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    manager.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>
            <FaUserTie size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>All Farm Managers</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '1rem' }}>View and manage all your farm managers.</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Table Controls */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <FaSearch style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <button style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaFilter /> Filter
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Manager</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Contact</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Shift & Sheds</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading managers...</td></tr>
              ) : filteredManagers.map((manager, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold' }}>
                        {manager.ownerName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{manager.ownerName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{manager.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <FaEnvelope color="#94a3b8" /> {manager.ownerEmail}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaPhone color="#94a3b8" /> {manager.ownerPhone}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{manager.shift || 'General'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{(manager.assignedSheds || []).join(', ') || 'None'}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '600',
                      backgroundColor: manager.status === 'approved' ? '#dcfce7' : '#f1f5f9',
                      color: manager.status === 'approved' ? '#166534' : '#64748b'
                    }}>
                      {manager.status === 'approved' ? 'Active' : manager.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#3b82f6', cursor: 'pointer' }} title="View Details">
                        <FaEye />
                      </button>
                      <button style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#f59e0b', cursor: 'pointer' }} title="Edit">
                        <FaEdit />
                      </button>
                      <button style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#ef4444', cursor: 'pointer' }} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!loading && filteredManagers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No managers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllFarmManagers;
