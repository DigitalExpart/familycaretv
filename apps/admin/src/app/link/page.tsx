'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, AlertCircle, CheckCircle2, Tv } from 'lucide-react';

export default function LinkDevice() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login?redirect=/link');
    }
  }, [router]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setStatus('loading');
    setMessage('');
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/roku/link-device`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: code.toUpperCase() })
      });
      
      const data = await res.json().catch(() => null);
      
      if (res.ok) {
        setStatus('success');
        setMessage('Your Roku TV has been successfully linked!');
      } else {
        setStatus('error');
        setMessage(data?.message || 'Invalid or expired code. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Cannot connect to server. Ensure backend is running.');
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
          <div className="bg-indigo-50 p-4 rounded-2xl shadow-sm border border-indigo-100 mb-4 group hover:scale-105 transition-transform">
            <Tv className="w-10 h-10 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Link Your <span className="text-indigo-500">Roku TV</span></h1>
          <p className="text-slate-500 text-sm mt-2 text-center">Enter the code displayed on your TV screen to connect it to your account.</p>
        </div>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 font-medium">{message}</p>
          </div>
        )}

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-center text-slate-700 font-medium">{message}</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all duration-300"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleLink} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Pairing Code</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. ABCDEFGH" 
                  value={code} 
                  onChange={e => setCode(e.target.value)}
                  maxLength={8}
                  required
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold py-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-base placeholder:text-slate-400"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={status === 'loading' || !code.trim()}
              className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
            >
              {status === 'loading' ? (
                <span className="animate-pulse">Linking device...</span>
              ) : (
                <>
                  <Link2 className="w-5 h-5" />
                  Link TV
                </>
              )}
            </button>
          </form>
        )}
      </div>
      
    </div>
  );
}
