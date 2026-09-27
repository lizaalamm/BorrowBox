import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, MapPin, Grid3X3, List } from 'lucide-react';
import { itemsAPI, categoriesAPI } from '../lib/api';
import ItemCard from '../components/ItemCard';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    availability: searchParams.get('availability') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    minValue: '',
    maxValue: ''
  });

  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data.data)).catch(()=>{});
  }, []);

  useEffect(() => {
    fetchItems();
  }, [searchParams]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      searchParams.forEach((v,k) => { if(v) params[k]=v; });
      const res = await itemsAPI.getAll(params);
      setItems(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k,v]) => { if(v) params.set(k,v); });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', condition: '', availability: '', sortBy: 'newest', minValue: '', maxValue: '' });
    setSearchParams({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'newest').length;

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display font-bold text-[36px] sm:text-[44px] leading-none tracking-tight">Browse items</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">{loading ? 'Loading...' : `${items.length} items available near you`}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-[360px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && updateFilter('search', filters.search)}
                placeholder="Search tools, cameras, books..."
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`relative p-3 rounded-full border transition-colors ${showFilters || activeFilterCount ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>}
            </button>
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <button onClick={() => setView('grid')} className={`p-2 rounded-full transition-colors ${view==='grid' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={`p-2 rounded-full transition-colors ${view==='list' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters - desktop */}
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-[88px] space-y-6">
              <div className="rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
                <h3 className="font-display font-semibold mb-4">Categories</h3>
                <div className="space-y-1">
                  <button onClick={() => updateFilter('category','')} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between ${!filters.category ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}><span>All categories</span><span className="text-xs opacity-60">{categories.reduce((s,c)=>s+c.itemCount,0)}</span></button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => updateFilter('category', cat.slug)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-2.5 ${filters.category===cat.slug ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                      <span>{cat.icon}</span><span className="flex-1 text-left">{cat.name}</span><span className="text-xs opacity-60">{cat.itemCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 space-y-6">
                <div>
                  <h4 className="font-medium text-sm mb-3">Condition</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['New','Like New','Good','Fair'].map(c => (
                      <button key={c} onClick={() => updateFilter('condition', filters.condition===c?'':c)} className={`px-3 py-2 rounded-full text-xs font-medium border transition-colors ${filters.condition===c ? 'bg-violet-600 border-violet-600 text-white' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-3">Availability</h4>
                  <div className="space-y-2">
                    {[
                      { v: '', l: 'All items' },
                      { v: 'available', l: 'Available now' },
                      { v: 'borrowed', l: 'Currently borrowed' },
                    ].map(o => (
                      <label key={o.v} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" checked={filters.availability===o.v} onChange={() => updateFilter('availability', o.v)} className="w-4 h-4 accent-violet-600" />
                        <span className="text-sm group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{o.l}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-3">Sort by</h4>
                  <select value={filters.sortBy} onChange={e => updateFilter('sortBy', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                    <option value="newest">Newest first</option>
                    <option value="popular">Most popular</option>
                    <option value="rating">Highest rated</option>
                    <option value="valueLow">Value: low to high</option>
                    <option value="valueHigh">Value: high to low</option>
                  </select>
                </div>
                {activeFilterCount>0 && <button onClick={clearFilters} className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Clear all filters</button>}
              </div>

              <div className="rounded-[20px] p-5 bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                <h4 className="font-display font-semibold">Want to lend?</h4>
                <p className="text-sm opacity-80 mt-1">List your unused items and earn reputation + fees.</p>
                <a href="/list-item" className="mt-4 inline-flex px-4 py-2 rounded-full bg-white text-zinc-900 text-sm font-semibold">List an item →</a>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Mobile filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden mb-6 rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Filters</h3><button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="w-4 h-4" /></button></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Category</label><select value={filters.category} onChange={e => updateFilter('category', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border text-sm"><option value="">All</option>{categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></div>
                    <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Sort</label><select value={filters.sortBy} onChange={e => updateFilter('sortBy', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border text-sm"><option value="newest">Newest</option><option value="popular">Popular</option><option value="rating">Rating</option></select></div>
                  </div>
                  {activeFilterCount>0 && <button onClick={clearFilters} className="mt-4 w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium">Clear filters ({activeFilterCount})</button>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active filter pills */}
            {(filters.category || filters.search || filters.condition) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.search && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium">"{filters.search}" <button onClick={() => updateFilter('search','')}><X className="w-3 h-3" /></button></span>}
                {filters.category && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium">{categories.find(c=>c.slug===filters.category)?.name || filters.category} <button onClick={() => updateFilter('category','')}><X className="w-3 h-3" /></button></span>}
                {filters.condition && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">{filters.condition} <button onClick={() => updateFilter('condition','')}><X className="w-3 h-3" /></button></span>}
              </div>
            )}

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => <div key={i} className="rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 animate-pulse"><div className="aspect-[4/3] rounded-[16px] bg-zinc-100 dark:bg-zinc-800 mb-4" /><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded mb-2" /><div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" /></div>)}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-zinc-400" /></div>
                <h3 className="font-display font-semibold text-lg">No items found</h3>
                <p className="text-sm text-zinc-500 mt-1 max-w-[320px] mx-auto">Try adjusting your filters or search. We add new items daily!</p>
                <button onClick={clearFilters} className="mt-6 px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium">Clear filters</button>
              </div>
            ) : (
              <div className={view==='grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
                {items.map((item,i) => <ItemCard key={item.id} item={item} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
