import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Package, MapPin, Star, ShieldCheck, Recycle, Users, TrendingUp,
  Search, CalendarCheck, Handshake, MessageSquare, ChevronDown, Lock,
  BadgeCheck, Leaf, Wrench, Clock3, Sparkles, CheckCircle2, Quote,
} from 'lucide-react';
import { itemsAPI, categoriesAPI } from '../lib/api';
import ItemCard from '../components/ItemCard';
import CategoryIcon from '../lib/categoryIcons';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const STEPS = [
  {
    Icon: Search,
    title: 'Find what you need',
    copy: 'Search by keyword, category or distance. Every listing shows condition, owner rating and availability.',
  },
  {
    Icon: CalendarCheck,
    title: 'Request your dates',
    copy: 'Pick a start and end date, add a short note, and send the request. The owner is notified instantly.',
  },
  {
    Icon: Handshake,
    title: 'Pick up and use it',
    copy: 'Once approved, arrange a handover nearby. Most items are borrowed within a few streets of home.',
  },
  {
    Icon: CheckCircle2,
    title: 'Return and review',
    copy: 'Return it in the same condition, leave a review, and both sides build reputation for next time.',
  },
];

const SAFETY = [
  { Icon: BadgeCheck, title: 'Identity verified members', copy: 'Email, phone and photo verification before a first lend.' },
  { Icon: ShieldCheck, title: 'Protection up to $500', copy: 'Automatic coverage on approved borrows through the platform.' },
  { Icon: MessageSquare, title: 'In-app messaging only', copy: 'Keep addresses and contact details private until you agree to meet.' },
  { Icon: Lock, title: 'Encrypted sessions', copy: 'Hashed passwords, signed JWT sessions and audit-logged actions.' },
];

const IMPACT = [
  { label: 'Items shared this month', value: '1,243', percent: 78, tone: 'from-brand-600 to-cyan-500' },
  { label: 'CO2 emissions avoided', value: '1.2 tonnes', percent: 64, tone: 'from-emerald-500 to-teal-500' },
  { label: 'Household spend saved', value: '$47,180', percent: 86, tone: 'from-violet-600 to-fuchsia-500' },
];

const TESTIMONIALS = [
  {
    quote:
      'I needed a tile cutter for one afternoon. Instead of buying one I borrowed from someone two streets away. The whole flow took four minutes.',
    name: 'User 2',
    meta: 'Mission District, San Francisco',
    stats: '42 lends / 28 borrows',
  },
  {
    quote:
      'The calendar and return reminders make lending painless. I know exactly when something is coming back and who has it.',
    name: 'User 3',
    meta: 'Noe Valley, San Francisco',
    stats: '31 lends / 52 borrows',
  },
  {
    quote:
      'Our building started a BorrowBox group for camping gear. Between five households we replaced a storage unit worth of stuff.',
    name: 'User 4',
    meta: 'Sunset, San Francisco',
    stats: '27 lends / 19 borrows',
  },
];

