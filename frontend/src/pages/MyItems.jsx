import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle, Eye, Package, Pencil, Plus, Repeat2, Save, Star, Trash2, X,
} from 'lucide-react';
import { itemsAPI } from '../lib/api';
import { toast } from 'sonner';
import CategoryIcon from '../lib/categoryIcons';

const AVAILABILITY_OPTIONS = ['available', 'borrowed', 'reserved', 'unavailable'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function MyItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchItems = async () => {
    try {
      const res = await itemsAPI.getMyItems();
      setItems(res.data.data || []);
    } catch {
      toast.error('Could not load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (item) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      setDeletingId(item.id);
      await itemsAPI.delete(item.id);
      toast.success('Listing deleted');
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete this listing');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const res = await itemsAPI.update(editing.id, {
        title: editing.title,
        description: editing.description,
        condition: editing.condition,
        value: Number(editing.value),
        lendingFee: Number(editing.lendingFee),
        availability: editing.availability,
      });
      const updated = res.data.data;
      setItems((current) => current.map((entry) => (entry.id === updated.id ? { ...entry, ...updated } : entry)));
      setEditing(null);
      toast.success('Listing updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update this listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="shell py-10">
        <div className="skeleton h-10 w-64" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeleton h-80" />
          ))}
        </div>
      </div>
    );
  }

  const available = items.filter((item) => item.availability === 'available').length;
  const totalBorrows = items.reduce((sum, item) => sum + (item.borrowCount || 0), 0);

  return (
    <div className="min-h-screen">
      <div className="shell py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Lending</p>
            <h1 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[34px]">My items</h1>
            <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
              {items.length} listings / {available} available now / {totalBorrows} total borrows
            </p>
          </div>
          <Link to="/list-item" className="btn btn-primary btn-md self-start">
            <Plus className="h-4 w-4" aria-hidden="true" />
            List an item
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="card mt-8 flex flex-col items-center px-6 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <Package className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-lg font-semibold">No listings yet</h2>
            <p className="mt-2 max-w-[380px] text-sm text-zinc-500 dark:text-zinc-400">
              Start with something you use a few times a year, like a drill, a tent or a stand mixer.
            </p>
            <Link to="/list-item" className="btn btn-primary btn-md mt-6">Create your first listing</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="card card-hover overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img src={item.images?.[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-white ${
                      item.availability === 'available' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  >
                    {item.availability}
                  </span>
                  <Link
                    to={`/items/${item.id}`}
                    aria-label={`View ${item.title}`}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/90 text-zinc-700 backdrop-blur transition-colors hover:text-brand-600 dark:border-zinc-700/60 dark:bg-zinc-900/85 dark:text-zinc-200"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-2">
                    <CategoryIcon
                      category={item.categoryDetails || { slug: '' }}
                      boxed
                      className="h-4 w-4"
                      boxClassName="h-8 w-8 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[14.5px] font-semibold">{item.title}</h2>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                        {item.rating} /
                        <span className="inline-flex items-center gap-1">
                          <Repeat2 className="h-3 w-3" aria-hidden="true" />
                          {item.borrowCount} borrows
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[13px] text-zinc-500 dark:text-zinc-400">
                    {item.lendingFee > 0 ? `$${item.lendingFee}/day` : 'Free to borrow'} / value ${item.value}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => setEditing({ ...item })} className="btn btn-secondary btn-sm flex-1">
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="btn btn-sm border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {deletingId === item.id ? 'Deleting' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="card mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Pause instead of deleting</p>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  Set availability to unavailable to hide a listing without losing its reviews.
                </p>
              </div>
            </div>
            <span className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
              {items.filter((item) => item.availability === 'unavailable').length} paused
            </span>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-2xl border border-border bg-card shadow-lift">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-display text-[16px] font-semibold">Edit listing</h2>
                <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="icon-btn h-8 w-8">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div>
                  <label className="label" htmlFor="edit-title">Title</label>
                  <input
                    id="edit-title"
                    required
                    minLength={3}
                    maxLength={100}
                    value={editing.title}
                    onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    rows={4}
                    maxLength={2000}
                    value={editing.description}
                    onChange={(event) => setEditing({ ...editing, description: event.target.value })}
                    className="input resize-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="edit-condition">Condition</label>
                    <select
                      id="edit-condition"
                      value={editing.condition}
                      onChange={(event) => setEditing({ ...editing, condition: event.target.value })}
                      className="select"
                    >
                      {CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="edit-availability">Availability</label>
                    <select
                      id="edit-availability"
                      value={editing.availability}
                      onChange={(event) => setEditing({ ...editing, availability: event.target.value })}
                      className="select"
                    >
                      {AVAILABILITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="edit-value">Value (USD)</label>
                    <input
                      id="edit-value"
                      type="number"
                      min="0"
                      value={editing.value}
                      onChange={(event) => setEditing({ ...editing, value: event.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="edit-fee">Daily fee (USD)</label>
                    <input
                      id="edit-fee"
                      type="number"
                      min="0"
                      value={editing.lendingFee}
                      onChange={(event) => setEditing({ ...editing, lendingFee: event.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                <button type="button" onClick={() => setEditing(null)} className="btn btn-secondary btn-md">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-md">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {saving ? 'Saving' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
