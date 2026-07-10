import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // change to your FastAPI backend URL
  headers: { "Content-Type": "application/json" },
});

export const getCompany = (ticker: string) => api.get(`/company/${ticker}`);
export const getFinancials = (ticker: string) => api.get(`/financial/${ticker}`);
export const getCharts = (ticker: string) => api.get(`/charts/${ticker}`);
export const getCompare = (ticker: string) => api.get(`/compare/${ticker}`);
export const getReport = (ticker: string) => api.get(`/report/${ticker}`);
export const uploadPDF = (formData: FormData) =>
  api.post("/upload-pdf", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const askQuestion = (payload: any) => api.post("/ask", payload);
export const chatMessage = (payload: any) => api.post("/chat", payload);
export const getQuotes = (symbols?: string) =>
  api.get(`/quotes${symbols ? `?symbols=${symbols}` : ""}`);

export default api;