const FAQS = [
  {
    q: 'How much does BorrowBox cost?',
    a: 'Creating an account is free and most listings are free to borrow. Owners can optionally set a small per-day fee to cover wear and tear, which is always shown before you confirm a request.',
  },
  {
    q: 'What happens if an item is damaged?',
    a: 'Approved borrows include coverage up to $500 per item. Report damage from the request page within 48 hours of return and our trust team mediates with both members.',
  },
  {
    q: 'Who can see my address?',
    a: 'Never the public. Listings show a neighbourhood and approximate distance. Your exact pickup details are only shared inside an approved borrow conversation.',
  },
  {
    q: 'Can I lend to the same neighbours repeatedly?',
    a: 'Yes. Repeat borrowers keep their reputation history with you, and you can mark trusted neighbours as favourites so their requests get priority.',
  },
  {
    q: 'Do you support lending to businesses?',
    a: 'Teams can register a shared workspace account, pool inventory into a single catalogue and hand out admin roles for approvals.',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    itemsAPI.getFeatured().then((res) => setFeatured(res.data.data || [])).catch(() => {});
    categoriesAPI.getAll().then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  const totalItems = categories.reduce((sum, category) => sum + (category.itemCount || 0), 0);
  const heroItem = featured[0];

  return (
    <div className="min-h-screen">
      {/* ------------------------------------------------------------------ hero */}
      {/* No overflow clipping on the section itself: the hero must never crop
          its own content. Only the decorative layer is clipped. */}
      <section className="relative isolate border-b border-border">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 grid-backdrop [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
          <div className="glow-brand absolute inset-x-0 top-0 h-[460px]" />
        </div>

        <div className="shell relative pb-16 pt-12 sm:pb-24 sm:pt-16 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[620px]"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-zinc-600 shadow-soft dark:text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                Community-powered lending
              </span>

              <h1 className="mt-6 font-display text-[38px] font-bold leading-[1.03] tracking-[-0.03em] text-balance sm:text-[52px] lg:text-[58px]">
                Borrow <span className="text-gradient">anything</span> from neighbours who already own it.
              </h1>

              <p className="mt-5 max-w-[540px] text-[16px] leading-relaxed text-zinc-600 sm:text-[17px] dark:text-zinc-400">
                BorrowBox connects you with the tools, gear and equipment sitting unused around the corner.
                Save money, skip the storage unit, and keep good things in circulation.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/browse" className="btn btn-primary btn-lg">
                  Start borrowing
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to="/list-item" className="btn btn-secondary btn-lg">
                  <Package className="h-4 w-4" aria-hidden="true" />
                  List an item
                </Link>
              </div>

              <dl className="mt-10 grid max-w-[540px] grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                {[
                  { Icon: ShieldCheck, label: 'Verified members' },
                  { Icon: Leaf, label: 'Free for neighbours' },
                  { Icon: Clock3, label: 'Approval in minutes' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Icon className="h-[18px] w-[18px] text-brand-600 dark:text-brand-400" strokeWidth={1.9} aria-hidden="true" />
                    <dt className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">{label}</dt>
                  </div>
                ))}
              </dl>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-6">
                <div className="flex items-center">
                  {['user1', 'user2', 'user3', 'user4'].map((seed, index) => (
                    <img
                      key={seed}
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                      alt=""
                      className={`h-9 w-9 rounded-full border-2 border-background object-cover ${index > 0 ? '-ml-2.5' : ''}`}
                      loading="lazy"
                    />
                  ))}
                  <span className="-ml-2.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-zinc-900 text-[11px] font-bold text-white dark:bg-white dark:text-zinc-900">
                    +2k
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                    <span className="ml-1.5 text-[13px] font-bold text-foreground">4.9</span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Trusted by 2,400+ neighbours across 42 areas
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Preview card — fixed orientation, nothing escapes the container */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[470px]"
            >
              <div className="relative rounded-[26px] border border-border bg-card p-3 shadow-card">
                <span className="absolute right-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-white shadow-soft">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  Available
                </span>

                <div className="relative overflow-hidden rounded-[20px] bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={heroItem?.images?.[0] || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&q=80'}
                    alt={heroItem?.title || 'Cordless drill kit available to borrow'}
                    className="aspect-[4/3] w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-2.5 py-1.5 text-2xs font-semibold text-white backdrop-blur">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {heroItem?.location?.split(' - ')[0] || 'Mission District, SF'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-2xs font-bold text-zinc-900 backdrop-blur">
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      Free to borrow
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 px-2 pb-1 pt-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-[17px] font-semibold">
                      {heroItem?.title || 'DeWalt 20V Cordless Drill Kit'}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                      <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                      {heroItem?.category || 'Tools'} / {heroItem?.condition || 'Like New'}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-1 dark:border-amber-400/20 dark:bg-amber-500/10">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                    <span className="text-xs font-bold">{heroItem?.rating ?? '4.9'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="card flex items-center gap-3 p-3.5">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    <TrendingUp className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold">Average reply in 12 min</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Owners confirm fast</p>
                  </div>
                </div>
                <div className="card flex items-center gap-3 p-3.5">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Recycle className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold">1.2t CO2 avoided</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">This month alone</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Platform stats */}
          <motion.dl
            {...fadeUp}
            className="mt-14 grid grid-cols-2 gap-3 sm:mt-16 lg:grid-cols-4 lg:gap-4"
          >
            {[
              { Icon: Package, value: `${Math.max(totalItems, 8)}+`, label: 'Items available now' },
              { Icon: Users, value: '2.4k+', label: 'Active neighbours' },
              { Icon: TrendingUp, value: '$47k+', label: 'Saved by members' },
              { Icon: Recycle, value: '1.2t', label: 'CO2 avoided' },
            ].map(({ Icon, value, label }) => (
              <div key={label} className="card flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-zinc-50 text-brand-600 dark:bg-zinc-800/60 dark:text-brand-300">
                  <Icon className="h-5 w-5" strokeWidth={1.85} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className="font-display text-xl font-bold leading-none">{value}</dt>
                  <dd className="mt-1 truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</dd>
                </div>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* ------------------------------------------------------------ categories */}
      <section className="shell section" aria-labelledby="categories-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Browse the catalogue</p>
            <h2 id="categories-heading" className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">
              Find what you need by category
            </h2>
            <p className="mt-2 max-w-[560px] text-[15px] text-zinc-600 dark:text-zinc-400">
              From power tools to camping gear to party equipment, everything here is owned by someone nearby.
            </p>
          </div>
          <Link to="/browse" className="btn btn-secondary btn-md">
            View all items
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
            >
              <Link
                to={`/browse?category=${category.slug}`}
                className="card card-hover group flex h-full items-center gap-3.5 p-4"
              >
                <CategoryIcon
                  category={category}
                  boxed
                  className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  boxClassName="h-11 w-11 flex-shrink-0"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{category.name}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                    {category.itemCount || 0} {category.itemCount === 1 ? 'item' : 'items'}
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- featured */}
      {featured.length > 0 && (
        <section className="border-y border-border surface-muted" aria-labelledby="featured-heading">
          <div className="shell section">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Handpicked by the community</p>
                <h2 id="featured-heading" className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">
                  Featured this week
                </h2>
                <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
                  High demand items with verified owners and quick approval times.
                </p>
              </div>
              <Link to="/browse?sortBy=popular" className="btn btn-secondary btn-md">
                Explore popular
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.slice(0, 4).map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- how it works */}
      <section id="how-it-works" className="shell section scroll-mt-24" aria-labelledby="how-heading">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="eyebrow">How BorrowBox works</p>
          <h2 id="how-heading" className="mt-2 font-display text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[40px]">
            Four steps from search to handover
          </h2>
          <p className="mt-3 text-[16px] text-zinc-600 dark:text-zinc-400">
            No fees to join, no paperwork, no shipping. Just neighbours lending to neighbours.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map(({ Icon, title, copy }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="card relative flex h-full flex-col p-6"
            >
              <span className="absolute right-5 top-5 font-display text-[13px] font-bold text-zinc-300 dark:text-zinc-600">
                0{index + 1}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
                <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-[17px] font-semibold">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- trust & safety */}
      <section className="border-y border-border surface-muted" aria-labelledby="safety-heading">
        <div className="shell section grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[26px] border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-[17px] font-semibold">Trust report</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Updated hourly</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {[
                { label: 'Verified member rate', value: '98%', percent: 98 },
                { label: 'Items returned on time', value: '96%', percent: 96 },
                { label: 'Requests answered within a day', value: '91%', percent: 91 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{row.label}</span>
                    <span className="font-display font-bold">{row.value}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500" style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50 px-3.5 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <BadgeCheck className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              <p className="text-[13px] font-medium text-emerald-800 dark:text-emerald-200">
                Every approved borrow includes $500 of item protection.
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">Built for safety</p>
            <h2 id="safety-heading" className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">
              Lending that feels as safe as borrowing from a friend
            </h2>
            <p className="mt-3 max-w-[540px] text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              Reputation, verification and clear agreements are built into every request so both sides know
              exactly what to expect.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {SAFETY.map(({ Icon, title, copy }) => (
                <div key={title} className="flex gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-card text-brand-600 dark:text-brand-300">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- impact */}
      <section id="impact" className="shell section scroll-mt-24" aria-labelledby="impact-heading">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Measured impact</p>
            <h2 id="impact-heading" className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">
              Sharing beats buying, by the numbers
            </h2>
            <p className="mt-3 max-w-[540px] text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              A power drill is used for roughly 13 minutes in its lifetime. When neighbours share instead of
              each buying one, materials, packaging and shipping disappear from the equation.
            </p>

            <div className="mt-7 space-y-5">
              {IMPACT.map((row) => (
                <div key={row.label} className="card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">{row.label}</p>
                    <p className="font-display text-[15px] font-bold">{row.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className={`h-full rounded-full bg-gradient-to-r ${row.tone}`} style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { Icon: Recycle, value: '3.4x', label: 'More use per item', copy: 'Shared tools stay out of drawers and in service.' },
              { Icon: Users, value: '42', label: 'Neighbourhoods live', copy: 'Dense enough that most handovers are walkable.' },
              { Icon: TrendingUp, value: '$190', label: 'Saved per member, yearly', copy: 'Compared with buying single-use equipment.' },
              { Icon: Clock3, value: '12 min', label: 'Median approval time', copy: 'Owners respond quickly during waking hours.' },
            ].map(({ Icon, value, label, copy }) => (
              <div key={label} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-brand-600 dark:bg-zinc-800 dark:text-brand-300">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <p className="mt-4 font-display text-[26px] font-bold leading-none">{value}</p>
                <p className="mt-1.5 text-[13px] font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- testimonials */}
      <section className="border-y border-border surface-muted" aria-labelledby="reviews-heading">
        <div className="shell section">
          <div className="mx-auto max-w-[640px] text-center">
            <p className="eyebrow">Community reviews</p>
            <h2 id="reviews-heading" className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">
              Loved by lenders and borrowers
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((item, index) => (
              <motion.figure
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                className="card flex h-full flex-col p-6"
              >
                <Quote className="h-6 w-6 text-brand-500/40" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-[14.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {item.quote}
                </blockquote>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name.replace(' ', '').toLowerCase()}`}
                    alt=""
                    className="h-10 w-10 rounded-full border border-border bg-zinc-50 object-cover"
                    loading="lazy"
                  />
                  <figcaption className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-foreground">{item.name}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{item.meta}</p>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-brand-600 dark:text-brand-300">
                      {item.stats}
                    </p>
                  </figcaption>
                </div>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- FAQ */}
      <section className="shell section" aria-labelledby="faq-heading">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 id="faq-heading" className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">
              Everything you wanted to ask
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              Still unsure about something? Our trust team replies to every message within one business day.
            </p>
            <a href="mailto:support@borrowbox.com" className="btn btn-secondary btn-md mt-6">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Contact support
            </a>
          </div>

          <div className="card divide-y divide-border overflow-hidden">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <span className="text-[14.5px] font-semibold text-foreground">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresenceWrapper open={isOpen}>
                    <p className="px-5 pb-5 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{faq.a}</p>
                  </AnimatePresenceWrapper>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- CTA */}
      <section className="shell">
        <div className="relative overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-900 px-6 py-12 text-center sm:px-12 sm:py-16 dark:border-zinc-800">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/25 via-transparent to-cyan-500/20" />
            <div className="absolute inset-0 grid-backdrop opacity-[0.15]" />
          </div>

          <div className="relative mx-auto max-w-[720px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              Set up in under a minute
            </span>
            <h2 className="mt-6 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.03em] text-white text-balance sm:text-[42px]">
              Your neighbours are already lending. Join the box.
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-zinc-300 sm:text-[16px]">
              Create a free account, list one thing you rarely use, and start borrowing from the people around you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="btn btn-lg bg-white text-zinc-900 hover:bg-zinc-100">
                Create free account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/browse" className="btn btn-lg border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/15">
                Browse nearby items
              </Link>
            </div>
            <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              No listing fees. Cancel any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Small helper that animates collapsible content without leaking motion props
 * onto plain DOM nodes.
 */
function AnimatePresenceWrapper({ open, children }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
      aria-hidden={!open}
    >
      {children}
    </motion.div>
  );
}
