import React, { useState } from 'react';
import { FaUserClock, FaSearch, FaCheck, FaTimes, FaCalendarDay, FaHistory, FaQrcode, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AttendanceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const attendance = [
    { id: 'W-01', name: 'John Doe', role: 'Feeder', timeIn: '07:00 AM', timeOut: '--:--', status: 'Present' },
    { id: 'W-02', name: 'Jane Smith', role: 'Cleaner', timeIn: '--:--', timeOut: '--:--', status: 'Leave' },
    { id: 'W-03', name: 'Mike Johnson', role: 'Supervisor', timeIn: '06:45 AM', timeOut: '--:--', status: 'Present' },
    { id: 'W-04', name: 'Sarah Lee', role: 'Milker', timeIn: '--:--', timeOut: '--:--', status: 'Absent' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUserClock style={{ color: '#06b6d4' }} /> Attendance
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Daily attendance tracking and time logging.</p>
        </div>
        <div style={{ background: '#fff', padding: '0.6rem 1.25rem', borderRadius: '30px', border: '1px solid #e5e7eb', color: '#06b6d4', fontWeight: '600' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search worker..." 
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => toast.success("Attendance records saved successfully!")} style={{ background: '#06b6d4', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            Save Changes
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Worker</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Time In</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Time Out</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '2px solid #e5e7eb', textAlign: 'center' }}>Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>
                    {item.name} <br/><span style={{fontSize: '0.75rem', color: '#6b7280'}}>{item.role}</span>
                  </td>
                  <td style={{ padding: '1rem', color: '#374151' }}><input type="time" defaultValue={item.timeIn !== '--:--' ? '07:00' : ''} style={{padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db'}} /></td>
                  <td style={{ padding: '1rem', color: '#374151' }}><input type="time" style={{padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db'}} /></td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: item.status === 'Present' ? '#dcfce7' : item.status === 'Leave' ? '#fef3c7' : '#fee2e2', color: item.status === 'Present' ? '#166534' : item.status === 'Leave' ? '#92400e' : '#991b1b', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <select defaultValue={item.status} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">Leave</option>
                      <option value="Half Day">Half Day</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
