import React, { useState, useEffect } from 'react';
import { 
  FaSeedling, FaSearch, FaFilter, FaPlus, FaShoppingCart, FaHistory, 
  FaEdit, FaTrash, FaChartLine, FaCalculator, FaBell, FaExclamationTriangle,
  FaFileAlt, FaCheck, FaTruck, FaWarehouse, FaBoxOpen, FaInfoCircle, FaRobot, FaFilePdf, FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const FeedManagement = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');

  // Main State Arrays
  const [inventory, setInventory] = useState([]);
  
  const [consumptionLog, setConsumptionLog] = useState([
    { id: 'CL-001', date: '2026-07-24', animalType: 'Poultry', shed: 'Shed 1', feedName: 'Starter Mix Premium', qtyUsed: 50, noOfAnimals: 1000, feedingTime: 'Morning', recordedBy: 'Farm Manager', remarks: 'Standard daily feeding' },
  ]);

  const [purchases, setPurchases] = useState([
    { id: 'PO-991', date: '2026-07-01', supplier: 'Farm Supplies Co.', feedName: 'Starter Mix Premium', qty: 1500, unit: 'kg', totalCost: '$675.00', status: 'Delivered' }
  ]);

  // Modals State
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [isEditingFeed, setIsEditingFeed] = useState(false);
  const [editFeedId, setEditFeedId] = useState(null);
  
  const [showConsumeModal, setShowConsumeModal] = useState(false);

  // Forms
  const [feedForm, setFeedForm] = useState({
    name: '', category: 'Poultry', type: '', brand: '', batchNumber: '', supplier: '', quantity: '', unit: 'kg', purchaseDate: '', mfgDate: '', expDate: '', purchasePrice: '', location: '', minStock: '', notes: ''
  });

  const [consumeForm, setConsumeForm] = useState({
    date: new Date().toISOString().split('T')[0], animalType: 'Poultry', shed: 'Shed 1', feedName: '', qtyUsed: '', noOfAnimals: '', feedingTime: 'Morning', recordedBy: 'Manager', remarks: ''
  });

  const [calcData, setCalcData] = useState({ animals: '', feedPerAnimal: '' });

  // Auto Reorder State
  const [draftPOs, setDraftPOs] = useState([]);
  const [loadingPOs, setLoadingPOs] = useState(false);

  // Fetch Inventory
  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/feed-inventory`);
      const formatted = res.data.data.map(item => ({
        ...item,
        purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
        mfgDate: item.mfgDate ? item.mfgDate.split('T')[0] : '',
        expDate: item.expDate ? item.expDate.split('T')[0] : ''
      }));
      setInventory(formatted);
    } catch (err) {
      toast.error('Failed to load feed inventory');
      console.error(err);
    }
  };

  const fetchAutoReorders = async () => {
    setLoadingPOs(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/automation/auto-reorder`);
      if (res.data.success && res.data.data) {
        setDraftPOs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load AI POs', err);
    } finally {
      setLoadingPOs(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchAutoReorders();
  }, []);

  // Handlers
  const handleSaveFeed = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...feedForm, totalCost: (feedForm.quantity * feedForm.purchasePrice) || 0, status: feedForm.quantity <= feedForm.minStock ? 'Low Stock' : 'Available' };
      if (isEditingFeed) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/feed-inventory/${editFeedId}`, payload);
        toast.success('Feed stock updated successfully!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/feed-inventory`, payload);
        toast.success('New feed stock added!');
      }
      fetchInventory();
      setShowFeedModal(false);
    } catch (err) {
      toast.error('Error saving feed stock');
      console.error(err);
    }
  };

  const handleDeleteFeed = async (id) => {
    if (window.confirm("Are you sure you want to delete this feed record?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/feed-inventory/${id}`);
        toast.error('Feed record deleted.');
        fetchInventory();
      } catch (err) {
        toast.error('Error deleting feed');
        console.error(err);
      }
    }
  };

  const handleRecordConsumption = (e) => {
    e.preventDefault();
    const feedToUpdate = inventory.find(f => f.name === consumeForm.feedName);
    if (feedToUpdate) {
      if (feedToUpdate.quantity < consumeForm.qtyUsed) {
        toast.error('Insufficient stock for this consumption!');
        return;
      }
      setInventory(inventory.map(f => {
        if (f.name === consumeForm.feedName) {
          const newQty = f.quantity - consumeForm.qtyUsed;
          return { ...f, quantity: newQty, status: newQty <= f.minStock ? (newQty === 0 ? 'Out of Stock' : 'Low Stock') : 'Available' };
        }
        return f;
      }));
    }
    
    setConsumptionLog([{ id: `CL-00${consumptionLog.length + 2}`, ...consumeForm }, ...consumptionLog]);
    toast.success('Daily consumption recorded successfully!');
    setShowConsumeModal(false);
  };

  const approveAutoReorder = (po) => {
    // Generate PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Green
    doc.text('PURCHASE ORDER', 105, 20, null, null, 'center');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`PO Number: ${po.id}`, 20, 35);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text(`Generated By: Digital Farm AI Load Balancer`, 20, 49);
    
    doc.text(`Supplier: ${po.supplier}`, 130, 35);
    doc.text(`Ship To: Digital Farm Main Hub`, 130, 42);
    
    // AI Reasoning Block
    doc.setFillColor(240, 253, 244);
    doc.rect(20, 55, 170, 20, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.text(`AI Recommendation Basis:`, 25, 62);
    doc.text(`${po.reason}`, 25, 68);

    // Table
    doc.autoTable({
      startY: 85,
      head: [['Item Name', 'Current Stock', 'Target Stock (30-day)', 'Order Quantity', 'Est. Cost']],
      body: [
        [po.feedName, `${po.currentStock} ${po.unit}`, `${po.predictedAmountNeeded} ${po.unit}`, `${po.predictedAmountNeeded - po.currentStock} ${po.unit}`, `$${po.estimatedCost}`]
      ],
      headStyles: { fillColor: [16, 185, 129] },
      theme: 'grid'
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Authorized Signature: _______________________', 20, doc.lastAutoTable.finalY + 30);
    
    doc.save(`${po.id}_${po.feedName}_PurchaseOrder.pdf`);
    
    // Remove from draft list
    setDraftPOs(draftPOs.filter(d => d.id !== po.id));
    toast.success(`Purchase Order ${po.id} approved and downloaded.`);
  };

  const openEditModal = (item) => {
    setFeedForm(item);
    setEditFeedId(item._id);
    setIsEditingFeed(true);
    setShowFeedModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return { bg: '#dcfce7', text: '#166534' };
      case 'Low Stock': return { bg: '#fef3c7', text: '#d97706' };
      case 'Out of Stock': return { bg: '#fee2e2', text: '#dc2626' };
      case 'Expired': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  // Rendering Tabs
  const renderInventory = () => (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Current Feed Inventory</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Search feed..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
          <button onClick={() => { setIsEditingFeed(false); setFeedForm({ name: '', category: 'Poultry', type: '', brand: '', batchNumber: '', supplier: '', quantity: '', unit: 'kg', purchaseDate: '', mfgDate: '', expDate: '', purchasePrice: '', location: '', minStock: '', notes: '' }); setShowFeedModal(true); }} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <FaPlus /> Add Stock
          </button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem' }}>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Feed Info</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Category & Type</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Stock Level</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Storage</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.brand} • {item._id ? `FD-${item._id.slice(-5).toUpperCase()}` : 'NEW'}</div>
              </td>
              <td style={{ padding: '1rem', color: '#334155' }}>{item.category}<br/><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.type}</span></td>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.quantity} {item.unit}</div>
                <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Min: {item.minStock} {item.unit}</div>
              </td>
              <td style={{ padding: '1rem', color: '#334155', fontSize: '0.9rem' }}>{item.location}</td>
              <td style={{ padding: '1rem' }}>
                <span style={{ background: getStatusColor(item.status).bg, color: getStatusColor(item.status).text, padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>{item.status}</span>
              </td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                <button onClick={() => openEditModal(item)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', marginRight: '0.5rem' }}><FaEdit /></button>
                <button onClick={() => handleDeleteFeed(item._id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderConsumption = () => (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Daily Consumption Log</h3>
        <button onClick={() => setShowConsumeModal(true)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <FaBoxOpen /> Record Consumption
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem' }}>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Date & Time</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Target (Shed/Animal)</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Feed Used</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Quantity</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Recorded By</th>
          </tr>
        </thead>
        <tbody>
          {consumptionLog.map((log, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1rem', color: '#0f172a', fontWeight: '600' }}>{log.date} <span style={{ color: '#64748b', fontWeight: '400', fontSize:'0.8rem', marginLeft:'0.5rem' }}>({log.feedingTime})</span></td>
              <td style={{ padding: '1rem', color: '#334155' }}>{log.shed} <br/><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.animalType} - {log.noOfAnimals} heads</span></td>
              <td style={{ padding: '1rem', color: '#334155', fontWeight: '600' }}>{log.feedName}</td>
              <td style={{ padding: '1rem', color: '#10b981', fontWeight: '700' }}>{log.qtyUsed} kg</td>
              <td style={{ padding: '1rem', color: '#64748b' }}>{log.recordedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCalculator = () => (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.4rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><FaCalculator color="#4f46e5" /> Auto Feed Calculator</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Number of Animals</label>
          <input type="number" value={calcData.animals} onChange={e=>setCalcData({...calcData, animals: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} placeholder="e.g. 500" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Average Feed per Animal (kg/day)</label>
          <input type="number" value={calcData.feedPerAnimal} onChange={e=>setCalcData({...calcData, feedPerAnimal: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} placeholder="e.g. 0.15" />
        </div>
        
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.5rem' }}>Total Daily Requirement</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>
            {calcData.animals && calcData.feedPerAnimal ? (parseFloat(calcData.animals) * parseFloat(calcData.feedPerAnimal)).toFixed(2) : '0.00'} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>kg/day</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '2rem', borderRadius: '20px', color: 'white', boxShadow: '0 10px 25px rgba(15,23,42,0.2)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}>
            <FaWarehouse style={{ color: '#10b981' }} /> Feed & Nutrition Management
          </h1>
          <p style={{ color: '#cbd5e1', margin: 0, fontSize: '1rem' }}>Comprehensive tracking of inventory, consumption, purchases, and nutritional planning.</p>
        </div>
        
        {/* Quick Alerts */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}>
            <FaExclamationTriangle color="#ffffff" size={24} />
            <div>
              <div style={{ color: '#fca5a5', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.5px' }}>ALERTS</div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>1 Low Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        {[
          { id: 'inventory', label: 'Inventory & Stock', icon: <FaSeedling /> },
          { id: 'consumption', label: 'Consumption Logs', icon: <FaBoxOpen /> },
          { id: 'purchase', label: 'Purchases & Suppliers', icon: <FaShoppingCart /> },
          { id: 'calculator', label: 'Feed Calculator', icon: <FaCalculator /> },
          { id: 'reports', label: 'Reports & Analytics', icon: <FaChartLine /> },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              background: activeTab === tab.id ? '#10b981' : '#f8fafc', 
              color: activeTab === tab.id ? 'white' : '#475569', 
              border: activeTab === tab.id ? 'none' : '1px solid #cbd5e1',
              padding: '0.75rem 1.5rem', 
              borderRadius: '999px', 
              fontWeight: '700', 
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'inventory' && renderInventory()}
      {activeTab === 'consumption' && renderConsumption()}
      {activeTab === 'calculator' && renderCalculator()}
      
      {activeTab === 'purchase' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaRobot color="#8b5cf6" size={24} /> AI Auto-Reorder Queue
            </h3>
            <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '700' }}>
              {draftPOs.length} Pending Approval
            </span>
          </div>
          
          {loadingPOs ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>AI is calculating supply chain requirements...</div>
          ) : draftPOs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <FaCheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Supply Chain Optimal</h2>
              <p style={{ color: '#64748b' }}>No low stock detected. The AI has not recommended any immediate purchase orders.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {draftPOs.map(po => (
                <div key={po.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#f59e0b' }}></div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>{po.feedName}</span>
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{po.id}</span>
                    </div>
                    <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                      Current Stock: {po.currentStock} {po.unit} (Below Min. {po.minStock} {po.unit})
                    </p>
                    <div style={{ background: 'white', padding: '0.8rem', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.85rem', color: '#334155', maxWidth: '600px' }}>
                      <strong>🤖 AI Projection:</strong> {po.reason}<br/>
                      <span style={{ color: '#10b981', fontWeight: 'bold', display: 'block', marginTop: '0.3rem' }}>Recommended Order: {po.predictedAmountNeeded} {po.unit} (~${po.estimatedCost})</span>
                    </div>
                  </div>
                  <div>
                    <button onClick={() => approveAutoReorder(po)} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '1rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
                      <FaFilePdf /> Approve & Generate PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <FaChartLine size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Feed Reports & Analytics</h2>
          <p style={{ color: '#64748b' }}>Advanced analytics for consumption history, wastage, and cost tracking will appear here.</p>
        </div>
      )}

      {/* Modals */}
      {/* 1. Feed Details Form Modal */}
      {showFeedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <FaSeedling color="#10b981" /> {isEditingFeed ? 'Update Feed Stock' : 'Add Feed Stock'}
              </h2>
              <button onClick={() => setShowFeedModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSaveFeed} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Identity */}
              <div style={{ gridColumn: 'span 2', fontSize: '0.9rem', fontWeight: '700', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Basic Details</div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Feed Name</label><input required type="text" value={feedForm.name} onChange={e=>setFeedForm({...feedForm, name:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div>
                <label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Category</label>
                <select value={feedForm.category} onChange={e=>setFeedForm({...feedForm, category:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}}>
                  <option>Poultry</option><option>Swine</option><option>Cattle</option><option>Sheep/Goat</option><option>Other</option>
                </select>
              </div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Feed Type (e.g. Starter)</label><input type="text" value={feedForm.type} onChange={e=>setFeedForm({...feedForm, type:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Brand</label><input type="text" value={feedForm.brand} onChange={e=>setFeedForm({...feedForm, brand:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              
              {/* Purchase & Stock */}
              <div style={{ gridColumn: 'span 2', fontSize: '0.9rem', fontWeight: '700', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginTop: '1rem' }}>Stock & Purchase Info</div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 2 }}><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Quantity</label><input required type="number" value={feedForm.quantity} onChange={e=>setFeedForm({...feedForm, quantity:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
                <div style={{ flex: 1 }}><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Unit</label>
                  <select value={feedForm.unit} onChange={e=>setFeedForm({...feedForm, unit:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}}><option>kg</option><option>Ton</option><option>Bag</option></select>
                </div>
              </div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Min Stock Level (Alert)</label><input required type="number" value={feedForm.minStock} onChange={e=>setFeedForm({...feedForm, minStock:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Supplier Name</label><input type="text" value={feedForm.supplier} onChange={e=>setFeedForm({...feedForm, supplier:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Purchase Price (Total)</label><input type="number" value={feedForm.purchasePrice} onChange={e=>setFeedForm({...feedForm, purchasePrice:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>

              {/* Quality & Dates */}
              <div style={{ gridColumn: 'span 2', fontSize: '0.9rem', fontWeight: '700', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginTop: '1rem' }}>Quality & Storage</div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Batch Number</label><input type="text" value={feedForm.batchNumber} onChange={e=>setFeedForm({...feedForm, batchNumber:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Storage Location</label><input type="text" value={feedForm.location} onChange={e=>setFeedForm({...feedForm, location:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Mfg Date</label><input type="date" value={feedForm.mfgDate} onChange={e=>setFeedForm({...feedForm, mfgDate:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Expiry Date</label><input type="date" value={feedForm.expDate} onChange={e=>setFeedForm({...feedForm, expDate:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              
              <div style={{ gridColumn: 'span 2', marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowFeedModal(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '0.8rem 1.5rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#10b981', color: 'white', padding: '0.8rem 2rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>{isEditingFeed ? 'Update Feed' : 'Save Feed'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Feed Consumption Form Modal */}
      {showConsumeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', width: '600px', maxWidth: '95%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <FaBoxOpen color="#f59e0b" /> Record Feed Consumption
              </h2>
              <button onClick={() => setShowConsumeModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleRecordConsumption} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Date</label>
                <input required type="date" value={consumeForm.date} onChange={e=>setConsumeForm({...consumeForm, date:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} />
              </div>
              <div>
                <label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Feeding Time</label>
                <select value={consumeForm.feedingTime} onChange={e=>setConsumeForm({...consumeForm, feedingTime:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}}>
                  <option>Morning</option><option>Afternoon</option><option>Evening</option>
                </select>
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Select Feed</label>
                <select required value={consumeForm.feedName} onChange={e=>setConsumeForm({...consumeForm, feedName:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}}>
                  <option value="">-- Choose Feed --</option>
                  {inventory.filter(f => f.quantity > 0).map(f => (
                    <option key={f.id} value={f.name}>{f.name} (Avail: {f.quantity} {f.unit})</option>
                  ))}
                </select>
              </div>

              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Quantity Used (kg)</label><input required type="number" value={consumeForm.qtyUsed} onChange={e=>setConsumeForm({...consumeForm, qtyUsed:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Number of Animals</label><input type="number" value={consumeForm.noOfAnimals} onChange={e=>setConsumeForm({...consumeForm, noOfAnimals:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Shed / Location</label><input required type="text" value={consumeForm.shed} onChange={e=>setConsumeForm({...consumeForm, shed:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>
              <div><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Animal Type</label><input type="text" value={consumeForm.animalType} onChange={e=>setConsumeForm({...consumeForm, animalType:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} /></div>

              <div style={{ gridColumn: 'span 2' }}><label style={{display:'block', fontSize:'0.85rem', fontWeight:'600', marginBottom:'0.4rem'}}>Remarks</label><input type="text" value={consumeForm.remarks} onChange={e=>setConsumeForm({...consumeForm, remarks:e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #cbd5e1'}} placeholder="Any issues with feeding?" /></div>

              <div style={{ gridColumn: 'span 2', marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowConsumeModal(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '0.8rem 1.5rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#f59e0b', color: 'white', padding: '0.8rem 2rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>Log Consumption</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeedManagement;
