import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { motion } from 'framer-motion';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="min-h-screen lg:pl-60 pb-20 lg:pb-8">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 pt-14 lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
