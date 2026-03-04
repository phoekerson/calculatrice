import { useState } from 'react';
import { CalculatorIcon, TrendingUp, ClockIcon } from 'lucide-react';
import Calculator, { type HistoryEntry } from './components/Calculator';
import GraphPlotter from './components/GraphPlotter';
import HistoryPanel from './components/HistoryPanel';

type Tab = 'calc' | 'graph' | 'history';
type Theme = 'light' | 'dark';

const THEME_KEY = 'calculatrice-theme';

export default function App() {
  const [tab, setTab] = useState<Tab>('calc');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) ?? 'dark';
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

  const addHistory = (entry: HistoryEntry) => {
    setHistory(h => [entry, ...h].slice(0, 50));
  };

  const useResult = (result: string) => {
    console.log('Réutiliser résultat:', result);
    setTab('calc');
  };

  const navItems: { id: Tab; icon: typeof CalculatorIcon; label: string }[] = [
    { id: 'calc', icon: CalculatorIcon, label: 'Calc' },
    { id: 'graph', icon: TrendingUp, label: 'Graph' },
    { id: 'history', icon: ClockIcon, label: 'Hist.' },
  ];

  return (
    <div className={`app-root ${theme === 'light' ? 'light-mode' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <CalculatorIcon size={20} color="white" />
        </div>

        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`nav-btn ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
            title={label}
          >
            <Icon size={20} />
            <span className="nav-btn-label">{label}</span>
            {id === 'history' && history.length > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                background: 'var(--neon)',
                color: 'white',
                fontSize: 8,
                fontWeight: 700,
                width: 14, height: 14,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {history.length > 9 ? '9+' : history.length}
              </span>
            )}
          </button>
        ))}

        <div className="sidebar-spacer" />

        {/* Theme indicator */}
        <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', paddingBottom: 4 }}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-panel">
        {tab === 'calc' && (
          <Calculator
            theme={theme}
            onToggleTheme={toggleTheme}
            onAddHistory={addHistory}
          />
        )}
        {tab === 'graph' && <GraphPlotter />}
        {tab === 'history' && (
          <HistoryPanel
            history={history}
            onClear={() => setHistory([])}
            onUseResult={useResult}
          />
        )}
      </main>
    </div>
  );
}
