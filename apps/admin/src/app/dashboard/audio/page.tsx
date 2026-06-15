'use client';
import { useState, useEffect } from 'react';
import { Music, Plus, Trash2, Headphones, PlayCircle } from 'lucide-react';

export default function AudioPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [type, setType] = useState('MUSIC');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTracks = async () => {
    try {
      const res = await fetch('http://localhost:3000/audio');
      if(res.ok) {
        const data = await res.json();
        setTracks(data);
      }
    } catch(e) { console.error('Failed to fetch'); }
  };

  useEffect(() => { fetchTracks(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMethod === 'file' && !file) {
      alert('Please select an audio file to upload');
      return;
    }
    if (uploadMethod === 'url' && !audioUrl) {
      alert('Please enter an audio URL');
      return;
    }
    
    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      if (uploadMethod === 'file') {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        formData.append('file', file as File);

        await fetch('http://localhost:3000/audio', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        await fetch('http://localhost:3000/audio', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, type, audioUrl })
        });
      }

      await fetchTracks();
      setTitle(''); 
      setFile(null);
      setAudioUrl('');
      // Reset file input value
      const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    await fetch(`http://localhost:3000/audio/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchTracks();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
          <Headphones className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Audio Library</h1>
          <p className="text-slate-500 mt-1">Manage music tracks and voice messages.</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Form Card */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-indigo-500" />
              Add New Track
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Track Title</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  placeholder="e.g. Relaxing Piano" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Upload Method</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${uploadMethod === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    File Upload
                  </button>
                  <button 
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${uploadMethod === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    External URL
                  </button>
                </div>
              </div>
              
              {uploadMethod === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Upload Audio File</label>
                  <input 
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all outline-none" 
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                    required 
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Audio URL (.mp3)</label>
                  <input 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                    placeholder="https://example.com/track.mp3" 
                    value={audioUrl} 
                    onChange={e => setAudioUrl(e.target.value)} 
                    required 
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Track Type</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none" 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                >
                  <option value="MUSIC">Music</option>
                  <option value="MESSAGE">Voice Message</option>
                </select>
              </div>
              
              <button 
                disabled={isSubmitting}
                className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Save Track
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          {tracks.length === 0 ? (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 border-dashed p-12 flex flex-col items-center justify-center text-center">
               <div className="bg-slate-50 p-4 rounded-full mb-4">
                 <Music className="w-8 h-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-800">No tracks found</h3>
               <p className="text-slate-500 mt-1 max-w-sm">Add your first audio track using the form to get started.</p>
             </div>
          ) : (
            tracks.map(t => (
              <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-slate-800 truncate text-lg">{t.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        t.type === 'MUSIC' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t.type}
                      </span>
                    </div>
                    <a href={t.audioUrl} target="_blank" rel="noreferrer" className="text-slate-400 text-sm hover:text-indigo-500 transition-colors truncate block">
                      {t.audioUrl}
                    </a>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(t.id)} 
                  className="shrink-0 ml-4 p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Delete track"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
