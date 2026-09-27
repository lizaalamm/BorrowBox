import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Heart, ShoppingBag, Bell, TrendingUp, Star, Clock, ArrowRight, Plus, DollarSign, Users, Award } from 'lucide-react';
import { dashboardAPI, itemsAPI, borrowAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, items] = await Promise.all([dashboardAPI.stats(), itemsAPI.getMyItems()]);
        setStats(s.data.data);
        setRecentItems(items.data.data.slice(0, 3));
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!stats) return null;

  const { overview, recentActivity, monthlyData, topItems } = stats;

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-[32px] sm:text-[40px] leading-none tracking-tight">Good {new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">Here's what's happening with your BorrowBox activity.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/list-item" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold"><Plus className="w-4 h-4" /> List Item</Link>
            <Link to="/browse" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium">Browse →</Link>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-[20px] group-hover:bg-violet-500/20 transition-colors" />
            <div className="relative"><div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-violet-600"><Package className="w-5 h-5" /></div><p className="mt-4 text-2xl font-display font-bold">{overview.totalItems}</p><p className="text-xs text-zinc-500 mt-1">Items listed • {overview.availableItems} available</p></div>
          </div>
          <div className="rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[20px]" />
            <div className="relative"><div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600"><ShoppingBag className="w-5 h-5" /></div><p className="mt-4 text-2xl font-display font-bold">{overview.activeBorrows}</p><p className="text-xs text-zinc-500 mt-1">Active borrows • {overview.totalBorrowed} total</p></div>
          </div>
          <div className="rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[20px]" />
            <div className="relative"><div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600"><Heart className="w-5 h-5" /></div><p className="mt-4 text-2xl font-display font-bold">{overview.wishlistCount}</p><p className="text-xs text-zinc-500 mt-1">Wishlist • {overview.pendingRequests} pending requests</p></div>
          </div>
          <div className="rounded-[20px] bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="relative"><div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"><Star className="w-5 h-5" /></div><p className="mt-4 text-2xl font-display font-bold">{overview.rating}★</p><p className="text-xs opacity-80 mt-1">Reputation • Verified lender</p></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold text-lg">Activity overview</h3><span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">Last 6 months</span></div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="borrows" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="lends" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-4 text-xs"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-violet-500" /> Borrows</span><span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-500" /> Lends</span></div>
          </div>

          {/* Recent activity */}
          <div className="rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold">Recent activity</h3><Link to="/requests" className="text-xs font-medium text-violet-600 hover:text-violet-700">View all →</Link></div>
            <div className="space-y-3">
              {recentActivity?.length===0 ? <p className="text-sm text-zinc-500">No recent activity</p> : recentActivity?.map((act,i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${act.status==='pending'?'bg-amber-100 text-amber-600':act.status==='borrowed'?'bg-violet-100 text-violet-600':'bg-emerald-100 text-emerald-600'}`}>{act.status==='pending'?'⏳':act.status==='borrowed'?'📦':'✅'}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{act.itemTitle}</p><p className="text-xs text-zinc-500 capitalize">{act.status} • {new Date(act.createdAt).toLocaleDateString()}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Top items */}
          <div className="rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-violet-600" /> Top performing</h3>
            {topItems?.length===0 ? <p className="text-sm text-zinc-500">List items to see performance</p> : topItems?.map(item => (
              <div key={item.id} className="flex gap-3 py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                <img src={item.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.title}</p><p className="text-xs text-zinc-500">{item.borrowCount} borrows • {item.rating}★</p><div className="mt-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full" style={{ width: `${Math.min(100, item.borrowCount*10)}%` }} /></div></div>
              </div>
            ))}
            <Link to="/my-items" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:gap-2 transition-all">Manage items <ArrowRight className="w-3 h-3" /></Link>
          </div>

          {/* Quick actions */}
          <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
            <Link to="/requests?type=lent" className="rounded-[20px] p-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.02] transition-transform group"><div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-zinc-900/10 flex items-center justify-center"><Bell className="w-5 h-5" /></div><p className="font-semibold mt-4">{overview.pendingRequests} pending</p><p className="text-xs opacity-70 mt-1">Requests to approve</p><span className="inline-flex items-center gap-1 text-xs font-medium mt-3 group-hover:gap-2 transition-all">Review now <ArrowRight className="w-3 h-3" /></span></Link>
            <Link to="/wishlist" className="rounded-[20px] p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:scale-[1.02] transition-all group"><div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-violet-600"><Heart className="w-5 h-5" /></div><p className="font-semibold mt-4">{overview.wishlistCount} saved</p><p className="text-xs text-zinc-500 mt-1">Items in wishlist</p><span className="inline-flex items-center gap-1 text-xs font-medium mt-3 group-hover:gap-2 transition-all">View wishlist <ArrowRight className="w-3 h-3" /></span></Link>
            <div className="rounded-[20px] p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30"><div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white"><Award className="w-5 h-5" /></div><p className="font-semibold mt-4">Level 3 • Explorer</p><p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{overview.totalLent + overview.totalBorrowed} total transactions</p><div className="mt-3 h-1.5 rounded-full bg-amber-200/50 overflow-hidden"><div className="h-full w-[65%] bg-amber-500 rounded-full" /></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
