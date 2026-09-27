import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, Info, ImagePlus, MapPin, Package, Plus, ShieldCheck, Sparkles, Trash2, X,
} from 'lucide-react';
import { categoriesAPI, itemsAPI } from '../lib/api';
import { toast } from 'sonner';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const INITIAL_FORM = {
  title: '',
  description: '',
  category: '',
  categoryId: '',
  condition: 'Good',
  value: '',
  lendingFee: '0',
  location: '',
  tags: '',
  images: [''],
};

export default function ListItem() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((res) => {
        const list = res.data.data || [];
        setCategories(list);
        if (list[0]) {
          setForm((current) => ({ ...current, category: list[0].name, categoryId: list[0].id }));
        }
      })
      .catch(() => toast.error('Could not load categories'));
  }, []);

  const coverImage = useMemo(() => form.images.find((image) => image.trim()), [form.images]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 3) next.title = 'Give your listing a clear title (at least 3 characters).';
    if (form.description.trim().length < 10) next.description = 'Describe the item, its condition and what is included.';
    if (!form.categoryId) next.categoryId = 'Choose a category.';
    if (!form.value || Number(form.value) < 0) next.value = 'Enter the replacement value in dollars.';
    if (Number(form.lendingFee) < 0) next.lendingFee = 'Fee cannot be negative.';
    if (!form.location.trim()) next.location = 'Add a neighbourhood so neighbours can find it.';
    const badImage = form.images.find((image) => image.trim() && !/^https?:\/\/.+/i.test(image.trim()));
    if (badImage) next.images = 'Image links must start with http:// or https://';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        categoryId: form.categoryId,
        condition: form.condition,
        value: Number(form.value),
        lendingFee: Number(form.lendingFee) || 0,
        location: form.location.trim(),
        tags: form.tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
        images: form.images.map((image) => image.trim()).filter(Boolean),
      };
      const res = await itemsAPI.create(payload);
      toast.success('Listing published. Neighbours can now request it.');
      navigate(`/items/${res.data.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not publish your listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="shell max-w-[900px] py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">New listing</p>
            <h1 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[34px]">
              List an item to lend
            </h1>
            <p className="mt-2 max-w-[520px] text-[15px] text-zinc-600 dark:text-zinc-400">
              Clear photos and honest condition notes get approved twice as fast. You can pause a listing at any time.
            </p>
          </div>
          <span className="badge-pill self-start">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" aria-hidden="true" />
            Free to list
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            {/* Basics */}
            <section className="card p-6">
              <h2 className="font-display text-[15px] font-semibold">Item basics</h2>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="label" htmlFor="title">Listing title</label>
                  <input
                    id="title"
                    value={form.title}
                    onChange={(event) => setField('title', event.target.value)}
                    placeholder="DeWalt 20V cordless drill kit"
                    maxLength={100}
                    className="input"
                    aria-invalid={Boolean(errors.title)}
                  />
                  {errors.title ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{errors.title}</p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-zinc-400">{form.title.length}/100 characters</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={form.categoryId}
                      onChange={(event) => {
                        const category = categories.find((entry) => entry.id === event.target.value);
                        setForm((current) => ({ ...current, categoryId: event.target.value, category: category?.name || '' }));
                        setErrors((current) => ({ ...current, categoryId: undefined }));
                      }}
                      className="select"
                      aria-invalid={Boolean(errors.categoryId)}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{errors.categoryId}</p>
                    )}
                  </div>

                  <div>
                    <label className="label" htmlFor="condition">Condition</label>
                    <select
                      id="condition"
                      value={form.condition}
                      onChange={(event) => setField('condition', event.target.value)}
                      className="select"
                    >
                      {CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows={5}
                    maxLength={2000}
                    value={form.description}
                    onChange={(event) => setField('description', event.target.value)}
                    placeholder="What is included, how it has been used, and anything a borrower should know."
                    className="input resize-none"
                    aria-invalid={Boolean(errors.description)}
                  />
                  {errors.description ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{errors.description}</p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-zinc-400">{form.description.length}/2000 characters</p>
                  )}
                </div>
              </div>
            </section>

            {/* Pricing & location */}
            <section className="card p-6">
              <h2 className="font-display text-[15px] font-semibold">Value, fee and pickup</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label" htmlFor="value">Replacement value (USD)</label>
                  <input
                    id="value"
                    type="number"
                    min="0"
                    step="1"
                    value={form.value}
                    onChange={(event) => setField('value', event.target.value)}
                    placeholder="199"
                    className="input"
                    aria-invalid={Boolean(errors.value)}
                  />
                  {errors.value && <p className="mt-1.5 text-xs text-rose-600">{errors.value}</p>}
                </div>

                <div>
                  <label className="label" htmlFor="fee">Daily fee (USD)</label>
                  <input
                    id="fee"
                    type="number"
                    min="0"
                    step="1"
                    value={form.lendingFee}
                    onChange={(event) => setField('lendingFee', event.target.value)}
                    placeholder="0"
                    className="input"
                    aria-invalid={Boolean(errors.lendingFee)}
                  />
                  <p className="mt-1.5 text-[11px] text-zinc-400">Keep it at 0 for pure community sharing.</p>
                </div>

                <div>
                  <label className="label" htmlFor="location">Neighbourhood</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                    <input
                      id="location"
                      value={form.location}
                      onChange={(event) => setField('location', event.target.value)}
                      placeholder="Mission District, SF"
                      className="input input-icon"
                      aria-invalid={Boolean(errors.location)}
                    />
                  </div>
                  {errors.location && <p className="mt-1.5 text-xs text-rose-600">{errors.location}</p>}
                </div>
              </div>

              <div className="mt-5">
                <label className="label" htmlFor="tags">Tags</label>
                <input
                  id="tags"
                  value={form.tags}
                  onChange={(event) => setField('tags', event.target.value)}
                  placeholder="power-tools, diy, dewalt"
                  className="input"
                />
                <p className="mt-1.5 text-[11px] text-zinc-400">Separate tags with commas to help neighbours find this item.</p>
              </div>
            </section>

            {/* Images */}
            <section className="card p-6">
              <h2 className="font-display text-[15px] font-semibold">Photos</h2>
              <p className="mt-1.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                Paste image links (Unsplash, Cloudinary or your own CDN). The first photo becomes the cover.
              </p>

              <div className="mt-5 space-y-3">
                {form.images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-zinc-50 dark:bg-zinc-800/60">
                      {image.trim() ? (
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                      )}
                    </span>
                    <input
                      value={image}
                      onChange={(event) => {
                        const images = [...form.images];
                        images[index] = event.target.value;
                        setField('images', images);
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                      aria-label={`Image URL ${index + 1}`}
                      className="input"
                    />
                    {form.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setField('images', form.images.filter((_, position) => position !== index))}
                        aria-label={`Remove image ${index + 1}`}
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border text-zinc-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setField('images', [...form.images, ''])}
                disabled={form.images.length >= 5}
                className="btn btn-secondary btn-sm mt-4"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add another photo
              </button>
              {errors.images && <p className="mt-2 text-xs text-rose-600">{errors.images}</p>}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
            <div className="card overflow-hidden">
              <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
                {coverImage ? (
                  <img src={coverImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-8 w-8 text-zinc-300" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Live preview</p>
                <p className="mt-2 line-clamp-2 font-display text-[16px] font-semibold">
                  {form.title.trim() || 'Your listing title'}
                </p>
                <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
                  {form.category || 'Category'} / {form.condition}
                </p>
                <p className="mt-3 text-[13px] font-semibold text-brand-700 dark:text-brand-300">
                  {Number(form.lendingFee) > 0 ? `$${Number(form.lendingFee)}/day` : 'Free to borrow'}
                </p>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
                <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                Tips for a great listing
              </h2>
              <ul className="mt-3 space-y-2.5 text-[13px] text-zinc-600 dark:text-zinc-400">
                {[
                  'Photograph the item on a plain background in daylight.',
                  'Mention accessories, batteries or cases that travel with it.',
                  'Set expectations for pickup windows and return condition.',
                  'Keep the daily fee low, most neighbours lend for free.',
                ].map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
                <Info className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                What happens next
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                Your listing goes live immediately. Neighbours send requests, you approve or decline, and every borrow is
                covered up to $500.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? 'Publishing...' : 'Publish listing'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost btn-md w-full">
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}
