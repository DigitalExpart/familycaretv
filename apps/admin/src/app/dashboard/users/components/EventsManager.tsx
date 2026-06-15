'use client';
import { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';

export default function EventsManager({ user, token, onRefresh }: { user: any, token: string, onRefresh: () => void }) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', type: 'APPOINTMENT', startDateTime: '' });

  const selectedPatient = user.patients?.find((p: any) => p.id === selectedPatientId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    try {
      await fetch(`http://localhost:3000/events/admin/patient/${selectedPatientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          startDateTime: new Date(formData.startDateTime).toISOString()
        })
      });
      setIsAdding(false);
      setFormData({ title: '', description: '', type: 'APPOINTMENT', startDateTime: '' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetch(`http://localhost:3000/events/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (user.patients?.length === 0) {
    return <div className="text-slate-500 italic">Please add a patient first to manage events.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Events</h3>
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
            <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500"/> {selectedPatient?.fullName}'s Events</h4>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-indigo-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3 mb-4">
              <input type="text" required placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" />
              <div className="flex gap-3">
                <input type="datetime-local" required value={formData.startDateTime} onChange={e => setFormData({...formData, startDateTime: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" />
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500">
                  <option value="APPOINTMENT">Appointment</option>
                  <option value="MEDICATION">Medication</option>
                  <option value="TASK">Task</option>
                </select>
              </div>
              <input type="text" placeholder="Description (Optional)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Save</button>
              </div>
            </form>
          )}

          {selectedPatient?.events?.length === 0 ? (
            <div className="text-center py-4 text-slate-400">No events for this patient.</div>
          ) : (
            <div className="space-y-2">
              {selectedPatient?.events?.map((evt: any) => (
                <div key={evt.id} className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{evt.title}</div>
                    <div className="text-xs font-medium text-indigo-600 mb-1">{evt.type}</div>
                    <div className="text-xs text-slate-500">{new Date(evt.startDateTime).toLocaleString()}</div>
                  </div>
                  <button onClick={() => handleDelete(evt.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition">
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
