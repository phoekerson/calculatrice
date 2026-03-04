import { useState, useEffect } from 'react';
import Calculator from './components/Calculator';

const THEME_KEY = 'calculatrice-theme';
export type Theme = 'light' | 'dark';

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved === 'light' ? 'light' : 'dark') as Theme;
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-slate-950' : 'bg-slate-100';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${bgClass}`}>
      <Calculator theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
    </div>
  );
}
