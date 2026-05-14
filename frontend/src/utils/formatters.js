export function formatINR(amount) {
  // < 1000: "₹847"
  // 1,000 - 99,999: "₹45,230"
  // 1,00,000 - 99,99,999: "₹4.2L"
  // 1,00,00,000+: "₹1.3Cr"
  
  if (!amount || isNaN(amount)) return "₹0";
  const num = parseFloat(amount);
  if (num >= 10000000) return `₹${(num/10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num/100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${num.toLocaleString('en-IN')}`;
  return `₹${num}`;
}

export function formatDelta(value, type = "currency") {
  // Returns: { text: "+₹4.2L", color: "var(--primary)", arrow: "↑" }
  const isPositive = value > 0;
  const isZero = value === 0;
  return {
    text: isZero ? "—" : `${isPositive ? "+" : ""}${
      type === "currency" ? formatINR(Math.abs(value)) : 
      Math.abs(value).toFixed(1) + "%"
    }`,
    color: isZero ? "var(--text-3)" : isPositive ? "var(--green, #00C48C)" : "var(--red, #EF4444)",
    arrow: isZero ? "→" : isPositive ? "↑" : "↓"
  };
}

export function formatDays(days) {
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days/30)} months`;
  return `${(days/365).toFixed(1)} years`;
}
