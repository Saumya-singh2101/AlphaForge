/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Bloomberg-inspired palette
        bg:        "#0a0e1a",   // deep navy black
        surface:   "#0f1629",   // card background
        border:    "#1e2d4a",   // subtle borders
        cyan:      "#00d4ff",   // primary accent
        cyanDim:   "#0099bb",   // muted cyan
        amber:     "#f59e0b",   // warning / highlight
        green:     "#00ff88",   // positive / profit
        red:       "#ff4444",   // negative / loss
        textPrime: "#e8f4fd",   // primary text
        textMuted: "#6b8cad",   // muted text
        textDim:   "#3a5070",   // very muted
      },
      fontFamily: {
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":    "fadeIn 0.5s ease-in-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "glow":       "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        glow:    { "0%": { boxShadow: "0 0 5px #00d4ff33" }, "100%": { boxShadow: "0 0 20px #00d4ff66, 0 0 40px #00d4ff22" } },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        "hero-gradient": "radial-gradient(ellipse at 20% 50%, #00d4ff15 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0099bb10 0%, transparent 50%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
