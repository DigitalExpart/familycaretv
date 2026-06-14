'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('adminToken')) {
      router.push('/login');
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8">FamilyCare CMS</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link>
          <Link href="/dashboard/bible-verses" className="hover:text-blue-400">Bible Verses</Link>
          <Link href="/dashboard/drawings" className="hover:text-blue-400">Drawings</Link>
          <Link href="/dashboard/audio" className="hover:text-blue-400">Audio</Link>
        </nav>
        <div className="mt-auto">
          <button 
            onClick={() => { localStorage.removeItem('adminToken'); router.push('/login'); }}
            className="text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
