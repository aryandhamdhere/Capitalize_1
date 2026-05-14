import React, { useEffect, useRef, useState } from 'react';

const AnimatedProgressBar = ({ score, color }) => {
  const [isVisible, setIsVisible] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (trackRef.current) {
      observer.observe(trackRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={trackRef} className="pillar-bar-track" style={{ width: '100%', overflow: 'hidden' }}>
      <div 
        className="pillar-bar-fill" 
        style={{ 
          width: `${score}%`, 
          backgroundColor: color,
          animationPlayState: isVisible ? 'running' : 'paused'
        }} 
      />
    </div>
  );
};

export default AnimatedProgressBar;
