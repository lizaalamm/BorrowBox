import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Star, Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import Logo from '../components/Logo';

const DEMO_ACCOUNTS = [
  { label: 'Member demo', email: 'user2@borrowbox.com', password: 'Demo@123', description: 'Browse, borrow and lend' },
  { label: 'Admin demo', email: 'user1@borrowbox.com', password: 'Admin@123', description: 'Full moderation access' },
];

const HIGHLIGHTS = [
  { Icon: ShieldCheck, text: 'Verified neighbours with $500 borrow protection' },
  { Icon: Users, text: '2,400+ members sharing across 42 neighbourhoods' },
  { Icon: Star, text: '4.9 average rating on 3,800 completed borrows' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sign in failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          <Logo size={44} showTagline={false} wordmarkClass="text-[22px]" />

          <h1 className="mt-8 font-display text-[30px] font-bold leading-tight tracking-[-0.02em]">Sign in to BorrowBox</h1>
          <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
            Pick up where you left off with your borrows, lends and wishlist.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account)}
                className="card card-hover p-3.5 text-left"
              >
                <p className="text-2xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">{account.label}</p>
                <p className="mt-1 truncate text-[13px] font-semibold">{account.email}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{account.description}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="input input-icon"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="password">Password</label>
                <Link to="/help" className="mb-1.5 text-[12px] font-semibold text-brand-600 hover:underline dark:text-brand-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="input input-icon pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:text-zinc-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-400">
              <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" defaultChecked />
              Keep me signed in on this device
            </label>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-zinc-600 dark:text-zinc-400">
            New to BorrowBox?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
              Create a free account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Marketing panel */}
      <div className="relative hidden overflow-hidden border-l border-border bg-zinc-900 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-violet-700 to-cyan-600 opacity-95" aria-hidden="true" />
        <div className="absolute inset-0 grid-backdrop opacity-20" aria-hidden="true" />
        <div className="relative flex w-full flex-col justify-between p-12 text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-2xs font-bold uppercase tracking-[0.14em] backdrop-blur">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            Trusted by 2,400+ neighbours
          </span>

          <div>
            <h2 className="max-w-[420px] font-display text-[40px] font-bold leading-[0.98] tracking-[-0.03em]">
              Borrowing made beautifully simple.
            </h2>
            <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-white/80">
              Skip the purchase for things you only need once. Your neighbours already own them.
            </p>

            <ul className="mt-8 space-y-3">
              {HIGHLIGHTS.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[14px]">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '4.9', label: 'Average rating' },
              { value: '$47k', label: 'Saved by members' },
              { value: '1.2t', label: 'CO2 avoided' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
