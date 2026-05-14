import React, { useEffect, useState } from 'react';

const GaugeChart = ({ value, max = 100 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = 70;
  const stroke = 12;
  const cx = 100;
  const cy = 95;
  const totalDegrees = 200; // 200deg sweep
  const startAngle = -200; // starts bottom-left
  
  // Circumference of the full circle
  const fullCircumference = 2 * Math.PI * radius;
  // Length of the arc (200 degrees)
  const arcLength = fullCircumference * (totalDegrees / 360);
  
  // Calculate dashoffset. 
  // When animatedValue is 0, offset = arcLength (empty).
  // When animatedValue is max, offset = 0 (full).
  const strokeDashoffset = arcLength - (arcLength * (animatedValue / max));

  useEffect(() => {
    // Trigger the animation shortly after mount
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  // SVG path definition for a circular arc
  // We use transform to rotate the circle so our 200deg sweep is symmetric at the top
  // To have 200 degrees opening at the bottom, we rotate by (360 - 200) / 2 = 80 degrees, but 
  // stroke-dasharray starts at 3 o'clock (0 deg). 
  // So we rotate by 180 - (200/2) = 80 degrees to center it.
  // Actually, standard SVG starts at 3 o'clock. 
  // We want to draw from angle 170 to -10. 
  // Let's just use a circle, stroke-dasharray = arcLength, fullCircumference, and rotate it.
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg width="200" height="130" viewBox="0 0 200 130">
        {/* Background Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          stroke="#E5E7EB"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${fullCircumference}`}
          transform={`rotate(170 ${cx} ${cy})`}
        />
        {/* Filled Arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          stroke="#2B84EA"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${fullCircumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(170 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {/* Center Text */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="text-metric" style={{ fontSize: '48px', fill: '#02042B' }}>
          {value}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" style={{ fontSize: '14px', fontWeight: '500', fill: '#6B7280' }}>
          /100
        </text>
      </svg>
      
      {/* Legend Dots */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '-10px', fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F97316' }}></span>
          Total Sales per day
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FDBA74' }}></span>
          For week
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;
