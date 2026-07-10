import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Search,
  FileDown,
  TrendingUp,
  FileText,
  Target,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import { getReport } from "../services/api";
import { addHistory } from "../services/historyStore";

interface NewsItem {
  title: string;
  analysis?: string;
  url: string;
  published_at?: string;
  source?: string;
}

interface ReportData {
  ticker: string;
  report: string;
  raw_data?: {
    financial?: any;
    news?: NewsItem[];
    competitors?: {
      comparison?: Array<{
        ticker: string;
        revenue?: number;
        market_cap?: number;
        pe_ratio?: number;
        roe?: number;
      }>;
    };
  };
}

export default function ReportPage() {
  const { ticker: paramTicker } = useParams();
  const navigate = useNavigate();
  const [ticker, setTicker] = useState(paramTicker || "");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (paramTicker) fetchReport(paramTicker);
  }, [paramTicker]);

  const fetchReport = async (t: string) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await getReport(t);
      setData(res.data);
      addHistory({
        type: "report",
        title: t.toUpperCase(),
        detail: res.data?.report?.slice(0, 100) || "AI report generated",
      });
    } catch {
      setError("Could not generate report. Check ticker or backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!ticker.trim()) return;
    navigate(`/report/${ticker.trim().toUpperCase()}`);
  };

  const comparison = data?.raw_data?.competitors?.comparison || [];
  const chartData = comparison.map((c) => ({
    ticker: c.ticker,
    "Revenue ($B)": c.revenue ? +(c.revenue / 1e9).toFixed(1) : 0,
    "Market Cap ($B)": c.market_cap ? +(c.market_cap / 1e9).toFixed(1) : 0,
  }));

  const news = data?.raw_data?.news || [];

  const ratingMatch = data?.report?.match(/\*\*Rating\*\*:\s*([A-Z]+)/i);
  const rating = ratingMatch?.[1]?.toUpperCase();
  const pillClass =
    rating === "BUY" ? "pill-buy" : rating === "SELL" ? "pill-sell" : "pill-hold";

  const targetMatch = data?.report?.match(/\*\*Target Price\*\*:\s*\*\*?\$?([\d.]+)\*?\*?/i);
  const targetPrice = targetMatch?.[1];

  const handlePrint = () => window.print();

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto flex flex-col items-center">
      {/* Header — hidden on print */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-8 print:hidden"
      >
        <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-4">
          <FileText size={13} className="text-terminal-cyan" />
          <span className="font-mono text-[11px] text-terminal-muted uppercase tracking-widest">
            AI Equity Research
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Generate <span className="text-terminal-cyan">Report</span>
        </h1>
        <p className="text-terminal-muted text-sm mt-2 max-w-md">
          Full equity research — financials, risk, competitors, sourced news, and rating.
        </p>
      </motion.div>

      <div className="glass glow-cyan rounded-xl p-2 flex items-center gap-2 mb-10 w-full max-w-md print:hidden">
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
          Generate
        </button>
      </div>

      {loading && (
        <div className="font-mono text-terminal-cyan animate-pulse flex items-center gap-2 mb-8 print:hidden">
          <span className="live-dot" /> Generating AI report...
        </div>
      )}
      {error && <div className="font-mono text-terminal-red mb-8 print:hidden">{error}</div>}

      {!data && !loading && !error && (
        <div className="glass rounded-xl p-12 text-center w-full max-w-md print:hidden">
          <FileText className="text-terminal-muted mx-auto mb-3" size={28} />
          <p className="font-mono text-sm text-terminal-muted">
            Enter a ticker to generate a full AI research report
          </p>
        </div>
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          id="report-document"
          className="glass rounded-xl p-6 md:p-10 w-full print:bg-white print:text-black print:shadow-none print:border-none"
        >
          <div className="flex items-center justify-between mb-6 border-b border-terminal-border pb-6 flex-wrap gap-4 print:border-gray-300">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-3xl font-bold text-terminal-cyan print:text-black">
                  {data.ticker}
                </h2>
                {rating && <span className={`pill ${pillClass} print:border print:border-black`}>{rating}</span>}
              </div>
              <p className="text-terminal-muted text-xs font-mono mt-1 uppercase tracking-wide">
                AI-Generated Equity Research Report · {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4 print:hidden">
              {targetPrice && (
                <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
                  <Target size={14} className="text-terminal-green" />
                  <div>
                    <div className="text-[10px] font-mono text-terminal-muted uppercase">Target</div>
                    <div className="font-display text-sm font-bold text-terminal-green">${targetPrice}</div>
                  </div>
                </div>
              )}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 text-xs font-mono text-terminal-muted hover:text-terminal-cyan border border-terminal-border rounded-lg px-3 py-2 transition-colors"
              >
                <FileDown size={16} /> Export PDF
              </button>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="mb-10 break-inside-avoid">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-terminal-cyan print:text-black" />
                <h3 className="font-mono text-sm text-terminal-muted uppercase tracking-wide print:text-black">
                  Competitor Comparison
                </h3>
              </div>
              <div className="h-72 bg-terminal-panel rounded-lg p-4 print:bg-gray-50 print:border print:border-gray-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2530" />
                    <XAxis dataKey="ticker" stroke="#7d8590" fontSize={11} />
                    <YAxis stroke="#7d8590" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "#0a0e14",
                        border: "1px solid #1c2530",
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace" }} />
                    <Bar dataKey="Revenue ($B)" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Market Cap ($B)" fill="#0a84ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <article className="report-markdown text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.report}</ReactMarkdown>
          </article>

          {news.length > 0 && (
            <div className="mt-10 pt-8 border-t border-terminal-border print:border-gray-300 break-inside-avoid">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper size={16} className="text-terminal-cyan print:text-black" />
                <h3 className="font-mono text-sm text-terminal-muted uppercase tracking-wide print:text-black">
                  Sources &amp; Citations
                </h3>
              </div>
              <ol className="space-y-3">
                {news.map((n, i) => (
                  <li key={i} className="text-sm break-inside-avoid">
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terminal-cyan hover:underline print:text-black flex items-start gap-1.5"
                    >
                      <span className="font-mono text-terminal-muted print:text-gray-600 shrink-0">
                        [{i + 1}]
                      </span>
                      <span className="flex-1">
                        {n.title}
                        <ExternalLink size={11} className="inline ml-1 -translate-y-0.5" />
                      </span>
                    </a>
                    <div className="text-[11px] text-terminal-muted font-mono mt-0.5 ml-6 print:text-gray-500">
                      {n.source} {n.published_at && `· ${formatDate(n.published_at)}`}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
