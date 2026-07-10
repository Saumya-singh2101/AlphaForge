import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  History as HistoryIcon,
  FileText,
  MessageSquare,
  BarChart3,
  FileUp,
  Trash2,
} from "lucide-react";
import { getHistory, clearHistory, HistoryEntry } from "../services/historyStore";

const typeMeta: Record<string, { icon: any; label: string; route: (e: HistoryEntry) => string }> = {
  report: { icon: FileText, label: "Report", route: (e) => `/report/${e.title}` },
  dashboard: { icon: BarChart3, label: "Dashboard", route: (e) => `/dashboard/${e.title}` },
  chat: { icon: MessageSquare, label: "Chat", route: () => `/chat` },
  pdf: { icon: FileUp, label: "PDF", route: () => `/pdf` },
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.type === filter);

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  return (
    <div className="px-6 md:px-12 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-bold text-terminal-cyan flex items-center gap-2">
          <HistoryIcon size={20} /> History
        </h2>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-mono text-terminal-muted hover:text-terminal-red transition-colors"
          >
            <Trash2 size={14} /> Clear all
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "report", "dashboard", "chat", "pdf"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
              filter === f
                ? "border-terminal-cyan text-terminal-cyan bg-terminal-cyan/10"
                : "border-terminal-border text-terminal-muted hover:text-terminal-text"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center text-terminal-muted font-mono text-sm">
          No history yet — your reports, chats, and lookups will show up here.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, i) => {
            const meta = typeMeta[entry.type];
            const Icon = meta?.icon || HistoryIcon;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => navigate(meta.route(entry))}
                className="glass card-hover rounded-xl p-4 flex items-center gap-4 cursor-pointer"
              >
                <div className="bg-terminal-panel border border-terminal-border rounded-lg p-2.5">
                  <Icon size={16} className="text-terminal-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{entry.title}</span>
                    <span className="pill pill-hold text-[9px] py-0.5">{meta?.label}</span>
                  </div>
                  {entry.detail && (
                    <p className="text-terminal-muted text-xs mt-1 truncate">{entry.detail}</p>
                  )}
                </div>
                <span className="text-terminal-muted text-[11px] font-mono whitespace-nowrap">
                  {timeAgo(entry.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
