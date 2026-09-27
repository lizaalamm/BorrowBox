import {
  Wrench, Laptop, BookOpen, Tent, Home, PartyPopper, Shirt, Dumbbell,
  Camera, Bike, Utensils, Palette, Gamepad2, Music, Car, Baby, Package,
  Hammer, Sparkles, Leaf, Guitar, Dog, Cpu,
} from 'lucide-react';

/**
 * Icon registry for categories.
 * The API stores a stable icon key (never an emoji); legacy emoji values are
 * still resolved so older persisted data keeps rendering correctly.
 */
const ICONS = {
  wrench: Wrench,
  tools: Wrench,
  hammer: Hammer,
  laptop: Laptop,
  electronics: Laptop,
  cpu: Cpu,
  camera: Camera,
  book: BookOpen,
  'book-open': BookOpen,
  books: BookOpen,
  tent: Tent,
  outdoor: Tent,
  home: Home,
  house: Home,
  utensils: Utensils,
  'party-popper': PartyPopper,
  party: PartyPopper,
  music: Music,
  guitar: Guitar,
  shirt: Shirt,
  clothing: Shirt,
  dumbbell: Dumbbell,
  sports: Dumbbell,
  bike: Bike,
  palette: Palette,
  'gamepad-2': Gamepad2,
  games: Gamepad2,
  car: Car,
  baby: Baby,
  dog: Dog,
  sparkles: Sparkles,
  leaf: Leaf,
  package: Package,
};

export function resolveCategoryIcon(category) {
  const key = typeof category?.icon === 'string' ? category.icon.toLowerCase() : '';
  if (key && ICONS[key]) return ICONS[key];

  // Fall back to the category slug or name so unmapped entries still render a
  // sensible icon instead of a raw string or missing glyph.
  const slug = (category?.slug || category?.name || '').toLowerCase();
  return ICONS[slug] || Package;
}

/** Tailwind colour treatments per category slug (falls back to brand). */
const TONES = {
  tools: 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
  electronics: 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20',
  books: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  outdoor: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
  home: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
  party: 'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/20',
  clothing: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
  sports: 'bg-lime-50 text-lime-600 border-lime-100 dark:bg-lime-500/10 dark:text-lime-300 dark:border-lime-500/20',
};

export function categoryTone(category) {
  const slug = (category?.slug || '').toLowerCase();
  return TONES[slug] || 'bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20';
}

export default function CategoryIcon({ category, className = 'h-5 w-5', boxed = false, boxClassName = '' }) {
  const Icon = resolveCategoryIcon(category);
  if (!boxed) return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
  return (
    <span className={`inline-flex items-center justify-center rounded-xl border ${categoryTone(category)} ${boxClassName}`}>
      <Icon className={className} strokeWidth={1.85} aria-hidden="true" />
    </span>
  );
}
