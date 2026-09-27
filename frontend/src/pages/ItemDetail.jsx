import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Shield, Clock, Package, MessageCircle, Calendar, DollarSign, CheckCircle, ArrowLeft, Share2, Flag, User } from 'lucide-react';
import { itemsAPI, borrowAPI, wishlistAPI, reviewsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showBorrow, setShowBorrow] = useState(false);
  const [borrowForm, setBorrowForm] = useState({ startDate: '', endDate: '', message: '' });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await itemsAPI.getById(id);
      setItem(res.data.data);
      setReviews(res.data.data.reviews || []);
      if (user) {
        try { const w = await wishlistAPI.check(id); setIsWishlisted(w.data.data.inWishlist); } catch {}
      }
    } catch { toast.error('Item not found'); navigate('/browse'); } finally { setLoading(false); }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to borrow'); navigate('/login'); return; }
    if (!borrowForm.startDate || !borrowForm.endDate) { toast.error('Select dates'); return; }
    try {
      await borrowAPI.create({ itemId: id, ...borrowForm });
      toast.success('Borrow request sent! 🎉 Owner will respond soon.');
      setShowBorrow(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send request'); }
  };

  const toggleWishlist = async () => {
    if (!user) { toast.error('Sign in to save'); return; }
    try {
      if (isWishlisted) { await wishlistAPI.remove(id); setIsWishlisted(false); toast.success('Removed from wishlist'); }
      else { await wishlistAPI.add(id); setIsWishlisted(true); toast.success('Added to wishlist ❤️'); }
    } catch {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!item) return null;

  const isOwner = user?.id === item.ownerId;
  const days = borrowForm.startDate && borrowForm.endDate ? Math.max(1, Math.ceil((new Date(borrowForm.endDate) - new Date(borrowForm.startDate)) / (1000*60*60*24))) : 1;
  const totalFee = (item.lendingFee || 0) * days;

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/browse" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6"><ArrowLeft className="w-4 h-4" /> Back to browse</Link>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative rounded-[28px] overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 aspect-[4/3]">
              <img src={item.images[activeImg]} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${item.condition==='New'?'bg-emerald-500':item.condition==='Like New'?'bg-cyan-500':'bg-amber-500'}`}>{item.condition}</span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl border shadow-lg ${item.availability==='available'?'bg-emerald-500/90 border-emerald-400 text-white':'bg-zinc-900/80 border-white/10 text-white'}`}>{item.availability}</span>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={toggleWishlist} className={`w-10 h-10 rounded-full backdrop-blur-xl border shadow-lg flex items-center justify-center ${isWishlisted?'bg-red-500 border-red-500 text-white':'bg-white/90 dark:bg-zinc-900/90 border-white/20'}`}><Heart className={`w-5 h-5 ${isWishlisted?'fill-white':''}`} /></button>
                <button className="w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>
            {item.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.images.map((img,i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImg===i?'border-violet-600 ring-2 ring-violet-600/20':'border-transparent hover:border-zinc-200'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
                ))}
              </div>
            )}

            {/* Owner card - mobile */}
            <div className="lg:hidden rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 flex items-center gap-4">
              <img src={item.owner?.avatar} alt="" className="w-12 h-12 rounded-full" />
              <div className="flex-1"><p className="font-semibold">{item.owner?.name}</p><p className="text-xs text-zinc-500 flex items-center gap-1"><Shield className="w-3 h-3" /> {item.owner?.rating} • {item.owner?.totalLends} lends • Verified</p></div>
              <Link to={`/users/${item.ownerId}`} className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">View</Link>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2"><span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">{item.category}</span><span className="flex items-center gap-1 text-xs text-zinc-500"><Clock className="w-3 h-3" /> {item.borrowCount} borrows</span></div>
                  <h1 className="font-display font-bold text-[28px] sm:text-[36px] leading-[0.95] tracking-tight">{item.title}</h1>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50"><Star className="w-4 h-4 fill-amber-500 text-amber-500" /><span className="text-sm font-bold">{item.rating}</span><span className="text-xs text-zinc-500">({item.reviewCount})</span></div>
                    <span className="text-sm text-zinc-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> {item.location}</span>
                  </div>
                </div>
                <div className="text-right"><p className="text-xs uppercase tracking-wide font-semibold text-zinc-500">Value</p><p className="font-display font-bold text-2xl">${item.value}</p><p className={`text-xs font-bold px-2.5 py-1 rounded-full mt-1 inline-block ${item.lendingFee===0?'bg-gradient-to-r from-violet-600 to-indigo-600 text-white':'bg-zinc-100 dark:bg-zinc-800'}`}>{item.lendingFee===0?'FREE to borrow':`$${item.lendingFee}/day`}</p></div>
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">{item.description}</p>

              {item.tags?.length>0 && <div className="flex flex-wrap gap-2 mt-4">{item.tags.map(t => <span key={t} className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">#{t}</span>)}</div>}
            </div>

            {/* Borrow card */}
            <div className="rounded-[24px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-600/20 to-cyan-500/20 rounded-full blur-[40px]" />
              <div className="relative">
                {isOwner ? (
                  <div className="text-center py-4"><Package className="w-10 h-10 mx-auto mb-3 opacity-60" /><p className="font-semibold">This is your listing</p><p className="text-sm opacity-70 mt-1">You have {item.borrowCount} total borrows • {item.rating}★ rating</p><Link to="/my-items" className="mt-4 inline-flex px-5 py-2.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm font-semibold">Manage listing</Link></div>
                ) : item.availability!=='available' ? (
                  <div className="text-center py-4"><div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3"><Clock className="w-6 h-6" /></div><p className="font-semibold">Currently {item.availability}</p><p className="text-sm opacity-70 mt-1">This item is not available right now. Save it to get notified.</p><button onClick={toggleWishlist} className="mt-4 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm font-semibold">Notify when available</button></div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold text-xl">Borrow this item</h3><span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold"><CheckCircle className="w-3 h-3" /> Available now</span></div>
                    
                    {!showBorrow ? (
                      <>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="rounded-2xl bg-white/5 dark:bg-zinc-900/5 backdrop-blur border border-white/10 p-3"><p className="text-[11px] uppercase tracking-wide opacity-60">Response</p><p className="font-bold mt-1">~2 hours</p></div>
                          <div className="rounded-2xl bg-white/5 dark:bg-zinc-900/5 backdrop-blur border border-white/10 p-3"><p className="text-[11px] uppercase tracking-wide opacity-60">Pickup</p><p className="font-bold mt-1">Flexible</p></div>
                          <div className="rounded-2xl bg-white/5 dark:bg-zinc-900/5 backdrop-blur border border-white/10 p-3"><p className="text-[11px] uppercase tracking-wide opacity-60">Deposit</p><p className="font-bold mt-1">None</p></div>
                        </div>
                        <button onClick={() => setShowBorrow(true)} className="w-full py-4 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-[15px] hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2"><Calendar className="w-5 h-5" /> Request to Borrow</button>
                        <p className="text-center text-xs opacity-60 mt-3">Free • No commitment • Owner approves in ~2h</p>
                      </>
                    ) : (
                      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleBorrow} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-xs font-medium opacity-70">Start date</label><input type="date" required value={borrowForm.startDate} onChange={e => setBorrowForm({...borrowForm, startDate: e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-zinc-900/10 backdrop-blur border border-white/20 dark:border-zinc-900/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" min={new Date().toISOString().split('T')[0]} /></div>
                          <div><label className="text-xs font-medium opacity-70">End date</label><input type="date" required value={borrowForm.endDate} onChange={e => setBorrowForm({...borrowForm, endDate: e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-zinc-900/10 backdrop-blur border border-white/20 dark:border-zinc-900/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" min={borrowForm.startDate || new Date().toISOString().split('T')[0]} /></div>
                        </div>
                        <div><label className="text-xs font-medium opacity-70">Message to owner (optional)</label><textarea value={borrowForm.message} onChange={e => setBorrowForm({...borrowForm, message: e.target.value})} placeholder="Hi! I need this for..." rows={3} className="mt-1 w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-zinc-900/10 backdrop-blur border border-white/20 dark:border-zinc-900/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white/20" /></div>
                        {item.lendingFee>0 && <div className="rounded-xl bg-white/5 dark:bg-zinc-900/5 border border-white/10 p-3 flex items-center justify-between text-sm"><span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> {days} day{days>1?'s':''} × ${item.lendingFee}</span><span className="font-bold">${totalFee}</span></div>}
                        <div className="flex gap-3"><button type="button" onClick={() => setShowBorrow(false)} className="flex-1 py-3 rounded-full bg-white/10 dark:bg-zinc-900/10 border border-white/20 text-sm font-medium">Cancel</button><button type="submit" className="flex-1 py-3 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm font-semibold">Send Request</button></div>
                      </motion.form>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Owner desktop */}
            <div className="hidden lg:block rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
              <div className="flex items-center gap-4">
                <img src={item.owner?.avatar} alt="" className="w-14 h-14 rounded-full" />
                <div className="flex-1"><p className="font-semibold flex items-center gap-2">{item.owner?.name} <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[11px] font-bold">VERIFIED</span></p><p className="text-sm text-zinc-500 mt-0.5">{item.owner?.bio?.slice(0,60)}</p><div className="flex items-center gap-3 mt-2 text-xs"><span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {item.owner?.rating} rating</span><span>•</span><span>{item.owner?.totalLends} items lent</span><span>•</span><span>{item.owner?.location}</span></div></div>
                <Link to={`/users/${item.ownerId}`} className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><User className="w-5 h-5" /></Link>
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2"><Star className="w-5 h-5 fill-amber-400 text-amber-400" /> Reviews ({reviews.length})</h3>
              {reviews.length===0 ? <p className="text-sm text-zinc-500 mt-4">No reviews yet. Be the first to review after borrowing!</p> : <div className="mt-4 space-y-4">{reviews.map(r => <div key={r.id} className="flex gap-3"><img src={r.reviewer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reviewerId}`} alt="" className="w-9 h-9 rounded-full flex-shrink-0" /><div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium text-sm">{r.reviewer?.name || 'Anonymous'}</span><span className="flex">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i<=r.rating?'fill-amber-400 text-amber-400':'text-zinc-200'}`} />)}</span><span className="text-xs text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</span></div><p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{r.comment}</p></div></div>)}</div>}
            </div>
          </div>
        </div>

        {/* Related */}
        {item.relatedItems?.length>0 && (
          <div className="mt-16"><h2 className="font-display font-bold text-2xl mb-6">You might also like</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{item.relatedItems.map((ri,i) => <Link key={ri.id} to={`/items/${ri.id}`} className="group rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all"><img src={ri.images[0]} alt="" className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500" /><div className="p-4"><p className="font-medium text-sm line-clamp-1">{ri.title}</p><p className="text-xs text-zinc-500 mt-1">{ri.category} • ${ri.lendingFee===0?'FREE':`$${ri.lendingFee}/day`}</p></div></Link>)}</div></div>
        )}
      </div>
    </div>
  );
}
