import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Send, CheckCircle2, Sparkles } from "lucide-react";
import { uploadPDF, askQuestion } from "../services/api";

export default function PDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadPDF(formData);
      setUploaded(true);
    } catch {
      setUploaded(false);
      alert("Upload failed. Check backend connection.");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAsking(true);
    try {
      const res = await askQuestion({ question, filename: file?.name });
      setAnswer(res.data?.answer || JSON.stringify(res.data));
    } catch {
      setAnswer("⚠️ Could not get an answer. Check backend connection.");
    } finally {
      setAsking(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
  };

  return (
    <div className="px-6 md:px-12 py-8 max-w-3xl mx-auto">
      <h2 className="font-display text-xl font-bold text-terminal-cyan mb-6 flex items-center gap-2">
        <FileText size={18} /> PDF Analyzer
      </h2>

      <motion.div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        whileHover={{ scale: 1.005 }}
        className={`glass rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed transition-colors ${
          dragOver
            ? "border-terminal-cyan bg-terminal-cyan/5"
            : uploaded
            ? "border-terminal-green/40"
            : "border-terminal-border"
        }`}
      >
        {uploaded ? (
          <CheckCircle2 size={32} className="text-terminal-green" />
        ) : (
          <UploadCloud size={32} className={dragOver ? "text-terminal-cyan" : "text-terminal-cyan/70"} />
        )}
        <p className="font-mono text-sm text-terminal-muted text-center">
          {file ? file.name : "Drag & drop a PDF here, or click to browse"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </motion.div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-terminal-cyan text-terminal-bg font-mono text-sm font-semibold px-5 py-3 rounded-lg disabled:opacity-40 hover:bg-cyan-400 transition-colors"
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        {uploaded && (
          <div className="flex items-center gap-2 text-terminal-green font-mono text-xs">
            <CheckCircle2 size={14} /> Indexed — ask away below
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-2 flex items-center gap-2 mt-8">
        <Sparkles size={16} className="text-terminal-cyan ml-2" />
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask something about this PDF..."
          className="bg-transparent flex-1 outline-none text-sm py-3 px-2 placeholder:text-terminal-muted"
        />
        <button
          onClick={handleAsk}
          disabled={asking}
          className="bg-terminal-cyan text-terminal-bg p-3 rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>

      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 mt-4 text-sm leading-relaxed whitespace-pre-wrap border-l-2 border-terminal-cyan"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
}
