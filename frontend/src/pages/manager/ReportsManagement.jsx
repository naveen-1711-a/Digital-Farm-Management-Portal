import React, { useState } from 'react';
import { FaFileAlt, FaFilePdf, FaFileExcel, FaFileCsv, FaHistory, FaQrcode, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReportsManagement = () => {
  const reports = [
    { name: 'Daily Activity Report', desc: 'Summary of all tasks, feedings, and attendances.', type: 'Daily' },
    { name: 'Weekly Health & Disease', desc: 'Overview of sick animals, treatments, and recoveries.', type: 'Weekly' },
    { name: 'Monthly Feed Consumption', desc: 'Total feed used vs stocked.', type: 'Monthly' },
    { name: 'Biosecurity & Visitor Log', desc: 'List of all farm entries and sanitation checks.', type: 'Custom' },
  ];

  const [autoSend, setAutoSend] = useState(false);

  const toggleAutoSend = () => {
    setAutoSend(!autoSend);
    if (!autoSend) {
      toast.success("Daily reports will now be automatically generated and sent to the Farm Owner.", { duration: 4000 });
    } else {
      toast.error("Auto-send disabled.");
    }
  };

  const handleDownload = (reportName, format) => {
    toast.success(`Generating ${reportName} as ${format}...`);
    setTimeout(() => {
      // Simulate file download
      const content = `data:text/plain;charset=utf-8,Mock ${format} content for ${reportName}`;
      const encodedUri = encodeURI(content);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${reportName.replace(/ /g, '_')}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Download complete: ${reportName}`);
    }, 1500);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaFileAlt style={{ color: '#4f46e5' }} /> Reports & Analytics
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Generate and export modular reports for the Farm Owner.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#111827' }}>Auto-Send to Owner</span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Daily generated reports</span>
          </div>
          <div 
            onClick={toggleAutoSend}
            style={{ width: '44px', height: '24px', background: autoSend ? '#10b981' : '#e5e7eb', borderRadius: '999px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
          >
            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: autoSend ? '22px' : '2px', transition: 'left 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {reports.map((r, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{r.type}</span>
            <h3 style={{ margin: '0.8rem 0 0.4rem 0', color: '#111827' }}>{r.name}</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.4 }}>{r.desc}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleDownload(r.name, 'PDF')} style={{ flex: 1, padding: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><FaFilePdf /> PDF</button>
              <button onClick={() => handleDownload(r.name, 'Excel')} style={{ flex: 1, padding: '0.5rem', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><FaFileExcel /> Excel</button>
              <button onClick={() => handleDownload(r.name, 'CSV')} style={{ flex: 1, padding: '0.5rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><FaFileCsv /> CSV</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsManagement;
