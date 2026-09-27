import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, RefreshCw } from 'lucide-react';
import { wishlistAPI } from '../lib/api';
import ItemCard from '../components/ItemCard';
import { toast } from 'sonner';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistAPI.getAll();
      setItems((res.data.data || []).map((entry) => entry.item).filter(Boolean));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load your wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="shell py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Saved for later</p>
            <h1 className="mt-2 flex items-center gap-3 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[34px]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
              </span>
              Wishlist
            </h1>
            <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
              {loading ? 'Loading saved items...' : `${items.length} saved ${items.length === 1 ? 'item' : 'items'}`}
            </p>
          </div>

          <div className="flex gap-2 self-start">
            <button type="button" onClick={fetchWishlist} className="btn btn-secondary btn-md">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
            <Link to="/browse" className="btn btn-primary btn-md">
              Find more items
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="skeleton h-80" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card mt-8 flex flex-col items-center px-6 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <Heart className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-lg font-semibold">Your wishlist is empty</h2>
            <p className="mt-2 max-w-[380px] text-sm text-zinc-500 dark:text-zinc-400">
              Tap the heart on any listing to keep it here. We will show availability the moment you come back.
            </p>
            <Link to="/browse" className="btn btn-primary btn-md mt-6">Explore nearby items</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
              <ItemCard key={item.id} item={item} index={index} initiallyWishlisted />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
