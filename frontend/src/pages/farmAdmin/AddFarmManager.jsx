import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
  FaUserPlus, FaUserTie, FaEnvelope, FaPhone, FaLock, 
  FaIdBadge, FaVenusMars, FaCalendarAlt, FaCamera, FaAddressCard, 
  FaBriefcase, FaBuilding, FaClock, FaMapMarkerAlt, FaShieldAlt, 
  FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';

const AddFarmManager = () => {
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    employeeId: `EMP-${Math.floor(Math.random() * 90000) + 10000}`,
    gender: '',
    dob: '',
    aadhaarNumber: '',
    email: '',
    phone: '',
    emergencyContact: '',
    
    // Employment Info
    designation: 'Farm Manager',
    joiningDate: '',
    employmentType: 'Full-Time',
    assignedSheds: [],
    shift: 'General',
    
    // Address Info
    address: '',
    state: '',
    district: '',
    pinCode: '',
    
    // Account Info
    username: '',
    accountEmail: '',
    password: '',
    confirmPassword: '',
    
    // Permissions
    permissions: {
      animalManagement: true,
      vaccinationManagement: true,
      feedInventory: true,
      medicineInventory: true,
      workerManagement: true,
      attendanceManagement: true,
      taskAssignment: true,
      diseaseMonitoring: true,
      biosecurityManagement: true,
      viewReports: true
    },
    
    // Status & Declaration
    status: 'Active',
    declaration: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name.startsWith('perm_')) {
      const permName = name.replace('perm_', '');
      setFormData({
        ...formData,
        permissions: { ...formData.permissions, [permName]: checked }
      });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleShedChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, assignedSheds: value });
  };

  const validatePassword = (pwd) => {
    // Relaxed validation: just check for at least 8 characters.
    return pwd.length >= 8;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdManagerEmail, setCreatedManagerEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!validatePassword(formData.password)) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (!formData.declaration) {
      toast.error("You must confirm the declaration before submitting.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating Farm Manager account...');

    try {
      const res = await api.post('/farm-dashboard/managers', formData);

      if (res.data.success) {
        toast.success(res.data.message || 'Farm Manager created successfully!', { id: toastId });
        setCreatedManagerEmail(formData.accountEmail);
        setIsSuccess(true);
      } else {
        toast.error(res.data.message || 'Failed to create manager.', { id: toastId });
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create Farm Manager. Please check your connection.';
      toast.error(msg, { id: toastId });
      console.error('Create Manager Error:', error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc' };
  const iconStyle = { position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#94a3b8' };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155', fontSize: '0.9rem' };
  const cardStyle = { padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2rem' };
  const sectionTitleStyle = { fontSize: '1.25rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>
          <FaUserPlus size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Add Farm Manager</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '1rem' }}>Create a new Farm Manager account to oversee daily farm operations.</p>
        </div>
      </div>

      {isSuccess ? (
        <div className="glass-card" style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', marginBottom: '1.5rem' }}>
            <FaCheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '1rem' }}>Manager Successfully Created!</h2>
          <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            The Farm Manager account for <strong>{createdManagerEmail}</strong> has been successfully set up and is now active. They can log in immediately using their email address and the password you provided.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button 
              onClick={() => {
                setFormData({
                  fullName: '', employeeId: `EMP-${Math.floor(Math.random() * 90000) + 10000}`,
                  gender: '', dob: '', aadhaarNumber: '', email: '', phone: '', emergencyContact: '',
                  designation: 'Farm Manager', joiningDate: '', employmentType: 'Full-Time', assignedSheds: [], shift: 'General',
                  address: '', state: '', district: '', pinCode: '', username: '', accountEmail: '', password: '', confirmPassword: '',
                  permissions: { animalManagement: true, vaccinationManagement: true, feedInventory: true, medicineInventory: true, workerManagement: true, attendanceManagement: true, taskAssignment: true, diseaseMonitoring: true, biosecurityManagement: true, viewReports: true },
                  status: 'Active', declaration: false
                });
                setIsSuccess(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ padding: '0.875rem 2rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--primary)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <FaUserPlus /> Add Another Manager
            </button>
          </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit} noValidate>
        
        {/* Personal Information */}
        <div className="glass-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}><FaUserTie color="var(--primary)" /> Personal Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <FaUserTie style={iconStyle} />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Full Name" style={inputStyle} />
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>Employee ID</label>
              <div style={{ position: 'relative' }}>
                <FaIdBadge style={iconStyle} />
                <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="Auto-generated or Manual" style={inputStyle} />
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>Gender *</label>
              <div style={{ position: 'relative' }}>
                <FaVenusMars style={iconStyle} />
                <select name="gender" value={formData.gender} onChange={handleChange} required style={{...inputStyle, appearance: 'none'}}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <div style={{ position: 'relative' }}>
                <FaCalendarAlt style={iconStyle} />
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Profile Photo *</label>
              <div style={{ position: 'relative' }}>
                <FaCamera style={iconStyle} />
                <input type="file" name="profilePhoto" accept="image/*" style={{...inputStyle, paddingLeft: '2.5rem'}} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Aadhaar Number *</label>
              <div style={{ position: 'relative' }}>
                <FaAddressCard style={iconStyle} />
                <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required placeholder="12-digit Aadhaar Number" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={iconStyle} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email Address" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <FaPhone style={iconStyle} />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone Number" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Emergency Contact *</label>
              <div style={{ position: 'relative' }}>
                <FaPhone style={{...iconStyle, color: '#ef4444'}} />
                <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required placeholder="Emergency Contact" style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="glass-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}><FaBriefcase color="var(--primary)" /> Employment Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Designation</label>
              <div style={{ position: 'relative' }}>
                <FaBriefcase style={iconStyle} />
                <input type="text" value="Farm Manager" disabled style={{...inputStyle, backgroundColor: '#e2e8f0', color: '#64748b'}} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Date of Joining *</label>
              <div style={{ position: 'relative' }}>
                <FaCalendarAlt style={iconStyle} />
                <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Employment Type *</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                {['Full-Time', 'Part-Time', 'Contract'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="employmentType" value={type} checked={formData.employmentType === type} onChange={handleChange} style={{ accentColor: 'var(--primary)' }} />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Assigned Farm</label>
              <div style={{ position: 'relative' }}>
                <FaBuilding style={iconStyle} />
                <input type="text" value="Auto-filled (Current Farm)" disabled style={{...inputStyle, backgroundColor: '#e2e8f0', color: '#64748b'}} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Assigned Sheds (Multiple Select)</label>
              <select multiple name="assignedSheds" value={formData.assignedSheds} onChange={handleShedChange} style={{...inputStyle, padding: '0.75rem', height: '100px'}}>
                <option value="Shed 1">Shed 1</option>
                <option value="Shed 2">Shed 2</option>
                <option value="Shed 3">Shed 3</option>
                <option value="Shed 4">Shed 4</option>
              </select>
              <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</small>
            </div>

            <div>
              <label style={labelStyle}>Shift *</label>
              <div style={{ position: 'relative' }}>
                <FaClock style={iconStyle} />
                <select name="shift" value={formData.shift} onChange={handleChange} required style={{...inputStyle, appearance: 'none'}}>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="glass-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}><FaMapMarkerAlt color="var(--primary)" /> Address Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Address *</label>
              <div style={{ position: 'relative' }}>
                <FaMapMarkerAlt style={{...iconStyle, top: '1.5rem'}} />
                <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" placeholder="Full Address" style={{...inputStyle, paddingLeft: '2.5rem', resize: 'vertical'}} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>State *</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="State" style={{...inputStyle, paddingLeft: '1rem'}} />
            </div>

            <div>
              <label style={labelStyle}>District *</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} required placeholder="District" style={{...inputStyle, paddingLeft: '1rem'}} />
            </div>

            <div>
              <label style={labelStyle}>PIN Code *</label>
              <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} required placeholder="PIN Code" style={{...inputStyle, paddingLeft: '1rem'}} />
            </div>
          </div>
        </div>

        {/* Account Information & Security */}
        <div className="glass-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}><FaShieldAlt color="var(--primary)" /> Account Information & Security</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Username (Optional)</label>
              <div style={{ position: 'relative' }}>
                <FaUserTie style={iconStyle} />
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Account Email *</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={iconStyle} />
                <input type="email" name="accountEmail" value={formData.accountEmail} onChange={handleChange} required placeholder="Login Email" style={inputStyle} />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <FaExclamationCircle color="#3b82f6" style={{ marginTop: '0.2rem' }} />
                <div style={{ fontSize: '0.85rem', color: '#1e3a8a' }}>
                  <strong>Password Requirements:</strong> Minimum 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={iconStyle} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create Password" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={iconStyle} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm Password" style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Permissions & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          
          <div className="glass-card" style={{ ...cardStyle, marginBottom: 0 }}>
            <h3 style={sectionTitleStyle}><FaCheckCircle color="var(--primary)" /> Manager Permissions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {Object.entries(formData.permissions).map(([key, value]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                  <input type="checkbox" name={`perm_${key}`} checked={value} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card" style={{ ...cardStyle, marginBottom: 0 }}>
              <h3 style={sectionTitleStyle}>Account Status</h3>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {['Active', 'Inactive'].map(status => (
                  <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', color: formData.status === status ? 'var(--primary)' : '#64748b' }}>
                    <input type="radio" name="status" value={status} checked={formData.status === status} onChange={handleChange} style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }} />
                    {status}
                  </label>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ ...cardStyle, marginBottom: 0, border: '1px solid #86efac', background: '#f0fdf4' }}>
              <h3 style={{...sectionTitleStyle, color: '#166534', borderBottomColor: '#bbf7d0'}}>Declaration</h3>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#166534', fontWeight: '500' }}>
                <input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleChange} required style={{ width: '20px', height: '20px', accentColor: '#166534', marginTop: '2px' }} />
                I confirm that the above information is correct and I authorize the creation of this managerial account.
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '2rem', marginBottom: '4rem' }}>
          <button type="button" style={{ padding: '0.875rem 2rem', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
            Cancel
          </button>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: '0.875rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
            Clear
          </button>
          <button type="submit" disabled={isSubmitting} style={{ padding: '0.875rem 2.5rem', borderRadius: '8px', border: 'none', background: isSubmitting ? '#a7f3d0' : 'var(--primary)', color: 'white', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)', transition: 'all 0.2s', opacity: isSubmitting ? 0.8 : 1 }}>
            <FaUserPlus /> {isSubmitting ? 'Creating...' : 'Create Manager'}
          </button>
        </div>

      </form>
      )}
    </div>
  );
};

export default AddFarmManager;
