import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, Heart, Package, LayoutDashboard, 
  LogOut, Menu, X, Sparkles, User, Plus,
  ShoppingBag, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
    const interval = setInterval(() => user && fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.data.slice(0, 5));
      setUnreadCount(res.data.unreadCount || res.data.data.filter(n => !n.read).length);
    } catch {}
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/browse', label: 'Browse', icon: Search },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, auth: true },
    { path: '/my-items', label: 'My Items', icon: Package, auth: true },
    { path: '/requests', label: 'Requests', icon: ShoppingBag, auth: true },
    { path: '/wishlist', label: 'Wishlist', icon: Heart, auth: true },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl' : 'bg-white/0'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl blur-[8px] opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-[20px] shadow-lg">
                B
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-[22px] leading-none tracking-tight">BorrowBox</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-violet-600 -mt-0.5">Community Lending</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur p-1 rounded-full">
            {navLinks.filter(l => !l.auth || user).map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive(link.path) 
                    ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/list-item" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:scale-[1.02] transition-transform">
                  <Plus className="w-4 h-4" /> List Item
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button onClick={() => setNotifOpen(!notifOpen)} className="relative w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-glow">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-96 rounded-[20px] glass shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden border"
                      >
                        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                          <h3 className="font-display font-semibold">Notifications</h3>
                          <button onClick={async () => { await notificationsAPI.markAllRead(); fetchNotifications(); }} className="text-xs font-medium text-violet-600 hover:text-violet-700">Mark all read</button>
                        </div>
                        <div className="max-h-[380px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-sm">No notifications yet</div>
                          ) : notifications.map(n => (
                            <div key={n.id} className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 ${!n.read ? 'bg-violet-50/50 dark:bg-violet-950/20' : ''}`}>
                              <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                                  {n.type === 'borrow_request' ? '📥' : n.type === 'request_approved' ? '🎉' : n.type === 'new_review' ? '⭐' : '🔔'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm leading-tight">{n.title}</p>
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">{n.message}</p>
                                  <p className="text-[11px] text-zinc-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Link to="/dashboard" onClick={() => setNotifOpen(false)} className="block p-3 text-center text-sm font-medium text-violet-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">View all activity</Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="relative group">
                  <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-3 w-64 rounded-[16px] glass shadow-[0_20px_60px_rgba(0,0,0,0.15)] border p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    <div className="p-3 flex items-center gap-3">
                      <img src={user.avatar} className="w-10 h-10 rounded-full" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm"><User className="w-4 h-4" /> Profile</Link>
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm"><Settings className="w-4 h-4" /> Settings</Link>
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-sm text-red-600"><LogOut className="w-4 h-4" /> Sign out</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block px-5 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Sign in</Link>
                <Link to="/register" className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:scale-[1.02] transition-transform flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Get Started
                </Link>
              </>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
            <div className="p-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium ${isActive(link.path) ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                  <link.icon className="w-5 h-5" /> {link.label}
                </Link>
              ))}
              {user && (
                <Link to="/list-item" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium">
                  <Plus className="w-5 h-5" /> List New Item
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
