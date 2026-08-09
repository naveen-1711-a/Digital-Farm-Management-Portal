import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaFileAlt, 
  FaLock, 
  FaCheckSquare,
  FaCheckCircle,
  FaUpload
} from 'react-icons/fa';

function FarmadminSignuppage() {
  const [formData, setFormData] = useState({
    // 1. Farm Information
    farmName: '',
    farmType: '',
    registrationNumber: '',
    farmAddress: '',
    state: '',
    district: '',
    pinCode: '',
    gpsLocation: '',
    farmEmail: '',
    farmPhone: '',
    
    // 2. Farm Owner Information
    ownerName: '',
    aadhaarNumber: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPhoto: null,

    // 3. Farm Details
    numberOfSheds: '',
    approxNumberOfAnimals: '',
    farmArea: '',
    internetAvailable: '',
    farmPhoto: null,

    // 4. Upload Documents
    aadhaarCard: null,
    scheduleOfProperty: null,

    // 5. Account Security
    password: '',
    confirmPassword: '',

    // 6. Declaration
    infoAccurate: false,
    agreeTerms: false,
    agreePrivacy: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Client-side password match check
    if (formData.password !== formData.confirmPassword) {
      setServerError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build multipart/form-data payload (required for file uploads)
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        body: payload, // Do NOT set Content-Type header — browser sets it with boundary
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Registration failed. Please try again.');
        return;
      }

      // Store token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Registration error:', err);
      setServerError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="contact-page">
        <section className="contact-grid-section" style={{ padding: '8rem 8%', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div className="contact-form-panel" style={{ maxWidth: '600px', width: '100%' }}>
             <div className="form-success-container animate-fade-in" style={{ background: '#fff', padding: '3rem', borderRadius: '1.5rem', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
               <div className="success-icon-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '4rem', color: 'var(--primary)' }}>
                 <FaCheckCircle />
               </div>
               <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Registration Successful!</h3>
               <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                 Thank you for registering <strong>{formData.farmName || 'your farm'}</strong>. 
                 Your application is currently under review by our administration team.
               </p>
               <button className="btn-outline" onClick={() => setIsSubmitted(false)}>
                 Register Another Farm
               </button>
             </div>
           </div>
        </section>
      </div>
    );
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-badge">
            <FaBuilding className="contact-badge-icon" />
            <span>Partner With Us</span>
          </div>
          <h1>
            Farm Owner <span className="highlight">Registration</span>
          </h1>
          <p>
            Digitize your farm operations by joining the FarmManager network. Complete the 
            registration form below to create your enterprise account.
          </p>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="contact-grid-section" style={{ paddingTop: '2rem' }}>
        <div className="contact-grid-wrapper" style={{ gridTemplateColumns: '1fr', maxWidth: '900px', margin: '0 auto' }}>
          
          <div className="contact-form-panel">
            <form onSubmit={handleSubmit}>
              {/* Server Error Banner */}
              {serverError && (
                <div style={{
                  background: '#fff0f0',
                  border: '1px solid #f87171',
                  color: '#b91c1c',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '0.75rem',
                  marginBottom: '1.5rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⚠️ {serverError}
                </div>
              )}
              
              <div className="contact-form-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--text-main)', textAlign: 'center' }}>Create Your Farm Account</h2>
                
                {/* Section 1: Farm Information */}
                
                <div className="form-group">
                  <label>Farm Name *</label>
                  <input type="text" name="farmName" value={formData.farmName} onChange={handleInputChange} className="form-input" placeholder="Enter farm name" required />
                </div>

                <div className="form-group">
                  <label>Farm Type *</label>
                  <select 
                    name="farmType" 
                    value={formData.farmType} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    required
                  >
                    <option value="" disabled>Select farm type</option>
                    <option value="Pig Farm">Pig Farm</option>
                    <option value="Poultry Farm">Poultry Farm</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label>Farm Registration Number *</label>
                    <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} className="form-input" placeholder="e.g. REG-123456" required />
                  </div>
                  <div className="form-group">
                    <label>GPS Location *</label>
                    <input type="text" name="gpsLocation" value={formData.gpsLocation} onChange={handleInputChange} className="form-input" placeholder="Latitude, Longitude" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Farm Address *</label>
                  <input type="text" name="farmAddress" value={formData.farmAddress} onChange={handleInputChange} className="form-input" placeholder="Street address, village, or town" required />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label>State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="form-input" placeholder="State" required />
                  </div>
                  <div className="form-group">
                    <label>District *</label>
                    <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="form-input" placeholder="District" required />
                  </div>
                  <div className="form-group">
                    <label>PIN Code *</label>
                    <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} className="form-input" placeholder="6-digit PIN" required />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label>Farm Email *</label>
                    <input type="email" name="farmEmail" value={formData.farmEmail} onChange={handleInputChange} className="form-input" placeholder="farm@example.com" required />
                  </div>
                  <div className="form-group">
                    <label>Farm Phone Number *</label>
                    <input type="tel" name="farmPhone" value={formData.farmPhone} onChange={handleInputChange} className="form-input" placeholder="+91" required />
                  </div>
                </div>
                <hr style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
                
                {/* Section 2: Farm Owner Information */}
                
                <div className="form-row-two">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="form-input" placeholder="Owner's full name" required />
                  </div>
                  <div className="form-group">
                    <label>Aadhaar Number *</label>
                    <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} className="form-input" placeholder="12-digit Aadhaar" required />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleInputChange} className="form-input" placeholder="owner@example.com" required />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleInputChange} className="form-input" placeholder="+91" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Owner Profile Photo <span style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>(Optional)</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                     <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaUpload /> Choose File
                        <input type="file" name="ownerPhoto" onChange={handleInputChange} style={{ display: 'none' }} accept="image/*" />
                     </label>
                     <span style={{ color: formData.ownerPhoto ? 'var(--primary)' : 'var(--text-muted)', fontWeight: formData.ownerPhoto ? '600' : '400' }}>
                       {formData.ownerPhoto ? `✅ ${formData.ownerPhoto.name}` : 'No file chosen'}
                     </span>
                  </div>
                </div>
                <hr style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Section 3: Farm Details */}

                <div className="form-row-two">
                  <div className="form-group">
                    <label>Number of Sheds *</label>
                    <input type="number" name="numberOfSheds" value={formData.numberOfSheds} onChange={handleInputChange} className="form-input" placeholder="e.g. 5" required />
                  </div>
                  <div className="form-group">
                    <label>Approx. Number of Animals/Birds *</label>
                    <input type="number" name="approxNumberOfAnimals" value={formData.approxNumberOfAnimals} onChange={handleInputChange} className="form-input" placeholder="e.g. 10000" required />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label>Farm Area (Acres/Hectares) *</label>
                    <input type="text" name="farmArea" value={formData.farmArea} onChange={handleInputChange} className="form-input" placeholder="e.g. 15 Acres" required />
                  </div>
                  <div className="form-group">
                    <label>Internet Available? *</label>
                    <select 
                      name="internetAvailable" 
                      value={formData.internetAvailable} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required
                    >
                      <option value="" disabled>Select option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Farm Photo <span style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>(Optional)</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                     <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaUpload /> Choose File
                        <input type="file" name="farmPhoto" onChange={handleInputChange} style={{ display: 'none' }} accept="image/*" />
                     </label>
                     <span style={{ color: formData.farmPhoto ? 'var(--primary)' : 'var(--text-muted)', fontWeight: formData.farmPhoto ? '600' : '400' }}>
                       {formData.farmPhoto ? `✅ ${formData.farmPhoto.name}` : 'No file chosen'}
                     </span>
                  </div>
                </div>
                <hr style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Section 4: Upload Documents */}

                <div className="form-group">
                  <label>Aadhaar Card (PDF/Image) <span style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>(Optional)</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                     <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaUpload /> Choose File
                        <input type="file" name="aadhaarCard" onChange={handleInputChange} style={{ display: 'none' }} accept=".pdf,image/*" />
                     </label>
                     <span style={{ color: formData.aadhaarCard ? 'var(--primary)' : 'var(--text-muted)', fontWeight: formData.aadhaarCard ? '600' : '400' }}>
                       {formData.aadhaarCard ? `✅ ${formData.aadhaarCard.name}` : 'No file chosen'}
                     </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Schedule of Property (Land Details PDF) <span style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>(Optional)</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                     <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaUpload /> Choose File
                        <input type="file" name="scheduleOfProperty" onChange={handleInputChange} style={{ display: 'none' }} accept=".pdf" />
                     </label>
                     <span style={{ color: formData.scheduleOfProperty ? 'var(--primary)' : 'var(--text-muted)', fontWeight: formData.scheduleOfProperty ? '600' : '400' }}>
                       {formData.scheduleOfProperty ? `✅ ${formData.scheduleOfProperty.name}` : 'No file chosen'}
                     </span>
                  </div>
                </div>
                <hr style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Section 5: Account Security */}

                <div className="form-row-two">
                  <div className="form-group">
                    <label>Password *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-input" placeholder="Create a strong password" required />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="form-input" placeholder="Re-enter password" required />
                  </div>
                </div>
                
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)', marginTop: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Password Requirements:</p>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                    <li>Minimum 8 characters</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                    <li>At least one special character</li>
                  </ul>
                </div>
                <hr style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Section 6: Declaration */}

                <div className="form-group-checkbox" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label className="checkbox-container">
                    <input type="checkbox" name="infoAccurate" checked={formData.infoAccurate} onChange={handleInputChange} required />
                    <span className="checkbox-checkmark"></span>
                    <span className="checkbox-label" style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      I confirm that all information provided is accurate.
                    </span>
                  </label>
                  <label className="checkbox-container">
                    <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleInputChange} required />
                    <span className="checkbox-checkmark"></span>
                    <span className="checkbox-label" style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      I agree to the Terms & Conditions.
                    </span>
                  </label>
                  <label className="checkbox-container">
                    <input type="checkbox" name="agreePrivacy" checked={formData.agreePrivacy} onChange={handleInputChange} required />
                    <span className="checkbox-checkmark"></span>
                    <span className="checkbox-label" style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      I agree to the Privacy Policy.
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                  <button 
                    type="submit" 
                    className="btn-primary large"
                    disabled={isSubmitting}
                    style={{ minWidth: '250px' }}
                  >
                  {isSubmitting ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
              </div>{/* end contact-form-card */}

            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FarmadminSignuppage;
