import React, { useState, useEffect } from 'react';
import { Lock, Zap, CheckCircle2 } from 'lucide-react';
import { loansData } from '../data/mockData';

const Loans = () => {
  const [activeTab, setActiveTab] = useState('All');
  const userScore = 73;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
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

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      
      {/* Top Section: Score Gate Bar */}
      <div className="card flex items-center justify-between" style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--color-navy)', color: 'white', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="text-meta" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>Your Score: {userScore}/100</div>
          <div className="text-card-title" style={{ fontSize: '18px' }}>You qualify for {unlockedCount} out of {loansData.length} lending products</div>
        </div>
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <div className="flex justify-between text-meta mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span>Progress to unlock all</span>
            <span>{Math.round((unlockedCount/loansData.length)*100)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div className="pillar-bar-fill" style={{ width: `${(unlockedCount/loansData.length)*100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="text-btn nav-item"
            style={{ 
              padding: '0.5rem 0.5rem', 
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-9px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loan Cards Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredLoans.map(loan => (
          <div 
            key={loan.id} 
            className="card flex-col justify-between metric-card" 
            style={{ 
              display: 'flex',
              border: loan.locked ? '1px solid var(--color-border)' : '1px solid var(--color-primary)',
              opacity: loan.locked ? 0.7 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Badge */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', maxWidth: 'calc(100% - 24px)', zIndex: 10 }}>
              {loan.locked ? (
                <span className="badge badge-danger text-badge flex items-center gap-1"><Lock size={12} flexShrink={0} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Score {loan.reqScore}+ Required</span></span>
              ) : (
                <span className="badge badge-success text-badge flex items-center gap-1"><CheckCircle2 size={12} /> Eligible</span>
              )}
            </div>

            <div style={{ marginTop: loan.locked ? '24px' : '0' }}>
              <div className="text-meta mb-1">{loan.provider}</div>
              <h3 className="text-card-title mb-4" style={{ fontSize: '18px' }}>{loan.name}</h3>
              
              <div className="flex-col gap-2 mb-6" style={{ display: 'flex' }}>
                <div className="flex justify-between text-body">
                  <span className="text-meta">Amount</span>
                  <span style={{ fontWeight: '500' }}>{loan.amount}</span>
                </div>
                <div className="flex justify-between text-body">
                  <span className="text-meta">Interest Rate</span>
                  <span style={{ fontWeight: '500' }}>{loan.rate}</span>
                </div>
                {loan.details && (
                  <div className="flex justify-between text-body">
                    <span className="text-meta">Key Feature</span>
                    <span style={{ fontWeight: '500', textAlign: 'right' }}>{loan.details}</span>
                  </div>
                )}
              </div>
            </div>

            {loan.locked ? (
              <button className="text-primary text-btn hover:underline text-left" style={{ padding: '0.5rem 0' }}>
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
      <div className="card" style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)', padding: '1.5rem 2rem', marginTop: '1rem' }}>
        <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'} gap-4`}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary)', borderRadius: '50%', color: 'white', flexShrink: 0 }}>
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
