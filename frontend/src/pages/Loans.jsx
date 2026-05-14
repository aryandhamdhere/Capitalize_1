import React, { useState, useEffect } from 'react';
import { Lock, Zap, CheckCircle2 } from 'lucide-react';
import { loansData } from '../data/mockData';

const Loans = () => {
  const [activeTab, setActiveTab] = useState('All');
  const userScore = 73;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = ['All', 'Unlocked', 'Locked', 'Government Schemes', 'NBFC'];

  const filteredLoans = loansData.filter(loan => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unlocked') return !loan.locked;
    if (activeTab === 'Locked') return loan.locked;
    return loan.category === activeTab;
  });

  const unlockedCount = loansData.filter(l => !l.locked).length;

  const loansGridCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '24px' }}>

      {/* Score Gate Bar */}
      <div className="card" style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        padding: isMobile ? '1rem' : '1.5rem 2rem',
        backgroundColor: 'var(--color-navy)',
        color: 'white',
        gap: '1rem'
      }}>
        <div>
          <div className="text-meta" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
            Your Score: {userScore}/100
          </div>
          <div className="text-card-title" style={{ fontSize: '18px' }}>
            You qualify for {unlockedCount} out of {loansData.length} lending products
          </div>
        </div>
        <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }} className="text-meta mb-1">
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Progress to unlock all</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{Math.round((unlockedCount / loansData.length) * 100)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div className="pillar-bar-fill" style={{ width: `${(unlockedCount / loansData.length) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filter Tabs — horizontally scrollable on mobile */}
      <div className="filter-tabs" style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '0.5rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="filter-tab text-btn nav-item"
            style={{
              padding: '0.5rem 0.5rem',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-9px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              minHeight: '44px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loan Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: loansGridCols,
        gap: isMobile ? '12px' : '20px'
      }}>
        {filteredLoans.map(loan => (
          <div
            key={loan.id}
            className="card metric-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: loan.locked ? '1px solid var(--color-border)' : '1px solid var(--color-primary)',
              opacity: loan.locked ? 0.7 : 1,
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {/* Badge */}
            <div className="locked-badge" style={{ position: 'absolute', top: '12px', right: '12px', maxWidth: 'calc(100% - 24px)', zIndex: 2 }}>
              {loan.locked ? (
                <span className="badge badge-danger text-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Score {loan.reqScore}+ Required</span>
                </span>
              ) : (
                <span className="badge badge-success text-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Eligible
                </span>
              )}
            </div>

            <div style={{ marginTop: loan.locked ? '24px' : '0' }}>
              <div className="text-meta mb-1">{loan.provider}</div>
              <h3 className="text-card-title mb-4" style={{ fontSize: '18px' }}>{loan.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }} className="text-body">
                  <span className="text-meta">Amount</span>
                  <span style={{ fontWeight: '500' }}>{loan.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }} className="text-body">
                  <span className="text-meta">Interest Rate</span>
                  <span style={{ fontWeight: '500' }}>{loan.rate}</span>
                </div>
                {loan.details && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }} className="text-body">
                    <span className="text-meta">Key Feature</span>
                    <span style={{ fontWeight: '500', textAlign: 'right' }}>{loan.details}</span>
                  </div>
                )}
              </div>
            </div>

            {loan.locked ? (
              <button className="text-primary text-btn" style={{ padding: '0.5rem 0', textAlign: 'left' }}>
                How to unlock →
              </button>
            ) : (
              <button className="btn-primary text-btn w-full">
                {loan.provider.includes('Govt') ? 'Check Eligibility' : 'Apply Now'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Banner */}
      <div className="card" style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)', padding: isMobile ? '1rem' : '1.5rem 2rem', marginTop: '1rem' }}>
        <div className="loan-bottom-banner" style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '1rem',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary)', borderRadius: '50%', color: 'white', flexShrink: 0, alignSelf: isMobile ? 'center' : 'auto' }}>
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-card-title mb-1" style={{ color: 'var(--color-navy)' }}>Pre-underwritten profile ready for lenders</h3>
            <p className="text-meta" style={{ color: 'var(--color-text-main)' }}>Your Capitalize report eliminates lender underwriting cost. Approved faster.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Loans;
