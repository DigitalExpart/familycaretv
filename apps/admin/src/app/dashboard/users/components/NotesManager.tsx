'use client';
import { useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';

export default function NotesManager({ user, token, onRefresh }: { user: any, token: string, onRefresh: () => void }) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const selectedPatient = user.patients?.find((p: any) => p.id === selectedPatientId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}`}/notes/admin/patient/${selectedPatientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      setIsAdding(false);
      setFormData({ title: '', content: '' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}`}/notes/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (user.patients?.length === 0) {
    return <div className="text-slate-500 italic">Please add a patient first to manage notes.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Clinical/Personal Notes</h3>
        <select 
          value={selectedPatientId} 
          onChange={e => { setSelectedPatientId(e.target.value); setIsAdding(false); }}
          className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-sm font-medium text-slate-700 bg-white"
        >
          <option value="">Select Patient</option>
          {user.patients?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.fullName}</option>
          ))}
        </select>
      </div>

      {selectedPatientId && (
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500"/> {selectedPatient?.fullName}'s Notes</h4>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-indigo-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3 mb-4">
              <input type="text" required placeholder="Note Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" />
              <textarea required placeholder="Note Content..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 min-h-[100px]" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Save Note</button>
              </div>
            </form>
          )}

          {selectedPatient?.patientNotes?.length === 0 ? (
            <div className="text-center py-4 text-slate-400">No notes for this patient.</div>
          ) : (
            <div className="space-y-2">
              {selectedPatient?.patientNotes?.map((note: any) => (
                <div key={note.id} className="bg-white border border-slate-200 p-4 rounded-lg flex items-start justify-between">
                  <div className="pr-4">
                    <div className="font-bold text-slate-800">{note.title}</div>
                    <div className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{note.content}</div>
                    <div className="text-xs text-slate-400 mt-2">{new Date(note.createdAt).toLocaleString()}</div>
                  </div>
                  <button onClick={() => handleDelete(note.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
