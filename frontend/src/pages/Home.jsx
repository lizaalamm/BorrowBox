import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Recycle, Users, Zap, Star, TrendingUp, Package, Heart, Search, MapPin, Clock } from 'lucide-react';
import { itemsAPI, categoriesAPI } from '../lib/api';
import ItemCard from '../components/ItemCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ items: 0, users: 0, borrows: 0 });

  useEffect(() => {
    itemsAPI.getFeatured().then(res => setFeatured(res.data.data)).catch(() => {});
    categoriesAPI.getAll().then(res => {
      setCategories(res.data.data);
      setStats({ items: res.data.data.reduce((s,c)=>s+c.itemCount,0), users: 1243, borrows: 3892 });
    }).catch(()=>{});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-zinc-950" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-400/20 rounded-full blur-[80px] animate-float" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-fuchsia-400/15 rounded-full blur-[90px] animate-float" style={{ animationDelay: '4s' }} />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-20 sm:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25,0.1,0.25,1] }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200/50 dark:border-violet-800/50 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live: {stats.items}+ items available in your neighborhood
              </div>
              
              <h1 className="font-display font-bold text-[42px] sm:text-[64px] lg:text-[72px] leading-[0.9] tracking-[-0.03em]">
                Borrow <br />
                <span className="text-gradient">anything,</span> <br />
                <span className="relative">
                  anytime
                  <motion.span initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 1, duration: 0.8 }} className="absolute bottom-2 left-0 h-3 bg-violet-200/60 dark:bg-violet-800/30 -z-10" />
                </span>
              </h1>
              
              <p className="mt-6 text-[18px] sm:text-[20px] leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-[520px]">
                The community lending platform that turns your neighborhood into a shared toolbox. Save money, reduce waste, meet neighbors.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/browse" className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-[15px] hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  Start Borrowing <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/list-item" className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-semibold text-[15px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <Package className="w-4 h-4" /> List an Item
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-8">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}23`} alt="" className="w-10 h-10 rounded-full ring-4 ring-white dark:ring-zinc-950 object-cover" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 ring-4 ring-white dark:ring-zinc-950 flex items-center justify-center text-xs font-bold">+2k</div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    <span className="ml-1 text-sm font-semibold">4.9/5</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">Trusted by 2,400+ neighbors</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.25,0.1,0.25,1] }} className="relative lg:ml-8">
              {/* Main card stack */}
              <div className="relative mx-auto max-w-[440px]">
                <div className="absolute -inset-4 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 rounded-[32px] blur-[24px] opacity-20" />
                
                {/* Card 1 */}
                <div className="relative rounded-[28px] overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_20px_80px_rgba(0,0,0,0.12)] rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800" alt="" className="w-full aspect-[4/3] object-cover" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display font-semibold text-lg leading-tight">DeWalt Drill Kit</h3>
                        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> 0.2 miles • Mission</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">FREE</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan" className="w-8 h-8 rounded-full" alt="" />
                        <div><p className="text-xs font-medium">Jordan</p><p className="text-[11px] text-zinc-500 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9</p></div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">🔧 Tools</span>
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-6 -right-6 sm:-right-12 glass rounded-2xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white"><Zap className="w-6 h-6" /></div>
                  <div><p className="text-xs font-bold">Instant Booking</p><p className="text-[11px] text-zinc-500">Approved in 2 mins</p></div>
                </motion.div>

                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute -bottom-8 -left-6 sm:-left-12 glass rounded-2xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border">
                  <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">✓</div><div><p className="text-xs font-bold">Returned on time</p><p className="text-[11px] text-zinc-500">+5 reputation</p></div></div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="mt-16 sm:mt-24 grid grid-cols-2 sm:grid-cols-4 gap-4 p-2 rounded-[24px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
            {[
              { label: 'Active Items', value: `${stats.items}+`, icon: Package },
              { label: 'Happy Neighbors', value: '2.4k+', icon: Users },
              { label: 'Money Saved', value: '$47k+', icon: TrendingUp },
              { label: 'CO₂ Saved', value: '1.2t', icon: Recycle },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-[16px] bg-white/5 dark:bg-zinc-900/5 backdrop-blur">
                <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-zinc-900/10 flex items-center justify-center"><s.icon className="w-5 h-5" /></div>
                <div><p className="font-display font-bold text-xl leading-none">{s.value}</p><p className="text-[11px] opacity-70 uppercase tracking-wide font-medium mt-1">{s.label}</p></div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-[32px] sm:text-[40px] tracking-tight leading-none">Browse by category</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-3">Find what you need, from tools to camping gear</p>
          </div>
          <Link to="/browse" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4, scale: 1.02 }} className="group">
              <Link to={`/browse?category=${cat.slug}`} className="block p-5 rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] mb-3 group-hover:scale-110 transition-transform" style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}20` }}>{cat.icon}</div>
                <p className="font-semibold text-[14px]">{cat.name}</p>
                <p className="text-[12px] text-zinc-500 mt-1">{cat.itemCount} items</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-zinc-50/80 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h2 className="font-display font-bold text-[28px] sm:text-[36px] leading-none">Featured this week</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Handpicked by our community • High demand</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((item, i) => <ItemCard key={item.id} item={item} index={i} />)}
          </div>

          <div className="mt-10 text-center">
            <Link to="/browse" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Explore all items <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works - Bento */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-[720px] mx-auto text-center mb-12">
          <h2 className="font-display font-bold text-[36px] sm:text-[48px] leading-[0.95] tracking-tight">Sharing is the new <span className="text-gradient">buying</span></h2>
          <p className="mt-4 text-[17px] text-zinc-600 dark:text-zinc-400">Join thousands who borrow instead of buy. Save money, space, and the planet.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 auto-rows-[280px]">
          <div className="lg:col-span-2 rounded-[28px] p-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-violet-600/30 to-cyan-500/30 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-zinc-900/10 backdrop-blur flex items-center justify-center"><Search className="w-6 h-6" /></div>
              <div className="mt-auto">
                <h3 className="font-display font-semibold text-[24px] leading-tight">Discover nearby items in seconds</h3>
                <p className="mt-3 text-[15px] opacity-70 leading-relaxed max-w-[420px]">Smart search, real-time availability, distance filters. Find exactly what you need within 0.5 miles.</p>
                <div className="mt-6 flex gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-white/10 dark:bg-zinc-900/10 text-xs font-medium">🔍 AI-powered search</span>
                  <span className="px-3 py-1.5 rounded-full bg-white/10 dark:bg-zinc-900/10 text-xs font-medium">📍 0.3 mi avg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] p-8 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"><Shield className="w-6 h-6" /></div>
              <div className="mt-auto">
                <h3 className="font-display font-semibold text-[22px] leading-tight">Verified & insured</h3>
                <p className="mt-2 text-[14px] opacity-80 leading-relaxed">ID verified users, $500 protection, 4.9★ avg rating. Borrow with confidence.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600"><Heart className="w-6 h-6" /></div>
            <div className="mt-12">
              <h3 className="font-display font-semibold text-[20px] leading-tight">Build reputation, unlock perks</h3>
              <p className="mt-2 text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Every timely return boosts your score. Top lenders get featured & earn fees.</p>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-[28px] p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
            <div className="grid sm:grid-cols-2 gap-8 h-full">
              <div className="flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600"><Recycle className="w-6 h-6" /></div>
                <div className="mt-auto">
                  <h3 className="font-display font-semibold text-[20px] leading-tight">Sustainable by design</h3>
                  <p className="mt-2 text-[14px] text-zinc-600 dark:text-zinc-400">One shared drill = 20 less manufactured. Join the circular economy.</p>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-4"><span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Impact</span><span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">This month</span></div>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-xs mb-1"><span>Items shared</span><span className="font-bold">1,243</span></div><div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"><div className="h-full w-[78%] bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full" /></div></div>
                  <div><div className="flex justify-between text-xs mb-1"><span>CO₂ saved</span><span className="font-bold">1.2 tons</span></div><div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"><div className="h-full w-[65%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" /></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-[32px] overflow-hidden bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 relative">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-full blur-[100px]" />
          </div>
          <div className="relative p-10 sm:p-16 lg:p-20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-zinc-900/10 backdrop-blur border border-white/10 text-xs font-medium mb-6"><Clock className="w-3.5 h-3.5" /> Set up in 60 seconds</div>
            <h2 className="font-display font-bold text-[36px] sm:text-[52px] leading-[0.9] tracking-tight max-w-[720px] mx-auto">Ready to start borrowing? Your neighbors are waiting.</h2>
            <p className="mt-4 text-[17px] opacity-70 max-w-[560px] mx-auto">Join 2,400+ locals sharing tools, gear, and more. No fees for most items.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="px-8 py-4 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold hover:scale-[1.02] transition-transform">Create free account</Link>
              <Link to="/browse" className="px-8 py-4 rounded-full bg-white/10 dark:bg-zinc-900/10 backdrop-blur border border-white/20 dark:border-zinc-900/20 font-semibold hover:bg-white/15 transition-colors">Browse items →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
