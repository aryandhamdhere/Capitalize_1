import React, { useState, useEffect } from 'react';
import { FileDown, ArrowRight, CheckCircle2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { chartData } from '../data/mockData';
import { Bar } from 'react-chartjs-2';
import AnimatedCounter from '../components/AnimatedCounter';

const Digest = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false },
      x: { display: false }
    }
  };

  const chartDataObj = {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [{
      data: [12000, 19000, 3000, 5000, 20000, 3000, 1000],
      backgroundColor: 'var(--color-primary)',
      borderRadius: 4
    }]
  };

  return (
    <div className="flex-col gap-6" style={{ display: 'flex', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="flex items-start justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-page-title mb-2">Weekly Intelligence Digest</h2>
          <div className="flex gap-4 text-meta">
            <span>Week of 7–13 May 2026</span>
            <span className="desktop-only">•</span>
            <span className="desktop-only">Auto-generated every Monday</span>
          </div>
          <div className="text-meta mobile-only mt-1">Auto-generated every Monday</div>
        </div>
        <button className="btn-outline text-btn w-full mobile-only mt-2" style={{ width: '100%' }}>
          <FileDown size={18} /> Download PDF
        </button>
        <button className="btn-outline text-btn desktop-only">
          <FileDown size={18} /> Download PDF
        </button>
      </div>

      {/* Top Delta Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        <DeltaCard label="Net Revenue" value={<AnimatedCounter targetValue={108} prefix="₹" suffix="k" />} trend="+18%" color="var(--color-success)" />
        <DeltaCard label="Total Expenses" value={<AnimatedCounter targetValue={62.4} prefix="₹" suffix="k" decimals={1} />} trend="+4%" color="var(--color-warning)" />
        <DeltaCard label="Transactions" value={<AnimatedCounter targetValue={63} />} trend="+7" color="var(--color-primary)" />
        <DeltaCard label="Score Change" value="+2 pts" trend="71 → 73" color="var(--color-success)" />
      </div>

      {/* Main Digest Report */}
      <div className="card flex-col gap-8" style={{ display: 'flex', padding: isMobile ? '1.5rem 1rem' : '2rem' }}>
        
        <ReportSection title="Revenue Highlights" icon={<TrendingUp color="var(--color-success)" />}>
          <ul className="text-body" style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><strong style={{ fontWeight: '600' }}>Top Source:</strong> Kumar Retail accounted for 42% of total weekly inflow (₹80,500).</li>
            <li><strong style={{ fontWeight: '600' }}>Peak Day:</strong> Tuesday saw the highest activity, driven by 3 large B2B transfers.</li>
            <li><strong style={{ fontWeight: '600' }}>Largest Payment:</strong> NEFT transfer of ₹1,20,000 received on 10 May from new client.</li>
          </ul>
        </ReportSection>

        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', width: '100%' }}></div>

        <ReportSection title="Expense Analysis" icon={<TrendingDown color="var(--color-warning)" />}>
          <ul className="text-body" style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><strong style={{ fontWeight: '600' }}>Top Category:</strong> Staff Salaries (₹75,000) was the largest outflow this week.</li>
            <li><strong style={{ fontWeight: '600' }}>Supplier Payments:</strong> Mehta Suppliers invoice cleared, improving DPO.</li>
            <li><strong style={{ fontWeight: '600', color: 'var(--color-danger)' }}>Anomaly Detected:</strong> Office Internet bill was 20% higher than the 6-month average.</li>
          </ul>
        </ReportSection>

        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', width: '100%' }}></div>

        <div className="flex gap-6" style={{ flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ flex: 1 }}>
            <ReportSection title="Cash Flow Health" icon={<AlertCircle color="var(--color-primary)" />}>
              <ul className="text-body" style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>Operating cash flow remains positive for the 3rd consecutive week.</li>
                <li>Cash buffer is sufficient to cover estimated expenses for the next 47 days.</li>
              </ul>
            </ReportSection>
          </div>
          <div style={{ width: isMobile ? '100%' : '200px', height: '100px', alignSelf: 'center', backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: '8px' }}>
            <Bar data={chartDataObj} options={chartOptions} />
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', width: '100%' }}></div>

        <ReportSection title="Credit Score Movement" icon={<CheckCircle2 color="var(--color-success)" />}>
          <p className="text-body mb-2">Your score increased from <strong>71</strong> to <strong>73</strong> (Good Tier).</p>
          <div className="text-body" style={{ backgroundColor: 'var(--color-success-bg)', padding: '1rem', borderRadius: '8px', color: 'var(--color-success)' }}>
            <strong style={{ fontWeight: '600' }}>What changed:</strong> Payment Regularity improved by +3 points after clearing 4 pending invoices on time.
          </div>
        </ReportSection>

      </div>

      {/* AI Recommendations */}
      <div className="card" style={{ backgroundColor: 'var(--color-navy)', color: 'white', borderColor: 'var(--color-navy)' }}>
        <h3 className="text-card-title mb-4 flex items-center gap-2">
          <span style={{ color: 'var(--color-primary)' }}>✨</span> AI Recommendations for Next Week
        </h3>
        <div className="flex-col gap-3" style={{ display: 'flex' }}>
          <RecommendationItem text="Review 'Office Internet' subscription plan for potential overcharges." />
          <RecommendationItem text="Send automated payment reminders to 3 clients with invoices overdue by >5 days." />
          <RecommendationItem text="Keep end-of-month cash balance above ₹2L to maintain Cash Flow Consistency score." />
        </div>
      </div>

      <div className="text-center text-meta mt-4">
        This digest was auto-generated by Capitalize AI. Not financial advice.
      </div>

    </div>
  );
};

const DeltaCard = ({ label, value, trend, color }) => (
  <div className="card metric-card" style={{ padding: '1rem' }}>
    <div className="text-meta mb-1">{label}</div>
    <div className="text-metric" style={{ fontSize: '20px' }}>{value}</div>
    <div className="text-delta" style={{ color: color, marginTop: '0.25rem' }}>
      {trend}
    </div>
  </div>
);

const ReportSection = ({ title, icon, children }) => (
  <div>
    <h3 className="text-card-title mb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const RecommendationItem = ({ text }) => (
  <div className="flex items-start gap-3" style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
    <ArrowRight size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
    <span className="text-body" style={{ color: 'rgba(255,255,255,0.9)' }}>{text}</span>
  </div>
);

export default Digest;
