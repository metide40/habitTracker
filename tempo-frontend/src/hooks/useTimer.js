import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Accurate timer using timestamps so it stays correct in background tabs.
 */
export function useTimer({ durationMinutes, onComplete }) {
  const [status, setStatus] = useState('idle'); // idle | running | paused
  const [remaining, setRemaining] = useState(durationMinutes * 60);
  const endAtRef = useRef(null);
  const remainingOnPauseRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const totalSeconds = durationMinutes * 60;

  // Reset when duration changes and idle
  useEffect(() => {
    if (status === 'idle') {
      setRemaining(durationMinutes * 60);
    }
  }, [durationMinutes, status]);

  useEffect(() => {
    if (status !== 'running') return;

    const tick = () => {
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setStatus('idle');
        endAtRef.current = null;
        onCompleteRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [status]);

  // Update document title
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      document.title = `${m}:${s.toString().padStart(2, '0')} — Tempo`;
    } else {
      document.title = 'Tempo';
    }
    return () => {
      document.title = 'Tempo';
    };
  }, [remaining, status]);

  const start = useCallback(() => {
    const secs = remainingOnPauseRef.current ?? remaining;
    endAtRef.current = Date.now() + secs * 1000;
    remainingOnPauseRef.current = null;
    setStatus('running');
  }, [remaining]);

  const pause = useCallback(() => {
    if (endAtRef.current) {
      remainingOnPauseRef.current = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(remainingOnPauseRef.current);
    }
    endAtRef.current = null;
    setStatus('paused');
  }, []);

  const reset = useCallback(() => {
    endAtRef.current = null;
    remainingOnPauseRef.current = null;
    setRemaining(totalSeconds);
    setStatus('idle');
  }, [totalSeconds]);

  const skip = useCallback(() => {
    endAtRef.current = null;
    remainingOnPauseRef.current = null;
    setRemaining(totalSeconds);
    setStatus('idle');
    onCompleteRef.current?.();
  }, [totalSeconds]);

  const toggle = useCallback(() => {
    if (status === 'running') pause();
    else start();
  }, [status, pause, start]);

  return {
    status,
    remaining,
    totalSeconds,
    progress: 1 - remaining / totalSeconds,
    start,
    pause,
    reset,
    skip,
    toggle,
  };
}
