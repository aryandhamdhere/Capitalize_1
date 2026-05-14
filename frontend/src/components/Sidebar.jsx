import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BadgeCheck, ArrowLeftRight, Landmark, Newspaper, BotMessageSquare, Settings, Upload, LogOut, X } from 'lucide-react';
import { businessData } from '../data/mockData';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, isMobile }) => {
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
  const isCollapsed = isTablet && !isMobile;
  
  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ padding: isCollapsed ? '1.5rem 0.5rem' : '1.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
      
      {/* Mobile Close Button */}
      {isMobile && (
        <button 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'rgba(255,255,255,0.7)', padding: '8px' }}
        >
          <X size={24} />
        </button>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: isCollapsed ? '0' : '1rem' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>C</div>
          {!isCollapsed && <h1 className="text-page-title" style={{ fontSize: '1.25rem', color: 'white' }}>Capitalize</h1>}
        </div>
        {!isCollapsed && (
          <div className="text-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {businessData.name}
            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-success)', borderRadius: '50%', display: 'inline-block' }}></span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '8px' }}>
        <NavSection title="Main" isCollapsed={isCollapsed}>
          <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" isCollapsed={isCollapsed} isMobile={isMobile} setIsSidebarOpen={setIsSidebarOpen} />
          <NavItem to="/score" icon={<BadgeCheck size={18} />} label="Credit Score" isCollapsed={isCollapsed} isMobile={isMobile} setIsSidebarOpen={setIsSidebarOpen} />
          <NavItem to="/transactions" icon={<ArrowLeftRight size={18} />} label="Transactions" isCollapsed={isCollapsed} isMobile={isMobile} setIsSidebarOpen={setIsSidebarOpen} />
          <NavItem to="/loans" icon={<Landmark size={18} />} label="Loans" isCollapsed={isCollapsed} isMobile={isMobile} setIsSidebarOpen={setIsSidebarOpen} />
        </NavSection>

        <NavSection title="Intelligence" isCollapsed={isCollapsed}>
          <NavItem to="/digest" icon={<Newspaper size={18} />} label="Weekly Digest" isCollapsed={isCollapsed} isMobile={isMobile} setIsSidebarOpen={setIsSidebarOpen} />
          <div className="nav-item" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '0.75rem', padding: isMobile ? '0.75rem 1rem' : '0.5rem 0.75rem', borderRadius: '6px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', position: 'relative' }} title={isCollapsed ? "AI CFO Chat" : ""}>
            <BotMessageSquare size={18} />
            {!isCollapsed && <span className="text-nav">AI CFO Chat</span>}
          </div>
        </NavSection>

        <NavSection title="Account" isCollapsed={isCollapsed}>
          <div className="nav-item" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '0.75rem', padding: isMobile ? '0.75rem 1rem' : '0.5rem 0.75rem', borderRadius: '6px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', position: 'relative' }} title={isCollapsed ? "Settings" : ""}>
            <Settings size={18} />
            {!isCollapsed && <span className="text-nav">Settings</span>}
          </div>
          <NavItem to="/onboarding" icon={<Upload size={18} />} label="Upload New File" isCollapsed={isCollapsed} isMobile={isMobile} setIsSidebarOpen={setIsSidebarOpen} />
        </NavSection>
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
        {!isCollapsed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                RS
              </div>
              <div>
                <div className="text-nav" style={{ color: 'white' }}>{businessData.owner}</div>
                <div className="text-meta">{businessData.plan}</div>
              </div>
            </div>
            <button style={{ color: 'rgba(255,255,255,0.5)', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogOut size={18} /></button>
          </>
        ) : (
          <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }} title={businessData.owner}>
            RS
          </div>
        )}
      </div>
    </aside>
  );
};

const NavSection = ({ title, isCollapsed, children }) => (
  <div>
    {!isCollapsed && <h2 className="text-sidebar-group text-meta" style={{ marginBottom: '0.75rem' }}>{title}</h2>}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {children}
    </div>
  </div>
);

const NavItem = ({ to, icon, label, isCollapsed, isMobile, setIsSidebarOpen }) => {
  return (
    <NavLink
      to={to}
      onClick={() => isMobile && setIsSidebarOpen(false)}
      className="nav-item"
      title={isCollapsed ? label : ""}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '0.75rem',
        padding: isMobile ? '0.75rem 1rem' : '0.5rem 0.75rem',
        borderRadius: '6px',
        color: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.7)',
        backgroundColor: isActive ? 'rgba(43, 132, 234, 0.1)' : 'transparent',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden'
      })}
    >
      {({ isActive }) => (
        <>
          <div 
            className="active-bar"
            style={{ 
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: 'var(--color-primary)',
              transform: isActive && !isCollapsed ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'center'
            }} 
          />
          {icon}
          {!isCollapsed && <span className="text-nav">{label}</span>}
        </>
      )}
    </NavLink>
  );
};

export default Sidebar;
