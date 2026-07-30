import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  ShieldCheck,
  Film
} from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        setSuccessMsg('Successfully logged in!');
      } else {
        await register(email, password);
        setSuccessMsg('Account successfully registered! Welcome to DataBoard.');
      }
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 overflow-hidden bg-black text-white">
      
      {/* 1. Full-screen Video Background (Data Science Control Room Video) */}
      <video
        src="/video/login_bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* 2. Backdrop Overlay */}
      <div className="fixed inset-0 bg-black/55 backdrop-blur-md z-[1] pointer-events-none" />

      {/* 3. Auth Form Card (z-10) */}
      <div className="max-w-md w-full glass-panel p-8 shadow-2xl relative z-10 border border-white/20 my-8">
        
        {/* Decorative Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Video Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-300 bg-white/10 px-3 py-1 rounded-full border border-white/15 w-fit mx-auto mb-4">
          <Film className="w-3 h-3 text-amber-400" />
          <span>Data Science Control Room</span>
        </div>

        {/* Branding Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-sky-400 p-0.5 shadow-xl shadow-brand-500/30 mx-auto mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Welcome to Data<span className="text-brand-400">Board</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {isLogin ? 'Sign in to access your dataset analytics dashboard' : 'Create an account to start uploading & analyzing datasets'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex p-1 bg-slate-950/80 rounded-xl border border-white/15 mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isLogin ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isLogin ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-fade-in font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input Container - Flex layout with icon first, zero text overlap */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/15 bg-slate-950/80 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 shrink-0 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm font-medium p-0 focus:ring-0"
                required
              />
            </div>
          </div>

          {/* Password Input Container - Flex layout with icon first, zero text overlap */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/15 bg-slate-950/80 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm font-medium p-0 focus:ring-0"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 text-sm mt-3 justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>{isLogin ? 'Signing In...' : 'Registering Account...'}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign In to DataBoard' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-white/15 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>JWT Secure Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Apache ECharts</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
