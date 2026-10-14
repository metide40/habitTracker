import { NavLink } from 'react-router-dom';
import {
  Sun,
  ListChecks,
  Timer,
  BarChart3,
  Settings,
  Flame,
  Moon,
  Monitor,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useStore, useActiveHabits } from '../../store/useStore';
import { getCurrentStreak } from '../../utils/streaks';
import { useTheme } from '../../hooks/useTheme';
import { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { REMOTE } from '../../api';

const nav = [
  { to: '/', label: 'Today', icon: Sun },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const habits = useActiveHabits();
  const completions = useStore((s) => s.completions);
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const bestStreak = habits.reduce((max, h) => {
    const s = getCurrentStreak(h, completions);
    return s > max ? s : max;
  }, 0);

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  const user = useAuth((st) => st.user);
  const logout = useAuth((st) => st.logout);

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7C2 7 4 3 7 3C10 3 12 7 12 7C12 7 10 11 7 11C4 11 2 7 2 7Z" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="7" cy="7" r="1.4" fill="white"/>
          </svg>
        </div>
        <span className="font-serif text-xl text-foreground tracking-tight">Tempo</span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium transition-colors duration-fast
              ${isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:text-foreground hover:bg-background'}`
            }
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-2">
        {bestStreak > 0 && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-background border border-border">
            <Flame className="w-4 h-4 text-category-amber flex-shrink-0" />
            <div>
              <p className="text-2xs text-muted">Best streak</p>
              <p className="text-sm font-semibold tabular text-foreground">
                {bestStreak} day{bestStreak !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={cycleTheme}
          className="flex items-center gap-3 w-full px-3 h-9 rounded-md text-sm text-muted hover:text-foreground hover:bg-background transition-colors"
          aria-label={`Theme: ${theme}`}
        >
          <ThemeIcon className="w-4 h-4" />
          <span className="capitalize">Theme: {theme}</span>
        </button>
        {REMOTE && user && (
          <div className="flex items-center gap-2.5 pt-3 mt-1 border-t border-border">
            <span className="w-8 h-8 rounded-full bg-primary-soft text-primary text-sm font-medium flex items-center justify-center flex-shrink-0">
              {user.name?.trim()?.[0]?.toUpperCase() || '?'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-2xs text-muted truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-background transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-md bg-surface border border-border shadow-soft"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-surface border-r border-border">
            <button className="absolute top-3 right-3 p-1.5 text-muted" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
            {content}
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 w-60 bg-surface border-r border-border">
        {content}
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-14 bg-surface border-t border-border px-2 safe-area-pb">
        {nav.slice(0, 4).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-2xs font-medium ${isActive ? 'text-primary' : 'text-muted'}`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
