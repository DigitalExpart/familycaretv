'use client';
import { useState, useEffect } from 'react';

export default function AudioPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [type, setType] = useState('MUSIC');

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
    const token = localStorage.getItem('adminToken');
    await fetch('http://localhost:3000/audio', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, audioUrl, type })
    });
    fetchTracks();
    setTitle(''); setAudioUrl('');
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
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Audio Tracks</h1>
      
      <form onSubmit={handleCreate} className="bg-white p-6 rounded shadow-md mb-8 max-w-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Audio (URL for MVP)</h2>
        <input className="w-full mb-3 p-2 border rounded text-black" placeholder="Track Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input className="w-full mb-3 p-2 border rounded text-black" placeholder="Audio URL (.mp3)" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} required />
        <select className="w-full mb-4 p-2 border rounded text-black" value={type} onChange={e => setType(e.target.value)}>
          <option value="MUSIC">Music</option>
          <option value="MESSAGE">Voice Message</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Save Audio</button>
      </form>

      <div className="grid gap-4 max-w-3xl">
        {tracks.map(t => (
          <div key={t.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 flex justify-between items-center group">
            <div className="flex-1">
              <p className="font-bold text-gray-800">{t.title} <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">{t.type}</span></p>
              <a href={t.audioUrl} target="_blank" rel="noreferrer" className="text-blue-500 text-sm hover:underline block truncate max-w-md">{t.audioUrl}</a>
            </div>
            <button onClick={() => handleDelete(t.id)} className="text-red-500 text-sm opacity-0 group-hover:opacity-100 transition ml-4">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
