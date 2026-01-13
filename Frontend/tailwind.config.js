/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    theme: {
        extend: {
            /* =====================================================
               COLORS — SpaceScope Aurora System
               ===================================================== */
            colors: {
                /* Primary interaction */
                primary: "#00d9ff",        // Cyan primary
                success: "#00ff88",
                error: "#ff3366",
                warning: "#ffaa00",

                /* Core backgrounds */
                "background-dark": "#050714", // Deep space
                "space-blue": "#0a0e27",
                "panel-dark": "#0f131f",

                /* Glass surfaces */
                glass: "rgba(15, 19, 34, 0.6)",
                "glass-strong": "rgba(15, 19, 34, 0.9)",

                /* Text system */
                secondary: "#94a3b8", // slate-400
                muted: "#64748b",     // slate-500

                /* Inputs & borders */
                "input-bg": "#151a29",
                "input-border": "rgba(255,255,255,0.05)",

                /* Alerts */
                "alert-danger-bg": "rgba(255,51,102,0.15)",
                "alert-danger-border": "rgba(255,51,102,0.3)",

                /* Accent utility */
                cyan: "#00d9ff",
            },

            /* =====================================================
               TYPOGRAPHY
               ===================================================== */
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Space Grotesk", "sans-serif"],
                mono: [
                    "ui-monospace",
                    "SFMono-Regular",
                    "Menlo",
                    "Monaco",
                    "Consolas",
                    "monospace",
                ],
            },

            fontSize: {
                mega: ["32px", { lineHeight: "1.2", fontWeight: "900" }],
                h1: ["24px", { lineHeight: "1.2", fontWeight: "700" }],
                h2: ["18px", { lineHeight: "1.3", fontWeight: "700" }],
                body: ["14px", { lineHeight: "1.5" }],
                small: ["12px", { lineHeight: "1.5" }],
                micro: ["10px", { lineHeight: "1.4" }],
            },

            letterSpacing: {
                wide: "0.12em",
                tight: "-0.02em",
            },

            /* =====================================================
               BACKGROUNDS & GRADIENTS
               ===================================================== */
            backgroundImage: {
                "space-gradient":
                    "radial-gradient(circle at 70% 50%, #1a2040 0%, #050714 100%)",

                "glass-gradient":
                    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0))",

                "btn-gradient":
                    "linear-gradient(90deg, #00d9ff 0%, #b900ff 100%)",
            },

            /* =====================================================
               ANIMATIONS
               ===================================================== */
            animation: {
                spinSlow: "spin 1s linear infinite",
                pulseGlow: "pulseGlow 2s ease-in-out infinite",
                float: "float 6s ease-in-out infinite",
                slideUp: "slideUp 0.3s ease-out forwards",
            },

            keyframes: {
                pulseGlow: {
                    "0%,100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
                float: {
                    "0%,100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-15px)" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },

            /* =====================================================
               ACCESSIBILITY & INTERACTION
               ===================================================== */
            ringColor: {
                primary: "rgba(0,217,255,0.5)",
            },

            ringOffsetWidth: {
                3: "3px",
            },

            boxShadow: {
                glass:
                    "0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)",
                glow:
                    "0 0 20px rgba(0,217,255,0.25)",
            },

            transitionDuration: {
                DEFAULT: "200ms",
            },

            /* =====================================================
               RESPONSIVE BREAKPOINTS (optional override)
               ===================================================== */
            screens: {
                sm: "640px",
                md: "768px",   // Tablet
                lg: "1024px",
                xl: "1280px",  // Desktop
            },
        },
    },

    plugins: [],
};
