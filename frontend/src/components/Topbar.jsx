import React, { useState } from 'react';
import { Search, Bell, Download, Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname) => {
  switch (pathname) {
    case '/dashboard': return { title: 'Dashboard', subtitle: 'Track your financial health and AI insights' };
    case '/score': return { title: 'Credit Score', subtitle: 'Your credit readiness breakdown' };
    case '/transactions': return { title: 'Transactions', subtitle: 'Explore your processed bank data' };
    case '/loans': return { title: 'Loan Marketplace', subtitle: 'Pre-approved offers based on your score' };
    case '/digest': return { title: 'Weekly Digest', subtitle: 'Auto-generated intelligence report' };
    default: return { title: 'Capitalize', subtitle: 'AI CFO' };
  }
};

const Topbar = ({ isMobile, setIsSidebarOpen }) => {
  const location = useLocation();
  const { title, subtitle } = getPageTitle(location.pathname);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="topbar">
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 1rem' : '0 2rem' }}>
        
        {isMobile ? (
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} style={{ color: 'var(--color-text-main)', padding: '8px' }}>
              <Menu size={24} />
            </button>
            <h1 className="text-page-title" style={{ fontSize: '18px' }}>Capitalize</h1>
          </div>
        ) : (
          <div>
            <h1 className="text-page-title">{title}</h1>
            <p className="text-topbar-subtitle">{subtitle}</p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1.5rem' }}>
          
          {/* Search */}
          {isMobile ? (
            <button onClick={() => setShowMobileSearch(true)} style={{ color: 'var(--color-text-main)', padding: '8px' }}>
              <Search size={20} />
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search transactions, insights..." 
                className="text-body"
                style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', width: '300px' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>
            <button style={{ position: 'relative', color: 'var(--color-text-main)', padding: '8px' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', backgroundColor: 'var(--color-danger)', borderRadius: '50%' }}></span>
            </button>
            
            {isMobile ? (
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                RS
              </div>
            ) : (
              <button className="btn-primary text-btn">
                <Download size={16} /> Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown Overlay */}
      <div 
        style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, padding: '12px', backgroundColor: 'white', 
          borderBottom: '1px solid var(--color-border)', zIndex: 10,
          transform: showMobileSearch ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 250ms ease',
          pointerEvents: showMobileSearch ? 'auto' : 'none',
          boxShadow: showMobileSearch ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="text-body"
            style={{ flex: 1, padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
          />
          <button onClick={() => setShowMobileSearch(false)} className="btn-outline">
            <X size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
