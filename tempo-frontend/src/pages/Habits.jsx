import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Archive, Trash2, ChevronDown } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { EmptyState } from '../components/ui/EmptyState';
import { HabitForm } from '../components/habits/HabitForm';
import { Sparkline } from '../components/charts/Sparkline';
import { useStore, useActiveHabits, useArchivedHabits } from '../store/useStore';
import { getCurrentStreak } from '../utils/streaks';
import { useToast } from '../components/ui/Toast';

export default function Habits() {
  const habits = useActiveHabits();
  const archived = useArchivedHabits();
  const completions = useStore((s) => s.completions);
  const categories = useStore((s) => s.categories);
  const archiveHabit = useStore((s) => s.archiveHabit);
  const unarchiveHabit = useStore((s) => s.unarchiveHabit);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const toast = useToast((s) => s.add);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    return habits.filter((h) => {
      const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || h.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [habits, search, filterCat]);

  const openNew = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (h) => {
    setEditing(h);
    setDrawerOpen(true);
    setMenuId(null);
  };

  const freqLabel = (h) => {
    if (h.frequency?.type === 'daily') return 'Daily';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const w = [...(h.frequency?.weekdays || [])].sort();
    if (w.length === 7) return 'Daily';
    if (w.join() === '1,2,3,4,5') return 'Weekdays';
    if (w.join() === '0,6') return 'Weekends';
    if (w.length > 3) return `${w.length} days a week`;
    return w.map((d) => days[d]).join(', ');
  };

  return (
    <div>
      <PageHeader
        title="Habits"
        action={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" /> New habit
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            placeholder="Search habits…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded bg-surface border border-border text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterCat('all')}
            className={`px-2.5 h-8 text-xs font-medium rounded transition-colors ${
              filterCat === 'all' ? 'bg-primary-soft text-primary' : 'text-muted hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`px-2.5 h-8 text-xs font-medium rounded transition-colors ${
                filterCat === c.id ? 'bg-primary-soft text-primary' : 'text-muted hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={habits.length === 0 ? 'No habits yet' : 'No matching habits'}
          description={
            habits.length === 0
              ? 'Create your first habit to start building a steady rhythm.'
              : 'Try a different search or filter.'
          }
          action={
            habits.length === 0 && (
              <Button onClick={openNew}>
                <Plus className="w-4 h-4" /> New habit
              </Button>
            )
          }
        />
      ) : (
        <Card padding={false}>
          <div className="hidden sm:grid grid-cols-[1fr_100px_120px_60px_90px_40px] gap-2 px-4 py-2.5 border-b border-border text-meta">
            <span>Name</span>
            <span>Category</span>
            <span>Frequency</span>
            <span>Streak</span>
            <span>30 days</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {filtered.map((h, idx) => {
              const streak = getCurrentStreak(h, completions);
              const cat = categories.find((c) => c.id === h.category);
              return (
                <div
                  key={h.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_60px_90px_40px] gap-2 items-center px-4 py-3 hover:bg-background/50 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground truncate">{h.name}</span>
                  <Badge color={h.color}>{cat?.label || h.category}</Badge>
                  <span className="text-xs text-muted truncate">{freqLabel(h)}</span>
                  <span className="text-sm tabular text-foreground">{streak || '—'}</span>
                  <Sparkline habit={h} completions={completions} />
                  <div className="relative">
                    <button
                      onClick={() => setMenuId(menuId === h.id ? null : h.id)}
                      className="p-1.5 rounded text-muted hover:text-foreground hover:bg-background"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuId === h.id && (
                      <div className={`absolute right-0 z-30 w-36 bg-surface border border-border rounded-lg shadow-card py-1 ${idx >= filtered.length - 2 && filtered.length > 3 ? 'bottom-9' : 'top-9'}`}>
                        <button
                          onClick={() => openEdit(h)}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-foreground hover:bg-background"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            archiveHabit(h.id);
                            setMenuId(null);
                            toast('Habit archived');
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-foreground hover:bg-background"
                        >
                          <Archive className="w-3.5 h-3.5" /> Archive
                        </button>
                        <button
                          onClick={() => {
                            deleteHabit(h.id);
                            setMenuId(null);
                            toast('Habit deleted', 'error');
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-category-coral hover:bg-background"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-3"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showArchived ? '' : '-rotate-90'}`} />
            Archived ({archived.length})
          </button>
          {showArchived && (
            <Card padding={false} className="divide-y divide-border">
              {archived.map((h) => (
                <div key={h.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted">{h.name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { unarchiveHabit(h.id); toast('Habit restored'); }}>
                      Restore
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => { deleteHabit(h.id); toast('Habit deleted', 'error'); }}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit habit' : 'New habit'}
      >
        <HabitForm
          initial={editing}
          onSuccess={() => {
            setDrawerOpen(false);
            toast(editing ? 'Habit updated' : 'Habit created');
          }}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
}
