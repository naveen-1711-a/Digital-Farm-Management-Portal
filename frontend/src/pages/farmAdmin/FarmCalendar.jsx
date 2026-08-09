import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaChevronLeft, FaChevronRight, FaTimes, FaSyringe, FaTruck, FaUserMd, FaWrench, FaClipboardList } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const FarmCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', type: 'General', description: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/calendar');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Event Title is required');
      return;
    }
    if (!formData.date) {
      toast.error('Event Date is required');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/calendar', {
        title: formData.title.trim(),
        date: formData.date,       // YYYY-MM-DD format from <input type="date">
        type: formData.type,
        description: formData.description.trim()
      });
      if (res.data.success) {
        toast.success('✅ Event saved to MongoDB!');
        setIsModalOpen(false);
        setFormData({ title: '', date: '', type: 'General', description: '' });
        fetchEvents();
      }
    } catch (err) {
      console.error('Add event error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save event.');
      }
    } finally {
      setSaving(false);
    }
  };


  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await api.delete(`/calendar/${id}`);
      if (res.data.success) {
        toast.success('Event deleted');
        fetchEvents();
      }
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  // Calendar logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Helper to format Date for comparison
  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const getEventIcon = (type) => {
    switch (type) {
      case 'Vaccination': return <FaSyringe />;
      case 'Feed Delivery': return <FaTruck />;
      case 'Vet Visit': return <FaUserMd />;
      case 'Maintenance': return <FaWrench />;
      default: return <FaClipboardList />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'Vaccination': return { bg: '#ecfdf5', border: '#34d399', text: '#059669' };
      case 'Feed Delivery': return { bg: '#fffbeb', border: '#fbbf24', text: '#d97706' };
      case 'Vet Visit': return { bg: '#eff6ff', border: '#60a5fa', text: '#2563eb' };
      case 'Maintenance': return { bg: '#fef2f2', border: '#f87171', text: '#dc2626' };
      default: return { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' };
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>
            <FaCalendarAlt size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Farm Schedule</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '1rem' }}>Manage operations, vet visits, and daily activities.</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
          <FaPlus /> Add Event
        </button>
      </div>

      <div className="glass-card" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '2rem' }}>
        
        {/* Calendar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', fontWeight: '800' }}>
            {monthNames[month]} {year}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={prevMonth} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', color: '#475569' }}><FaChevronLeft /></button>
            <button onClick={() => setCurrentDate(new Date())} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', color: '#0f172a', fontWeight: '600' }}>Today</button>
            <button onClick={nextMonth} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', color: '#475569' }}><FaChevronRight /></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {dayNames.map(day => (
            <div key={day} style={{ textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '2px solid #f1f5f9' }}>
              {day}
            </div>
          ))}

          {/* Empty slots for previous month */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: '120px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}></div>
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const currentCellDate = new Date(year, month, dayNum);
            const isToday = isSameDay(currentCellDate, new Date());
            
            // Get events for this day
            const dayEvents = events.filter(ev => isSameDay(new Date(ev.date), currentCellDate));

            return (
              <div key={dayNum} style={{ minHeight: '120px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', background: isToday ? '#f0fdf4' : 'white', transition: 'border-color 0.2s', ':hover': { borderColor: '#cbd5e1' } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: isToday ? '800' : '600', color: isToday ? '#166534' : '#1e293b', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: isToday ? '#bbf7d0' : 'transparent' }}>
                    {dayNum}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {dayEvents.map(ev => {
                    const colors = getEventColor(ev.type);
                    return (
                      <div key={ev._id} style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', borderRadius: '4px', background: colors.bg, borderLeft: `3px solid ${colors.border}`, color: colors.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem' }} title={ev.description}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {getEventIcon(ev.type)}
                          <span style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</span>
                        </div>
                        <FaTimes style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => handleDeleteEvent(ev._id)} title="Delete Event" />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Add Schedule Event</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem' }}><FaTimes /></button>
            </div>
            
            <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Event Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Weekly Vaccination" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Date *</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Event Type *</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                    <option value="General">General</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Feed Delivery">Feed Delivery</option>
                    <option value="Vet Visit">Vet Visit</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" placeholder="Optional details..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: saving ? '#6ee7b7' : 'var(--primary)', color: 'white', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmCalendar;
