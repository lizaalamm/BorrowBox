import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Eye, EyeOff, Lock, Mail, MapPin, ShieldCheck, Star, Users, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import Logo from '../components/Logo';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'One number', test: (value) => /\d/.test(value) },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(form.password) })),
    [form.password],
  );
  const passwordValid = passwordChecks.every((rule) => rule.passed);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!passwordValid) {
      toast.error('Choose a stronger password that meets every requirement');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Please accept the terms to create an account');
      return;
    }

    setLoading(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim().toLowerCase() });
      toast.success('Account created. Welcome to BorrowBox.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[460px]"
        >
          <Logo size={44} showTagline={false} wordmarkClass="text-[22px]" />

          <h1 className="mt-8 font-display text-[30px] font-bold leading-tight tracking-[-0.02em]">Create your account</h1>
          <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
            Free forever for personal lending. No card required.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input
                id="name"
                required
                minLength={2}
                maxLength={50}
                autoComplete="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Taylor Reed"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="you@example.com"
                  className="input input-icon"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder="At least 8 characters"
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

              <div>
                <label className="label" htmlFor="location">Neighbourhood</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  <input
                    id="location"
                    maxLength={100}
                    autoComplete="address-level2"
                    value={form.location}
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                    placeholder="Mission District, SF"
                    className="input input-icon"
                  />
                </div>
              </div>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {passwordChecks.map((rule) => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 text-[12.5px] ${rule.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`}
                >
                  {rule.passed ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {rule.label}
                </li>
              ))}
            </ul>

            <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-brand-600"
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">terms of service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">privacy policy</Link>.
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                  Creating account
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-zinc-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Marketing panel */}
      <div className="relative hidden overflow-hidden border-l border-border bg-zinc-900 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-violet-700 to-cyan-600 opacity-95" aria-hidden="true" />
        <div className="absolute inset-0 grid-backdrop opacity-20" aria-hidden="true" />
        <div className="relative flex w-full flex-col justify-between p-12 text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-2xs font-bold uppercase tracking-[0.14em] backdrop-blur">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            Free forever for personal lending
          </span>

          <div>
            <h2 className="max-w-[420px] font-display text-[40px] font-bold leading-[0.98] tracking-[-0.03em]">
              Turn your garage into a community library.
            </h2>

            <ul className="mt-8 space-y-4">
              {[
                { Icon: Check, text: 'List an item in under 30 seconds' },
                { Icon: ShieldCheck, text: 'Verified neighbours and $500 protection' },
                { Icon: Users, text: 'Build reputation and lend with confidence' },
                { Icon: MapPin, text: 'Everything happens within a few streets' },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[14px]">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="max-w-[380px] text-[13px] leading-relaxed text-white/70">
            BorrowBox members avoid an average of $190 in purchases every year while keeping 3.4 times more use
            out of the things they already own.
          </p>
        </div>
      </div>
    </div>
  );
}
