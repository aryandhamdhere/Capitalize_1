import React, { useState } from "react";
import { uploadFile } from "../api/upload";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useData } from "../context/DataContext";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [qualityInfo, setQualityInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUploadedFile, setDashboardData } = useData();

  const submit = async () => {
    if (!file) {
      setIsError(true);
      setMsg("⚠️ Please select a file first!");
      return;
    }

    setLoading(true);
    setMsg("Uploading...");
    setIsError(false);
    setUploaded(false);
    setQualityInfo(null);

    try {
      const res = await uploadFile(file);
      if (res.status === "success" && res.indexed) {
        setMsg(`✅ "${res.file}" uploaded and indexed successfully!`);
        setIsError(false);
        setUploaded(true);
        // Persist filename so Credit Score page can fetch live score
        localStorage.setItem("capitalize_last_file", res.file);
        // Store validation metadata for quality card
        if (res.quality) {
          setQualityInfo({
            score:        res.quality.score,
            issues:       res.quality.issues || [],
            months:       res.quality.months_covered,
            rowsAfter:    res.quality.rows_after,
            confidence:   res.quality.confidence,
            dateRange:    res.quality.date_range || {},
            fileType:     res.file_type,
            bankDetected: res.bank_detected,
          });
        }
        
        try {
          // Compute credit score immediately after upload
          const scoreRes = await axios.post("http://localhost:8000/api/credit/score", { filename: res.file });
          localStorage.setItem("capitalize_credit_score", scoreRes.data.total_score);
          setUploadedFile(res.file);
          setDashboardData(scoreRes.data);
          
          window.dispatchEvent(new CustomEvent("show-toast", {
            detail: {
              message: "✓ Data processed — your dashboard has been updated",
              type: "success",
              showLink: location.pathname !== "/dashboard"
            }
          }));
        } catch (err) {
          console.error("Credit score calculation failed", err);
        }
      } else if (res.status === "saved") {
        setMsg(`⚠️ File saved but not indexed: ${res.detail || "Unsupported file type."}`);
        setIsError(true);
      } else {
        setMsg(`Uploaded: ${JSON.stringify(res)}`);
      }
    } catch (err) {
      setIsError(true);
      const detail = err?.response?.data?.detail || err.message || "Upload failed. Is the backend running?";
      setMsg(`❌ Error: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-box" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <div className="input-group" style={{ width: '100%', maxWidth: '500px' }}>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => { setFile(e.target.files[0]); setMsg(""); setUploaded(false); setQualityInfo(null); }}
          style={{
            padding: '2.5rem',
            background: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            width: '100%',
            color: 'var(--text-secondary)'
          }}
        />
        {file && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={submit}
        disabled={loading}
        style={{ width: '100%', maxWidth: '500px', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Uploading..." : "Upload & Process Data"}
      </button>

      {msg && (
        <p style={{
          color: isError ? '#ef4444' : '#10b981',
          fontWeight: '600',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          {msg}
        </p>
      )}

      {/* Data Quality Card — only shown after a successful upload */}
      {qualityInfo && (
        <div style={{
          width: '100%',
          maxWidth: '500px',
          background: '#fff',
          border: `1.5px solid ${
            qualityInfo.score > 80 ? '#86efac'
            : qualityInfo.score >= 50 ? '#fde68a'
            : '#fca5a5'
          }`,
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#02042B' }}>
              {qualityInfo.bankDetected && qualityInfo.bankDetected !== 'generic'
                ? `🏦 ${qualityInfo.bankDetected} Bank Statement`
                : qualityInfo.fileType === 'bank_statement'
                ? '🏦 Bank Statement'
                : qualityInfo.fileType === 'gst_export'
                ? '📄 GST Export'
                : qualityInfo.fileType === 'sales_ledger'
                ? '📊 Sales Ledger'
                : qualityInfo.fileType === 'expense_sheet'
                ? '💸 Expense Sheet'
                : '📁 Financial Document'} detected
            </div>
            <span style={{
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: qualityInfo.score > 80 ? '#dcfce7' : qualityInfo.score >= 50 ? '#fef3c7' : '#fee2e2',
              color:      qualityInfo.score > 80 ? '#15803d' : qualityInfo.score >= 50 ? '#92400e' : '#991b1b',
            }}>
              Quality: {qualityInfo.score}/100
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: '#4A5568', flexWrap: 'wrap' }}>
            {qualityInfo.months > 0 && (
              <span>📅 <strong>{qualityInfo.months}</strong> month{qualityInfo.months !== 1 ? 's' : ''} of data</span>
            )}
            {qualityInfo.rowsAfter > 0 && (
              <span>📋 <strong>{qualityInfo.rowsAfter}</strong> transactions</span>
            )}
            {qualityInfo.dateRange?.from && (
              <span>🗓 {qualityInfo.dateRange.from} → {qualityInfo.dateRange.to}</span>
            )}
          </div>

          {/* Issues list */}
          {qualityInfo.issues.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {qualityInfo.issues.map((issue, i) => (
                <li key={i}>⚠️ {issue}</li>
              ))}
            </ul>
          )}

          {qualityInfo.issues.length === 0 && (
            <div style={{ fontSize: '0.8rem', color: '#15803d' }}>✅ No data issues found.</div>
          )}
        </div>
      )}

      {uploaded && (
        <button
          className="btn btn-primary"
          onClick={() => navigate("/dashboard")}
          style={{
            width: '100%',
            maxWidth: '500px',
            background: '#10b981',
            fontSize: '1.1rem'
          }}
        >
          Go to Dashboard →
        </button>
      )}
    </div>
  );
}

