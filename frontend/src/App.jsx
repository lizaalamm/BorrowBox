import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyItems from './pages/MyItems';
import Requests from './pages/Requests';
import Wishlist from './pages/Wishlist';
import ListItem from './pages/ListItem';
import Profile from './pages/Profile';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/my-items" element={<Protected><MyItems /></Protected>} />
        <Route path="/requests" element={<Protected><Requests /></Protected>} />
        <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
        <Route path="/list-item" element={<Protected><ListItem /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/users/:id" element={<Profile />} />
        <Route path="*" element={<div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"><h1 className="font-display font-bold text-4xl">404</h1><p className="text-zinc-500 mt-2">Page not found</p><a href="/" className="mt-6 px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">Go home</a></div>} />
      </Routes>

      <footer className="border-t border-zinc-100 dark:border-zinc-800 mt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-4 gap-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">B</div><span className="font-display font-bold">BorrowBox</span></div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 max-w-[360px]">Community lending platform. Borrow anything, anytime. Save money, reduce waste, meet neighbors. Built with love for sustainable sharing.</p>
              <div className="flex gap-2 mt-4">
                <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">🌱 1.2t CO₂ saved</span>
                <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">📦 1.2k items</span>
                <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">⭐ 4.9/5 rating</span>
              </div>
            </div>
            <div><h4 className="font-semibold text-sm">Platform</h4><ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400"><li><a href="/browse" className="hover:text-zinc-900 dark:hover:text-white">Browse items</a></li><li><a href="/list-item" className="hover:text-zinc-900 dark:hover:text-white">List an item</a></li><li><a href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white">Dashboard</a></li><li><a href="http://localhost:5000/api-docs" target="_blank" className="hover:text-zinc-900 dark:hover:text-white">API Docs (Swagger)</a></li></ul></div>
            <div><h4 className="font-semibold text-sm">Community</h4><ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400"><li>How it works</li><li>Safety & Trust</li><li>Sustainability</li><li>Contact: support@borrowbox.com</li></ul></div>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between gap-4 text-xs text-zinc-500"><span>© 2024 BorrowBox. Community lending, reimagined. Built with 💜 for sharing economy.</span><span>Demo: admin@borrowbox.com / Admin@123 • demo@borrowbox.com / Demo@123</span></div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}
