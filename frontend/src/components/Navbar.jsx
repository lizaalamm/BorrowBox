import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, Bell, Heart, Package, LayoutDashboard, LogOut, Menu, X, Plus,
  ShoppingBag, UserRound, ChevronDown, Inbox, CheckCircle2, XCircle, Star,
  PackageCheck, MessageSquare, ArrowRight, Settings, Sun, Moon,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

const NOTIFICATION_ICONS = {
  borrow_request: { Icon: Inbox, tone: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300' },
  request_approved: { Icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  request_rejected: { Icon: XCircle, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300' },
  request_declined: { Icon: XCircle, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300' },
  new_review: { Icon: Star, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
  item_returned: { Icon: PackageCheck, tone: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300' },
  new_message: { Icon: MessageSquare, tone: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
};

function relativeTime(value) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationsAPI.getAll({ limit: 6 });
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount ?? (res.data.data || []).filter((n) => !n.read).length);
    } catch {
      /* silent: notifications are non-critical */
    }
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  useEffect(() => {
    const onClick = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
        setMenuOpen(false);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const navLinks = [
    { path: '/browse', label: 'Browse', Icon: Search, public: true },
    { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/my-items', label: 'My items', Icon: Package },
    { path: '/requests', label: 'Requests', Icon: ShoppingBag },
    { path: '/messages', label: 'Messages', Icon: MessageSquare },
    { path: '/wishlist', label: 'Wishlist', Icon: Heart },
  ].filter((link) => link.public || user);

  const isActive = (path) => location.pathname === path;

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/browse?search=${encodeURIComponent(term)}` : '/browse');
    setQuery('');
    setSearchOpen(false);
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      fetchNotifications();
    } catch {
      /* ignore */
    }
  };

  const openNotification = async (notification) => {
    if (!notification.read) {
      try {
        await notificationsAPI.markRead(notification.id);
      } catch {
        /* ignore */
      }
    }
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    setUnreadCount((count) => Math.max(0, count - (notification.read ? 0 : 1)));
    setNotifOpen(false);
    if (notification.relatedId) navigate('/requests');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-border bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70'
          : 'border-transparent bg-background/60 backdrop-blur-sm'
      }`}
    >
      <div className="shell">
        <div className="flex h-[70px] items-center justify-between gap-3">
          <Logo size={40} />

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 rounded-full border border-border bg-zinc-100/70 p-1 lg:flex dark:bg-zinc-800/50">
            {navLinks.map(({ path, label, Icon }) => (
              <Link
                key={path}
                to={path}
                aria-current={isActive(path) ? 'page' : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition-all ${
                  isActive(path)
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="icon-btn"
            >
              {theme === 'dark' ? (
                <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
              ) : (
                <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </button>

            <div className="relative hidden xl:block" ref={searchRef}>
              <AnimatePresence initial={false}>
                {searchOpen ? (
                  <motion.form
                    key="search-input"
                    onSubmit={submitSearch}
                    initial={{ width: 44, opacity: 0.6 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 44, opacity: 0 }}
                    className="relative"
                  >
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search items, categories"
                      aria-label="Search items"
                      className="input input-icon h-10 rounded-full"
                    />
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    aria-label="Open search"
                    className="icon-btn"
                  >
                    <Search className="h-[18px] w-[18px]" aria-hidden="true" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <>
                <Link to="/list-item" className="btn btn-primary btn-sm hidden sm:inline-flex">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  List item
                </Link>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => { setNotifOpen((open) => !open); setMenuOpen(false); }}
                    aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                    aria-expanded={notifOpen}
                    className="icon-btn relative"
                  >
                    <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-border bg-card shadow-lift"
                      >
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-sm font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="chip-brand">{unreadCount} new</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={markAllRead}
                            className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300"
                          >
                            Mark all read
                          </button>
                        </div>

                        <div className="max-h-[360px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                              <Bell className="mx-auto h-6 w-6 text-zinc-300" aria-hidden="true" />
                              <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">You are all caught up</p>
                              <p className="mt-1 text-xs text-zinc-500">Requests and updates will appear here.</p>
                            </div>
                          ) : (
                            notifications.map((notification) => {
                              const meta = NOTIFICATION_ICONS[notification.type] || {
                                Icon: Bell,
                                tone: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
                              };
                              const { Icon, tone } = meta;
                              return (
                                <button
                                  key={notification.id}
                                  type="button"
                                  onClick={() => openNotification(notification)}
                                  className={`flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                                    notification.read ? '' : 'bg-brand-50/40 dark:bg-brand-500/5'
                                  }`}
                                >
                                  <span className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${tone}`}>
                                    <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                      <span className="truncate text-[13.5px] font-semibold text-foreground">{notification.title}</span>
                                      {!notification.read && <span className="status-dot flex-shrink-0 bg-brand-500" />}
                                    </span>
                                    <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                      {notification.message}
                                    </span>
                                    <span className="mt-1 block text-[11px] text-zinc-400">{relativeTime(notification.createdAt)}</span>
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>

                        <Link
                          to="/requests"
                          className="flex items-center justify-center gap-1.5 px-4 py-3 text-[13px] font-semibold text-brand-600 transition-colors hover:bg-zinc-50 dark:text-brand-300 dark:hover:bg-zinc-800/50"
                        >
                          View all activity
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen((open) => !open); setNotifOpen(false); }}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  >
                    <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <span className="hidden max-w-[110px] truncate text-[13px] font-semibold sm:block">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-lift"
                      >
                        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                          <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{user.name}</p>
                            <p className="truncate text-xs text-zinc-500">{user.email}</p>
                          </div>
                        </div>

                        <div className="my-1 h-px bg-border" />

                        {[
                          { to: '/profile', label: 'Profile', Icon: UserRound },
                          { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
                          { to: '/my-items', label: 'My items', Icon: Package },
                          { to: '/messages', label: 'Messages', Icon: MessageSquare },
                          { to: '/wishlist', label: 'Wishlist', Icon: Heart },
                        ].map(({ to, label, Icon }) => (
                          <Link
                            key={to}
                            to={to}
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Icon className="h-4 w-4 text-zinc-400" strokeWidth={1.9} aria-hidden="true" />
                            {label}
                          </Link>
                        ))}

                        <div className="my-1 h-px bg-border" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        >
                          <LogOut className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="icon-btn lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="shell space-y-1 py-4">
              <form onSubmit={submitSearch} className="relative mb-2">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search items, categories"
                  aria-label="Search items"
                  className="input input-icon h-11"
                />
              </form>

              {navLinks.map(({ path, label, Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                    isActive(path)
                      ? 'bg-brand-600 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                  {label}
                </Link>
              ))}

              <div className="my-2 h-px bg-border" />

              {user ? (
                <>
                  <Link to="/list-item" className="btn btn-primary btn-md w-full">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    List an item
                  </Link>
                  <Link to="/profile" className="btn btn-secondary btn-md w-full">
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Account settings
                  </Link>
                  <button type="button" onClick={handleLogout} className="btn btn-ghost btn-md w-full text-rose-600">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-md w-full">
                    Create account
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-md w-full">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
