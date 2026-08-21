import React, { useState } from 'react';
import { FaPaw, FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaQrcode, FaHistory, FaCamera, FaWeight, FaSyringe, FaStethoscope, FaEgg, FaExchangeAlt, FaTimes, FaEye, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AnimalManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [animals, setAnimals] = useState([
    { id: 'A-1001', name: 'Bessie', species: 'Cattle', breed: 'Holstein', weight: '650', age: '36 Months', gender: 'Female', health: 'Healthy', shed: 'Shed 1', purchaseDate: '2023-01-10', rfid: 'RF-99812', status: 'Active', photo: null },
    { id: 'A-1002', name: 'Daisy', species: 'Cattle', breed: 'Jersey', weight: '420', age: '24 Months', gender: 'Female', health: 'Sick', shed: 'Shed 2', purchaseDate: '2024-05-15', rfid: 'RF-88211', status: 'Active', photo: null },
    { id: 'P-2001', name: 'Porky', species: 'Pig', breed: 'Large White', weight: '110', age: '12 Months', gender: 'Male', health: 'Healthy', shed: 'Shed 3', purchaseDate: '2025-11-20', rfid: 'RF-77632', status: 'Active', photo: null },
    { id: 'C-3050', name: 'Batch 50', species: 'Poultry', breed: 'Broiler', weight: '2.5', age: '45 Days', gender: 'Mixed', health: 'Healthy', shed: 'Shed 5', purchaseDate: '2026-06-01', rfid: '', status: 'Active', photo: null },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [currentAnimal, setCurrentAnimal] = useState(null);
  const [profileTab, setProfileTab] = useState('overview');

  const [formData, setFormData] = useState({
    id: '', name: '', species: 'Cattle', breed: '', age: '',
    weight: '', gender: 'Female', shed: 'Shed 1',
    health: 'Healthy', purchaseDate: '', rfid: ''
  });

  // Action Modals State
  const [transferShed, setTransferShed] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [productionInput, setProductionInput] = useState({ type: 'Milk', amount: '', date: '' });

  // Autonomous Load Balancer State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyConfig, setEmergencyConfig] = useState({ shed: 'Shed 1', type: 'Disease Outbreak' });
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState(null);

  // Auto Vet Scheduler State
  const [autoVetLoading, setAutoVetLoading] = useState(false);

  const openAdd = () => {
    setFormData({
      id: `A-${Math.floor(Math.random() * 9000) + 1000}`,
      name: '', species: 'Cattle', breed: '', age: '',
      weight: '', gender: 'Female', shed: 'Shed 1',
      health: 'Healthy', purchaseDate: new Date().toISOString().split('T')[0], rfid: ''
    });
    setShowAddModal(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newAnimal = { ...formData, status: 'Active', photo: null };
    setAnimals([...animals, newAnimal]);
    setShowAddModal(false);
    toast.success('Animal added successfully!');
  };

  const openEdit = (animal) => {
    setCurrentAnimal(animal);
    setFormData({ ...animal });
    setShowEditModal(true);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setAnimals(animals.map(a => a.id === currentAnimal.id ? { ...a, ...formData } : a));
    setShowEditModal(false);
    if (currentAnimal && currentAnimal.id === formData.id) {
      if (showProfileModal) setCurrentAnimal({ ...currentAnimal, ...formData });
    }
    toast.success('Animal updated successfully!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this animal permanently?')) {
      setAnimals(animals.filter(a => a.id !== id));
      toast.success('Animal removed from records.');
    }
  };

  const openProfile = (animal) => {
    setCurrentAnimal(animal);
    setProfileTab('overview');
    setShowProfileModal(true);
  };

  const handleStatusChange = (status) => {
    setAnimals(animals.map(a => a.id === currentAnimal.id ? { ...a, status } : a));
    setCurrentAnimal({ ...currentAnimal, status });
    toast.success(`Animal marked as ${status}`);
  };

  const handleTransfer = () => {
    if (!transferShed) return toast.error("Select a shed");
    setAnimals(animals.map(a => a.id === currentAnimal.id ? { ...a, shed: transferShed } : a));
    setCurrentAnimal({ ...currentAnimal, shed: transferShed });
    toast.success(`Transferred to ${transferShed}`);
    setTransferShed('');
  };

  const handleWeightUpdate = () => {
    if (!weightInput) return;
    setAnimals(animals.map(a => a.id === currentAnimal.id ? { ...a, weight: weightInput } : a));
    setCurrentAnimal({ ...currentAnimal, weight: weightInput });
    toast.success(`Weight updated to ${weightInput}kg`);
    setWeightInput('');
  };

  const handleLogProduction = () => {
    if (!productionInput.amount) return;
    toast.success(`${productionInput.type} production of ${productionInput.amount} logged!`);
    setProductionInput({ type: 'Milk', amount: '', date: '' });
  };

  const generateQR = (id) => toast.success(`QR Code / RFID scanned for ${id}`);
  const handlePhotoUpload = () => toast.success('Photo uploaded successfully!');

  const handleTriggerEmergency = async () => {
    setEmergencyLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/automation/trigger-emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shed: emergencyConfig.shed, emergencyType: emergencyConfig.type })
      });
      const data = await response.json();

      if (data.success) {
        setEmergencyResult(data.data);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to trigger emergency protocol');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection failed');
    } finally {
      setEmergencyLoading(false);
    }
  };

  const handleAutoVetScheduler = async () => {
    setAutoVetLoading(true);
    const toastId = toast.loading('AI analyzing vaccination histories...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/automation/auto-vet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animalsToCheck: animals }) // Pass current animals to simulate check
      });
      const data = await response.json();

      if (data.success && data.data) {
        toast.success(
          <div>
            <strong>Autonomously Scheduled!</strong><br />
            {data.data.tasksGenerated} vet tasks assigned.<br />
            Check pending badges below.
          </div>,
          { id: toastId, duration: 5000 }
        );

        // Update local state to reflect the new "Vax Pending" health status
        const flaggedIds = data.data.flaggedAnimals.map(a => a.id);
        setAnimals(prev => prev.map(a =>
          flaggedIds.includes(a.id) ? { ...a, health: 'Vax Pending' } : a
        ));
      } else {
        toast.error(data.message || 'No animals need scheduling.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to run AI Vet Scheduler', { id: toastId });
    } finally {
      setAutoVetLoading(false);
    }
  };

  const ModalStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
  const ModalContentStyle = { background: 'white', padding: '2rem', borderRadius: '12px', width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' };
  const LargeModalStyle = { ...ModalContentStyle, width: '800px' };
  const InputStyle = { width: '100%', padding: '0.6rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #d1d5db' };
  const GridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaPaw style={{ color: '#3b82f6' }} /> Animal Management
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Manage all farm animals, record health, and track details.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleAutoVetScheduler} disabled={autoVetLoading} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: autoVetLoading ? 'wait' : 'pointer', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)' }}>
            <FaSyringe /> {autoVetLoading ? 'Scheduling...' : 'Run Auto Vet Scheduler'}
          </button>
          <button onClick={() => { setShowEmergencyModal(true); setEmergencyResult(null); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }}>
            <FaExclamationTriangle /> Emergency Protocol
          </button>
          <button onClick={openAdd} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <FaPlus /> Add New Animal
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by ID, Name or Species..."
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', color: '#374151' }}>
            <option value="">All Species</option>
            <option value="Cattle">Cattle</option>
            <option value="Poultry">Poultry</option>
            <option value="Pig">Pig</option>
          </select>
          <select style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', color: '#374151' }}>
            <option value="">All Sheds</option>
            <option value="Shed 1">Shed 1</option>
            <option value="Shed 2">Shed 2</option>
          </select>
          <button style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <FaFilter /> Filter
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>ID / Tag</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Species & Breed</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Weight</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Health & Status</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Location</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {animals.filter(a => a.id.toLowerCase().includes(searchTerm.toLowerCase()) || a.name.toLowerCase().includes(searchTerm.toLowerCase())).map((animal, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s', opacity: animal.status !== 'Active' ? 0.6 : 1 }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>
                    {animal.id} <br /><span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '400' }}>{animal.name}</span>
                  </td>
                  <td style={{ padding: '1rem', color: '#374151' }}>
                    {animal.species} <br /><span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{animal.breed}</span>
                  </td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{animal.weight} kg</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: animal.health === 'Healthy' ? '#dcfce7' : (animal.health === 'Vax Pending' ? '#fef3c7' : '#fee2e2'),
                        color: animal.health === 'Healthy' ? '#166534' : (animal.health === 'Vax Pending' ? '#b45309' : '#991b1b'),
                        padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600'
                      }}>
                        {animal.health}
                      </span>
                      {animal.status !== 'Active' && (
                        <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600' }}>
                          {animal.status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{animal.shed}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => openProfile(animal)} title="View Profile" style={{ background: '#f3f4f6', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#4b5563', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaEye /></button>
                    <button onClick={() => toast.success('QR Code / RFID Generated')} title="Generate QR" style={{ background: '#e0e7ff', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#4338ca', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaQrcode /></button>
                    <button onClick={() => openEdit(animal)} title="Edit" style={{ background: '#fef3c7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#d97706', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaEdit /></button>
                    <button onClick={() => handleDelete(animal.id)} title="Delete" style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={ModalStyle}>
          <div style={ModalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>🐾 Animal Registration Form</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>

            <form onSubmit={handleAdd}>
              <div style={GridStyle}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Animal ID *</label>
                  <input style={InputStyle} value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Animal Type *</label>
                  <select style={InputStyle} value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })} required>
                    <option value="Cattle">Cattle</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Pig">Pig</option>
                    <option value="Goat">Goat</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Breed</label>
                  <input style={InputStyle} value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} placeholder="e.g. Holstein" />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Age (Months/Years)</label>
                  <input style={InputStyle} value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="e.g. 12 Months" />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Weight (kg) *</label>
                  <input type="number" style={InputStyle} value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="e.g. 400" required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Gender *</label>
                  <select style={InputStyle} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} required>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Shed Number *</label>
                  <select style={InputStyle} value={formData.shed} onChange={e => setFormData({ ...formData, shed: e.target.value })} required>
                    <option value="Shed 1">Shed 1</option>
                    <option value="Shed 2">Shed 2</option>
                    <option value="Shed 3">Shed 3</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Health Status</label>
                  <select style={InputStyle} value={formData.health} onChange={e => setFormData({ ...formData, health: e.target.value })}>
                    <option value="Healthy">Healthy</option>
                    <option value="Sick">Sick</option>
                    <option value="Under Treatment">Under Treatment</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Purchase Date</label>
                  <input type="date" style={InputStyle} value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>RFID Tag (Optional)</label>
                  <input style={InputStyle} value={formData.rfid} onChange={e => setFormData({ ...formData, rfid: e.target.value })} placeholder="Scan or enter RFID" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Register Animal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={ModalStyle}>
          <div style={ModalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>✏️ Edit Animal Form</h3>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>

            <form onSubmit={handleEdit}>
              <div style={GridStyle}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Animal ID</label>
                  <input style={{ ...InputStyle, background: '#f3f4f6' }} value={currentAnimal?.id || ''} readOnly />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Animal Type *</label>
                  <select style={InputStyle} value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })} required>
                    <option value="Cattle">Cattle</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Pig">Pig</option>
                    <option value="Goat">Goat</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Breed</label>
                  <input style={InputStyle} value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Age (Months/Years)</label>
                  <input style={InputStyle} value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Weight (kg) *</label>
                  <input type="number" style={InputStyle} value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Gender *</label>
                  <select style={InputStyle} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} required>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Shed Number *</label>
                  <select style={InputStyle} value={formData.shed} onChange={e => setFormData({ ...formData, shed: e.target.value })} required>
                    <option value="Shed 1">Shed 1</option>
                    <option value="Shed 2">Shed 2</option>
                    <option value="Shed 3">Shed 3</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Health Status</label>
                  <select style={InputStyle} value={formData.health} onChange={e => setFormData({ ...formData, health: e.target.value })}>
                    <option value="Healthy">Healthy</option>
                    <option value="Sick">Sick</option>
                    <option value="Under Treatment">Under Treatment</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Purchase Date</label>
                  <input type="date" style={InputStyle} value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>RFID Tag</label>
                  <input style={InputStyle} value={formData.rfid} onChange={e => setFormData({ ...formData, rfid: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#d97706', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Update Animal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Animal Profile Modal */}
      {showProfileModal && currentAnimal && (
        <div style={ModalStyle}>
          <div style={LargeModalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaPaw color="#3b82f6" /> {currentAnimal.id} - {currentAnimal.name || 'Unnamed'}
              </h3>
              <button type="button" onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              {['overview', 'health', 'production'].map(tab => (
                <button key={tab} onClick={() => setProfileTab(tab)} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: '600', color: profileTab === tab ? '#3b82f6' : '#6b7280', borderBottom: profileTab === tab ? '3px solid #3b82f6' : 'none', cursor: 'pointer', marginBottom: '-0.6rem', textTransform: 'capitalize' }}>
                  {tab === 'health' ? 'Health & Vax' : tab}
                </button>
              ))}
            </div>

            <div style={{ minHeight: '300px' }}>
              {profileTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                  {/* Left Col - Photo & Status */}
                  <div>
                    <div style={{ width: '100%', height: '180px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #d1d5db', marginBottom: '1rem', position: 'relative' }}>
                      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                        <FaCamera size={30} />
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>Upload Photo</p>
                      </div>
                      <input type="file" onChange={handlePhotoUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    </div>

                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#374151' }}>Animal Status</h4>
                    <select style={InputStyle} value={currentAnimal.status} onChange={(e) => handleStatusChange(e.target.value)}>
                      <option value="Active">Active</option>
                      <option value="Sold">Sold</option>
                      <option value="Deceased">Deceased</option>
                    </select>
                  </div>

                  {/* Right Col - Details & Actions */}
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div><span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Species/Breed:</span><div style={{ fontWeight: '600', color: '#111827' }}>{currentAnimal.species} ({currentAnimal.breed})</div></div>
                      <div><span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Gender:</span><div style={{ fontWeight: '600', color: '#111827' }}>{currentAnimal.gender}</div></div>
                      <div><span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Age:</span><div style={{ fontWeight: '600', color: '#111827' }}>{currentAnimal.age}</div></div>
                      <div><span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Current Weight:</span><div style={{ fontWeight: '600', color: '#111827' }}>{currentAnimal.weight} kg</div></div>
                      <div><span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Location:</span><div style={{ fontWeight: '600', color: '#111827' }}>{currentAnimal.shed}</div></div>
                      <div><span style={{ color: '#6b7280', fontSize: '0.8rem' }}>RFID:</span><div style={{ fontWeight: '600', color: '#111827' }}>{currentAnimal.rfid || 'N/A'}</div></div>
                    </div>

                    <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#374151' }}>Quick Actions</h4>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input style={{ ...InputStyle, marginBottom: 0, flex: 1 }} placeholder="New Weight (kg)" value={weightInput} onChange={e => setWeightInput(e.target.value)} type="number" />
                      <button onClick={handleWeightUpdate} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaWeight /> Update Weight</button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select style={{ ...InputStyle, marginBottom: 0, flex: 1 }} value={transferShed} onChange={e => setTransferShed(e.target.value)}>
                        <option value="">Select new shed...</option>
                        <option value="Shed 1">Shed 1</option>
                        <option value="Shed 2">Shed 2</option>
                        <option value="Shed 3">Shed 3</option>
                        <option value="Shed 4">Shed 4</option>
                        <option value="Shed 5">Shed 5</option>
                      </select>
                      <button onClick={handleTransfer} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaExchangeAlt /> Transfer Shed</button>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'health' && (
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, background: '#dcfce7', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534' }}><FaSyringe /> Vaccinations</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d', lineHeight: '1.5' }}><strong>Last:</strong> FMD Vaccine (10 Jul 2026)<br /><strong>Next Due:</strong> Rabies (15 Aug 2026)</p>
                    </div>
                    <div style={{ flex: 1, background: '#fee2e2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#991b1b' }}><FaStethoscope /> Treatments</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#b91c1c', lineHeight: '1.5' }}><strong>History:</strong> Treated for tick fever (05 Jun 2026)<br /><strong>Status:</strong> Fully recovered.</p>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#374151' }}>Growth & Weight History</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', color: '#4b5563' }}>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Weight</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Recorded By</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>2026-07-01</td><td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', fontWeight: 'bold' }}>640 kg</td><td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>Farm Manager</td></tr>
                      <tr><td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>2026-06-01</td><td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', fontWeight: 'bold' }}>625 kg</td><td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>Farm Manager</td></tr>
                      <tr><td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>2026-05-01</td><td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', fontWeight: 'bold' }}>610 kg</td><td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>Farm Admin</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {profileTab === 'production' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                    {/* Log Production */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}><FaEgg color="#d97706" /> Log Production (Milk/Egg)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <select style={{ ...InputStyle, marginBottom: 0 }} value={productionInput.type} onChange={e => setProductionInput({ ...productionInput, type: e.target.value })}>
                          <option value="Milk">Milk (Liters)</option>
                          <option value="Egg">Eggs (Count)</option>
                        </select>
                        <input style={{ ...InputStyle, marginBottom: 0 }} type="number" placeholder="Amount (e.g. 15)" value={productionInput.amount} onChange={e => setProductionInput({ ...productionInput, amount: e.target.value })} />
                        <input style={{ ...InputStyle, marginBottom: 0 }} type="date" value={productionInput.date} onChange={e => setProductionInput({ ...productionInput, date: e.target.value })} />
                        <button onClick={handleLogProduction} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' }}>Save Production Log</button>
                      </div>
                    </div>

                    {/* Breeding & Pregnancy */}
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Breeding & Pregnancy</h4>
                      <div style={{ background: '#fdf4ff', padding: '1.5rem', borderRadius: '8px', fontSize: '0.9rem', color: '#4a044e', border: '1px solid #f3e8ff' }}>
                        <p style={{ margin: '0 0 0.8rem 0' }}><strong>Pregnancy Status:</strong> <span style={{ background: '#e879f9', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Not Pregnant</span></p>
                        <p style={{ margin: '0 0 0.8rem 0' }}><strong>Last Calving/Hatching:</strong> 12 Feb 2026</p>
                        <p style={{ margin: '0 0 0.8rem 0' }}><strong>Total Offspring:</strong> 2</p>
                        <p style={{ margin: 0 }}><strong>Breeding Method:</strong> Artificial Insemination (AI)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Autonomous Load Balancer (Emergency Protocol) Modal */}
      {showEmergencyModal && (
        <div style={ModalStyle}>
          <div style={ModalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaShieldAlt /> Autonomous Emergency Response
              </h3>
              <button type="button" onClick={() => setShowEmergencyModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>

            {!emergencyResult ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 1rem 0', color: '#991b1b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <strong>Warning:</strong> Initiating an emergency response will autonomously halt all low/medium priority tasks across the farm and instantly reassign available workers to the affected area.
                </p>
                <div style={GridStyle}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#7f1d1d' }}>Target Location (Shed) *</label>
                    <select style={{ ...InputStyle, borderColor: '#fca5a5', background: 'white' }} value={emergencyConfig.shed} onChange={e => setEmergencyConfig({ ...emergencyConfig, shed: e.target.value })}>
                      <option value="Shed 1">Shed 1</option>
                      <option value="Shed 2">Shed 2</option>
                      <option value="Shed 3">Shed 3</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#7f1d1d' }}>Emergency Type *</label>
                    <select style={{ ...InputStyle, borderColor: '#fca5a5', background: 'white' }} value={emergencyConfig.type} onChange={e => setEmergencyConfig({ ...emergencyConfig, type: e.target.value })}>
                      <option value="Disease Outbreak">Disease Outbreak</option>
                      <option value="Severe Structural Damage">Severe Structural Damage</option>
                      <option value="Mass Heat Stress">Mass Heat Stress</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={() => setShowEmergencyModal(false)} style={{ padding: '0.8rem 1.5rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>Cancel</button>
                  <button onClick={handleTriggerEmergency} disabled={emergencyLoading} style={{ padding: '0.8rem 1.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: emergencyLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.4)' }}>
                    {emergencyLoading ? 'Autonomously Reallocating...' : 'Trigger Immediate Protocol'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ width: '50px', height: '50px', background: '#22c55e', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem auto', boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.4)' }}>✓</div>
                  <h3 style={{ color: '#166534', margin: '0 0 0.5rem 0' }}>AI Load Balancer Executed</h3>
                  <p style={{ color: '#15803d', margin: 0, fontSize: '0.95rem' }}>Resources have been autonomously reallocated to mitigate the threat in <strong>{emergencyResult.targetShed}</strong>.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '8px' }}>
                    <h4 style={{ color: '#475569', margin: '0 0 0.5rem 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Tasks Paused</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{emergencyResult.pausedTasksCount}</div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>Low/Medium priority tasks placed on hold farm-wide.</p>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '8px' }}>
                    <h4 style={{ color: '#475569', margin: '0 0 0.5rem 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Workers Reassigned</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{emergencyResult.reassignedWorkersCount}</div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
                      {emergencyResult.reassignedWorkerNames.join(', ')} redirected to critical tasks.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button onClick={() => setShowEmergencyModal(false)} style={{ padding: '0.8rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Acknowledge</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AnimalManagement;
