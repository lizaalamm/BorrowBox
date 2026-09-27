import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Check, X, Package, ArrowRight, Calendar } from 'lucide-react';
import { borrowAPI } from '../lib/api';
import { toast } from 'sonner';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, [filter, type]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (type !== 'all') params.type = type;
      if (filter !== 'all') params.status = filter;
      const res = await borrowAPI.getAll(params);
      setRequests(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const updateStatus = async (id, status, msg) => {
    try {
      await borrowAPI.updateStatus(id, { status, ownerMessage: msg });
      toast.success(`Request ${status} 🎉`);
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const statusColor = (s) => {
    switch(s){ case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'; case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200'; case 'borrowed': return 'bg-violet-100 text-violet-700 border-violet-200'; case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'; case 'rejected': case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'; default: return 'bg-zinc-100 text-zinc-700 border-zinc-200'; }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/30">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display font-bold text-[32px] leading-none">Borrow Requests</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">Manage your borrowing and lending activity</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <div className="flex gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
            {[{v:'all',l:'All'},{v:'borrowed',l:'My Borrows'},{v:'lent',l:'My Lends'}].map(o => <button key={o.v} onClick={() => setType(o.v)} className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${type===o.v?'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm':'hover:bg-white dark:hover:bg-zinc-700'}`}>{o.l}</button>)}
          </div>
          <div className="flex gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
            {['all','pending','approved','borrowed','completed'].map(s => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded-full text-xs font-medium capitalize transition-colors ${filter===s?'bg-white dark:bg-zinc-700 shadow-sm':'hover:bg-white dark:hover:bg-zinc-700'}`}>{s}</button>)}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-[20px] bg-white dark:bg-zinc-900 border animate-pulse" />)}</div> : requests.length===0 ? (
            <div className="text-center py-20 rounded-[24px] bg-white dark:bg-zinc-900 border"><Package className="w-12 h-12 mx-auto text-zinc-300 mb-3" /><h3 className="font-semibold">No requests found</h3><p className="text-sm text-zinc-500 mt-1">When you borrow or lend items, they'll appear here.</p><Link to="/browse" className="mt-4 inline-flex px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium">Browse items</Link></div>
          ) : requests.map(req => (
            <div key={req.id} className="rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow">
              <div className="flex gap-4">
                <img src={req.item?.images?.[0]} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div><Link to={`/items/${req.itemId}`} className="font-semibold hover:text-violet-600 transition-colors line-clamp-1">{req.item?.title}</Link><p className="text-xs text-zinc-500 mt-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> {req.startDate} → {req.endDate} • ${req.totalFee || 0} fee</p><p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">"{req.message || 'No message'}"</p></div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${statusColor(req.status)}`}>{req.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <img src={req.borrower?.avatar} alt="" className="w-6 h-6 rounded-full" /><span className="text-xs">{req.borrower?.name} → {req.owner?.name}</span>
                    <span className="text-xs text-zinc-400">• {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {req.status==='pending' && (
                      <>
                        <button onClick={() => updateStatus(req.id, 'approved')} className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"><Check className="w-3 h-3" /> Approve</button>
                        <button onClick={() => updateStatus(req.id, 'rejected')} className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1"><X className="w-3 h-3" /> Decline</button>
                      </>
                    )}
                    {req.status==='approved' && <button onClick={() => updateStatus(req.id, 'borrowed')} className="px-4 py-2 rounded-full bg-violet-600 text-white text-xs font-semibold flex items-center gap-1"><Package className="w-3 h-3" /> Mark as Borrowed</button>}
                    {req.status==='borrowed' && <button onClick={() => updateStatus(req.id, 'returned')} className="px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-semibold">Mark as Returned</button>}
                    {req.status==='returned' && <button onClick={() => updateStatus(req.id, 'completed')} className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold">Complete Transaction</button>}
                    <Link to={`/items/${req.itemId}`} className="px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-medium flex items-center gap-1">View item <ArrowRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
