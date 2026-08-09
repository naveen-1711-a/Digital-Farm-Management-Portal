import React, { useState } from 'react';
import { FaSyringe, FaSearch, FaFilter, FaPlus, FaCheck, FaTimes, FaCalendarAlt, FaVial, FaBoxOpen, FaHistory, FaQrcode, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VaccinationManagement = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy Data
  const [records, setRecords] = useState([
    { id: 'VR-101', animalId: 'A-1001', animalName: 'Bessie', vaccine: 'FMD Vaccine', batchNumber: 'FMD-2026-A', dose: '2ml', date: '2026-07-10', nextDueDate: '2027-07-10', boosterDate: '', remarks: 'Routine annual', status: 'Completed', certificate: null },
    { id: 'VR-102', animalId: 'A-1005', animalName: 'Daisy', vaccine: 'Rabies', batchNumber: 'RB-99X', dose: '1ml', date: '2026-08-15', nextDueDate: '', boosterDate: '', remarks: 'New purchase', status: 'Due', certificate: null },
  ]);

  const [inventory, setInventory] = useState([
    { id: 'INV-01', name: 'FMD Vaccine', manufacturer: 'AgriVet', type: 'Viral', batchLot: 'FMD-2026-A', quantity: 50, unit: 'Vial', purchaseDate: '2026-01-10', mfgDate: '2025-12-01', expiryDate: '2027-12-01', supplier: 'PharmaFarm', cost: '$250', storageTemp: '2-8°C', storageLoc: 'Fridge A', status: 'Available' },
    { id: 'INV-02', name: 'Rabies', manufacturer: 'PetHealth', type: 'Inactivated', batchLot: 'RB-99X', quantity: 5, unit: 'Dose', purchaseDate: '2026-05-15', mfgDate: '2026-01-20', expiryDate: '2026-07-30', supplier: 'VetSupplies', cost: '$50', storageTemp: '2-8°C', storageLoc: 'Fridge B', status: 'Low Stock' },
  ]);

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editRecordId, setEditRecordId] = useState(null);
  const [recordData, setRecordData] = useState({ animalId: '', animalName: '', vaccine: '', batchNumber: '', dose: '', date: '', nextDueDate: '', boosterDate: '', remarks: '' });

  const [showInvModal, setShowInvModal] = useState(false);
  const [isEditingInv, setIsEditingInv] = useState(false);
  const [editInvId, setEditInvId] = useState(null);
  const [invData, setInvData] = useState({ name: '', manufacturer: '', type: 'Viral', batchLot: '', quantity: '', unit: 'Vial', purchaseDate: '', mfgDate: '', expiryDate: '', supplier: '', cost: '', storageTemp: '', storageLoc: '', status: 'Available' });

  // Handlers
  const handleAddRecord = (e) => {
    e.preventDefault();
    if (isEditingRecord) {
      setRecords(records.map(r => r.id === editRecordId ? { ...r, ...recordData } : r));
      toast.success('Vaccination record updated!');
    } else {
      const newRecord = { ...recordData, id: `VR-${Math.floor(Math.random()*900)+100}`, status: 'Due', certificate: null };
      setRecords([...records, newRecord]);
      toast.success('Vaccination scheduled!');
    }
    setShowRecordModal(false);
    setIsEditingRecord(false);
    setEditRecordId(null);
  };

  const handleAddInv = (e) => {
    e.preventDefault();
    if (isEditingInv) {
      setInventory(inventory.map(i => i.id === editInvId ? { ...i, ...invData } : i));
      toast.success('Inventory updated!');
    } else {
      const newInv = { ...invData, id: `INV-${Math.floor(Math.random()*90)+10}` };
      setInventory([...inventory, newInv]);
      toast.success('Vaccine added to inventory!');
    }
    setShowInvModal(false);
    setIsEditingInv(false);
    setEditInvId(null);
  };

  const markCompleted = (id) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
    toast.success('Vaccination marked as completed!');
  };

  const cancelRecord = (id) => {
    if(window.confirm('Cancel this vaccination schedule?')) {
      setRecords(records.filter(r => r.id !== id));
      toast.error('Vaccination cancelled.');
    }
  };

  const deleteInv = (id) => {
    if(window.confirm('Remove vaccine from inventory?')) {
      setInventory(inventory.filter(i => i.id !== id));
      toast.error('Vaccine removed.');
    }
  };

  const ModalStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
  const ModalContentStyle = { background: 'white', padding: '2rem', borderRadius: '12px', width: '700px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' };
  const InputStyle = { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', marginTop: '0.3rem' };
  const LabelStyle = { fontSize: '0.85rem', fontWeight: 'bold', display: 'block' };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaSyringe style={{ color: '#10b981' }} /> Vaccination Management
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Track vaccination history and manage vaccine inventory.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { setIsEditingRecord(false); setEditRecordId(null); setRecordData({ animalId: '', animalName: '', vaccine: '', batchNumber: '', dose: '', date: '', nextDueDate: '', boosterDate: '', remarks: '' }); setShowRecordModal(true); }} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <FaPlus /> Vaccinate Animal
          </button>
          <button onClick={() => { setIsEditingInv(false); setEditInvId(null); setInvData({ name: '', manufacturer: '', type: 'Viral', batchLot: '', quantity: '', unit: 'Vial', purchaseDate: '', mfgDate: '', expiryDate: '', supplier: '', cost: '', storageTemp: '', storageLoc: '', status: 'Available' }); setShowInvModal(true); }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <FaVial /> Add Vaccine
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('records')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: '600', color: activeTab === 'records' ? '#10b981' : '#6b7280', borderBottom: activeTab === 'records' ? '3px solid #10b981' : 'none', cursor: 'pointer', marginBottom: '-0.6rem' }}>Vaccination Records</button>
        <button onClick={() => setActiveTab('inventory')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: '600', color: activeTab === 'inventory' ? '#10b981' : '#6b7280', borderBottom: activeTab === 'inventory' ? '3px solid #10b981' : 'none', cursor: 'pointer', marginBottom: '-0.6rem' }}>Vaccine Inventory</button>
      </div>

      {/* Main Content Area */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder={activeTab === 'records' ? "Search animal, vaccine..." : "Search vaccine, batch..."}
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
          {activeTab === 'records' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f9fafb', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Animal</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Vaccine Details</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Dose</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Date / Due</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>{item.animalId} <br/><span style={{fontSize: '0.75rem', color: '#6b7280'}}>{item.animalName}</span></td>
                    <td style={{ padding: '1rem', color: '#374151' }}>{item.vaccine} <br/><span style={{fontSize: '0.75rem', color: '#6b7280'}}>Batch: {item.batchNumber}</span></td>
                    <td style={{ padding: '1rem', color: '#374151' }}>{item.dose}</td>
                    <td style={{ padding: '1rem', color: '#374151', fontSize: '0.85rem' }}>
                      <div><FaCalendarAlt style={{color: '#9ca3af', marginRight: '0.3rem'}}/>{item.date}</div>
                      {item.nextDueDate && <div style={{color: '#d97706', marginTop: '0.2rem'}}>Due: {item.nextDueDate}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: item.status === 'Completed' ? '#dcfce7' : item.status === 'Due' ? '#fef3c7' : '#fee2e2', color: item.status === 'Completed' ? '#166534' : item.status === 'Due' ? '#92400e' : '#991b1b', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {item.status}
                      </span>
                    </td>
                    {item.status !== 'Completed' && (
                      <button onClick={() => markCompleted(item.id)} title="Mark Completed" style={{ background: '#dcfce7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#166534', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaCheck /></button>
                    )}
                    <button onClick={() => { setIsEditingRecord(true); setEditRecordId(item.id); setRecordData(item); setShowRecordModal(true); }} title="Edit" style={{ background: '#fef3c7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#d97706', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaEdit /></button>
                    <button onClick={() => cancelRecord(item.id)} title="Delete" style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaTrash /></button>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f9fafb', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Vaccine</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Batch & Type</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Stock</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Expiry Date</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>{item.name} <br/><span style={{fontSize: '0.75rem', color: '#6b7280'}}>{item.manufacturer}</span></td>
                    <td style={{ padding: '1rem', color: '#374151' }}>{item.batchLot} <br/><span style={{fontSize: '0.75rem', color: '#6b7280'}}>{item.type}</span></td>
                    <td style={{ padding: '1rem', color: '#374151', fontWeight: 'bold' }}>{item.quantity} {item.unit}s</td>
                    <td style={{ padding: '1rem', color: '#374151' }}>{item.expiryDate}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: item.status === 'Available' ? '#dcfce7' : item.status === 'Low Stock' ? '#fef3c7' : '#fee2e2', color: item.status === 'Available' ? '#166534' : item.status === 'Low Stock' ? '#92400e' : '#991b1b', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => { setIsEditingInv(true); setEditInvId(item.id); setInvData(item); setShowInvModal(true); }} title="Edit" style={{ background: '#fef3c7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#d97706', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaEdit /></button>
                    <button onClick={() => deleteInv(item.id)} title="Delete" style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaTrash /></button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Modal */}
      {showRecordModal && (
        <div style={ModalStyle}>
          <div style={ModalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{isEditingRecord ? '✏️ Edit Vaccination Record' : '💉 Vaccinate Animal'}</h3>
              <button type="button" onClick={() => setShowRecordModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <form onSubmit={handleAddRecord}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={LabelStyle}>Animal ID *</label><input style={InputStyle} value={recordData.animalId} onChange={e => setRecordData({...recordData, animalId: e.target.value})} required /></div>
                <div><label style={LabelStyle}>Animal Name</label><input style={InputStyle} value={recordData.animalName} onChange={e => setRecordData({...recordData, animalName: e.target.value})} /></div>
                <div><label style={LabelStyle}>Vaccine Name *</label><input style={InputStyle} value={recordData.vaccine} onChange={e => setRecordData({...recordData, vaccine: e.target.value})} required /></div>
                <div><label style={LabelStyle}>Batch Number *</label><input style={InputStyle} value={recordData.batchNumber} onChange={e => setRecordData({...recordData, batchNumber: e.target.value})} required /></div>
                <div><label style={LabelStyle}>Dose *</label><input style={InputStyle} value={recordData.dose} onChange={e => setRecordData({...recordData, dose: e.target.value})} placeholder="e.g. 2ml" required /></div>
                <div><label style={LabelStyle}>Vaccination Date *</label><input type="date" style={InputStyle} value={recordData.date} onChange={e => setRecordData({...recordData, date: e.target.value})} required /></div>
                <div><label style={LabelStyle}>Next Due Date</label><input type="date" style={InputStyle} value={recordData.nextDueDate} onChange={e => setRecordData({...recordData, nextDueDate: e.target.value})} /></div>
                <div><label style={LabelStyle}>Booster Date</label><input type="date" style={InputStyle} value={recordData.boosterDate} onChange={e => setRecordData({...recordData, boosterDate: e.target.value})} /></div>
                <div style={{ gridColumn: 'span 2' }}><label style={LabelStyle}>Remarks</label><input style={InputStyle} value={recordData.remarks} onChange={e => setRecordData({...recordData, remarks: e.target.value})} placeholder="Any side effects or notes" /></div>
                <div style={{ gridColumn: 'span 2' }}><label style={LabelStyle}>Upload Certificate</label><input type="file" style={{...InputStyle, padding: '0.4rem'}} /></div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowRecordModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{isEditingRecord ? 'Update Record' : 'Save Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInvModal && (
        <div style={ModalStyle}>
          <div style={ModalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{isEditingInv ? '✏️ Edit Inventory Item' : '📦 Add Vaccine to Inventory'}</h3>
              <button type="button" onClick={() => setShowInvModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <form onSubmit={handleAddInv}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={LabelStyle}>Vaccine Name *</label><input style={InputStyle} value={invData.name} onChange={e => setInvData({...invData, name: e.target.value})} required /></div>
                <div><label style={LabelStyle}>Manufacturer</label><input style={InputStyle} value={invData.manufacturer} onChange={e => setInvData({...invData, manufacturer: e.target.value})} /></div>
                <div>
                  <label style={LabelStyle}>Vaccine Type</label>
                  <select style={InputStyle} value={invData.type} onChange={e => setInvData({...invData, type: e.target.value})}>
                    <option value="Viral">Viral</option>
                    <option value="Bacterial">Bacterial</option>
                    <option value="Inactivated">Inactivated</option>
                    <option value="Live Attenuated">Live Attenuated</option>
                    <option value="Toxoid">Toxoid</option>
                  </select>
                </div>
                <div><label style={LabelStyle}>Batch/Lot Number *</label><input style={InputStyle} value={invData.batchLot} onChange={e => setInvData({...invData, batchLot: e.target.value})} required /></div>
                <div><label style={LabelStyle}>Quantity Available *</label><input type="number" style={InputStyle} value={invData.quantity} onChange={e => setInvData({...invData, quantity: e.target.value})} required /></div>
                <div>
                  <label style={LabelStyle}>Unit</label>
                  <select style={InputStyle} value={invData.unit} onChange={e => setInvData({...invData, unit: e.target.value})}>
                    <option value="Vial">Vial</option>
                    <option value="Dose">Dose</option>
                    <option value="Bottle">Bottle</option>
                  </select>
                </div>
                <div><label style={LabelStyle}>Purchase Date</label><input type="date" style={InputStyle} value={invData.purchaseDate} onChange={e => setInvData({...invData, purchaseDate: e.target.value})} /></div>
                <div><label style={LabelStyle}>Manufacturing Date</label><input type="date" style={InputStyle} value={invData.mfgDate} onChange={e => setInvData({...invData, mfgDate: e.target.value})} /></div>
                <div><label style={LabelStyle}>Expiry Date *</label><input type="date" style={InputStyle} value={invData.expiryDate} onChange={e => setInvData({...invData, expiryDate: e.target.value})} required /></div>
                <div><label style={LabelStyle}>Supplier Name</label><input style={InputStyle} value={invData.supplier} onChange={e => setInvData({...invData, supplier: e.target.value})} /></div>
                <div><label style={LabelStyle}>Purchase Cost</label><input style={InputStyle} value={invData.cost} onChange={e => setInvData({...invData, cost: e.target.value})} placeholder="e.g. $100" /></div>
                <div><label style={LabelStyle}>Storage Temperature</label><input style={InputStyle} value={invData.storageTemp} onChange={e => setInvData({...invData, storageTemp: e.target.value})} placeholder="e.g. 2-8°C" /></div>
                <div><label style={LabelStyle}>Storage Location</label><input style={InputStyle} value={invData.storageLoc} onChange={e => setInvData({...invData, storageLoc: e.target.value})} placeholder="e.g. Fridge A" /></div>
                <div>
                  <label style={LabelStyle}>Status</label>
                  <select style={InputStyle} value={invData.status} onChange={e => setInvData({...invData, status: e.target.value})}>
                    <option value="Available">Available</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowInvModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{isEditingInv ? 'Update Inventory' : 'Save to Inventory'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationManagement;
