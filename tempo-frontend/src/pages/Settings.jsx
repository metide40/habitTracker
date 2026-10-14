import { useState, useRef } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Toggle } from '../components/ui/Toggle';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useStore } from '../store/useStore';
import { useAuth } from '../store/useAuth';
import { REMOTE } from '../api';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../components/ui/Toast';

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const user = useAuth((st) => st.user);
  const logout = useAuth((st) => st.logout);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const resetAllData = useStore((s) => s.resetAllData);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const { theme, setTheme } = useTheme();
  const toast = useToast((s) => s.add);
  const fileRef = useRef(null);
  const [resetOpen, setResetOpen] = useState(false);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tempo-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Data exported');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importData(reader.result);
      toast(ok ? 'Data imported' : 'Import failed', ok ? 'success' : 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" />

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Theme</span>
            <SegmentedControl
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
              value={theme}
              onChange={setTheme}
            />
          </div>
        </Card>

        {/* Timer */}
        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">Timer</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Focus (min)"
                type="number"
                min={1}
                max={120}
                value={settings.focusDuration}
                onChange={(e) =>
                  updateSettings({ focusDuration: Math.max(1, Number(e.target.value) || 25) })
                }
              />
              <Input
                label="Short break (min)"
                type="number"
                min={1}
                max={30}
                value={settings.shortBreakDuration}
                onChange={(e) =>
                  updateSettings({ shortBreakDuration: Math.max(1, Number(e.target.value) || 5) })
                }
              />
              <Input
                label="Long break (min)"
                type="number"
                min={1}
                max={60}
                value={settings.longBreakDuration}
                onChange={(e) =>
                  updateSettings({ longBreakDuration: Math.max(1, Number(e.target.value) || 15) })
                }
              />
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
            <Toggle
              id="auto-breaks"
              label="Auto-start breaks"
              checked={settings.autoStartBreaks}
              onChange={(v) => updateSettings({ autoStartBreaks: v })}
            />
            <Toggle
              id="sound"
              label="Completion sound"
              checked={settings.soundEnabled}
              onChange={(v) => updateSettings({ soundEnabled: v })}
            />
            </div>
          </div>
        </Card>

        {/* Calendar */}
        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">Calendar</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Week starts on</span>
            <SegmentedControl
              options={[
                { value: '1', label: 'Monday' },
                { value: '0', label: 'Sunday' },
              ]}
              value={String(settings.weekStartsOn)}
              onChange={(v) => updateSettings({ weekStartsOn: Number(v) })}
            />
          </div>
        </Card>

        {/* Data */}
        {REMOTE && (
          <Card>
            <h2 className="font-medium text-foreground mb-4">Account</h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-foreground">{user?.name}</p>
                <p className="text-xs text-muted">{user?.email}</p>
              </div>
              <Button variant="secondary" onClick={logout}>Sign out</Button>
            </div>
          </Card>
        )}

        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">Data</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleExport}>
              Export JSON
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (window.confirm('Replace your current data with sample habits and history?')) loadSampleData();
              }}
            >
              Load sample data
            </Button>
            <Button variant="danger" onClick={() => setResetOpen(true)}>
              Reset all data
            </Button>
          </div>
        </Card>

        <p className="text-2xs text-muted text-center pt-4">
          {REMOTE ? 'Tempo · your data is saved to your account' : 'Tempo · local-first · data stays on this device'}
        </p>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset all data?" size="sm">
        <p className="text-sm text-muted mb-5">
          This will replace all habits, completions, and sessions with the default sample data. This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetAllData();
              setResetOpen(false);
              toast('Data reset');
            }}
          >
            Reset everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}
