import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Eye, Star } from 'lucide-react';
import { itemsAPI } from '../lib/api';
import { toast } from 'sonner';

export default function MyItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);
  const fetchItems = async () => {
    try { const res = await itemsAPI.getMyItems(); setItems(res.data.data); } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await itemsAPI.delete(id); toast.success('Item deleted'); fetchItems(); } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="font-display font-bold text-[32px] leading-none">My Items</h1><p className="text-zinc-600 dark:text-zinc-400 mt-2">{items.length} items listed • {items.filter(i=>i.availability==='available').length} available</p></div>
          <Link to="/list-item" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold"><Plus className="w-4 h-4" /> List Item</Link>
        </div>

        {items.length===0 ? (
          <div className="text-center py-20 rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"><div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4"><Package className="w-8 h-8 text-zinc-400" /></div><h3 className="font-display font-semibold text-lg">No items yet</h3><p className="text-sm text-zinc-500 mt-1 max-w-[320px] mx-auto">List your first item and start earning reputation in your community.</p><Link to="/list-item" className="mt-6 inline-flex px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">List your first item</Link></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => (
              <div key={item.id} className="rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow">
                <div className="relative aspect-[4/3]"><img src={item.images[0]} alt="" className="w-full h-full object-cover" /><span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white ${item.availability==='available'?'bg-emerald-500':item.availability==='borrowed'?'bg-amber-500':'bg-zinc-900'}`}>{item.availability}</span><div className="absolute top-3 right-3 flex gap-2"><Link to={`/items/${item.id}`} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform"><Eye className="w-4 h-4" /></Link></div></div>
                <div className="p-5"><h3 className="font-semibold line-clamp-1">{item.title}</h3><p className="text-xs text-zinc-500 mt-1 flex items-center gap-2"><span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating}</span>• {item.borrowCount} borrows • ${item.value} value</p><div className="flex gap-2 mt-4"><Link to={`/items/${item.id}/edit`} className="flex-1 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium flex items-center justify-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><Edit className="w-3 h-3" /> Edit</Link><button onClick={() => handleDelete(item.id)} className="px-4 py-2 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"><Trash2 className="w-3 h-3" /></button></div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
