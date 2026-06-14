'use client';
import { useState, useEffect } from 'react';

export default function BibleVersesPage() {
  const [verses, setVerses] = useState<any[]>([]);
  const [verse, setVerse] = useState('');
  const [reference, setReference] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  const fetchVerses = async () => {
    try {
      const res = await fetch('http://localhost:3000/bible-verses');
      if (res.ok) {
        const data = await res.json();
        setVerses(data);
      }
    } catch(e) { console.error('Failed to fetch'); }
  };

  useEffect(() => { fetchVerses(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    await fetch('http://localhost:3000/bible-verses', {
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
    fetchVerses();
    setVerse(''); setReference(''); setScheduledDate('');
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    await fetch(`http://localhost:3000/bible-verses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchVerses();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bible Verses</h1>
      
      <form onSubmit={handleCreate} className="bg-white p-6 rounded shadow-md mb-8 max-w-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Verse</h2>
        <input className="w-full mb-3 p-2 border rounded text-black" placeholder="Verse Text" value={verse} onChange={e => setVerse(e.target.value)} required />
        <input className="w-full mb-3 p-2 border rounded text-black" placeholder="Reference (e.g. John 3:16)" value={reference} onChange={e => setReference(e.target.value)} required />
        <input className="w-full mb-4 p-2 border rounded text-black" type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} required />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Save Verse</button>
      </form>

      <div className="grid gap-4 max-w-3xl">
        {verses.map(v => (
          <div key={v.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 flex justify-between items-center group">
            <div>
              <p className="font-medium text-lg text-gray-800">"{v.verse}"</p>
              <p className="text-gray-500">{v.reference}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-gray-400">
                {new Date(v.scheduledDate).toLocaleDateString()}
              </span>
              <button onClick={() => handleDelete(v.id)} className="text-red-500 text-sm opacity-0 group-hover:opacity-100 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
