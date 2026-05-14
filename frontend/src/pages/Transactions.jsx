import React, { useState, useEffect } from 'react';
import { Search, ChevronsUpDown, Download } from 'lucide-react';
import { transactionsData } from '../data/mockData';

const Transactions = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '24px' }}>

      {/* Filter Bar */}
      <div className="card" style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '0.75rem',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: isMobile ? '100%' : '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search description..."
              className="text-body"
              style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', width: '100%' }}
            />
          </div>

          {/* Date + Category in 2-col on mobile */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'auto auto',
            gap: '0.625rem',
            width: isMobile ? '100%' : 'auto'
          }}>
            <select className="text-body" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', width: '100%' }}>
              <option>All Dates</option>
              <option>This Month</option>
            </select>
            <select className="text-body" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', width: '100%' }}>
              <option>All Categories</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', width: isMobile ? '100%' : 'auto' }}>
            <button className="btn-primary text-btn" style={{ padding: '0.5rem 1rem', flex: isMobile ? 1 : 'none' }}>
              Apply Filters
            </button>
            {!isMobile && (
              <button className="btn-outline text-btn" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download size={16} /> Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat Chips — 4 col → 2 col */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '12px'
      }}>
        <StatChip label="Total Credits"  value="₹8,42,300" color="var(--color-success)" bgColor="var(--color-success-bg)" />
        <StatChip label="Total Debits"   value="₹4,09,650" color="var(--color-danger)"  bgColor="var(--color-danger-bg)"  />
        <StatChip label="Net Flow"       value="₹4,32,650" color="var(--color-primary)" bgColor="var(--color-primary-light)" />
        <StatChip label="Transactions"   value="247"        color="var(--color-text-main)" bgColor="var(--color-border)"  />
      </div>

      {/* Data — table on tablet/desktop, cards on mobile */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Desktop / Tablet — scrollable table */}
        {!isMobile && (
          <div className="table-wrapper transactions-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
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
                    <td className="text-body" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{tx.date}</td>
                    <td className="text-body" style={{ padding: '1rem', fontWeight: '500' }}>{tx.description}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="text-meta" style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-border)', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="text-body" style={{ padding: '1rem', fontWeight: '600', color: tx.type === 'Credit' ? 'var(--color-success)' : 'var(--color-text-main)', whiteSpace: 'nowrap' }}>
                      {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge text-badge ${tx.status === 'Credited' ? 'badge-success' : 'badge-danger'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="text-meta" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      ₹{tx.balance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile — card list */}
        {isMobile && (
          <div className="transactions-card-list" style={{ display: 'flex', flexDirection: 'column' }}>
            {transactionsData.map((tx, idx) => (
              <div
                key={tx.id}
                className="transaction-card"
                style={{
                  padding: '14px 16px',
                  backgroundColor: 'white',
                  borderBottom: idx === transactionsData.length - 1 ? 'none' : '1px solid #F3F4F6'
                }}
              >
                <div className="transaction-card-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div className="text-body" style={{ fontWeight: '600', flex: 1, marginRight: '8px' }}>{tx.description}</div>
                  <div className="text-meta" style={{ flexShrink: 0 }}>{tx.date}</div>
                </div>
                <div className="transaction-card-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'white',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div className="text-meta">Showing 1–15 of 247 transactions</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-outline text-btn" style={{ padding: '0.25rem 0.75rem' }} disabled>Prev</button>
            <button className="btn-outline text-btn" style={{ padding: '0.25rem 0.75rem' }}>Next</button>
          </div>
        </div>
      </div>

    </div>
  );
};

const StatChip = ({ label, value, color, bgColor }) => (
  <div style={{ backgroundColor: bgColor, padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <div className="text-meta">{label}</div>
    <div className="text-metric" style={{ fontSize: '20px', color }}>{value}</div>
  </div>
);

const Th = ({ children }) => (
  <th className="text-th" style={{ padding: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
      {children}
      <ChevronsUpDown size={14} />
    </div>
  </th>
);

export default Transactions;
