import { useState, useEffect, useRef } from "react";

const INCOME_CATS = ["Salary", "Freelance", "Investment", "Rental", "Gift", "Other Income"];
const EXPENSE_CATS = ["Food & Dining", "Transport", "Shopping", "Housing", "Healthcare", "Entertainment", "Education", "Utilities", "Other"];

const CAT_COLORS = [
  "#378ADD", "#1D9E75", "#D85A30", "#7F77DD",
  "#EF9F27", "#D4537E", "#639922", "#73726c", "#E24B4A",
];

const CAT_ICONS = {
  "Food & Dining": "🍽️", "Transport": "🚗", "Shopping": "🛍️",
  "Housing": "🏠", "Healthcare": "💊", "Entertainment": "🎬",
  "Education": "📚", "Utilities": "⚡", "Other": "📌",
  "Salary": "💼", "Freelance": "💻", "Investment": "📈",
  "Rental": "🏢", "Gift": "🎁", "Other Income": "💰",
};

function fmt(n) {
  return "₹" + Math.abs(n).toLocaleString("en-IN");
}

function DonutChart({ data, colors, labels }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (typeof window.Chart === "undefined") return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (!data || data.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: "#fff",
          hoverBorderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                return ` ${ctx.label}: ${fmt(ctx.raw)} (${pct}%)`;
              },
            },
          },
        },
        animation: { animateRotate: true, duration: 500 },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, colors, labels]);

  return (
    <div style={{ position: "relative", width: "100%", height: 220 }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Donut chart showing expense breakdown by category"
      >
        No expense data yet.
      </canvas>
    </div>
  );
}

