import React, { useState } from 'react';
import { BotMessageSquare, X, Send } from 'lucide-react';

const AICfoChat = ({ isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          position: 'fixed', 
          bottom: isMobile ? 'calc(1.5rem + env(safe-area-inset-bottom))' : '2rem', 
          right: isMobile ? '1.5rem' : '2rem', 
          width: '56px', height: '56px', borderRadius: '50%', 
          backgroundColor: 'var(--color-primary)', color: 'white', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          boxShadow: 'var(--shadow-lg)', zIndex: 50,
          transition: 'transform 200ms ease'
        }}
      >
        <BotMessageSquare size={24} />
      </button>
    );
  }

  // Mobile layout makes it cover the entire screen with an animation
  const containerStyles = isMobile ? {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'white',
    display: 'flex', flexDirection: 'column', zIndex: 100,
    animation: 'slideUp 350ms cubic-bezier(0.4, 0, 0.2, 1)'
  } : {
    position: 'fixed', bottom: '2rem', right: '2rem', width: '300px', height: '400px', 
    backgroundColor: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', 
    display: 'flex', flexDirection: 'column', zIndex: 50, border: '1px solid var(--color-border)', overflow: 'hidden',
    animation: 'slideUp 350ms cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div style={containerStyles}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-navy)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BotMessageSquare size={20} />
          <span className="text-btn">AI CFO</span>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-success)', borderRadius: '50%', marginLeft: '0.25rem' }}></span>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', padding: '0.5rem' }}>
          <X size={20} />
        </button>
      </div>
      
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <BotMessageSquare size={14} />
          </div>
          <div className="card" style={{ padding: '0.75rem', borderTopLeftRadius: 0, boxShadow: 'var(--shadow-subtle)' }}>
            <p className="text-body">Your cash runway is 47 days. Revenue grew 12% MoM but expenses rose faster. Want me to identify the top 3 cost categories to review?</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '1rem', paddingBottom: isMobile ? 'calc(1rem + env(safe-area-inset-bottom))' : '1rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-bg)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <input type="text" placeholder="Ask anything about your finances..." className="text-body" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.5rem' }} />
          <button style={{ color: 'var(--color-primary)', padding: '0.5rem' }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICfoChat;
