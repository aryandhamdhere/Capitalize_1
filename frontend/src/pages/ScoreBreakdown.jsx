import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart2, Scale, CalendarCheck, Lightbulb, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedCounter from '../components/AnimatedCounter';
import AnimatedProgressBar from '../components/AnimatedProgressBar';

const ScoreBreakdown = () => {
  const navigate = useNavigate();
  const score = 73;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      
      {/* Top Score Section */}
      <div className="card text-center" style={{ padding: isMobile ? '2rem 1rem' : '3rem 2rem' }}>
        <div className="text-metric" style={{ fontSize: isMobile ? '5rem' : '6rem', color: 'var(--color-primary)' }}>
          <AnimatedCounter targetValue={score} />
          <span style={{ fontSize: '0.4em', color: 'var(--color-text-muted)' }}>/100</span>
        </div>
        <div className="text-page-title" style={{ marginTop: '0.5rem' }}>Credit Readiness Score</div>
        <div className="text-meta" style={{ marginTop: '0.25rem' }}>Computed from your last upload: 14 May 2026</div>

        {/* Score Band Indicator */}
        <div style={{ maxWidth: '600px', margin: '3rem auto 0', position: 'relative' }}>
          <div style={{ display: 'flex', height: isMobile ? '8px' : '12px', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ flex: 40, backgroundColor: 'var(--color-danger)' }}></div>
            <div style={{ flex: 20, backgroundColor: 'var(--color-warning)' }}></div>
            <div style={{ flex: 20, backgroundColor: 'var(--color-primary)' }}></div>
            <div style={{ flex: 20, backgroundColor: 'var(--color-success)' }}></div>
          </div>
          
          {/* Marker */}
          <div style={{ 
            position: 'absolute', 
            top: isMobile ? '-8px' : '-10px', 
            left: `${score}%`, 
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ width: '0', height: '0', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid var(--color-navy)' }}></div>
            <div className="text-badge" style={{ marginTop: '14px', color: 'var(--color-navy)' }}>You</div>
          </div>

          <div className="text-meta" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span>Poor (0-40)</span>
            <span>Fair (41-60)</span>
            <span>Good (61-80)</span>
            <span className="desktop-only">Excellent (81-100)</span>
            <span className="mobile-only">Exc. (81-100)</span>
          </div>
        </div>
      </div>

      {/* 4 Pillar Cards */}
      <div className="grid grid-cols-2 gap-6">
        <PillarCard 
          icon={<TrendingUp size={24} color="var(--color-success)" />}
          title="Cash Flow Consistency"
          score={82}
          color="var(--color-success)"
          desc="Your cash inflows are regular across 90%+ of weeks"
        />
        <PillarCard 
          icon={<BarChart2 size={24} color="var(--color-primary)" />}
          title="Revenue Growth"
          score={68}
          color="var(--color-primary)"
          desc="Revenue grew 12.4% MoM but shows seasonal dip in Q1"
        />
        <PillarCard 
          icon={<Scale size={24} color="var(--color-warning)" />}
          title="Debt-to-Income Ratio"
          score={71}
          color="var(--color-warning)"
          desc="Debt obligations are 18.4% of monthly revenue — within safe range"
        />
        <PillarCard 
          icon={<CalendarCheck size={24} color="var(--color-success)" />}
          title="Payment Regularity"
          score={76}
          color="var(--color-success)"
          desc="94% of outbound payments made on time in last 90 days"
        />
      </div>

      {/* AI Recommendations */}
      <div>
        <h3 className="text-card-title mb-4">AI Recommendations</h3>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
          <RecommendationCard 
            text="Reduce cash withdrawal spikes in the last week of each month to improve consistency score by ~5 points"
          />
          <RecommendationCard 
            text="Maintain invoice-to-payment cycles under 21 days to unlock Good tier (80+)"
          />
          <div 
            className="card flex items-center justify-between" 
            style={{ padding: '1rem 1.5rem', borderLeft: '4px solid var(--color-primary)', cursor: 'pointer', backgroundColor: 'var(--color-primary-light)', flexWrap: 'wrap', gap: '1rem' }}
            onClick={() => navigate('/loans')}
          >
            <div className="flex items-center gap-4">
              <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '50%', color: 'var(--color-primary)', flexShrink: 0 }}>
                <Lightbulb size={20} />
              </div>
              <p className="text-body" style={{ fontWeight: '500' }}>Your profile qualifies for CGTMSE-backed collateral-free loans up to ₹25 lakh.</p>
            </div>
            <span className="text-primary text-btn flex items-center gap-1">See Loan Marketplace <ArrowRight size={16} /></span>
          </div>
        </div>
      </div>

    </div>
  );
};

const PillarCard = ({ icon, title, score, color, desc }) => (
  <div className="card">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div style={{ padding: '0.75rem', backgroundColor: `${color}15`, borderRadius: '8px' }}>
          {icon}
        </div>
        <h4 className="text-card-title">{title}</h4>
      </div>
      <div className="text-metric" style={{ fontSize: '24px' }}>
        <AnimatedCounter targetValue={score} />/100
      </div>
    </div>
    <p className="text-meta mb-4" style={{ fontSize: '13px' }}>{desc}</p>
    <AnimatedProgressBar score={score} color={color} />
  </div>
);

const RecommendationCard = ({ text }) => (
  <div className="card flex items-start gap-4" style={{ padding: '1rem 1.5rem' }}>
    <div style={{ color: 'var(--color-warning)', marginTop: '2px', flexShrink: 0 }}>
      <Lightbulb size={20} />
    </div>
    <p className="text-body">{text}</p>
  </div>
);

export default ScoreBreakdown;
