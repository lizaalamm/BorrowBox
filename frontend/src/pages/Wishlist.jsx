import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { wishlistAPI } from '../lib/api';
import ItemCard from '../components/ItemCard';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistAPI.getAll().then(res => setItems(res.data.data.map(w => w.item).filter(Boolean))).catch(()=>{}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display font-bold text-[32px] leading-none flex items-center gap-3"><Heart className="w-8 h-8 fill-red-500 text-red-500" /> Wishlist</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">{items.length} saved items</p>

        {items.length===0 ? (
          <div className="text-center py-20 rounded-[24px] bg-white dark:bg-zinc-900 border mt-8"><div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4"><Heart className="w-8 h-8 text-zinc-400" /></div><h3 className="font-display font-semibold text-lg">Your wishlist is empty</h3><p className="text-sm text-zinc-500 mt-1">Save items you love to borrow later.</p><Link to="/browse" className="mt-6 inline-flex px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">Explore items</Link></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">{items.map((item,i) => <ItemCard key={item.id} item={item} index={i} />)}</div>
        )}
      </div>
    </div>
  );
}
