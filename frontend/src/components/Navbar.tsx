import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  MessageSquare,
  FileText,
  Search,
  BarChart3,
  History,
} from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Search },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/report", label: "Report", icon: LineChart },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/pdf", label: "PDF Analyzer", icon: FileText },
  { to: "/history", label: "History", icon: History },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="glass fixed top-0 w-full z-50 px-8 py-4 flex items-center justify-between">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="font-mono text-xl font-bold text-terminal-cyan tracking-wider cursor-pointer"
      >
        ALPHA<span className="text-terminal-text">FORGE</span>
      </motion.div>

      <div className="flex gap-6">
        {links.map(({ to, label, icon: Icon }) => {
          const active =
            pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 text-sm font-mono px-3 py-2 rounded-md transition-all ${
                active
                  ? "text-terminal-cyan bg-terminal-panel glow-cyan"
                  : "text-terminal-muted hover:text-terminal-text"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
