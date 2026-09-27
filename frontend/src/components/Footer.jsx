import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Github, Twitter, Linkedin, Mail, MapPin, ShieldCheck, Lock, Leaf,
  ArrowRight, ArrowUp, Check, Globe, Send, HeartHandshake, Star,
} from 'lucide-react';
import Logo from './Logo';
import { toast } from 'sonner';

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Browse items', to: '/browse' },
      { label: 'List an item', to: '/list-item' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'My items', to: '/my-items' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Sustainability', to: '/#impact' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press kit', to: '/press' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', to: '/help' },
      { label: 'Safety & trust', to: '/safety' },
      { label: 'Community guidelines', to: '/guidelines' },
      { label: 'API documentation', href: '/api-docs', external: true },
      { label: 'System status', to: '/status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of service', to: '/terms' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Cookie preferences', to: '/cookies' },
      { label: 'Lending agreement', to: '/lending-agreement' },
      { label: 'Licenses', to: '/licenses' },
    ],
  },
];

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com', Icon: Github },
  { label: 'X', href: 'https://x.com', Icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin },
  { label: 'Email', href: 'mailto:support@borrowbox.com', Icon: Mail },
];

const TRUST = [
  { Icon: ShieldCheck, title: 'Verified members', copy: 'Identity checks on every lender' },
  { Icon: Lock, title: 'Private by default', copy: 'Encrypted sessions, no data resale' },
  { Icon: HeartHandshake, title: 'Protected borrows', copy: 'Up to $500 item coverage' },
  { Icon: Leaf, title: 'Carbon aware', copy: 'Every share offsets new production' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Subscribed. Monthly community digest is on its way.');
    setEmail('');
  };

  return (
    <footer className="mt-24 border-t border-border bg-zinc-50/70 dark:bg-zinc-950/60">
      {/* Trust band */}
      <div className="border-b border-border">
        <div className="shell grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ Icon, title, copy }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-card text-brand-600 dark:text-brand-400">
                <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shell py-14">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_2.4fr]">
          {/* Brand + newsletter */}
          <div className="max-w-md">
            <Logo size={44} wordmarkClass="text-[23px]" />

            <p className="mt-5 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              BorrowBox turns your neighbourhood into a shared toolkit. Lend what you already own,
              borrow what you only need once, and keep useful things in use for longer.
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-foreground">Monthly community digest</p>
              <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
                Product updates, lending tips and impact numbers. One email a month, no noise.
              </p>

              <form onSubmit={handleSubscribe} className="mt-3 flex w-full max-w-sm gap-2">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email address for the community digest"
                    className="input input-icon h-11"
                    disabled={subscribed}
                  />
                </div>
                <button type="submit" className="btn btn-primary h-11 px-4" disabled={subscribed}>
                  {subscribed ? <Check className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                  <span className="hidden sm:inline">{subscribed ? 'Subscribed' : 'Subscribe'}</span>
                </button>
              </form>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noreferrer noopener' : undefined}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-zinc-500 transition-colors hover:border-brand-200 hover:text-brand-600 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-[13.5px] text-zinc-600 transition-colors hover:text-brand-700 dark:text-zinc-400 dark:hover:text-brand-300"
                        >
                          {link.label}
                          <ArrowUp className="h-3 w-3 rotate-45" aria-hidden="true" />
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-[13.5px] text-zinc-600 transition-colors hover:text-brand-700 dark:text-zinc-400 dark:hover:text-brand-300"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Ratings + locations */}
        <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <Star className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">4.9 out of 5 from 2,400+ neighbours</p>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                Rated across 3,800+ completed borrows in 42 neighbourhoods
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              San Francisco, CA
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              English (US)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="status-dot bg-emerald-500" aria-hidden="true" />
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="shell flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-center text-[13px] text-zinc-500 sm:text-left dark:text-zinc-400">
            &copy; {new Date().getFullYear()} BorrowBox Labs, Inc. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-zinc-500 dark:text-zinc-400">
            <Link to="/terms" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Terms</Link>
            <Link to="/privacy" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Privacy</Link>
            <Link to="/safety" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Trust & safety</Link>
            <a
              href="mailto:support@borrowbox.com"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-700 dark:hover:text-brand-300"
            >
              support@borrowbox.com
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide transition-colors hover:text-brand-700"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
