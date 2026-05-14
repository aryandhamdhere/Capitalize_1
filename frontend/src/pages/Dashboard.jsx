import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  ArcElement,
  BarElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowUpRight, ChevronRight, Filter } from 'lucide-react';
import { metricsData, chartData, pillarsData, transactionsData } from '../data/mockData';
import GaugeChart from '../components/GaugeChart';
import AnimatedCounter from '../components/AnimatedCounter';
import AnimatedProgressBar from '../components/AnimatedProgressBar';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement
);

const Dashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: { legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: isMobile ? 10 : 12 } } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'var(--color-border)' }, ticks: { font: { family: 'Plus Jakarta Sans', size: isMobile ? 10 : 12 } } },
      x: { 
        grid: { display: false },
        ticks: { 
          font: { family: 'Plus Jakarta Sans', size: isMobile ? 10 : 12 },
          maxTicksLimit: isMobile ? 4 : undefined 
        } 
      }
    }
  };

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Revenue',
        data: chartData.revenue,
        borderColor: 'var(--color-primary)',
        backgroundColor: 'rgba(43, 132, 234, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: chartData.expenses,
        borderColor: 'var(--color-text-muted)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-3 gap-6">
        <MetricCard 
          title="Net Revenue" 
          value={<AnimatedCounter targetValue={108420} prefix="₹" isCurrency={true} />} 
          trend="+18%" 
          dropdown="This month"
        />
        <MetricCard 
          title="Active Cash Flow" 
          value={<AnimatedCounter targetValue={432650} prefix="₹" isCurrency={true} />} 
          trend="+4.2%" 
          showBar={true}
        />
        <div className="card metric-card flex-col justify-between items-center" style={{ display: 'flex' }}>
          <div className="w-full flex justify-between items-start mb-2">
            <div>
              <div className="text-meta mb-1">Credit Score</div>
              <div className="flex items-center gap-2 text-badge text-success mb-2">
                <ArrowUpRight size={14} /> {metricsData.creditScore.trend} vs last month
              </div>
            </div>
            <a href="/score" className="text-primary text-btn flex items-center gap-1">Details <ChevronRight size={16} /></a>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GaugeChart value={metricsData.creditScore.value} max={metricsData.creditScore.max} />
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid dashboard-middle-section gap-6" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-card-title">Financial Analytics</h3>
            <div className="flex gap-2">
              <select className="btn-outline text-body" style={{ padding: '0.25rem 0.5rem' }}>
                <option>This year</option>
              </select>
              <button className="btn-outline text-body" style={{ padding: '0.25rem 0.5rem' }}>
                <Filter size={14} /> Filters
              </button>
            </div>
          </div>
          <div style={{ height: isMobile ? '180px' : (window.innerWidth <= 1024 ? '220px' : '280px') }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="card flex-col justify-between" style={{ display: 'flex' }}>
          <div>
            <h3 className="text-card-title mb-6">Credit Pillar Breakdown</h3>
            <div className="flex-col gap-4" style={{ display: 'flex' }}>
              {pillarsData.map((pillar, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-meta mb-1">
                    <span>{pillar.name}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{pillar.score}/100</span>
                  </div>
                  <AnimatedProgressBar score={pillar.score} color={pillar.color} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-metric" style={{ fontSize: '24px' }}>
                  <AnimatedCounter targetValue={73.9} decimals={1} suffix="%" />
                </div>
                <div className="text-meta">Since last upload</div>
              </div>
              <a href="/score" className="text-primary text-btn flex items-center gap-1">See Details <ChevronRight size={16} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-card-title mb-2">Cash Flow by Week</h3>
          <div className="text-meta mb-1">Total cash in this month</div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-metric" style={{ fontSize: '24px' }}>
              <AnimatedCounter targetValue={432650} prefix="₹" isCurrency={true} />
            </span>
            <span className="badge badge-success text-delta">+4.2%</span>
          </div>
          <div style={{ height: '200px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                 <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div className="text-meta" style={{ width: '30px' }}>{day}</div>
                   <div style={{ flex: 1, display: 'flex', gap: '0.25rem' }}>
                     <div style={{ height: '20px', width: `${Math.random() * 40 + 20}%`, backgroundColor: 'var(--color-primary-light)', borderRadius: '4px' }}></div>
                     <div style={{ height: '20px', width: `${Math.random() * 30 + 10}%`, backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-card-title">Top Transactions</h3>
            <a href="/transactions" className="text-primary text-btn flex items-center gap-1">See Details <ChevronRight size={16} /></a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <th className="text-th" style={{ paddingBottom: '0.5rem' }}>Description</th>
                  <th className="text-th" style={{ paddingBottom: '0.5rem' }}>Amount</th>
                  <th className="text-th" style={{ paddingBottom: '0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactionsData.slice(0, 5).map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 0' }}>
                      <div className="text-body font-semibold">{tx.description}</div>
                      <div className="text-meta">{tx.category} • {tx.date}</div>
                    </td>
                    <td className="text-body" style={{ padding: '0.75rem 0', fontWeight: '600' }}>
                      {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <span className={`badge text-badge ${tx.status === 'Credited' ? 'badge-success' : 'badge-danger'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

const MetricCard = ({ title, value, trend, dropdown, showBar }) => (
  <div className="card metric-card">
    <div className="flex justify-between items-start mb-2">
      <div className="text-meta flex items-center gap-1">{title} <span style={{ backgroundColor: 'var(--color-bg)', padding: '2px 4px', borderRadius: '4px' }}>i</span></div>
      {dropdown && (
        <select className="text-meta" style={{ border: '1px solid var(--color-border)', borderRadius: '4px', padding: '2px 4px', outline: 'none', backgroundColor: 'transparent' }}>
          <option>{dropdown}</option>
        </select>
      )}
    </div>
    <div className="flex justify-between items-end mb-4">
      <div>
        <div className="text-metric mb-2">{value}</div>
        <div className="flex items-center gap-2 text-badge text-success">
          <span className="badge badge-success text-delta">{trend}</span> <span className="text-meta" style={{ color: 'var(--color-success)' }}>vs last month</span>
        </div>
      </div>
      {showBar && (
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px' }}>
          <div style={{ width: '8px', height: '60%', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }}></div>
          <div style={{ width: '8px', height: '80%', backgroundColor: 'var(--color-primary-light)', borderRadius: '2px' }}></div>
          <div style={{ width: '8px', height: '40%', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }}></div>
          <div style={{ width: '8px', height: '100%', backgroundColor: 'var(--color-primary-light)', borderRadius: '2px' }}></div>
        </div>
      )}
    </div>
    <a href="/transactions" className="text-primary text-btn flex items-center gap-1">See Details <ChevronRight size={16} /></a>
  </div>
);

export default Dashboard;
