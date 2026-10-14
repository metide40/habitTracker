import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { useAuth } from './store/useAuth';
import AuthPage from './pages/Auth';
import NotFound from './pages/NotFound';
import { AppLayout } from './components/layout/AppLayout';
import { Modal } from './components/ui/Modal';
import { useHotkeys } from './hooks/useHotkeys';
import { useTheme } from './hooks/useTheme';
import Today from './pages/Today';
import Habits from './pages/Habits';
import Focus from './pages/Focus';
import Insights from './pages/Insights';
import Settings from './pages/Settings';

function HotkeyProvider({ children }) {
  useTheme();
  const [helpOpen, setHelpOpen] = useState(false);

  useHotkeys({
    onNewHabit: () => {
      // Navigate handled by page; dispatch custom event
      window.dispatchEvent(new CustomEvent('tempo:new-habit'));
    },
    onShowHelp: () => setHelpOpen(true),
  });

  return (
    <>
      {children}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Keyboard shortcuts" size="sm">
        <ul className="space-y-2.5 text-sm">
          {[
            ['N', 'New habit'],
            ['G then T', 'Go to Today'],
            ['G then H', 'Go to Habits'],
            ['G then F', 'Go to Focus'],
            ['G then I', 'Go to Insights'],
            ['G then S', 'Go to Settings'],
            ['Space', 'Start / pause timer'],
            ['?', 'Show this help'],
          ].map(([key, desc]) => (
            <li key={key} className="flex items-center justify-between">
              <span className="text-muted">{desc}</span>
              <kbd className="px-1.5 py-0.5 text-2xs font-medium bg-background border border-border rounded text-foreground">
                {key}
              </kbd>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

// Signed out -> login. Signed in -> wait for data, then show the app.
function Gate() {
  const status = useAuth((s) => s.status);
  const hydrated = useStore((s) => s._hydrated);
  const loadError = useStore((s) => s.loadError);
  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => {
    if (status === 'in') hydrate();
  }, [status, hydrate]);

  if (status === 'out') return <Navigate to="/login" replace />;
  if (loadError)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 text-center px-6">
        <p className="font-serif text-2xl text-foreground">Can't load your data</p>
        <p className="text-sm text-muted max-w-sm">{loadError}</p>
        <button onClick={hydrate} className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary-hover">Try again</button>
      </div>
    );
  if (status !== 'in' || !hydrated) return <div className="min-h-screen bg-background" />;
  return <AppLayout />;
}

export default function App() {
  const init = useAuth((s) => s.init);
  useEffect(() => { init(); }, [init]);
  return (
    <BrowserRouter>
      <HotkeyProvider>
        <Routes>
          <Route path="login" element={<AuthPage mode="login" />} />
          <Route path="register" element={<AuthPage mode="register" />} />
          <Route element={<Gate />}>
            <Route index element={<Today />} />
            <Route path="habits" element={<Habits />} />
            <Route path="focus" element={<Focus />} />
            <Route path="insights" element={<Insights />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HotkeyProvider>
    </BrowserRouter>
  );
}
