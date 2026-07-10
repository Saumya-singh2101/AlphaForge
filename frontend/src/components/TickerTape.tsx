import { useEffect, useState } from "react";
import { getQuotes } from "../services/api";

interface Quote {
  symbol: string;
  price: number;
  change_pct: number;
  up: boolean;
}

const fallback: Quote[] = [
  { symbol: "NVDA", price: 0, change_pct: 0, up: true },
  { symbol: "AAPL", price: 0, change_pct: 0, up: true },
  { symbol: "AMD", price: 0, change_pct: 0, up: false },
  { symbol: "TSLA", price: 0, change_pct: 0, up: true },
];

export default function TickerTape() {
  const [quotes, setQuotes] = useState<Quote[]>(fallback);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchQuotes = async () => {
      try {
        const res = await getQuotes();
        const data = res.data?.quotes;
        if (mounted && Array.isArray(data) && data.length > 0) {
          setQuotes(data);
          setLive(true);
        }
      } catch {
        // keep fallback / previous quotes silently
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000); // refresh every 60s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const row = [...quotes, ...quotes];

  return (
    <div className="ticker-tape">
      <div className="ticker-tape-track">
        {[...row, ...row].map((t, i) => (
          <span key={i} className="ticker-item">
            <span className="text-terminal-muted">{t.symbol}</span>
            {live && <span className="text-terminal-text">${t.price}</span>}
            <span className={t.up ? "ticker-up" : "ticker-down"}>
              {t.up ? "▲" : "▼"} {Math.abs(t.change_pct).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
