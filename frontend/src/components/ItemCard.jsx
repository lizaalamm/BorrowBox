import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, BadgeCheck, Repeat2, Tag } from 'lucide-react';
import { wishlistAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const CONDITION_TONES = {
  New: 'bg-emerald-500',
  'Like New': 'bg-cyan-500',
  Good: 'bg-amber-500',
  Fair: 'bg-zinc-500',
};

const AVAILABILITY_TONES = {
  available: { label: 'Available', className: 'bg-emerald-500/95 text-white' },
  borrowed: { label: 'On loan', className: 'bg-amber-500/95 text-white' },
  reserved: { label: 'Reserved', className: 'bg-brand-600/95 text-white' },
  unavailable: { label: 'Unavailable', className: 'bg-zinc-900/85 text-white' },
};

export default function ItemCard({ item, index = 0, initiallyWishlisted = false }) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(initiallyWishlisted);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const availability = AVAILABILITY_TONES[item.availability] || AVAILABILITY_TONES.unavailable;

  const toggleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.error('Sign in to save items to your wishlist');
      return;
    }
    if (saving) return;

    try {
      setSaving(true);
      if (isWishlisted) {
        await wishlistAPI.remove(item.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(item.id);
        setIsWishlisted(true);
        toast.success('Saved to wishlist');
      }
    } catch (error) {
      if (error.response?.status === 400) setIsWishlisted(true);
      else toast.error(error.response?.data?.message || 'Could not update your wishlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Link
        to={`/items/${item.id}`}
        className="card card-hover flex h-full flex-col overflow-hidden focus-visible:ring-2 focus-visible:ring-brand-600/50"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {!imgLoaded && <div className="skeleton absolute inset-0 rounded-none" />}
          <img
            src={item.images?.[0]}
            alt={item.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.04] ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-white shadow-soft ${
                CONDITION_TONES[item.condition] || 'bg-zinc-600'
              }`}
            >
              {item.condition}
            </span>
            {item.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/90 px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-white backdrop-blur">
                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                Featured
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={toggleWishlist}
            disabled={saving}
            aria-label={isWishlisted ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`}
            aria-pressed={isWishlisted}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-soft backdrop-blur transition-all ${
              isWishlisted
                ? 'border-rose-500 bg-rose-500 text-white'
                : 'border-white/40 bg-white/90 text-zinc-700 hover:scale-105 dark:border-zinc-700/60 dark:bg-zinc-900/85 dark:text-zinc-200'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>

          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold backdrop-blur ${availability.className}`}>
              <span className="status-dot bg-white/90" aria-hidden="true" />
              {availability.label}
            </span>
            {item.lendingFee > 0 ? (
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-2xs font-bold text-zinc-900 backdrop-blur">
                ${item.lendingFee}/day
              </span>
            ) : (
              <span className="rounded-full bg-brand-600 px-2.5 py-1 text-2xs font-bold text-white">
                Free
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-display text-[16px] font-semibold leading-snug transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300">
              {item.title}
            </h3>
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50 px-2 py-0.5 dark:border-amber-400/20 dark:bg-amber-500/10">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
              <span className="text-[11px] font-bold">{item.rating ?? '5.0'}</span>
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            {item.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="chip">
              <Tag className="h-3 w-3" aria-hidden="true" />
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <Repeat2 className="h-3 w-3" aria-hidden="true" />
              {item.borrowCount || 0} borrows
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex min-w-0 items-center gap-2">
              <img
                src={item.owner?.avatar}
                alt=""
                loading="lazy"
                className="h-7 w-7 flex-shrink-0 rounded-full border border-border object-cover"
              />
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate text-xs font-semibold leading-none">
                  {item.owner?.name || 'BorrowBox member'}
                  {item.owner?.verified && (
                    <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  )}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] leading-none text-zinc-500 dark:text-zinc-400">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {item.owner?.rating ?? '5.0'}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{item.location?.split(' - ')[0]}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
