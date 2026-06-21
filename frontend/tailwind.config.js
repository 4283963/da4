/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        base: {
          DEFAULT: "#0b0f14",
          panel: "#131922",
          elevated: "#1a2230",
          hover: "#212c3d",
          border: "#2a3445",
          line: "#1f2837",
        },
        ink: {
          DEFAULT: "#e8edf3",
          muted: "#8a94a6",
          faint: "#5a6473",
        },
        amber: {
          DEFAULT: "#ff7a1a",
          glow: "#ffae42",
          dim: "#7a3a0d",
        },
        cyan: {
          tech: "#36d6e7",
          dim: "#155f6b",
        },
        danger: {
          DEFAULT: "#ff4d4d",
          dim: "#7a1a1a",
        },
        warn: "#ffb020",
      },
      fontFamily: {
        display: ['"Chakra Petch"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        body: ['"Sora"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(255,122,26,0.45)",
        "glow-cyan": "0 0 20px rgba(54,214,231,0.35)",
        "glow-danger": "0 0 24px rgba(255,77,77,0.5)",
        panel: "0 10px 50px rgba(0,0,0,0.6)",
        inset: "inset 0 0 0 1px rgba(255,255,255,0.02)",
      },
      keyframes: {
        flicker: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        scan: {
          "0%": { transform: "translateY(-110%)" },
          "100%": { transform: "translateY(110%)" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 10px rgba(255,122,26,0.3)" },
          "50%": { boxShadow: "0 0 26px rgba(255,122,26,0.7)" },
        },
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        flicker: "flicker 2.4s ease-in-out infinite",
        scan: "scan 3.4s linear infinite",
        pulseGlow: "pulseGlow 1.8s ease-in-out infinite",
        sweep: "sweep 2s linear infinite",
        rise: "rise 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
