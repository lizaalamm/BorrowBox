import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, X, MapPin, LayoutGrid, List, SlidersHorizontal, Package,
  ArrowRight, RefreshCw, Star, ShieldCheck, Filter,
} from 'lucide-react';
import { itemsAPI, categoriesAPI } from '../lib/api';
import ItemCard from '../components/ItemCard';
import CategoryIcon from '../lib/categoryIcons';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most borrowed' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'valueLow', label: 'Value: low to high' },
  { value: 'valueHigh', label: 'Value: high to low' },
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const AVAILABILITY = [
  { value: '', label: 'Any availability' },
  { value: 'available', label: 'Available now' },
  { value: 'borrowed', label: 'Currently on loan' },
];

const EMPTY_FILTERS = {
  search: '',
  category: '',
  condition: '',
  availability: '',
  sortBy: 'newest',
  minValue: '',
  maxValue: '',
};

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') || '');

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      condition: searchParams.get('condition') || '',
      availability: searchParams.get('availability') || '',
      sortBy: searchParams.get('sortBy') || 'newest',
      minValue: searchParams.get('minValue') || '',
      maxValue: searchParams.get('maxValue') || '',
    }),
    [searchParams],
  );

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      searchParams.forEach((value, key) => {
        if (value) params[key] = value;
      });
      const res = await itemsAPI.getAll(params);
      setItems(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'We could not load items right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const applyFilters = (patch) => {
    const next = { ...filters, ...patch };
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value && !(key === 'sortBy' && value === 'newest')) params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setSearchDraft('');
    setSearchParams({}, { replace: true });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'sortBy' && key !== 'search',
  ).length;

  const totalItems = categories.reduce((sum, category) => sum + (category.itemCount || 0), 0);
  const activeCategory = categories.find((category) => category.slug === filters.category);

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-border surface-muted">
        <div className="shell py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Link to="/" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Browse</span>
          </nav>

          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[38px]">
                {activeCategory ? `${activeCategory.name} to borrow` : 'Browse nearby items'}
              </h1>
              <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
                {loading
                  ? 'Loading items from your neighbourhood...'
                  : `${items.length} ${items.length === 1 ? 'item' : 'items'} ready to borrow from ${totalItems} listings across ${categories.length || 8} categories`}
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                applyFilters({ search: searchDraft.trim() });
              }}
              className="flex w-full items-center gap-2 lg:w-auto"
              role="search"
            >
              <div className="relative flex-1 lg:w-[340px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                <input
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Search tools, cameras, books"
                  aria-label="Search items"
                  className="input input-icon h-11 rounded-full"
                />
                {searchDraft && (
                  <button
                    type="button"
                    onClick={() => { setSearchDraft(''); applyFilters({ search: '' }); }}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:text-zinc-700"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-md h-11">Search</button>

              <button
                type="button"
                onClick={() => setShowFilters((open) => !open)}
                aria-expanded={showFilters}
                className="btn btn-secondary btn-md relative h-11 lg:hidden"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="shell py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ---------------------------------------------------- filter sidebar */}
          <aside className="hidden w-[272px] flex-shrink-0 lg:block">
            <div className="sticky top-[92px] space-y-4">
              <div className="card p-5">
                <h2 className="font-display text-sm font-semibold">Categories</h2>
                <div className="mt-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => applyFilters({ category: '' })}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                      !filters.category
                        ? 'bg-brand-600 text-white'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Package className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
                      All items
                    </span>
                    <span className={`text-xs ${!filters.category ? 'text-white/80' : 'text-zinc-400'}`}>{totalItems}</span>
                  </button>

                  {categories.map((category) => {
                    const active = filters.category === category.slug;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => applyFilters({ category: active ? '' : category.slug })}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                          active
                            ? 'bg-brand-600 text-white'
                            : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <CategoryIcon category={category} className="h-4 w-4" />
                        <span className="flex-1 truncate text-left">{category.name}</span>
                        <span className={`text-xs ${active ? 'text-white/80' : 'text-zinc-400'}`}>{category.itemCount || 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="card space-y-6 p-5">
                <div>
                  <h2 className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Condition</h2>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {CONDITIONS.map((condition) => {
                      const active = filters.condition === condition;
                      return (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => applyFilters({ condition: active ? '' : condition })}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                            active
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-border bg-card text-zinc-600 hover:border-zinc-300 dark:text-zinc-300'
                          }`}
                        >
                          {condition}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Availability</h2>
                  <div className="mt-3 space-y-2">
                    {AVAILABILITY.map((option) => (
                      <label key={option.value || 'any'} className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-zinc-600 dark:text-zinc-300">
                        <input
                          type="radio"
                          name="availability"
                          checked={filters.availability === option.value}
                          onChange={() => applyFilters({ availability: option.value })}
                          className="h-4 w-4 accent-brand-600"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Item value (USD)</h2>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={filters.minValue}
                      onChange={(event) => applyFilters({ minValue: event.target.value })}
                      placeholder="Min"
                      aria-label="Minimum item value"
                      className="input h-10"
                    />
                    <span className="text-zinc-400" aria-hidden="true">-</span>
                    <input
                      type="number"
                      min="0"
                      value={filters.maxValue}
                      onChange={(event) => applyFilters({ maxValue: event.target.value })}
                      placeholder="Max"
                      aria-label="Maximum item value"
                      className="input h-10"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Sort by</h2>
                  <select
                    value={filters.sortBy}
                    onChange={(event) => applyFilters({ sortBy: event.target.value })}
                    className="select mt-3 h-10"
                    aria-label="Sort results"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {(activeFilterCount > 0 || filters.search) && (
                  <button type="button" onClick={clearFilters} className="btn btn-secondary btn-sm w-full">
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reset all filters
                  </button>
                )}
              </div>

              <div className="card overflow-hidden p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-[15px] font-semibold">Lend something instead</h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  List an item you rarely use. Verified neighbours only, with $500 protection on every borrow.
                </p>
                <Link to="/list-item" className="btn btn-primary btn-sm mt-4 w-full">
                  List an item
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </aside>

          {/* ------------------------------------------------------- main results */}
          <div className="min-w-0 flex-1">
            {/* Mobile filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden lg:hidden"
                >
                  <div className="card space-y-5 p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-sm font-semibold">Filters</h2>
                      <button type="button" onClick={() => setShowFilters(false)} aria-label="Close filters" className="icon-btn h-8 w-8">
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div>
                      <label className="label" htmlFor="mobile-category">Category</label>
                      <select
                        id="mobile-category"
                        value={filters.category}
                        onChange={(event) => applyFilters({ category: event.target.value })}
                        className="select"
                      >
                        <option value="">All categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.slug}>{category.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label" htmlFor="mobile-condition">Condition</label>
                        <select
                          id="mobile-condition"
                          value={filters.condition}
                          onChange={(event) => applyFilters({ condition: event.target.value })}
                          className="select"
                        >
                          <option value="">Any</option>
                          {CONDITIONS.map((condition) => (
                            <option key={condition} value={condition}>{condition}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label" htmlFor="mobile-sort">Sort by</label>
                        <select
                          id="mobile-sort"
                          value={filters.sortBy}
                          onChange={(event) => applyFilters({ sortBy: event.target.value })}
                          className="select"
                        >
                          {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={clearFilters} className="btn btn-secondary btn-sm flex-1">
                        Reset
                      </button>
                      <button type="button" onClick={() => setShowFilters(false)} className="btn btn-primary btn-sm flex-1">
                        Show results
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => applyFilters({ search: '' })}
                    className="chip-brand transition-colors hover:bg-brand-100"
                  >
                    <Search className="h-3 w-3" aria-hidden="true" />
                    {filters.search}
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
                {activeCategory && (
                  <button
                    type="button"
                    onClick={() => applyFilters({ category: '' })}
                    className="chip transition-colors hover:border-zinc-300"
                  >
                    {activeCategory.name}
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
                {filters.condition && (
                  <button
                    type="button"
                    onClick={() => applyFilters({ condition: '' })}
                    className="chip transition-colors hover:border-zinc-300"
                  >
                    {filters.condition}
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
                {filters.availability && (
                  <button
                    type="button"
                    onClick={() => applyFilters({ availability: '' })}
                    className="chip transition-colors hover:border-zinc-300"
                  >
                    {AVAILABILITY.find((option) => option.value === filters.availability)?.label || filters.availability}
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-1.5 text-[13px] text-zinc-500 sm:flex dark:text-zinc-400">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  Sorted by {SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label.toLowerCase()}
                </span>
                <div className="hidden items-center gap-1 rounded-full border border-border bg-card p-1 sm:flex">
                  <button
                    type="button"
                    onClick={() => setView('grid')}
                    aria-label="Grid view"
                    aria-pressed={view === 'grid'}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      view === 'grid' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    aria-label="List view"
                    aria-pressed={view === 'list'}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      view === 'list' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <List className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="card overflow-hidden p-3">
                    <div className="skeleton aspect-[4/3] rounded-xl" />
                    <div className="mt-4 space-y-2 px-1 pb-2">
                      <div className="skeleton h-4 w-4/5" />
                      <div className="skeleton h-3 w-full" />
                      <div className="skeleton h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="card flex flex-col items-center px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                  <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold">Something went wrong</h2>
                <p className="mt-1.5 max-w-[380px] text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
                <button type="button" onClick={fetchItems} className="btn btn-primary btn-md mt-6">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="card flex flex-col items-center px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold">No items match those filters</h2>
                <p className="mt-1.5 max-w-[380px] text-sm text-zinc-500 dark:text-zinc-400">
                  Try a wider search radius, a different category, or clear the filters to see everything nearby.
                </p>
                <button type="button" onClick={clearFilters} className="btn btn-primary btn-md mt-6">
                  Clear all filters
                </button>
              </div>
            ) : view === 'grid' ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item, index) => (
                  <ItemCard key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <BrowseListItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowseListItem({ item }) {
  return (
    <Link to={`/items/${item.id}`} className="card card-hover group flex gap-4 p-3 sm:p-4">
      <img
        src={item.images?.[0]}
        alt=""
        loading="lazy"
        className="h-28 w-28 flex-shrink-0 rounded-xl object-cover sm:h-32 sm:w-40"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[16px] font-semibold transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300">
              {item.title}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                {item.rating} ({item.reviewCount || 0} reviews)
              </span>
              <span aria-hidden="true">/</span>
              <span>{item.condition}</span>
              <span aria-hidden="true">/</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {item.location}
              </span>
            </p>
          </div>
          <span className="hidden flex-shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold dark:bg-zinc-800 sm:block">
            {item.lendingFee > 0 ? `$${item.lendingFee}/day` : 'Free'}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="flex items-center gap-2">
            <img src={item.owner?.avatar} alt="" loading="lazy" className="h-6 w-6 rounded-full border border-border object-cover" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{item.owner?.name}</span>
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-2xs font-semibold ${
              item.availability === 'available'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
            }`}
          >
            {item.availability === 'available' ? 'Available now' : 'On loan'}
          </span>
        </div>
      </div>
    </Link>
  );
}
