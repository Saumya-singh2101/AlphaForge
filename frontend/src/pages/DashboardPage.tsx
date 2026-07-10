import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Search,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  Globe,
  FileText,
} from "lucide-react";
import { getCompany, getFinancials, getCharts, getCompare } from "../services/api";
import { addHistory } from "../services/historyStore";

const negativeKeys = ["debt", "risk", "negative"];

// Fields that aren't financial metrics and shouldn't render as cards.
const NON_METRIC_KEYS = [
  "ticker",
  "summary",
  "positive_signals",
  "negative_signals",
  "financial_health_score",
  "currency",
];

// Map ISO currency codes (as returned by yfinance / the backend) to symbols.
// Falls back to the code itself (e.g. "AED") if we don't have a symbol for it.
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  HKD: "HK$",
  AUD: "A$",
  CAD: "C$",
};

function getCurrencySymbol(currency?: string) {
  if (!currency) return "$";
  return CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;
}

function formatVal(label: string, value: any, currency?: string) {
  const numeric = typeof value === "number";
  if (!numeric) return String(value ?? "N/A");
  const symbol = getCurrencySymbol(currency);
  if (Math.abs(value) >= 1e9) return `${symbol}${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${symbol}${(value / 1e6).toFixed(2)}M`;
  if (label.toLowerCase().includes("ratio") || label.toLowerCase().includes("eps")) {
    return value.toFixed(2);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function FinancialCard({
  label,
  value,
  delay,
  currency,
}: {
  label: string;
  value: any;
  delay: number;
  currency?: string;
}) {
  const numeric = typeof value === "number";
  const isNegativeMetric = negativeKeys.some((k) => label.toLowerCase().includes(k));
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass card-hover rounded-xl p-4 relative"
    >
      <div className="text-terminal-muted text-[10px] font-mono uppercase tracking-wider flex items-center justify-between">
        {label.replace(/_/g, " ")}
        {numeric &&
          (isNegativeMetric ? (
            <ArrowDownRight size={12} className="text-terminal-red" />
          ) : (
            <ArrowUpRight size={12} className="text-terminal-green" />
          ))}
      </div>
      <div className="font-display text-lg font-bold mt-1.5">{formatVal(label, value, currency)}</div>
    </motion.div>
  );
}

function HealthScore({ financial }: { financial: any }) {
  const score = financial.financial_health_score ?? 0;
  const color = score >= 7 ? "#00ff9d" : score >= 4 ? "#ffc857" : "#ff5d6c";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass card-hover rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-xs text-terminal-muted uppercase tracking-wider">
          Financial Health Score
        </h3>
        <span className="font-display text-2xl font-bold" style={{ color }}>
          {score}/10
        </span>
      </div>
      <div className="w-full bg-terminal-border rounded-full h-2 mb-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-2 rounded-full"
          style={{ background: color }}
        />
      </div>
      {financial.summary && (
        <p className="text-sm text-terminal-text/80 mb-4">{financial.summary}</p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-mono text-terminal-green mb-2 uppercase tracking-wider">
            Positive Signals
          </p>
          {(financial.positive_signals || []).map((s: string) => (
            <div key={s} className="flex items-start gap-2 text-sm text-terminal-text/80 mb-1.5">
              <CheckCircle2 size={13} className="text-terminal-green flex-shrink-0 mt-0.5" /> {s}
            </div>
          ))}
        </div>
        <div>
          <p className="text-[11px] font-mono text-terminal-red mb-2 uppercase tracking-wider">
            Risk Signals
          </p>
          {(financial.negative_signals || []).map((s: string) => (
            <div key={s} className="flex items-start gap-2 text-sm text-terminal-text/80 mb-1.5">
              <AlertTriangle size={13} className="text-terminal-red flex-shrink-0 mt-0.5" /> {s}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CompetitorTable({ ticker }: { ticker: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    getCompare(ticker)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading)
    return (
      <div className="glass rounded-xl p-6 flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-terminal-cyan/20 border-t-terminal-cyan rounded-full animate-spin" />
        <span className="font-mono text-xs text-terminal-muted">Fetching competitors...</span>
      </div>
    );

  const rows = data?.comparison || [];
  if (rows.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass card-hover rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Globe size={16} className="text-terminal-cyan" />
        <h3 className="font-mono text-xs text-terminal-muted uppercase tracking-wider">
          Competitor Comparison
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-terminal-border">
              {["Ticker", "Revenue", "Market Cap", "P/E Ratio", "ROE"].map((h) => (
                <th key={h} className="text-left text-[11px] text-terminal-muted py-2 pr-4 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, i: number) => (
              <tr
                key={i}
                className={`border-b border-terminal-border/50 ${
                  row.ticker === ticker ? "text-terminal-cyan" : "text-terminal-text/80"
                }`}
              >
                <td className="py-2.5 pr-4 font-semibold">
                  {row.ticker === ticker ? "★ " : ""}
                  {row.ticker}
                </td>
                <td className="py-2.5 pr-4">{formatVal("revenue", row.revenue, row.currency)}</td>
                <td className="py-2.5 pr-4">{formatVal("market_cap", row.market_cap, row.currency)}</td>
                <td className="py-2.5 pr-4">{row.pe_ratio?.toFixed(2) ?? "N/A"}</td>
                <td className="py-2.5 pr-4">
                  {row.roe != null ? `${(row.roe * 100).toFixed(1)}%` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { ticker: paramTicker } = useParams();
  const navigate = useNavigate();
  const [ticker, setTicker] = useState(paramTicker || "");
  const [company, setCompany] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (paramTicker) fetchData(paramTicker);
  }, [paramTicker]);

  const fetchData = async (t: string) => {
    setLoading(true);
    setError("");
    setCompany(null);
    setFinancials(null);
    setChartData([]);
    try {
      const [companyRes, financialRes, chartsRes] = await Promise.all([
        getCompany(t),
        getFinancials(t),
        getCharts(t),
      ]);
      setCompany(companyRes.data);
      setFinancials(financialRes.data);
      setChartData(chartsRes.data?.prices || chartsRes.data || []);
      addHistory({
        type: "dashboard",
        title: t.toUpperCase(),
        detail: companyRes.data?.name || "Dashboard lookup",
      });
    } catch (err) {
      setError("Could not fetch data. Check ticker or backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!ticker.trim()) return;
    navigate(`/dashboard/${ticker.trim().toUpperCase()}`);
  };

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-4">
          <LayoutDashboard size={13} className="text-terminal-cyan" />
          <span className="font-mono text-[11px] text-terminal-muted uppercase tracking-widest">
            Company Intelligence
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Equity <span className="text-terminal-cyan">Dashboard</span>
        </h1>
        <p className="text-terminal-muted text-sm mt-2 max-w-md">
          Live company profile, financial health, competitors, and price action — in one view.
        </p>
      </motion.div>

      <div className="glass glow-cyan rounded-xl p-2 flex items-center gap-2 mb-10 w-full max-w-md">
        <Search className="text-terminal-cyan ml-3" size={18} />
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Ticker symbol..."
          className="bg-transparent flex-1 outline-none font-mono text-sm py-2.5 placeholder:text-terminal-muted"
        />
        <button
          onClick={handleSearch}
          className="bg-terminal-cyan text-terminal-bg font-mono text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-cyan-400 transition-colors"
        >
          Load
        </button>
      </div>

      {loading && (
        <div className="font-mono text-terminal-cyan animate-pulse flex items-center gap-2 mb-8">
          <span className="live-dot" /> Pulling live data...
        </div>
      )}
      {error && <div className="font-mono text-terminal-red mb-8">{error}</div>}

      {!company && !loading && !error && (
        <div className="glass rounded-xl p-12 text-center w-full max-w-md">
          <Building2 className="text-terminal-muted mx-auto mb-3" size={28} />
          <p className="font-mono text-sm text-terminal-muted">
            Search a ticker to load company data
          </p>
        </div>
      )}

      <div className="w-full space-y-6">
        {company && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass card-hover rounded-xl p-6 md:p-8 relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-terminal-cyan/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4 min-w-0">
                <div className="bg-terminal-panel rounded-lg p-3 border border-terminal-border shrink-0">
                  <Building2 className="text-terminal-cyan" size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-display text-2xl font-bold">
                      {company.name || paramTicker}
                    </h2>
                    <span className="pill pill-buy">{paramTicker}</span>
                    {company.country && (
                      <span className="font-mono text-[11px] border border-terminal-border text-terminal-muted px-2 py-0.5 rounded">
                        🌍 {company.country}
                      </span>
                    )}
                  </div>
                  <p className="text-terminal-muted text-xs mt-1.5 font-mono uppercase tracking-wide">
                    {company.sector} {company.industry && `· ${company.industry}`}
                  </p>
                  <p className="text-sm mt-3 leading-relaxed text-terminal-text/90">
                    {company.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/report/${paramTicker}`)}
                className="flex items-center gap-2 border border-terminal-cyan/30 text-terminal-cyan font-mono text-xs px-4 py-2.5 rounded-lg hover:bg-terminal-cyan/10 transition-colors shrink-0"
              >
                <FileText size={14} /> Full AI Report
              </button>
            </div>
          </motion.div>
        )}

        {financials && <HealthScore financial={financials} />}

        {chartData?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass card-hover rounded-xl p-6 h-80"
          >
            <h3 className="font-mono text-xs text-terminal-muted mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-terminal-cyan" /> Price Chart
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2530" />
                <XAxis dataKey="date" stroke="#7d8590" fontSize={10} />
                <YAxis stroke="#7d8590" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "#0f1419",
                    border: "1px solid #1c2530",
                    fontFamily: "monospace",
                  }}
                />
                <Line type="monotone" dataKey="close" stroke="#00d4ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {financials && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(financials)
              .filter(([k]) => !NON_METRIC_KEYS.includes(k))
              .map(([key, value], i) => (
                <FinancialCard
                  key={key}
                  label={key}
                  value={value}
                  delay={0.1 + i * 0.03}
                  currency={financials.currency}
                />
              ))}
          </div>
        )}

        {paramTicker && <CompetitorTable ticker={paramTicker} />}
      </div>
    </div>
  );
}
