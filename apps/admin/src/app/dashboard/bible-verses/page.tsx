'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Calendar } from 'lucide-react';

export default function BibleVersesPage() {
  const [verses, setVerses] = useState<any[]>([]);
  const [verse, setVerse] = useState('');
  const [reference, setReference] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVerses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/bible-verses`);
      if (res.ok) {
        const data = await res.json();
        setVerses(data);
      }
    } catch(e) { console.error('Failed to fetch'); }
  };

  useEffect(() => { fetchVerses(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/bible-verses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        verse,
        reference,
        scheduledDate: new Date(scheduledDate).toISOString()
      })
    });
    await fetchVerses();
    setVerse(''); setReference(''); setScheduledDate('');
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}`}/bible-verses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchVerses();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Bible Verses</h1>
          <p className="text-slate-500 mt-1">Schedule daily verses for your patients.</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Form Card */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-amber-500" />
              Add New Verse
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Verse Text</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none resize-none h-24" 
                  placeholder="For God so loved the world..." 
                  value={verse} 
                  onChange={e => setVerse(e.target.value)} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Reference</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none" 
                  placeholder="e.g. John 3:16" 
                  value={reference} 
                  onChange={e => setReference(e.target.value)} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Scheduled Date</label>
                <div className="relative">
                  <input 
                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none" 
                    type="datetime-local" 
                    value={scheduledDate} 
                    onChange={e => setScheduledDate(e.target.value)} 
                    required 
                  />
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>
              
              <button 
                disabled={isSubmitting}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Save Verse
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          {verses.length === 0 ? (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 border-dashed p-12 flex flex-col items-center justify-center text-center">
               <div className="bg-slate-50 p-4 rounded-full mb-4">
                 <BookOpen className="w-8 h-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-800">No verses found</h3>
               <p className="text-slate-500 mt-1 max-w-sm">Add your first daily bible verse using the form to get started.</p>
             </div>
          ) : (
            verses.map(v => (
              <div key={v.id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-amber-500/10 border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:-translate-y-1 transition-all duration-300">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lg text-slate-800 leading-relaxed italic border-l-4 border-amber-200 pl-4 mb-2">"{v.verse}"</p>
                  <div className="flex items-center gap-3 pl-4">
                    <span className="font-bold text-amber-600 text-sm">{v.reference}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(v.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end pl-4 sm:pl-0">
                  <button 
                    onClick={() => handleDelete(v.id)} 
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Delete verse"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
