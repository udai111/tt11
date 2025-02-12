const theme = {
  colors: {
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    accent: "hsl(var(--accent))",
    muted: "hsl(var(--muted))",
    success: "hsl(var(--success))",
    warning: "hsl(var(--warning))",
    error: "hsl(var(--error))",
    border: "hsl(var(--border))"
  },
  borderRadius: {
    sm: "calc(var(--radius) - 2px)",
    DEFAULT: "var(--radius)",
    lg: "calc(var(--radius) + 2px)"
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  }
};

export default theme;
