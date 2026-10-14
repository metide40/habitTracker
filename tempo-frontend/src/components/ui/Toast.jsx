import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';

export const useToast = create((set) => ({
  toasts: [],
  add: (message, type = 'success') => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const icons = {
  success: Check,
  error: AlertCircle,
  info: AlertCircle,
};

export function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type] || Check;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 bg-surface border border-border rounded-lg shadow-card text-sm"
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${t.type === 'error' ? 'text-category-coral' : 'text-success'}`} />
              <span className="text-foreground">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="ml-1 p-0.5 text-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
