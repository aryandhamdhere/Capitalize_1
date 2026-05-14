import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AICfoChat from './AICfoChat';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simple route transition logic
  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 200); // match page-exit-active duration
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  const getTransitionClass = () => {
    if (transitionStage === 'fadeOut') return 'page-exit page-exit-active';
    return 'page-enter page-enter-active';
  };

  return (
    <div className="layout-wrapper">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isMobile={isMobile} />
      
      {/* Dark overlay for mobile drawer */}
      {isMobile && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.45)', 
            zIndex: 40,
            opacity: isSidebarOpen ? 1 : 0,
            pointerEvents: isSidebarOpen ? 'auto' : 'none',
            transition: 'opacity 300ms ease'
          }}
        />
      )}

      <div className="main-content">
        <Topbar isMobile={isMobile} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="page-content">
          <div className={getTransitionClass()}>
            <Outlet context={{ displayLocation }} />
          </div>
        </main>
      </div>
      <AICfoChat isMobile={isMobile} />
    </div>
  );
};

export default Layout;
