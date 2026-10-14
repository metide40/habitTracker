import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useHotkeys({ onNewHabit, onToggleTimer, onShowHelp }) {
  const navigate = useNavigate();

  useEffect(() => {
    let gPending = false;
    let gTimer = null;

    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
        return;
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onShowHelp?.();
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNewHabit?.();
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (onToggleTimer) {
          e.preventDefault();
          onToggleTimer();
        }
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        gPending = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => {
          gPending = false;
        }, 800);
        return;
      }

      if (gPending) {
        gPending = false;
        clearTimeout(gTimer);
        const map = { t: '/', h: '/habits', f: '/focus', i: '/insights', s: '/settings' };
        const path = map[e.key.toLowerCase()];
        if (path) {
          e.preventDefault();
          navigate(path);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(gTimer);
    };
  }, [navigate, onNewHabit, onToggleTimer, onShowHelp]);
}
