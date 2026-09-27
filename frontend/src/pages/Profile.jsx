import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Award, BadgeCheck, Calendar, Heart, KeyRound, MapPin, Package, Pencil, Save,
  ShieldCheck, Star, TrendingUp, X,
} from 'lucide-react';
import { usersAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import { toast } from 'sonner';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const userId = id || currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', location: '', avatar: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const isSelf = Boolean(currentUser && profile && currentUser.id === profile.id);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await usersAPI.getById(userId);
        if (cancelled) return;
        setProfile(res.data.data);
        setItems(res.data.data.items || []);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const changePassword = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('The new passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Use at least 8 characters for the new password');
      return;
    }

    try {
      setChangingPassword(true);
      await usersAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update your password');
    } finally {
      setChangingPassword(false);
    }
  };

  const startEditing = () => {
    setForm({
      name: profile.name || '',
      bio: profile.bio || '',
      location: profile.location || '',
      avatar: profile.avatar || '',
    });
    setEditing(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      // Empty optional fields are omitted so the API keeps existing values.
      const payload = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
      };
      if (form.avatar.trim()) payload.avatar = form.avatar.trim();

      const res = await usersAPI.updateProfile(payload);
      setProfile((current) => ({ ...current, ...res.data.data }));
      updateUser(res.data.data);
      setEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update your profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="shell py-10">
        <div className="skeleton h-56 rounded-2xl" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeleton h-72" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Member not found</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">This profile may have been removed.</p>
      </div>
    );
  }

  const reviews = profile.reviews || [];

  return (
    <div className="min-h-screen">
      <div className="shell py-8">
        {/* Profile header */}
        <div className="card overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-brand-700 via-violet-700 to-cyan-600 sm:h-44">
            <div className="absolute inset-0 grid-backdrop opacity-20" aria-hidden="true" />
          </div>

          <div className="px-6 pb-6 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <img
                src={profile.avatar}
                alt=""
                className="-mt-12 h-24 w-24 rounded-2xl border-4 border-card bg-zinc-100 object-cover shadow-card sm:-mt-14 dark:bg-zinc-800"
              />

              <div className="min-w-0 flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-[26px] font-bold leading-none tracking-[-0.02em]">{profile.name}</h1>
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                      <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                      Verified
                    </span>
                  )}
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {profile.role}
                  </span>
                </div>

                <p className="mt-3 max-w-[640px] text-[14.5px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {profile.bio || 'This member has not added a bio yet.'}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {profile.location || 'Location not shared'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    {profile.rating} rating
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Package className="h-4 w-4" aria-hidden="true" />
                    {profile.totalLends} lends / {profile.totalBorrows} borrows
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    Joined {new Date(profile.joinedAt || profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 sm:pb-1">
                {isSelf ? (
                  <button type="button" onClick={startEditing} className="btn btn-secondary btn-md">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit profile
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-50 px-4 py-2 text-[13px] font-semibold text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                    <Award className="h-4 w-4" aria-hidden="true" />
                    Trusted neighbour
                  </span>
                )}
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-zinc-50 p-4 sm:grid-cols-4 dark:bg-zinc-800/40">
              {[
                { label: 'Items listed', value: items.length },
                { label: 'Times lent', value: profile.totalLends || 0 },
                { label: 'Times borrowed', value: profile.totalBorrows || 0 },
                { label: 'Average rating', value: `${profile.rating}` },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{stat.label}</dt>
                  <dd className="mt-1 font-display text-xl font-bold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <form onSubmit={saveProfile} className="card mt-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[16px] font-semibold">Edit profile</h2>
              <button type="button" onClick={() => setEditing(false)} aria-label="Cancel editing" className="icon-btn h-8 w-8">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="profile-name">Full name</label>
                <input
                  id="profile-name"
                  required
                  minLength={2}
                  maxLength={50}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="profile-location">Neighbourhood</label>
                <input
                  id="profile-location"
                  maxLength={100}
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  className="input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="profile-avatar">Avatar image URL</label>
                <input
                  id="profile-avatar"
                  type="url"
                  value={form.avatar}
                  onChange={(event) => setForm({ ...form, avatar: event.target.value })}
                  placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=yourname"
                  className="input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="profile-bio">About you</label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  maxLength={500}
                  value={form.bio}
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                  placeholder="Tell neighbours what you lend and how you like to borrow."
                  className="input resize-none"
                />
                <p className="mt-1 text-[11px] text-zinc-400">{form.bio.length}/500 characters</p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary btn-md">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary btn-md">
                <Save className="h-4 w-4" aria-hidden="true" />
                {saving ? 'Saving' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {/* Security */}
        {isSelf && (
          <form onSubmit={changePassword} className="card mt-6 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-[16px] font-semibold">Password and security</h2>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  Use a unique password you do not use anywhere else.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="current-password">Current password</label>
                <input
                  id="current-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="confirm-password">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                  className="input"
                />
              </div>
            </div>

            <p className="mt-3 text-[12px] text-zinc-500 dark:text-zinc-400">
              Must be at least 8 characters and include an uppercase letter, a lowercase letter and a number.
            </p>

            <button type="submit" disabled={changingPassword} className="btn btn-primary btn-md mt-5">
              {changingPassword ? 'Updating password' : 'Update password'}
            </button>
          </form>
        )}

        {/* Listings */}
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
              Items by {profile.name.split(' ')[0]} ({items.length})
            </h2>
            <span className="badge-pill hidden sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              Protected borrows
            </span>
          </div>

          {items.length === 0 ? (
            <div className="card mt-5 flex flex-col items-center px-6 py-14 text-center">
              <Package className="h-8 w-8 text-zinc-300" aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold">No items listed yet</p>
              <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
                {isSelf ? 'List your first item to start receiving requests.' : 'Check back soon for new listings.'}
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 font-display text-[20px] font-bold tracking-[-0.02em]">
              <TrendingUp className="h-5 w-5 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              Reviews from neighbours
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {reviews.map((review) => (
                <div key={review.id} className="card p-5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="ml-2 text-[11px] text-zinc-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {isSelf && items.length === 0 && (
          <div className="card mt-8 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                <Heart className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Build your lending history</p>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  Members with three or more listings get featured placement.
                </p>
              </div>
            </div>
            <Link to="/list-item" className="btn btn-primary btn-md">List an item</Link>
          </div>
        )}
      </div>
    </div>
  );
}
