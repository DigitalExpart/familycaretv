'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json().catch(() => null);
      
      if (res.ok && data?.success) {
        localStorage.setItem('adminToken', data.data.accessToken);
        
        // Check for redirect param
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/dashboard');
        }
      } else {
        setErrorMsg(data?.message || 'Invalid email or password.');
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Cannot connect to server. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-slate-50 to-slate-50 p-4 font-sans">
      
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 relative z-10 animate-in fade-in zoom-in duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-4 group hover:scale-105 transition-transform">
            <img src="/logo.png" alt="FamilyCare TV" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">FamilyCare <span className="text-indigo-500">CMS</span></h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage your family's content</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="admin@familycare.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <span className="animate-pulse">Signing in...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
      
    </div>
  );
}
