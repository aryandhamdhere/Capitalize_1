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
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  const getTransitionClass = () => {
    if (transitionStage === 'fadeOut') return 'page-exit page-exit-active';
    return 'page-enter page-enter-active';
  };

  return (
    <div className="layout-wrapper">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      {/* Overlay for mobile drawer */}
      <div
        className={`sidebar-overlay${isMobile && isSidebarOpen ? ' visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

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
