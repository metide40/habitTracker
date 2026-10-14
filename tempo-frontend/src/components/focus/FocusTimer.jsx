import { useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function FocusTimer({ mode, duration, onComplete, habitId }) {
  const soundEnabled = useStore((s) => s.settings?.soundEnabled ?? true);
  const addSession = useStore((s) => s.addFocusSession);
  const audioRef = useRef(null);

  const handleComplete = useCallback(() => {
    if (mode === 'focus') {
      addSession({
        mode,
        duration: duration * 60,
        habitId: habitId || null,
      });
    }
    if (soundEnabled) {
      try {
        // Soft completion tone via Web Audio
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660;
        gain.gain.value = 0.08;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.stop(ctx.currentTime + 0.6);
      } catch {
        /* ignore */
      }
    }
    onComplete?.();
  }, [mode, duration, habitId, soundEnabled, addSession, onComplete]);

  const { status, remaining, progress, start, pause, reset, skip, toggle } = useTimer({
    durationMinutes: duration,
    onComplete: handleComplete,
  });

  const size = 220;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-300 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-5xl tabular text-foreground tracking-tight">
            {formatTime(remaining)}
          </span>
          <span className="text-meta mt-1 capitalize">{mode === 'short' ? 'Short break' : mode === 'long' ? 'Long break' : 'Focus'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-8">
        <Button variant="secondary" size="sm" onClick={reset} aria-label="Reset">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button size="lg" onClick={toggle} className="w-28">
          {status === 'running' ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> {status === 'paused' ? 'Resume' : 'Start'}
            </>
          )}
        </Button>
        <Button variant="secondary" size="sm" onClick={skip} aria-label="Skip">
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-2xs text-muted mt-3">Space to start / pause</p>
    </div>
  );
}
