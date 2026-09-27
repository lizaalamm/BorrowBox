import { Suspense, lazy } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import { Package } from 'lucide-react';

/* Route level code-splitting keeps the first paint light. */
const Browse = lazy(() => import('./pages/Browse'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyItems = lazy(() => import('./pages/MyItems'));
const Requests = lazy(() => import('./pages/Requests'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ListItem = lazy(() => import('./pages/ListItem'));
const Profile = lazy(() => import('./pages/Profile'));
const Messages = lazy(() => import('./pages/Messages'));
const InfoPage = lazy(() => import('./pages/InfoPage'));

const INFO_PAGE_SLUGS = [
  'about', 'careers', 'press', 'help', 'safety', 'guidelines', 'status',
  'terms', 'privacy', 'cookies', 'lending-agreement', 'licenses',
];

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" aria-label="Loading page" />
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" aria-label="Checking your session" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-brand-600 dark:text-brand-300">
        <Package className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="eyebrow mt-6">Error 404</p>
      <h1 className="mt-3 font-display text-[34px] font-bold tracking-[-0.02em]">This box is empty</h1>
      <p className="mt-3 max-w-[440px] text-[15px] text-zinc-600 dark:text-zinc-400">
        The page you requested does not exist. It may have moved, or the link might be out of date.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary btn-md">Back home</Link>
        <Link to="/browse" className="btn btn-secondary btn-md">Browse items</Link>
      </div>
    </div>
  );
}

function AppLayout() {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/items/:id" element={<ItemDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/users/:id" element={<Profile />} />

              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/my-items" element={<RequireAuth><MyItems /></RequireAuth>} />
              <Route path="/requests" element={<RequireAuth><Requests /></RequireAuth>} />
              <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
              <Route path="/list-item" element={<RequireAuth><ListItem /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />

              {INFO_PAGE_SLUGS.map((slug) => (
                <Route key={slug} path={`/${slug}`} element={<InfoPage />} />
              ))}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />

      <Toaster
        richColors
        closeButton
        theme={theme}
        position="top-center"
        toastOptions={{ style: { borderRadius: '14px' } }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
