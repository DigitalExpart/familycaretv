import Link from 'next/link';
import { BookOpen, PenTool, Music, Activity } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { title: 'Bible Verses', value: 'Manage', icon: BookOpen, href: '/dashboard/bible-verses', color: 'bg-amber-100 text-amber-600', hover: 'hover:border-amber-200 hover:shadow-amber-500/10' },
    { title: 'Drawings', value: 'Manage', icon: PenTool, href: '/dashboard/drawings', color: 'bg-pink-100 text-pink-600', hover: 'hover:border-pink-200 hover:shadow-pink-500/10' },
    { title: 'Audio Tracks', value: 'Manage', icon: Music, href: '/dashboard/audio', color: 'bg-indigo-100 text-indigo-600', hover: 'hover:border-indigo-200 hover:shadow-indigo-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Welcome to FamilyCare TV
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Your command center for managing the content that brings peace and comfort to your family's space. Select a category below to get started.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute right-1/4 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2"></div>
      </div>

      {/* Quick Stats / Navigation Cards */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Content Modules
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl ${stat.hover}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-1">
                      {stat.value} &rarr;
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{stat.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">Update {stat.title.toLowerCase()} content.</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
