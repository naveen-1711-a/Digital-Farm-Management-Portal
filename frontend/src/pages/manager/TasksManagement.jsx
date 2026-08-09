import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaPlus, FaCheck, FaTimes, FaCamera, FaHistory, FaQrcode, FaEdit, FaTrash, FaCalendarAlt, FaUserAlt, FaExclamationCircle, FaPlay, FaSearch, FaWrench, FaSyringe, FaSeedling, FaTruck, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const TasksManagement = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [tasks, setTasks] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTask, setViewTask] = useState(null);

  const [formData, setFormData] = useState({
    title: '', desc: '', assignee: '', shed: '', category: 'Maintenance', priority: 'Medium', status: 'Pending', startDate: '', dueDate: '', estTime: ''
  });

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks');
      const formattedTasks = res.data.data.map(t => ({
        ...t,
        startDate: t.startDate ? t.startDate.split('T')[0] : '',
        dueDate: t.dueDate ? t.dueDate.split('T')[0] : ''
      }));
      setTasks(formattedTasks);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks from server.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/tasks/${editingId}`, formData);
        toast.success("Task updated successfully!");
      } else {
        await axios.post('http://localhost:5000/api/tasks', formData);
        toast.success("New task assigned successfully!");
      }
      fetchTasks();
      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      toast.error('Error saving task');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, { status: newStatus });
      toast.success(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (err) {
      toast.error('Error updating status');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${id}`);
        toast.error('Task Deleted');
        fetchTasks();
      } catch (err) {
        toast.error('Error deleting task');
        console.error(err);
      }
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return { bg: '#fee2e2', text: '#991b1b' };
      case 'High': return { bg: '#ffedd5', text: '#9a3412' };
      case 'Medium': return { bg: '#fef3c7', text: '#92400e' };
      case 'Low': return { bg: '#f3f4f6', text: '#4b5563' };
      default: return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#dcfce7', text: '#166534', border: '#86efac', iconColor: '#16a34a' };
      case 'In Progress': return { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc', iconColor: '#0284c7' };
      case 'Pending': return { bg: '#fef3c7', text: '#92400e', border: '#fde047', iconColor: '#ca8a04' };
      case 'Overdue': return { bg: '#ffe4e6', text: '#e11d48', border: '#fda4af', iconColor: '#e11d48' }; // Rose/Red for overdue
      case 'On Hold': return { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db', iconColor: '#6b7280' };
      case 'Cancelled': return { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4', iconColor: '#db2777' };
      default: return { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db', iconColor: '#6b7280' };
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Health': return <FaSyringe />;
      case 'Maintenance': return <FaClipboardList />;
      case 'Repair': return <FaWrench />;
      case 'Feeding': return <FaSeedling />;
      case 'Logistics': return <FaTruck />;
      default: return <FaClipboardList />;
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (activeFilter !== 'All' && t.status !== activeFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase()) && !t.assignee.toLowerCase().includes(searchTerm.toLowerCase()) && !(t._id || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>
        {`
          .task-card-animated {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .task-card-animated:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 24px -6px rgba(27, 223, 27, 0.25), 0 0 0 1px #1f7529ff !important;
            border-color: #2cef1aff !important;
          }
        `}
      </style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaClipboardList style={{ color: '#14b8a6' }} /> Task Management
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Assign tasks, track deadlines, and monitor farm operations.</p>
        </div>
        <button onClick={() => {
          setIsEditing(false);
          setEditingId(null);
          setFormData({ title: '', desc: '', assignee: '', shed: '', category: 'Maintenance', priority: 'Medium', status: 'Pending', startDate: '', dueDate: '', estTime: '' });
          setShowModal(true);
        }} style={{ background: '#14b8a6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(20, 184, 166, 0.2)' }}>
          <FaPlus /> Create Task
        </button>
      </div>

      {/* Advanced Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ 
          flex: '1 1 300px', 
          position: 'relative', 
          background: 'linear-gradient(135deg, #fff, #f8fafc)',
          borderRadius: '999px',
          padding: '4px',
          boxShadow: '0 4px 15px rgba(20, 184, 166, 0.15)',
          border: '1px solid rgba(20, 184, 166, 0.3)',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ width: '40px', height: '40px', background: '#14b8a6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <FaSearch />
          </div>
          <input 
            type="text" 
            placeholder="Search tasks, assignees, or IDs..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ width: '100%', padding: '0.6rem 1.2rem', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.95rem', color: '#1f2937', fontWeight: '500' }} 
            onFocus={(e) => e.currentTarget.parentElement.style.border = '1px solid #14b8a6'}
            onBlur={(e) => e.currentTarget.parentElement.style.border = '1px solid rgba(20, 184, 166, 0.3)'}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <span style={{ padding: '0.5rem', fontWeight: 'bold', color: '#6b7280', fontSize: '0.85rem' }}>Status:</span>
          {['All', 'Pending', 'In Progress', 'Completed', 'Overdue', 'On Hold'].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ background: activeFilter === f ? '#14b8a6' : 'transparent', color: activeFilter === f ? 'white' : '#4b5563', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              {f} {f === 'Overdue' && <FaExclamationCircle style={{ marginLeft: '0.3rem', color: activeFilter === f ? 'white' : '#ef4444' }} />}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <span style={{ padding: '0.5rem', fontWeight: 'bold', color: '#6b7280', fontSize: '0.85rem' }}>Priority:</span>
          {['All', 'Low', 'Medium', 'High', 'Critical'].map(f => (
            <button key={f} onClick={() => setPriorityFilter(f)} style={{ background: priorityFilter === f ? '#4b5563' : 'transparent', color: priorityFilter === f ? 'white' : '#4b5563', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Card Grid matching the exact design */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filteredTasks.map((task, i) => {
          const isOverdue = task.status === 'Overdue';
          const pColor = getPriorityColor(task.priority);
          const sColor = getStatusColor(task.status);

          return (
            <div key={i} className="task-card-animated" style={{
              background: 'white',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              border: '1px solid #10b981',
              boxShadow: '0 2px 4px 0 rgba(16, 185, 129, 0.05)',
              display: 'flex', flexDirection: 'column', gap: '0.8rem',
              position: 'relative', overflow: 'hidden',
            }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  {getCategoryIcon(task.category)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <span style={{ background: pColor.bg, color: pColor.text, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px' }}>{task.priority.toUpperCase()}</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600' }}>{task._id ? `T-${task._id.slice(-5).toUpperCase()}` : 'NEW'}</span>
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', color: '#111827', fontWeight: '700', letterSpacing: '-0.3px' }}>{task.title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5', flexGrow: 1 }}>{task.desc}</p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ flex: '1 1 45%', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563' }}>
                  <FaUserAlt color={sColor.iconColor} style={{ opacity: 0.7 }} /> <strong>{task.assignee}</strong>
                </div>
                <div style={{ flex: '1 1 45%', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: isOverdue ? '#e11d48' : '#4b5563' }}>
                  <FaCalendarAlt color={isOverdue ? '#e11d48' : sColor.iconColor} style={{ opacity: 0.7 }} /> <strong>{task.dueDate}</strong>
                </div>
                <div style={{ flex: '1 1 100%', fontSize: '0.8rem', color: '#9ca3af' }}>
                  Location: <strong>{task.shed}</strong> • Est: <strong>{task.estTime}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ background: sColor.bg, color: sColor.iconColor, padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem', border: `1px solid ${sColor.border}` }}>
                  {task.status === 'Completed' && <FaCheck />}
                  {task.status === 'Overdue' && <FaExclamationCircle />}
                  {task.status}
                </span>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {task.status !== 'Completed' && (
                    <button onClick={() => handleUpdateStatus(task._id, 'In Progress')} title="Start" style={{ background: '#e0f2fe', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#0369a1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaPlay /></button>
                  )}
                  {task.status !== 'Completed' && (
                    <button onClick={() => handleUpdateStatus(task._id, 'Completed')} title="Mark Done" style={{ background: '#dcfce7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#166534', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaCheck /></button>
                  )}
                  <button onClick={() => { setViewTask(task); setShowViewModal(true); }} title="View" style={{ background: '#f3f4f6', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#4b5563', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaEye /></button>
                  <button onClick={() => { setFormData(task); setEditingId(task._id); setIsEditing(true); setShowModal(true); }} title="Edit" style={{ background: '#fef3c7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#d97706', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaEdit /></button>
                  <button onClick={() => handleDelete(task._id)} title="Delete" style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '700px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{isEditing ? '✏️ Edit Task' : '📋 Create New Task'}</h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Task Title *</label>
                  <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Repair Shed Roof" required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Description</label>
                  <textarea style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '80px', fontFamily: 'inherit' }} value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} placeholder="Provide detailed instructions..." />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Assign To *</label>
                  <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.assignee} onChange={e => setFormData({ ...formData, assignee: e.target.value })} placeholder="e.g. John Doe" required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Shed / Location</label>
                  <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.shed} onChange={e => setFormData({ ...formData, shed: e.target.value })} placeholder="e.g. Shed 1" />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Category</label>
                  <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Health">Health</option>
                    <option value="Feeding">Feeding</option>
                    <option value="Repair">Repair</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Priority</label>
                  <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Start Date</label>
                  <input type="date" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Due Date *</label>
                  <input type="date" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} required />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Status</label>
                  <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Estimated Time</label>
                  <input style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={formData.estTime} onChange={e => setFormData({ ...formData, estTime: e.target.value })} placeholder="e.g. 2 hrs" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '0.8rem', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{isEditing ? 'Update Task' : 'Assign Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {showViewModal && viewTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '600px', maxWidth: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>🔍 Task Details</h3>
              <button type="button" onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
               <div style={{ gridColumn: 'span 2' }}>
                 <strong>Title:</strong> <p style={{ margin: '0.2rem 0', color: '#4b5563' }}>{viewTask.title}</p>
               </div>
               <div style={{ gridColumn: 'span 2' }}>
                 <strong>Description:</strong> <p style={{ margin: '0.2rem 0', color: '#4b5563' }}>{viewTask.desc}</p>
               </div>
               <div><strong>Assignee:</strong> <span style={{ color: '#4b5563', display: 'block', marginTop: '0.2rem' }}>{viewTask.assignee}</span></div>
               <div><strong>Location/Shed:</strong> <span style={{ color: '#4b5563', display: 'block', marginTop: '0.2rem' }}>{viewTask.shed}</span></div>
               <div><strong>Category:</strong> <span style={{ color: '#4b5563', display: 'block', marginTop: '0.2rem' }}>{viewTask.category}</span></div>
               <div><strong>Priority:</strong> <span style={{ color: '#4b5563', display: 'block', marginTop: '0.2rem' }}>{viewTask.priority}</span></div>
               <div><strong>Start Date:</strong> <span style={{ color: '#4b5563', display: 'block', marginTop: '0.2rem' }}>{viewTask.startDate}</span></div>
               <div><strong>Due Date:</strong> <span style={{ color: '#4b5563', display: 'block', marginTop: '0.2rem' }}>{viewTask.dueDate}</span></div>
               <div><strong>Status:</strong> <span style={{ color: '#4b5563', display: 'block', marginTop: '0.2rem' }}>{viewTask.status}</span></div>
               <div><strong>Est. Time:</strong> <span style={{ color: '#4b5563', display: 'block', marginTop: '0.2rem' }}>{viewTask.estTime}</span></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowViewModal(false)} style={{ padding: '0.8rem 1.5rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksManagement;
