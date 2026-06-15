'use client';
import { useState, useEffect } from 'react';
import { PenTool, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

export default function DrawingsPage() {
  const [drawings, setDrawings] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDrawings = async () => {
    try {
      const res = await fetch('http://localhost:3000/drawings');
      if (res.ok) {
        const data = await res.json();
        setDrawings(data);
      }
    } catch(e) { console.error('Failed to fetch'); }
  };

  useEffect(() => { fetchDrawings(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMethod === 'file' && !file) {
      alert('Please select an image file to upload');
      return;
    }
    if (uploadMethod === 'url' && !imageUrl) {
      alert('Please enter an image URL');
      return;
    }
    
    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      if (uploadMethod === 'file') {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file as File);

        await fetch('http://localhost:3000/drawings', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        await fetch('http://localhost:3000/drawings', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, imageUrl })
        });
      }

      await fetchDrawings();
      setTitle(''); 
      setFile(null);
      setImageUrl('');
      const fileInput = document.getElementById('drawing-upload') as HTMLInputElement;
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
    await fetch(`http://localhost:3000/drawings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchDrawings();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-pink-100 rounded-2xl text-pink-600">
          <PenTool className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kids' Drawings</h1>
          <p className="text-slate-500 mt-1">Upload and manage art for the family to see.</p>
        </div>
      </div>
      
      <div className="grid xl:grid-cols-3 gap-8">
        
        {/* Form Card */}
        <div className="xl:col-span-1">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-pink-500" />
              Add New Drawing
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Drawing Title</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none" 
                  placeholder="e.g. A beautiful sunset" 
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
                    className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${uploadMethod === 'file' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    File Upload
                  </button>
                  <button 
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${uploadMethod === 'url' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    External URL
                  </button>
                </div>
              </div>
              
              {uploadMethod === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Upload Image File</label>
                  <input 
                    id="drawing-upload"
                    type="file"
                    accept="image/*"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 transition-all outline-none" 
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                    required 
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Image URL</label>
                  <input 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none" 
                    placeholder="https://example.com/image.jpg" 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)} 
                    required 
                  />
                </div>
              )}
              
              <button 
                disabled={isSubmitting}
                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Save Drawing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Gallery Section */}
        <div className="xl:col-span-2">
          {drawings.length === 0 ? (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 border-dashed p-12 flex flex-col items-center justify-center text-center">
               <div className="bg-slate-50 p-4 rounded-full mb-4">
                 <ImageIcon className="w-8 h-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-800">No drawings yet</h3>
               <p className="text-slate-500 mt-1 max-w-sm">Upload a drawing to start building the gallery.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {drawings.map(d => (
                <div key={d.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-pink-500/10 border border-slate-100 overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img src={d.imageUrl} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <button 
                      onClick={() => handleDelete(d.id)} 
                      className="absolute top-3 right-3 bg-red-500/90 backdrop-blur text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                      title="Delete drawing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-4 bg-white z-10 flex items-center justify-between border-t border-slate-50">
                    <h3 className="font-bold text-slate-800 truncate">{d.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
