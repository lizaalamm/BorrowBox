import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Package, Shield, Calendar, Award } from 'lucide-react';
import { usersAPI, itemsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = id || currentUser?.id;

  useEffect(() => {
    if (!userId) return;
    usersAPI.getById(userId).then(res => { setProfile(res.data.data); setItems(res.data.data.items || []); }).catch(()=>{}).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-[28px] overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <div className="h-32 sm:h-48 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 relative"><div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" /></div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <img src={profile.avatar} alt="" className="w-24 h-24 rounded-[20px] object-cover ring-4 ring-white dark:ring-zinc-900 -mt-16 sm:-mt-20 shadow-xl" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3"><h1 className="font-display font-bold text-[28px] leading-none">{profile.name}</h1>{profile.verified && <span className="px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center gap-1"><Shield className="w-3 h-3" /> VERIFIED</span>}<span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium capitalize">{profile.role}</span></div>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2 max-w-[600px]">{profile.bio || 'No bio yet'}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-500">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location || 'No location'}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {profile.rating} rating</span>
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {profile.totalLends} lends • {profile.totalBorrows} borrows</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {new Date(profile.joinedAt || profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 self-start"><div className="px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 flex items-center gap-2 text-sm font-medium"><Award className="w-4 h-4 text-amber-600" /> Level 3 Explorer</div></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 p-4 rounded-[16px] bg-zinc-50 dark:bg-zinc-800/50">
              <div className="text-center"><p className="font-display font-bold text-xl">{items.length}</p><p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Items listed</p></div>
              <div className="text-center border-x border-zinc-200 dark:border-zinc-700"><p className="font-display font-bold text-xl">{profile.totalLends}</p><p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Times lent</p></div>
              <div className="text-center"><p className="font-display font-bold text-xl">{profile.rating}★</p><p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Avg rating</p></div>
            </div>
          </div>
        </div>

        <div className="mt-8"><h2 className="font-display font-bold text-xl mb-4">Items by {profile.name.split(' ')[0]} ({items.length})</h2>{items.length===0 ? <div className="text-center py-12 rounded-[20px] bg-white dark:bg-zinc-900 border"><p className="text-zinc-500">No items listed yet</p></div> : <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{items.map((item,i) => <ItemCard key={item.id} item={item} index={i} />)}</div>}</div>

        {profile.reviews?.length>0 && <div className="mt-8 rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6"><h3 className="font-display font-semibold">Reviews</h3><div className="mt-4 space-y-4">{profile.reviews.map(r => <div key={r.id} className="flex gap-3"><div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">{r.rating}★</div><div><p className="text-sm">{r.comment}</p><p className="text-xs text-zinc-500 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p></div></div>)}</div></div>}
      </div>
    </div>
  );
}
