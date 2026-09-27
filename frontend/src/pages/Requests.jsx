import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, Check, CheckCircle2, Clock3, Package, PackageCheck,
  RefreshCw, ShoppingBag, Star, X,
} from 'lucide-react';
import { borrowAPI, reviewsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const STATUS_TONES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  approved: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20',
  borrowed: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
  returned: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
  cancelled: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
};

const TYPE_TABS = [
  { value: 'all', label: 'All activity' },
  { value: 'borrowed', label: 'My borrows' },
  { value: 'lent', label: 'My lends' },
];

const STATUS_TABS = ['all', 'pending', 'approved', 'borrowed', 'returned', 'completed'];

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [savingReview, setSavingReview] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (type !== 'all') params.type = type;
      if (status !== 'all') params.status = status;
      const res = await borrowAPI.getAll(params);
      setRequests(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load your requests');
    } finally {
      setLoading(false);
    }
  }, [type, status]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (request, nextStatus, successMessage) => {
    try {
      setBusyId(request.id);
      await borrowAPI.updateStatus(request.id, { status: nextStatus });
      toast.success(successMessage);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update this request');
    } finally {
      setBusyId(null);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (review.comment.trim().length < 5) {
      toast.error('Add a few words about how the borrow went');
      return;
    }
    try {
      setSavingReview(true);
      await reviewsAPI.create({
        itemId: reviewing.itemId,
        rating: review.rating,
        comment: review.comment.trim(),
        type: 'item',
      });
      toast.success('Review published');
      setReviewing(null);
      setReview({ rating: 5, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not publish your review');
    } finally {
      setSavingReview(false);
    }
  };

  const pendingCount = requests.filter((request) => request.status === 'pending').length;

  return (
    <div className="min-h-screen">
      <div className="shell py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Borrow requests</p>
            <h1 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[34px]">
              Manage your activity
            </h1>
            <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
              {loading ? 'Loading requests...' : `${requests.length} requests / ${pendingCount} waiting on a reply`}
            </p>
          </div>
          <button type="button" onClick={fetchRequests} className="btn btn-secondary btn-md self-start">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 no-scrollbar">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setType(tab.value)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                  type === tab.value ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 no-scrollbar">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatus(tab)}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium capitalize transition-colors ${
                  status === tab ? 'bg-brand-600 text-white' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="mt-6 space-y-4">
          {loading ? (
            [0, 1, 2].map((index) => <div key={index} className="skeleton h-40" />)
          ) : requests.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-lg font-semibold">No requests here yet</h2>
              <p className="mt-2 max-w-[380px] text-sm text-zinc-500 dark:text-zinc-400">
                When you borrow or lend an item, the full history shows up in this list.
              </p>
              <Link to="/browse" className="btn btn-primary btn-md mt-6">Browse items</Link>
            </div>
          ) : (
            requests.map((request) => {
              const isOwner = request.ownerId === user?.id;
              const isBorrower = request.borrowerId === user?.id;
              const counterparty = isOwner ? request.borrower : request.owner;
              const busy = busyId === request.id;

              return (
                <article key={request.id} className="card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <img
                      src={request.item?.images?.[0]}
                      alt=""
                      loading="lazy"
                      className="h-24 w-full rounded-xl border border-border object-cover sm:h-24 sm:w-32"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`/items/${request.itemId}`}
                            className="font-display text-[16px] font-semibold transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                          >
                            {request.item?.title || 'Item no longer listed'}
                          </Link>
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                              {request.startDate} to {request.endDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                              Requested {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            <span>{request.totalFee > 0 ? `$${request.totalFee} fee` : 'Free'}</span>
                          </p>
                        </div>

                        <span className={`rounded-full border px-2.5 py-1 text-2xs font-bold uppercase tracking-wide ${STATUS_TONES[request.status] || STATUS_TONES.cancelled}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2.5">
                        <img src={counterparty?.avatar} alt="" className="h-6 w-6 rounded-full border border-border object-cover" />
                        <p className="text-xs text-zinc-600 dark:text-zinc-300">
                          <span className="font-semibold">{isOwner ? 'Borrower' : 'Owner'}:</span> {counterparty?.name || 'BorrowBox member'}
                        </p>
                      </div>

                      {request.message && (
                        <p className="mt-3 rounded-xl border border-border bg-zinc-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-300">
                          {request.message}
                        </p>
                      )}

                      {request.ownerMessage && (
                        <p className="mt-2 rounded-xl border border-brand-100 bg-brand-50/60 px-3.5 py-2.5 text-[13px] leading-relaxed text-brand-800 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-200">
                          Owner reply: {request.ownerMessage}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {request.status === 'pending' && isOwner && (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => updateStatus(request, 'approved', 'Request approved')}
                              className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => updateStatus(request, 'rejected', 'Request declined')}
                              className="btn btn-secondary btn-sm"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                              Decline
                            </button>
                          </>
                        )}

                        {request.status === 'pending' && isBorrower && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => updateStatus(request, 'cancelled', 'Request cancelled')}
                            className="btn btn-secondary btn-sm"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                            Cancel request
                          </button>
                        )}

                        {request.status === 'approved' && isOwner && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => updateStatus(request, 'borrowed', 'Marked as handed over')}
                            className="btn btn-primary btn-sm"
                          >
                            <Package className="h-3.5 w-3.5" aria-hidden="true" />
                            Mark as handed over
                          </button>
                        )}

                        {request.status === 'borrowed' && isBorrower && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => updateStatus(request, 'returned', 'Marked as returned')}
                            className="btn btn-sm bg-amber-500 text-white hover:bg-amber-600"
                          >
                            <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            Mark as returned
                          </button>
                        )}

                        {request.status === 'returned' && isOwner && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => updateStatus(request, 'completed', 'Borrow completed')}
                            className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Complete borrow
                          </button>
                        )}

                        {request.status === 'completed' && isBorrower && (
                          <button
                            type="button"
                            onClick={() => setReviewing(request)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Star className="h-3.5 w-3.5" aria-hidden="true" />
                            Leave a review
                          </button>
                        )}

                        <Link to={`/items/${request.itemId}`} className="btn btn-ghost btn-sm">
                          View item
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Review modal */}
      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card shadow-lift">
            <form onSubmit={submitReview}>
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-display text-[16px] font-semibold">Review your borrow</h2>
                <button type="button" onClick={() => setReviewing(null)} aria-label="Close" className="icon-btn h-8 w-8">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-4 px-6 py-5">
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  How was borrowing {reviewing.item?.title} from {reviewing.owner?.name}?
                </p>

                <div>
                  <span className="label">Rating</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReview({ ...review, rating: star })}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        className="rounded-full p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-7 w-7 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="review-comment">Your review</label>
                  <textarea
                    id="review-comment"
                    rows={3}
                    maxLength={1000}
                    value={review.comment}
                    onChange={(event) => setReview({ ...review, comment: event.target.value })}
                    placeholder="Item condition, communication, punctuality."
                    className="input resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                <button type="button" onClick={() => setReviewing(null)} className="btn btn-secondary btn-md">Cancel</button>
                <button type="submit" disabled={savingReview} className="btn btn-primary btn-md">
                  {savingReview ? 'Publishing' : 'Publish review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
