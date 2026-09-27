import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Upload, X, Sparkles } from 'lucide-react';
import { itemsAPI, categoriesAPI } from '../lib/api';
import { toast } from 'sonner';

export default function ListItem() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'Tools', categoryId: '', condition: 'Good', value: '', lendingFee: 0, location: '', tags: '', images: [''] });
  const [loading, setLoading] = useState(false);

  useEffect(() => { categoriesAPI.getAll().then(res => { setCategories(res.data.data); if(res.data.data[0]) setForm(f => ({ ...f, category: res.data.data[0].name, categoryId: res.data.data[0].id })); }).catch(()=>{}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, value: parseFloat(form.value), lendingFee: parseFloat(form.lendingFee), tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean), images: form.images.filter(Boolean) };
      const res = await itemsAPI.create(payload);
      toast.success('Item listed! 🎉');
      navigate(`/items/${res.data.data.id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to list item'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/30">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8"><h1 className="font-display font-bold text-[32px] leading-none">List an item</h1><p className="text-zinc-600 dark:text-zinc-400 mt-2">Share what you own, earn reputation, help neighbors.</p></div>

        <form onSubmit={handleSubmit} className="rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
          <div><label className="text-sm font-medium">Item title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. DeWalt Cordless Drill Kit" className="mt-1.5 w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-sm" /></div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Category *</label><select value={form.categoryId} onChange={e => { const cat = categories.find(c=>c.id===e.target.value); setForm({...form, categoryId: e.target.value, category: cat?.name || ''}); }} className="mt-1.5 w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm"><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
            <div><label className="text-sm font-medium">Condition *</label><select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className="mt-1.5 w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm"><option>New</option><option>Like New</option><option>Good</option><option>Fair</option></select></div>
          </div>

          <div><label className="text-sm font-medium">Description *</label><textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe your item, its condition, what's included, pickup instructions..." rows={4} className="mt-1.5 w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-sm resize-none" /></div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Value ($) *</label><input type="number" required value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="199" className="mt-1.5 w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm" /></div>
            <div><label className="text-sm font-medium">Fee per day ($)</label><input type="number" value={form.lendingFee} onChange={e => setForm({...form, lendingFee: e.target.value})} placeholder="0 = free" className="mt-1.5 w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm" /><p className="text-[11px] text-zinc-500 mt-1">0 for community sharing</p></div>
            <div><label className="text-sm font-medium">Location *</label><input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Mission, SF" className="mt-1.5 w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm" /></div>
          </div>

          <div><label className="text-sm font-medium">Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="power-tools, diy, dewalt" className="mt-1.5 w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm" /></div>

          <div>
            <label className="text-sm font-medium">Images (URLs)</label>
            {form.images.map((img,i) => (
              <div key={i} className="flex gap-2 mt-1.5"><input value={img} onChange={e => { const arr=[...form.images]; arr[i]=e.target.value; setForm({...form, images: arr}); }} placeholder="https://images.unsplash.com/..." className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm" />{form.images.length>1 && <button type="button" onClick={() => setForm({...form, images: form.images.filter((_,idx)=>idx!==i)})} className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"><X className="w-4 h-4" /></button>}</div>
            ))}
            <button type="button" onClick={() => setForm({...form, images: [...form.images, '']})} className="mt-2 text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"><Upload className="w-3 h-3" /> Add another image</button>
            <p className="text-[11px] text-zinc-500 mt-2">Use Unsplash URLs for best results. First image is cover.</p>
          </div>

          <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/30 p-4 flex gap-3"><div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white flex-shrink-0"><Sparkles className="w-4 h-4" /></div><div><p className="text-sm font-semibold text-violet-900 dark:text-violet-100">Pro tip: Great listings get borrowed 3x faster</p><p className="text-xs text-violet-700/70 dark:text-violet-300/70 mt-1">Add clear photos, detailed description, and set fair expectations. Verified photos increase trust by 40%.</p></div></div>

          <button disabled={loading} className="w-full py-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2 disabled:opacity-60">{loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Package className="w-5 h-5" /> List Item • Free</>}</button>
        </form>
      </div>
    </div>
  );
}
