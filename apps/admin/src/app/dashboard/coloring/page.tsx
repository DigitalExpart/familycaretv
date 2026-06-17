'use client';
import { useState, useEffect } from 'react';
import { Palette, Plus, Trash2 } from 'lucide-react';
import { api } from '../../../lib/api';

export default function ColoringAdminPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/coloring-pages');
      setPages(res.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Coloring Pages</h1>
          <p className="text-slate-500 mt-1">Manage Roku TV coloring pages.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Page
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <Palette className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No Coloring Pages</h3>
          <p className="text-slate-500 mt-2">Upload coloring pages for users to enjoy on Roku.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover rounded-xl mb-4 bg-slate-100" />
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-900">{p.title}</span>
                <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
