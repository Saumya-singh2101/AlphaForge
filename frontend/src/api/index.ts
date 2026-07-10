import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 60000,
});

// Separate instance for PDF upload — longer timeout
const pdfApi = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 300000, // 5 minutes for large PDFs
});

// ─── Types ───────────────────────────────────────────────
export interface FinancialData {
  ticker: string;
  revenue: number | null;
  net_income: number | null;
  eps: number | null;
  pe_ratio: number | null;
  debt: number | null;
  cash_flow: number | null;
  financial_health_score: number;
  positive_signals: string[];
  negative_signals: string[];
  risk_level: string;
  summary: string;
}

export interface NewsItem {
  title: string;
  analysis: string;
  url: string;
  published_at: string;
  source: string;
}

export interface CompanyInfo {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  country: string;
  marketCap: number;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── API Calls ───────────────────────────────────────────

export const getCompany = async (ticker: string) => {
  const res = await api.get(`/company/${ticker}`);
  return res.data;
};

export const getFinancial = async (ticker: string): Promise<FinancialData> => {
  const res = await api.get(`/financial/${ticker}`);
  return res.data;
};

export const getCharts = async (ticker: string) => {
  const res = await api.get(`/charts/${ticker}`);
  return res.data;
};

export const getCompare = async (ticker: string) => {
  const res = await api.get(`/compare/${ticker}`);
  return res.data;
};

export const getReport = async (ticker: string) => {
  const res = await api.get(`/report/${ticker}`);
  return res.data;
};

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await pdfApi.post('/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const askPDF = async (question: string) => {
  const res = await pdfApi.post('/ask', { question });
  return res.data;
};

export const sendChat = async (message: string, session_id?: string) => {
  const res = await api.post('/chat', { message, session_id });
  return res.data;
};
