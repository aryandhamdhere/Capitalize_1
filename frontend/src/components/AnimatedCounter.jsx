import React, { useState, useEffect, useRef } from 'react';

// easeOutQuart
const easeOut = (t) => 1 - Math.pow(1 - t, 4);

const AnimatedCounter = ({ targetValue, duration = 1200, prefix = '', suffix = '', decimals = 0, isCurrency = false }) => {
  const [count, setCount] = useState(0);
  const targetRef = useRef(null);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOut(progress);
      
      const currentVal = easedProgress * targetValue;
      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(targetValue);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animationFrameId = window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [targetValue, duration]);

  const formattedValue = isCurrency 
    ? count.toLocaleString('en-IN', { maximumFractionDigits: decimals }) 
    : count.toFixed(decimals);

  return (
    <span ref={targetRef}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

export default AnimatedCounter;
