import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useTheme() {
  const theme = useStore((s) => s.settings?.theme ?? 'system');
  const updateSettings = useStore((s) => s.updateSettings);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t) => {
      if (t === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    apply(theme);
  }, [theme]);

  return { theme, setTheme: (t) => updateSettings({ theme: t }) };
}
