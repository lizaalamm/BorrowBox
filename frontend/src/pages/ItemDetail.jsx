import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BadgeCheck, Calendar, CheckCircle2, Clock3, DollarSign, Heart,
  Info, MapPin, MessageSquare, Package, Repeat2, Share2, Shield, Star, Tag,
  UserRound, PackageCheck,
} from 'lucide-react';
import { borrowAPI, itemsAPI, wishlistAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const CONDITION_TONES = {
  New: 'bg-emerald-500',
  'Like New': 'bg-cyan-500',
  Good: 'bg-amber-500',
  Fair: 'bg-zinc-500',
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [showBorrow, setShowBorrow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [borrowForm, setBorrowForm] = useState({ startDate: '', endDate: '', message: '' });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await itemsAPI.getById(id);
        if (cancelled) return;
        setItem(res.data.data);
        setReviews(res.data.data.reviews || []);
        if (user) {
          try {
            const wish = await wishlistAPI.check(id);
            if (!cancelled) setIsWishlisted(Boolean(wish.data.data.inWishlist));
          } catch {
            /* wishlist state is optional */
          }
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const handleBorrow = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Sign in to send a borrow request');
      navigate('/login');
      return;
    }
    if (borrowForm.endDate < borrowForm.startDate) {
      toast.error('The return date must be after the start date');
      return;
    }

    try {
      setSubmitting(true);
      await borrowAPI.create({ itemId: id, ...borrowForm });
      toast.success('Request sent. The owner has been notified.');
      setShowBorrow(false);
      setBorrowForm({ startDate: '', endDate: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send the request');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Sign in to save items');
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(id);
        setIsWishlisted(true);
        toast.success('Saved to wishlist');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update your wishlist');
    }
  };

  const shareItem = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not share this item');
    }
  };

  if (loading) {
    return (
      <div className="shell grid gap-8 py-10 lg:grid-cols-2">
        <div className="skeleton aspect-[4/3] rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="shell py-24 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
          <Package className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">This item is no longer available</h1>
        <p className="mx-auto mt-2 max-w-[420px] text-sm text-zinc-500 dark:text-zinc-400">
          It may have been removed by the owner or the link could be incorrect.
        </p>
        <Link to="/browse" className="btn btn-primary btn-md mt-6">
          Back to browse
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === item.ownerId;
  const days =
    borrowForm.startDate && borrowForm.endDate
      ? Math.max(1, Math.ceil((new Date(borrowForm.endDate) - new Date(borrowForm.startDate)) / 86400000))
      : 1;
  const totalFee = (item.lendingFee || 0) * days;
  const isAvailable = item.availability === 'available';

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  return (
    <div className="min-h-screen">
      <div className="shell py-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link to="/" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/browse" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Browse</Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/browse?category=${(item.category || '').toLowerCase()}`}
            className="transition-colors hover:text-brand-700 dark:hover:text-brand-300"
          >
            {item.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">{item.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* ------------------------------------------------------------- media */}
          <div className="space-y-4">
            <div className="card relative overflow-hidden p-0">
              <img
                src={item.images?.[activeImg]}
                alt={item.title}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1.5 text-2xs font-bold uppercase tracking-wide text-white shadow-soft ${CONDITION_TONES[item.condition] || 'bg-zinc-600'}`}>
                  {item.condition}
                </span>
                <span className={`rounded-full px-3 py-1.5 text-2xs font-bold uppercase tracking-wide text-white shadow-soft ${isAvailable ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                  {isAvailable ? 'Available now' : item.availability}
                </span>
              </div>

              <div className="absolute right-4 top-4 flex gap-2">
                <button
                  type="button"
                  onClick={toggleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-soft backdrop-blur transition-colors ${
                    isWishlisted
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : 'border-white/40 bg-white/90 text-zinc-700 hover:text-rose-500 dark:border-zinc-700/60 dark:bg-zinc-900/85 dark:text-zinc-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={shareItem}
                  aria-label="Share this item"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/90 text-zinc-700 shadow-soft backdrop-blur transition-colors hover:text-brand-600 dark:border-zinc-700/60 dark:bg-zinc-900/85 dark:text-zinc-200"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {item.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {item.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-current={activeImg === index}
                    className={`h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      activeImg === index
                        ? 'border-brand-600 ring-2 ring-brand-600/20'
                        : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
                <Info className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                Item details
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                {[
                  { Icon: Tag, label: 'Category', value: item.category },
                  { Icon: Shield, label: 'Condition', value: item.condition },
                  { Icon: DollarSign, label: 'Estimated value', value: `$${item.value}` },
                  { Icon: Repeat2, label: 'Times borrowed', value: item.borrowCount || 0 },
                  { Icon: Star, label: 'Rating', value: `${item.rating} (${item.reviewCount || 0})` },
                  { Icon: PackageCheck, label: 'Lending fee', value: item.lendingFee > 0 ? `$${item.lendingFee}/day` : 'Free' },
                ].map(({ Icon, label, value }) => (
                  <div key={label}>
                    <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1 truncate text-[14px] font-semibold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* ----------------------------------------------------------- details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] sm:text-[34px]">
                {item.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="font-semibold text-foreground">{item.rating}</span>
                  <span>({item.reviewCount || 0} reviews)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {item.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  Listed {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <p className="mt-5 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">{item.description}</p>

              {item.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Link key={tag} to={`/browse?search=${encodeURIComponent(tag)}`} className="chip transition-colors hover:border-brand-300 hover:text-brand-700">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Borrow card */}
            <div className="card p-6">
              {isOwner ? (
                <div className="text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    <Package className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 font-display text-[17px] font-semibold">This is your listing</h2>
                  <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {item.borrowCount} borrows to date with a {item.rating} average rating.
                  </p>
                  <Link to="/my-items" className="btn btn-secondary btn-md mt-5">
                    Manage listing
                  </Link>
                </div>
              ) : !isAvailable ? (
                <div className="text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                    <Clock3 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 font-display text-[17px] font-semibold">Currently on loan</h2>
                  <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    Save it to your wishlist and we will keep it handy for when it is back.
                  </p>
                  <button type="button" onClick={toggleWishlist} className="btn btn-secondary btn-md mt-5">
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden="true" />
                    {isWishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-[18px] font-semibold">
                        {item.lendingFee > 0 ? `$${item.lendingFee} per day` : 'Free to borrow'}
                      </h2>
                      <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
                        {item.lendingFee > 0 ? 'Charged per day until return' : 'Community sharing, no fee'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-2xs font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Available
                    </span>
                  </div>

                  {!showBorrow ? (
                    <>
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        {[
                          { label: 'Reply time', value: '~2 hours' },
                          { label: 'Pickup', value: 'Flexible' },
                          { label: 'Deposit', value: 'None' },
                        ].map((fact) => (
                          <div key={fact.label} className="rounded-xl border border-border bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
                            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{fact.label}</p>
                            <p className="mt-1 text-[13.5px] font-semibold text-foreground">{fact.value}</p>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={() => setShowBorrow(true)} className="btn btn-primary btn-lg mt-5 w-full">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        Request to borrow
                      </button>
                      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No commitment until the owner approves. Protected up to $500.
                      </p>
                    </>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleBorrow}
                      className="mt-5 space-y-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label" htmlFor="start-date">Start date</label>
                          <input
                            id="start-date"
                            type="date"
                            required
                            min={todayISO()}
                            value={borrowForm.startDate}
                            onChange={(event) => setBorrowForm({ ...borrowForm, startDate: event.target.value })}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label" htmlFor="end-date">Return date</label>
                          <input
                            id="end-date"
                            type="date"
                            required
                            min={borrowForm.startDate || todayISO()}
                            value={borrowForm.endDate}
                            onChange={(event) => setBorrowForm({ ...borrowForm, endDate: event.target.value })}
                            className="input"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="label" htmlFor="borrow-message">Message to owner</label>
                        <textarea
                          id="borrow-message"
                          rows={3}
                          maxLength={500}
                          value={borrowForm.message}
                          onChange={(event) => setBorrowForm({ ...borrowForm, message: event.target.value })}
                          placeholder="Let the owner know what you need it for and when you can collect."
                          className="input resize-none"
                        />
                        <p className="mt-1 text-[11px] text-zinc-400">{borrowForm.message.length}/500 characters</p>
                      </div>

                      {item.lendingFee > 0 && (
                        <div className="flex items-center justify-between rounded-xl border border-border bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800/50">
                          <span>
                            {days} {days === 1 ? 'day' : 'days'} at ${item.lendingFee}/day
                          </span>
                          <span className="font-display font-bold">${totalFee}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setShowBorrow(false)} className="btn btn-secondary btn-md flex-1">
                          Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="btn btn-primary btn-md flex-1">
                          {submitting ? 'Sending...' : 'Send request'}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </>
              )}
            </div>

            {/* Owner card */}
            <div className="card p-5">
              <div className="flex items-center gap-4">
                <img
                  src={item.owner?.avatar}
                  alt=""
                  className="h-14 w-14 flex-shrink-0 rounded-full border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[15px] font-semibold">
                    {item.owner?.name}
                    {item.owner?.verified && (
                      <BadgeCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                    )}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-zinc-500 dark:text-zinc-400">
                    {item.owner?.bio || 'Community lender on BorrowBox'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      {item.owner?.rating} rating
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.owner?.totalLends} lends
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.owner?.location}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/users/${item.ownerId}`}
                  aria-label={`View ${item.owner?.name} profile`}
                  className="icon-btn flex-shrink-0 border border-border"
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-[17px] font-semibold">Reviews ({reviews.length})</h2>
                {reviews.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    {item.rating} average
                  </span>
                )}
              </div>

              {reviews.length > 0 && (
                <div className="mt-4 space-y-2">
                  {ratingBuckets.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-10 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{star} star</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[11px] text-zinc-500 dark:text-zinc-400">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-4">
                {reviews.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    No reviews yet. Borrowers can review after the item is returned.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="flex gap-3 border-t border-border pt-4 first:border-0 first:pt-0">
                      <img
                        src={review.reviewer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewerId}`}
                        alt=""
                        className="h-9 w-9 flex-shrink-0 rounded-full border border-border object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[13.5px] font-semibold">{review.reviewer?.name || 'BorrowBox member'}</span>
                          <span className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
                                aria-hidden="true"
                              />
                            ))}
                          </span>
                          <span className="text-[11px] text-zinc-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-600 dark:text-zinc-400">{review.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {item.relatedItems?.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Same category</p>
                <h2 className="mt-2 font-display text-[24px] font-bold tracking-[-0.02em] sm:text-[30px]">You might also need</h2>
              </div>
              <Link to="/browse" className="btn btn-ghost btn-sm">
                See all
                <ArrowLeft className="h-4 w-4 rotate-180" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {item.relatedItems.map((related) => (
                <Link key={related.id} to={`/items/${related.id}`} className="card card-hover group overflow-hidden">
                  <div className="overflow-hidden">
                    <img
                      src={related.images?.[0]}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="truncate text-[14px] font-semibold">{related.title}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {related.category} / {related.lendingFee === 0 ? 'Free' : `$${related.lendingFee}/day`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