export default function ExpenseDashboard() {
  const [transactions, setTransactions] = useState([
    { id: 1, type: "income", desc: "Monthly salary", amount: 75000, cat: "Salary", date: new Date() },
    { id: 2, type: "expense", desc: "Grocery run", amount: 3200, cat: "Food & Dining", date: new Date() },
    { id: 3, type: "expense", desc: "Uber rides", amount: 800, cat: "Transport", date: new Date() },
    { id: 4, type: "expense", desc: "Netflix + Spotify", amount: 1100, cat: "Entertainment", date: new Date() },
  ]);
  const [currentType, setCurrentType] = useState("income");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState(INCOME_CATS[0]);
  const [chartReady, setChartReady] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (window.Chart) { setChartReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => setChartReady(true);
    document.head.appendChild(script);
  }, []);

  const cats = currentType === "income" ? INCOME_CATS : EXPENSE_CATS;

  const handleTypeChange = (type) => {
    setCurrentType(type);
    setCat(type === "income" ? INCOME_CATS[0] : EXPENSE_CATS[0]);
  };

  const handleAdd = () => {
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) return;
    setTransactions([
      { id: Date.now(), type: currentType, desc: desc.trim(), amount: parseFloat(amount), cat, date: new Date() },
      ...transactions,
    ]);
    setDesc("");
    setAmount("");
  };

  const handleDelete = (id) => setTransactions(transactions.filter((t) => t.id !== id));

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  const expTx = transactions.filter((t) => t.type === "expense");
  const catMap = {};
  expTx.forEach((t) => { catMap[t.cat] = (catMap[t.cat] || 0) + t.amount; });
  const sortedCats = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]);
  const catVals = sortedCats.map((c) => catMap[c]);
  const catColors = sortedCats.map((_, i) => CAT_COLORS[i % CAT_COLORS.length]);
  const catTotal = catVals.reduce((s, v) => s + v, 0);

  const styles = {
    root: { fontFamily: "system-ui, -apple-system, sans-serif", background: "#f8f9fa", minHeight: "100vh", color: "#1a1a2e" },
    header: { background: "#fff", borderBottom: "1px solid #eee", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontSize: 18, fontWeight: 600, color: "#1a1a2e", margin: 0 },
    headerDate: { fontSize: 13, color: "#888" },
    body: { maxWidth: 960, margin: "0 auto", padding: "24px 16px" },
    metricGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 },
    metricCard: { background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #eee" },
    metricLabel: { fontSize: 11, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 },
    metricValue: { fontSize: 20, fontWeight: 700 },
    tabs: { display: "flex", gap: 4, marginBottom: 20, background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 4, width: "fit-content" },
    tab: { padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: "transparent", color: "#888", transition: "all 0.15s" },
    tabActive: { background: "#1a1a2e", color: "#fff" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    card: { background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: "18px 20px" },
    cardTitle: { fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 14 },
    typeToggle: { display: "flex", border: "1px solid #eee", borderRadius: 8, overflow: "hidden", marginBottom: 12 },
    typeBtn: { flex: 1, padding: "8px", fontSize: 13, border: "none", cursor: "pointer", background: "transparent", color: "#888", fontWeight: 500, transition: "all 0.15s" },
    typeBtnIncome: { background: "#e8faf4", color: "#0d7a54", fontWeight: 600 },
    typeBtnExpense: { background: "#fff0eb", color: "#b33e15", fontWeight: 600 },
    formGroup: { marginBottom: 10 },
    label: { display: "block", fontSize: 12, color: "#888", marginBottom: 4 },
    input: { width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #e8e8e8", borderRadius: 8, background: "#fafafa", color: "#1a1a2e", outline: "none", boxSizing: "border-box" },
    select: { width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #e8e8e8", borderRadius: 8, background: "#fafafa", color: "#1a1a2e", outline: "none", boxSizing: "border-box" },
    addBtn: { width: "100%", padding: "9px", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 8, cursor: "pointer", background: "#1a1a2e", color: "#fff", marginTop: 6, transition: "opacity 0.15s" },
    txList: { maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 },
    txItem: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f0f0" },
    txIcon: { width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
    txInfo: { flex: 1, minWidth: 0 },
    txName: { fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    txCat: { fontSize: 11, color: "#aaa", marginTop: 1 },
    txAmount: { fontSize: 13, fontWeight: 600, flexShrink: 0 },
    txDel: { background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 14, flexShrink: 0, padding: "0 2px", lineHeight: 1 },
    emptyState: { textAlign: "center", padding: "32px 0", color: "#bbb", fontSize: 13 },
    legendRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 },
    legendItem: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#666" },
    legendDot: { width: 9, height: 9, borderRadius: 2, flexShrink: 0 },
    catRow: { marginBottom: 12 },
    catRowTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    catLabel: { fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 5 },
    catAmt: { fontSize: 12, fontWeight: 600, color: "#1a1a2e" },
    progBar: { height: 5, borderRadius: 99, background: "#f0f0f0", overflow: "hidden" },
    progFill: { height: "100%", borderRadius: 99, transition: "width 0.4s" },
    badge: { display: "inline-block", padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500 },
  };

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>💰 Expense Analytics</h1>
        <span style={styles.headerDate}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      <div style={styles.body}>
        {/* Metric cards */}
        <div style={styles.metricGrid}>
          {[
            { label: "Total Income", value: fmt(totalIncome), color: "#1D9E75" },
            { label: "Total Expenses", value: fmt(totalExpense), color: "#D85A30" },
            { label: "Net Balance", value: (balance < 0 ? "-" : "") + fmt(balance), color: balance >= 0 ? "#1D9E75" : "#D85A30" },
            { label: "Savings Rate", value: `${savingsRate}%`, color: parseFloat(savingsRate) >= 20 ? "#1D9E75" : "#EF9F27" },
          ].map((m) => (
            <div key={m.label} style={styles.metricCard}>
              <div style={styles.metricLabel}>{m.label}</div>
              <div style={{ ...styles.metricValue, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["overview", "transactions"].map((t) => (
            <button
              key={t}
              style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(t)}
            >
              {t === "overview" ? "📊 Overview" : "📋 Transactions"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={styles.grid2}>
            {/* Add transaction */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>Add transaction</div>
              <div style={styles.typeToggle}>
                <button
                  style={{ ...styles.typeBtn, ...(currentType === "income" ? styles.typeBtnIncome : {}) }}
                  onClick={() => handleTypeChange("income")}
                >
                  ↓ Income
                </button>
                <button
                  style={{ ...styles.typeBtn, ...(currentType === "expense" ? styles.typeBtnExpense : {}) }}
                  onClick={() => handleTypeChange("expense")}
                >
                  ↑ Expense
                </button>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Salary, Groceries…"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount (₹)</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="0"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select style={styles.select} value={cat} onChange={(e) => setCat(e.target.value)}>
                  {cats.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button style={styles.addBtn} onClick={handleAdd}>+ Add entry</button>

              {/* Income vs Expense summary */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Income vs Expense</div>
                <div style={{ ...styles.progBar, height: 8, marginBottom: 4 }}>
                  <div style={{ ...styles.progFill, width: `${totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0}%`, background: "#D85A30" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888" }}>
                  <span style={{ color: "#1D9E75" }}>Income {fmt(totalIncome)}</span>
                  <span style={{ color: "#D85A30" }}>Spent {fmt(totalExpense)}</span>
                </div>
              </div>
            </div>

            {/* Category chart */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>Spending breakdown</div>
              {sortedCats.length > 0 ? (
                <>
                  <div style={styles.legendRow}>
                    {sortedCats.map((c, i) => (
                      <span key={c} style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, background: catColors[i] }} />
                        {c}
                      </span>
                    ))}
                  </div>
                  {chartReady && <DonutChart data={catVals} colors={catColors} labels={sortedCats} />}
                </>
              ) : (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                  No expenses recorded yet
                </div>
              )}
            </div>

            {/* Category breakdown bars */}
            <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
              <div style={styles.cardTitle}>Category summary</div>
              {sortedCats.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                  {sortedCats.map((c, i) => {
                    const pct = catTotal > 0 ? ((catMap[c] / catTotal) * 100).toFixed(1) : 0;
                    return (
                      <div key={c} style={styles.catRow}>
                        <div style={styles.catRowTop}>
                          <span style={styles.catLabel}>
                            <span>{CAT_ICONS[c] || "📌"}</span>
                            {c}
                          </span>
                          <span style={styles.catAmt}>
                            {fmt(catMap[c])}{" "}
                            <span style={{ fontWeight: 400, color: "#aaa" }}>({pct}%)</span>
                          </span>
                        </div>
                        <div style={styles.progBar}>
                          <div style={{ ...styles.progFill, width: `${pct}%`, background: catColors[i] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.emptyState}>Add some expenses to see the breakdown</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={styles.cardTitle}>All transactions ({transactions.length})</div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ ...styles.badge, background: "#e8faf4", color: "#0d7a54" }}>Income: {transactions.filter(t => t.type === "income").length}</span>
                <span style={{ ...styles.badge, background: "#fff0eb", color: "#b33e15" }}>Expenses: {transactions.filter(t => t.type === "expense").length}</span>
              </div>
            </div>
            {transactions.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                No transactions yet — add one above
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {transactions.map((t) => (
                  <div key={t.id} style={styles.txItem}>
                    <div style={{ ...styles.txIcon, background: t.type === "income" ? "#e8faf4" : "#fff0eb" }}>
                      {CAT_ICONS[t.cat] || (t.type === "income" ? "💰" : "💸")}
                    </div>
                    <div style={styles.txInfo}>
                      <div style={styles.txName}>{t.desc}</div>
                      <div style={styles.txCat}>{t.cat} · {t.date.toLocaleDateString("en-IN")}</div>
                    </div>
                    <div style={{ ...styles.txAmount, color: t.type === "income" ? "#1D9E75" : "#D85A30" }}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </div>
                    <button style={styles.txDel} onClick={() => handleDelete(t.id)} aria-label="Delete">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
