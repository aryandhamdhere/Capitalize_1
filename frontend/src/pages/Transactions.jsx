import React, { useState, useEffect } from 'react';
import { Search, ChevronsUpDown, Download } from 'lucide-react';
import { transactionsData } from '../data/mockData';

const Transactions = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      
      {/* Filters Bar */}
      <div className="card flex items-center justify-between" style={{ padding: '1rem 1.5rem', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '1rem' }}>
        <div className="flex gap-4" style={{ flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search description..." 
              className="text-body"
              style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', width: isMobile ? '100%' : '200px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', width: isMobile ? '100%' : 'auto' }}>
            <select className="text-body" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', flex: 1 }}>
              <option>All Dates</option>
              <option>This Month</option>
            </select>
            
            <select className="text-body" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', flex: 1 }}>
              <option>All Categories</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>

          {!isMobile && (
            <select className="text-body" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none' }}>
              <option>All Types</option>
              <option>Credit</option>
              <option>Debit</option>
            </select>
          )}

          {isMobile && (
            <button className="btn-primary text-btn w-full" style={{ padding: '0.5rem 1rem' }}>
              Apply Filters
            </button>
          )}
        </div>
        
        {!isMobile && (
          <div className="flex gap-4">
             <button className="btn-primary text-btn" style={{ padding: '0.5rem 1rem' }}>
              Apply Filters
            </button>
            <button className="btn-outline text-btn w-full" style={{ padding: '0.5rem 1rem' }}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Summary Stat Chips */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        <StatChip label="Total Credits" value="₹8,42,300" color="var(--color-success)" bgColor="var(--color-success-bg)" />
        <StatChip label="Total Debits" value="₹4,09,650" color="var(--color-danger)" bgColor="var(--color-danger-bg)" />
        <StatChip label="Net Flow" value="₹4,32,650" color="var(--color-primary)" bgColor="var(--color-primary-light)" />
        <StatChip label="Transactions" value="247" color="var(--color-text-main)" bgColor="var(--color-border)" />
      </div>

      {/* Data Section (Table or Cards based on screen size) */}
      <div className={isMobile ? "" : "card"} style={{ padding: 0, overflow: 'hidden' }}>
        
        {!isMobile ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <Th>#</Th>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Category</Th>
                  <Th>Amount</Th>
                  <Th>Type</Th>
                  <Th>Running Balance</Th>
                </tr>
              </thead>
              <tbody>
                {transactionsData.map((tx, idx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: idx % 2 === 0 ? 'white' : 'var(--color-bg)' }}>
                    <td className="text-meta" style={{ padding: '1rem' }}>{tx.id}</td>
                    <td className="text-body" style={{ padding: '1rem' }}>{tx.date}</td>
                    <td className="text-body" style={{ padding: '1rem', fontWeight: '500' }}>{tx.description}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="text-meta" style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-border)', borderRadius: '4px' }}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="text-body" style={{ padding: '1rem', fontWeight: '600', color: tx.type === 'Credit' ? 'var(--color-success)' : 'var(--color-text-main)' }}>
                      {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge text-badge ${tx.status === 'Credited' ? 'badge-success' : 'badge-danger'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="text-meta" style={{ padding: '1rem' }}>
                      ₹{tx.balance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-col" style={{ display: 'flex' }}>
            {transactionsData.map((tx, idx) => (
              <div key={tx.id} style={{ 
                padding: '14px 16px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                backgroundColor: 'white',
                borderBottom: idx === transactionsData.length - 1 ? 'none' : '1px solid #F3F4F6'
              }}>
                <div className="flex justify-between items-start">
                  <div className="text-body" style={{ fontWeight: '600' }}>{tx.description}</div>
                  <div className="text-meta">{tx.date}</div>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-meta" style={{ padding: '2px 6px', backgroundColor: 'var(--color-border)', borderRadius: '4px' }}>
                    {tx.category}
                  </span>
                  <div className="text-body" style={{ fontWeight: '600', color: tx.type === 'Credit' ? 'var(--color-success)' : '#DC2626' }}>
                    {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        <div className="flex items-center justify-between" style={{ padding: '1rem 1.5rem', borderTop: isMobile ? 'none' : '1px solid var(--color-border)', backgroundColor: 'white' }}>
          <div className="text-meta">
            Showing 1–15 of 247 transactions
          </div>
          <div className="flex gap-2">
            <button className="btn-outline text-btn" style={{ padding: '0.25rem 0.75rem' }} disabled>Prev</button>
            <button className="btn-outline text-btn" style={{ padding: '0.25rem 0.75rem' }}>Next</button>
          </div>
        </div>
      </div>

    </div>
  );
};

const StatChip = ({ label, value, color, bgColor }) => (
  <div style={{ backgroundColor: bgColor, padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
    <div className="text-meta">{label}</div>
    <div className="text-metric" style={{ fontSize: '20px', color: color }}>{value}</div>
  </div>
);

const Th = ({ children }) => (
  <th className="text-th" style={{ padding: '1rem' }}>
    <div className="flex items-center gap-1 cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
      {children}
      <ChevronsUpDown size={14} />
    </div>
  </th>
);

export default Transactions;
