import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TickerTape from "./components/TickerTape";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ReportPage from "./pages/ReportPage";
import ChatPage from "./pages/ChatPage";
import PDFPage from "./pages/PDFPage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-terminal-bg min-h-screen text-terminal-text font-sans">
        <Navbar />
        <div className="pt-20">
          <TickerTape />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard/:ticker?" element={<DashboardPage />} />
            <Route path="/report/:ticker?" element={<ReportPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/pdf" element={<PDFPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
