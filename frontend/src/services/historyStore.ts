export type HistoryType = "report" | "chat" | "dashboard" | "pdf";

export interface HistoryEntry {
  id: string;
  type: HistoryType;
  title: string;
  detail?: string;
  timestamp: number;
}

const KEY = "alphaforge_history";
const MAX_ENTRIES = 200;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  try {
    const existing = getHistory();
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — fail silently
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
