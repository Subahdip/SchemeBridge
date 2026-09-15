/**
 * Shared Design System & Theme Tokens for Govt. Scheme Matcher
 * Ensures visual consistency across Home Landing (/) and Assessment (/assessment) pages.
 */

export const theme = {
  colors: {
    // Primary Purple & Blue Gradients
    gradientPrimary: "from-indigo-600 via-purple-600 to-teal-500",
    gradientButton: "from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
    gradientHero: "from-indigo-950/80 via-purple-950/40 to-background",
    gradientCard: "from-card/90 via-card/70 to-card/50",
    
    // Teal & Emerald Accents
    accentTeal: "#14b8a6", // Tailwind teal-500
    accentEmerald: "#10b981", // Tailwind emerald-500
    accentIndigo: "#6366f1", // Tailwind indigo-500
    accentPurple: "#a855f7", // Tailwind purple-500
    accentAmber: "#f59e0b", // Tailwind amber-500
    
    // Dark Theme Foundation
    darkBg: "#070b14",
    darkCard: "#0d1424",
    darkBorder: "rgba(255, 255, 255, 0.08)",
  },

  typography: {
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    heroHeading: "text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight",
    sectionHeading: "text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight",
    cardTitle: "text-lg sm:text-xl font-bold tracking-tight text-foreground",
    subtext: "text-sm sm:text-base text-muted-foreground leading-relaxed",
    caption: "text-xs text-muted-foreground",
    mono: "font-mono font-bold",
  },

  spacing: {
    sectionPadding: "py-16 md:py-24",
    containerLanding: "max-w-6xl",
    containerDashboard: "max-w-5xl",
    cardPadding: "p-6 sm:p-8",
  },

  cards: {
    glass: "rounded-2xl border border-border/70 bg-card/70 dark:bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300",
    hoverGlow: "hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1",
    accentBorder: "relative overflow-hidden before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-teal-500",
  },

  buttons: {
    primaryGradient: "font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all",
    tealAction: "font-semibold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition-all",
    outlineGlass: "border border-border/80 bg-background/60 hover:bg-muted text-foreground backdrop-blur transition-all",
  },

  badges: {
    glow: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  }
} as const;
