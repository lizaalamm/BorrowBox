import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Award, Bell, CheckCircle2, Clock3, Heart, LayoutDashboard,
  Package, Plus, ShieldCheck, Star, TrendingUp, Users, Inbox, XCircle,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { dashboardAPI, itemsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import CategoryIcon from '../lib/categoryIcons';

const ACTIVITY_ICONS = {
  pending: { Icon: Clock3, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
  approved: { Icon: CheckCircle2, tone: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300' },
  borrowed: { Icon: Package, tone: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
  returned: { Icon: Inbox, tone: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300' },
  completed: { Icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  rejected: { Icon: XCircle, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300' },
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([dashboardAPI.stats(), itemsAPI.getMyItems()]);
        setStats(statsRes.data.data);
        setMyItems(itemsRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Dashboard data is unavailable right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="shell py-10">
        <div className="skeleton h-10 w-72" />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeleton h-32" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="skeleton h-80 lg:col-span-2" />
          <div className="skeleton h-80" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="font-display text-2xl font-bold">We could not load your dashboard</h1>
        <p className="mx-auto mt-2 max-w-[420px] text-sm text-zinc-500 dark:text-zinc-400">{error || 'Please refresh the page.'}</p>
        <Link to="/browse" className="btn btn-primary btn-md mt-6">Browse items</Link>
      </div>
    );
  }

  const { overview, recentActivity, monthlyData, topItems } = stats;

  const cards = [
    {
      Icon: Package,
      label: 'Items listed',
      value: overview.totalItems,
      meta: `${overview.availableItems} available now`,
      tone: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
    },
    {
      Icon: TrendingUp,
      label: 'Active borrows',
      value: overview.activeBorrows,
      meta: `${overview.totalBorrowed} completed`,
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
    {
      Icon: Heart,
      label: 'Wishlist',
      value: overview.wishlistCount,
      meta: `${overview.pendingRequests} requests awaiting reply`,
      tone: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
    },
    {
      Icon: Star,
      label: 'Reputation',
      value: overview.rating,
      meta: overview.verified ? 'Verified lender' : 'Verification pending',
      tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="shell py-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Your activity</p>
            <h1 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">
              {greeting()}, {user?.name?.split(' ')[0] || 'neighbour'}
            </h1>
            <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
              Here is how your lending and borrowing is going this month.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/list-item" className="btn btn-primary btn-md">
              <Plus className="h-4 w-4" aria-hidden="true" />
              List an item
            </Link>
            <Link to="/requests" className="btn btn-secondary btn-md">
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Manage requests
            </Link>
          </div>
        </div>

        {/* Overview */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map(({ Icon, label, value, meta, tone }) => (
            <div key={label} className="card p-5">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-[26px] font-bold leading-none">{value}</p>
              <p className="mt-1.5 text-[13px] font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{meta}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[17px] font-semibold">Activity overview</h2>
                <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">Borrows and lends across the last 6 months</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-600" aria-hidden="true" />
                  Borrows
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" aria-hidden="true" />
                  Lends
                </span>
              </div>
            </div>

            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="borrowFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="lendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e4e4e7" strokeDasharray="4 4" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e4e4e7',
                      fontSize: '12px',
                      boxShadow: '0 12px 32px -12px rgba(16,24,40,0.18)',
                    }}
                  />
                  <Area type="monotone" dataKey="borrows" stroke="#4f46e5" strokeWidth={2} fill="url(#borrowFill)" />
                  <Area type="monotone" dataKey="lends" stroke="#06b6d4" strokeWidth={2} fill="url(#lendFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent activity */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[17px] font-semibold">Recent activity</h2>
              <Link to="/requests" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:gap-1.5 dark:text-brand-300">
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-4 space-y-1">
              {!recentActivity?.length ? (
                <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">No activity yet. Start by listing an item.</p>
              ) : (
                recentActivity.map((activity, index) => {
                  const meta = ACTIVITY_ICONS[activity.status] || ACTIVITY_ICONS.pending;
                  const { Icon, tone } = meta;
                  return (
                    <div key={`${activity.itemTitle}-${index}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${tone}`}>
                        <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold">{activity.itemTitle}</p>
                        <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                          {activity.status} / {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5">
              <Link to="/requests" className="rounded-xl border border-border p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/50">
                <Bell className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                <p className="mt-2 text-[13px] font-semibold">{overview.pendingRequests} pending</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Awaiting reply</p>
              </Link>
              <Link to="/wishlist" className="rounded-xl border border-border p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/50">
                <Heart className="h-4 w-4 text-rose-500" aria-hidden="true" />
                <p className="mt-2 text-[13px] font-semibold">{overview.wishlistCount} saved</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Wishlist items</p>
              </Link>
            </div>
          </div>

          {/* Top performing */}
          <div className="card p-6">
            <h2 className="font-display text-[17px] font-semibold">Top performing items</h2>
            <div className="mt-4 space-y-4">
              {!topItems?.length ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">List items to see performance here.</p>
              ) : (
                topItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.images?.[0]} alt="" loading="lazy" className="h-14 w-14 flex-shrink-0 rounded-xl border border-border object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {item.borrowCount} borrows / {item.rating} rating
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500"
                          style={{ width: `${Math.min(100, (item.borrowCount || 0) * 10)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link to="/my-items" className="btn btn-ghost btn-sm mt-5 w-full">
              Manage items
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Your listings */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[17px] font-semibold">Your listings</h2>
              <Link to="/my-items" className="text-xs font-semibold text-brand-600 dark:text-brand-300">See all</Link>
            </div>

            {myItems.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
                <Package className="mx-auto h-6 w-6 text-zinc-300" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold">No listings yet</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Lenders with at least one listing get three times more borrow requests.
                </p>
                <Link to="/list-item" className="btn btn-primary btn-sm mt-4">List your first item</Link>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-border">
                {myItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <CategoryIcon category={item.categoryDetails || { slug: '' }} boxed className="h-4 w-4" boxClassName="h-9 w-9 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/items/${item.id}`} className="truncate text-[13.5px] font-semibold transition-colors hover:text-brand-700 dark:hover:text-brand-300">
                        {item.title}
                      </Link>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.category} / {item.lendingFee > 0 ? `$${item.lendingFee}/day` : 'Free'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-2xs font-semibold ${
                        item.availability === 'available'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                      }`}
                    >
                      {item.availability}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Milestones */}
          <div className="card p-6">
            <h2 className="font-display text-[17px] font-semibold">Your standing</h2>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200/60 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Award className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13.5px] font-bold text-amber-900 dark:text-amber-100">Level 3 explorer</p>
                <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
                  {(overview.totalLent || 0) + (overview.totalBorrowed || 0)} completed transactions
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { Icon: ShieldCheck, text: overview.verified ? 'Identity verified' : 'Finish verification to earn trust badges' },
                { Icon: Users, text: `${overview.totalLent || 0} neighbours borrowed from you` },
                { Icon: Star, text: `${overview.rating} average rating from reviews` },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                  <p className="text-[13px] text-zinc-600 dark:text-zinc-400">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Next level</span>
                <span>65%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
