import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, User } from "lucide-react";
import { chatMessage } from "../services/api";
import { addHistory } from "../services/historyStore";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Compare AMD vs NVDA financials",
  "Is TSLA overvalued right now?",
  "Summarize today's tech sector news",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Hi! Ask me anything about a company, market, or financial data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: Msg = { role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatMessage({ message: content });
      const reply = res.data?.reply || res.data?.response || JSON.stringify(res.data);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      addHistory({
        type: "chat",
        title: content.slice(0, 60),
        detail: reply.slice(0, 100),
      });
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Could not reach backend. Check connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-12 py-8 max-w-3xl mx-auto flex flex-col h-[80vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-terminal-cyan flex items-center gap-2">
          <Sparkles size={18} /> AI Chat
        </h2>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-terminal-muted uppercase tracking-wider">
          <span className="live-dot" /> Online
        </span>
      </div>

      <div className="glass rounded-xl flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="rounded-full p-2 h-fit bg-gradient-to-br from-terminal-cyan to-terminal-blue shadow-lg shadow-cyan-500/20">
                <Sparkles size={14} className="text-terminal-bg" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-terminal-cyan text-terminal-bg font-medium rounded-br-sm"
                  : "bg-terminal-panel text-terminal-text border border-terminal-border rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="bg-terminal-panel border border-terminal-border rounded-full p-2 h-fit">
                <User size={14} className="text-terminal-text" />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="rounded-full p-2 bg-gradient-to-br from-terminal-cyan to-terminal-blue">
              <Sparkles size={14} className="text-terminal-bg" />
            </div>
            <div className="flex gap-1 bg-terminal-panel border border-terminal-border rounded-2xl px-4 py-3">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-terminal-cyan"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="font-mono text-xs text-terminal-muted hover:text-terminal-cyan border border-terminal-border hover:border-terminal-cyan/40 rounded-full px-3 py-1.5 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="glass rounded-xl p-2 flex items-center gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your question..."
          className="bg-transparent flex-1 outline-none text-sm py-3 px-3 placeholder:text-terminal-muted"
        />
        <button
          onClick={() => send()}
          className="bg-terminal-cyan text-terminal-bg p-3 rounded-lg hover:bg-cyan-400 transition-all"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
