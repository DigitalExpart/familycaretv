'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, BookOpen, PenTool, Music, LogOut, Users, CheckSquare, Baby, Dog, Palette } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('adminToken')) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users Activity', href: '/dashboard/users', icon: Users },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Kids', href: '/dashboard/kids', icon: Baby },
    { name: 'Pets', href: '/dashboard/pets', icon: Dog },
    { name: 'Bible Verses', href: '/dashboard/bible-verses', icon: BookOpen },
    { name: 'Drawings', href: '/dashboard/drawings', icon: PenTool },
    { name: 'Audio & Music', href: '/dashboard/audio', icon: Music },
    { name: 'Coloring', href: '/dashboard/coloring', icon: Palette },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl relative z-10">
        <div className="flex items-center gap-3 p-6 mb-4 border-b border-slate-800">
          <div className="bg-white p-1.5 rounded-lg">
            <img src="/logo.png" alt="FamilyCare TV" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">FamilyCare <span className="text-indigo-400">CMS</span></h2>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => { localStorage.removeItem('adminToken'); router.push('/login'); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-slate-50 to-slate-50">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
