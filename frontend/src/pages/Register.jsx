import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, MapPin, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '', bio: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to BorrowBox 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[90vh] flex">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[440px]">
          <Link to="/" className="inline-flex items-center gap-2 mb-8"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold">B</div><span className="font-display font-bold text-lg">BorrowBox</span></Link>

          <h1 className="font-display font-bold text-[32px] leading-none tracking-tight">Create account</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3">Join 2,400+ neighbors sharing what they own.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <div className="relative mt-1.5"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm" /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative mt-1.5"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative mt-1.5"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><input type={showPass?'text':'password'} required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <div className="relative mt-1.5"><MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="SF, CA" className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm" /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Bio (optional)</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="DIY enthusiast, loves sharing tools..." rows={2} className="mt-1.5 w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm resize-none" />
            </div>

            <button disabled={loading} className="w-full py-3.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">Already have an account? <Link to="/login" className="font-semibold text-zinc-900 dark:text-white hover:underline">Sign in</Link></p>
          <p className="text-center text-[11px] text-zinc-500 mt-4">By creating an account, you agree to our Terms & Privacy Policy. Verified users get a badge.</p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative p-12 text-white w-full flex flex-col justify-between">
          <div><span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium">✨ Free forever for personal use</span></div>
          <div>
            <h2 className="font-display font-bold text-[40px] leading-[0.9] tracking-tight">Turn your<br/>garage into<br/>a community<br/>library.</h2>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">✓</div><span>List items in 30 seconds</span></div>
              <div className="flex items-center gap-3 text-sm"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">✓</div><span>Verified neighbors only</span></div>
              <div className="flex items-center gap-3 text-sm"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">✓</div><span>Earn reputation & optional fees</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
