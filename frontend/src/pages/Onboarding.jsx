import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldCheck, Lock, Eye, CheckCircle } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '1rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>C</div>
          <h1 className="text-page-title" style={{ color: 'var(--color-navy)', fontSize: '28px' }}>Capitalize</h1>
        </div>
        <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>AI-powered credit intelligence for your business</p>
      </div>

      <div className="card page-enter-active" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '2rem 16px' }}>
        <h2 className="text-page-title" style={{ marginBottom: '0.5rem' }}>Know your credit score in 3 minutes</h2>
        <p className="text-body" style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Upload your bank statement. No accounting knowledge needed.</p>

        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{ 
            border: '2px dashed var(--color-primary)', 
            borderRadius: '12px', 
            padding: '2rem 1.5rem',
            minHeight: '160px',
            backgroundColor: 'var(--color-primary-light)', 
            marginBottom: '2rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input type="file" id="file-upload" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
          
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle size={48} color="var(--color-success)" />
              <div>
                <p className="text-body" style={{ fontWeight: '600' }}>{file.name}</p>
                <p className="text-meta">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <FileText size={48} color="var(--color-primary)" />
              <div>
                <p className="text-body" style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Drag & drop your bank statement CSV</p>
                <p className="text-meta" style={{ marginTop: '0.25rem' }}>or click to browse</p>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-meta">
            <ShieldCheck size={18} color="var(--color-success)" flexShrink={0} /> <span>Bank-grade security</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-meta">
            <Lock size={18} color="var(--color-success)" flexShrink={0} /> <span>Your data is never shared</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-meta">
            <Eye size={18} color="var(--color-success)" flexShrink={0} /> <span>Processed locally, not stored permanently</span>
          </div>
        </div>

        <button 
          className="btn-primary text-btn" 
          style={{ width: '100%', padding: '1rem' }}
          onClick={() => navigate('/dashboard')}
        >
          Analyse My Financials →
        </button>

        <p className="text-meta" style={{ marginTop: '1.5rem' }}>
          87.4% of Indian MSMEs lack formal credit access. Capitalize changes that.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
