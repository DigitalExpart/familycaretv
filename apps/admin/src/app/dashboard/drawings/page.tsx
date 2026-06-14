'use client';
import { useState, useEffect } from 'react';

export default function DrawingsPage() {
  const [drawings, setDrawings] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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
    const token = localStorage.getItem('adminToken');
    await fetch('http://localhost:3000/drawings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, imageUrl })
    });
    fetchDrawings();
    setTitle(''); setImageUrl('');
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
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Drawings</h1>
      
      <form onSubmit={handleCreate} className="bg-white p-6 rounded shadow-md mb-8 max-w-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Drawing (URL for MVP)</h2>
        <input className="w-full mb-3 p-2 border rounded text-black" placeholder="Drawing Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input className="w-full mb-4 p-2 border rounded text-black" placeholder="Image URL (e.g. https://...)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Save Drawing</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drawings.map(d => (
          <div key={d.id} className="bg-white rounded shadow overflow-hidden flex flex-col group relative">
            <button onClick={() => handleDelete(d.id)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition z-10 text-xs">Delete</button>
            <div className="h-48 overflow-hidden bg-gray-100">
              <img src={d.imageUrl} alt={d.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800">{d.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
