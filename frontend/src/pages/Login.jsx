import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const fillDemo = (type) => {
    if (type === 'admin') { setEmail('admin@borrowbox.com'); setPassword('Admin@123'); }
    else { setEmail('demo@borrowbox.com'); setPassword('Demo@123'); }
  };

  return (
    <div className="min-h-[90vh] flex">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold">B</div>
            <span className="font-display font-bold text-lg">BorrowBox</span>
          </Link>

          <h1 className="font-display font-bold text-[32px] leading-none tracking-tight">Welcome back</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3">Sign in to your account to continue borrowing.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => fillDemo('user')} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Demo User</p>
              <p className="text-xs mt-1 text-zinc-600 dark:text-zinc-400">demo@borrowbox.com</p>
            </button>
            <button onClick={() => fillDemo('admin')} className="p-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-left hover:scale-[1.02] transition-transform">
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">Admin Access</p>
              <p className="text-xs mt-1 opacity-80">admin@borrowbox.com</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type={showPass?'text':'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            <button disabled={loading} className="w-full py-3.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">Don't have an account? <Link to="/register" className="font-semibold text-zinc-900 dark:text-white hover:underline">Create account</Link></p>

          <div className="mt-8 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/30">
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Quick Demo</p>
            <p className="text-xs text-violet-600/80 dark:text-violet-300/70 mt-1">Click demo cards above to autofill, or use: <br/> <span className="font-mono font-medium">demo@borrowbox.com / Demo@123</span></p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <div className="flex justify-between items-start"><span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium">Trusted by 2,400+ neighbors</span><div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">📦</div></div>
          <div>
            <h2 className="font-display font-bold text-[42px] leading-[0.9] tracking-tight">Borrowing<br/>made<br/>beautiful.</h2>
            <p className="mt-4 text-[16px] opacity-80 max-w-[360px]">Join the movement. Save money, reduce waste, build community — one borrow at a time.</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4"><p className="font-bold text-2xl">4.9</p><p className="text-xs opacity-70 mt-1">Avg rating</p></div>
              <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4"><p className="font-bold text-2xl">$47k</p><p className="text-xs opacity-70 mt-1">Saved</p></div>
              <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4"><p className="font-bold text-2xl">2.4k</p><p className="text-xs opacity-70 mt-1">Members</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
