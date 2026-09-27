import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Clock, Shield, Zap } from 'lucide-react';
import { useState } from 'react';
import { wishlistAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function ItemCard({ item, index = 0 }) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save items');
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(item.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(item.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist ❤️');
      }
    } catch (err) {
      if (err.response?.data?.message?.includes('Already')) {
        setIsWishlisted(true);
      }
    }
  };

  const getConditionColor = (cond) => {
    switch(cond) {
      case 'New': return 'bg-emerald-500';
      case 'Like New': return 'bg-cyan-500';
      case 'Good': return 'bg-amber-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link to={`/items/${item.id}`} className="block">
        <div className="relative overflow-hidden rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_24px_rgba(0,0,0,0.04)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-500">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {!imgLoaded && <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 animate-pulse" />}
            <img
              src={item.images?.[0]}
              alt={item.title}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase text-white shadow-lg ${getConditionColor(item.condition)}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {item.condition}
                </span>
                {item.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-900 text-white shadow-lg">
                    <Zap className="w-3 h-3" /> FEATURED
                  </span>
                )}
              </div>
              <button
                onClick={toggleWishlist}
                className={`w-9 h-9 rounded-full backdrop-blur-xl flex items-center justify-center transition-all shadow-lg border ${
                  isWishlisted 
                    ? 'bg-red-500 border-red-500 text-white scale-110' 
                    : 'bg-white/90 dark:bg-zinc-900/90 border-white/20 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 hover:scale-110'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Bottom quick info */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border shadow-lg flex items-center gap-1.5 ${
                item.availability === 'available' 
                  ? 'bg-emerald-500/90 border-emerald-400/50 text-white' 
                  : item.availability === 'borrowed'
                  ? 'bg-amber-500/90 border-amber-400/50 text-white'
                  : 'bg-zinc-900/80 border-white/10 text-white'
              }`}>
                <span className={`w-2 h-2 rounded-full ${item.availability === 'available' ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
                {item.availability.charAt(0).toUpperCase() + item.availability.slice(1)}
              </span>
              {item.lendingFee > 0 ? (
                <span className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 text-xs font-bold shadow-lg">
                  ${item.lendingFee}/day
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg">
                  FREE
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-display font-semibold text-[17px] leading-tight line-clamp-2 group-hover:text-violet-600 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 flex-shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold">{item.rating}</span>
              </div>
            </div>

            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
              {item.description}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium">
                {item.category}
              </span>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {item.borrowCount} borrows
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <img src={item.owner?.avatar} alt={item.owner?.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium leading-none">{item.owner?.name?.split(' ')[0]}</span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1 leading-none mt-0.5">
                    <Shield className="w-3 h-3" /> {item.owner?.rating} • Verified
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[110px]">{item.location?.split(' - ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Hover shimmer */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden rounded-[24px]">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
