export const businessData = {
  name: "Sharma Traders",
  location: "Mumbai",
  owner: "Ravi Sharma",
  sector: "Wholesale General Merchandise",
  bank: "HDFC Bank",
  plan: "Free Plan",
  lastUpload: "14 May 2026",
  score: 73,
};

export const metricsData = {
  netRevenue: { value: "₹4,32,650", trend: "+12%", trendUp: true },
  activeCashFlow: { value: "₹2,70,400", trend: "+8%", trendUp: true },
  creditScore: { value: 73, max: 100, trend: "+7", trendUp: true }
};

export const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  revenue: [280000, 310000, 295000, 340000, 432650, 380000, 410000, 365000],
  expenses: [180000, 200000, 195000, 220000, 260000, 240000, 260000, 230000]
};

export const pillarsData = [
  { name: "Cash Flow Consistency", score: 82, color: "var(--color-success)" },
  { name: "Revenue Growth", score: 68, color: "var(--color-primary)" },
  { name: "Debt-to-Income", score: 71, color: "var(--color-warning)" },
  { name: "Payment Regularity", score: 76, color: "var(--color-success)" }
];

export const transactionsData = [
  { id: 1, date: "12 May 2026", description: "GST Q1 Payment", category: "GST", amount: 18400, type: "Debit", status: "Credited", balance: 414250 },
  { id: 2, date: "11 May 2026", description: "Mehta Suppliers Invoice", category: "Supplier", amount: 42000, type: "Debit", status: "Debited", balance: 432650 },
  { id: 3, date: "10 May 2026", description: "Kumar Retail Receipt", category: "Income", amount: 80500, type: "Credit", status: "Credited", balance: 474650 },
  { id: 4, date: "05 May 2026", description: "Staff Salary May", category: "Salary", amount: 75000, type: "Debit", status: "Debited", balance: 394150 },
  { id: 5, date: "04 May 2026", description: "MSEDCL Electricity", category: "Expense", amount: 3200, type: "Debit", status: "Debited", balance: 469150 },
  { id: 6, date: "02 May 2026", description: "Patel Wholesalers", category: "Income", amount: 55000, type: "Credit", status: "Credited", balance: 472350 },
  { id: 7, date: "28 Apr 2026", description: "NEFT Transfer In", category: "Income", amount: 120000, type: "Credit", status: "Credited", balance: 417350 },
  { id: 8, date: "25 Apr 2026", description: "Razorpay Settlement", category: "Income", amount: 28600, type: "Credit", status: "Credited", balance: 297350 },
  { id: 9, date: "22 Apr 2026", description: "Jain Traders Invoice", category: "Supplier", amount: 34000, type: "Debit", status: "Debited", balance: 268750 },
  { id: 10, date: "20 Apr 2026", description: "HDFC Bank Charge", category: "Expense", amount: 500, type: "Debit", status: "Debited", balance: 302750 },
  { id: 11, date: "18 Apr 2026", description: "Office Internet", category: "Expense", amount: 1500, type: "Debit", status: "Debited", balance: 303250 },
  { id: 12, date: "15 Apr 2026", description: "Singh Distributors", category: "Income", amount: 62000, type: "Credit", status: "Credited", balance: 304750 },
  { id: 13, date: "12 Apr 2026", description: "Local Transport", category: "Expense", amount: 2400, type: "Debit", status: "Debited", balance: 242750 },
  { id: 14, date: "10 Apr 2026", description: "Shop Rent", category: "Expense", amount: 25000, type: "Debit", status: "Debited", balance: 245150 },
  { id: 15, date: "05 Apr 2026", description: "Cash Deposit", category: "Income", amount: 15000, type: "Credit", status: "Credited", balance: 270150 }
];

export const loansData = [
  { id: 1, provider: "HDFC Bank", name: "Business Loan", amount: "Up to ₹25L", rate: "12.5% p.a.", details: "No collateral", locked: false, category: "All" },
  { id: 2, provider: "Lendingkart", name: "MSME Loan", amount: "Up to ₹2Cr", rate: "15–24% p.a.", details: "3-day disbursal", locked: false, category: "NBFC" },
  { id: 3, provider: "Govt of India", name: "CGTMSE Guarantee Scheme", amount: "Up to ₹5Cr", rate: "Govt backed", details: "Collateral free", locked: false, category: "Government Schemes" },
  { id: 4, provider: "Govt of India", name: "MUDRA Tarun Loan", amount: "Up to ₹10L", rate: "10–12% p.a.", details: "Priority sector", locked: false, category: "Government Schemes" },
  { id: 5, provider: "Razorpay Capital", name: "Flexi Cash", amount: "Up to ₹50L", rate: "Revenue-based", details: "Instant", locked: false, category: "NBFC" },
  { id: 6, provider: "Indifi", name: "Working Capital", amount: "Up to ₹30L", rate: "GST-linked", details: "3-yr tenure", locked: false, category: "NBFC" },
  { id: 7, provider: "SBI", name: "MSME Prime", amount: "Up to ₹2Cr", rate: "Score needed: 80+", details: "", locked: true, reqScore: 80, category: "All" },
  { id: 8, provider: "ICICI", name: "iMobile Business", amount: "Up to ₹1Cr", rate: "Score needed: 78+", details: "", locked: true, reqScore: 78, category: "All" },
  { id: 9, provider: "Axis Bank", name: "Business Edge", amount: "Up to ₹75L", rate: "Score needed: 82+", details: "", locked: true, reqScore: 82, category: "All" },
];
