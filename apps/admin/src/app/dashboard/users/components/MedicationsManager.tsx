'use client';
import { useState } from 'react';
import { Plus, Trash2, Pill } from 'lucide-react';

export default function MedicationsManager({ user, token, onRefresh }: { user: any, token: string, onRefresh: () => void }) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', dosage: '', frequency: '', purpose: '' });

  const selectedPatient = user.patients?.find((p: any) => p.id === selectedPatientId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    try {
      await fetch(`http://localhost:3000/medications/admin/patient/${selectedPatientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      setIsAdding(false);
      setFormData({ name: '', dosage: '', frequency: '', purpose: '' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    try {
      await fetch(`http://localhost:3000/medications/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (user.patients?.length === 0) {
    return <div className="text-slate-500 italic">Please add a patient first to manage medications.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Medications</h3>
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
            <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Pill className="w-4 h-4 text-indigo-500"/> {selectedPatient?.fullName}'s Medications</h4>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-indigo-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Med
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3 mb-4">
              <input type="text" required placeholder="Medication Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" />
              <div className="flex gap-3">
                <input type="text" placeholder="Dosage (e.g., 50mg)" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" />
                <input type="text" placeholder="Frequency (e.g., Twice daily)" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" />
              </div>
              <input type="text" placeholder="Purpose" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Save</button>
              </div>
            </form>
          )}

          {selectedPatient?.medications?.length === 0 ? (
            <div className="text-center py-4 text-slate-400">No medications for this patient.</div>
          ) : (
            <div className="space-y-2">
              {selectedPatient?.medications?.map((med: any) => (
                <div key={med.id} className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{med.name}</div>
                    <div className="text-xs text-slate-500">{med.dosage} • {med.frequency}</div>
                  </div>
                  <button onClick={() => handleDelete(med.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition">
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
