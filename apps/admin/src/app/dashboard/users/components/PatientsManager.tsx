'use client';
import { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function PatientsManager({ user, token, onRefresh }: { user: any, token: string, onRefresh: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', dateOfBirth: '', gender: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}`}/patients/admin/user/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
          gender: formData.gender
        })
      });
      setIsAdding(false);
      setFormData({ fullName: '', dateOfBirth: '', gender: '' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient? All associated medications, events, and notes will be deleted.')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}`}/patients/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Patients</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <input 
            type="text" required placeholder="Full Name" 
            value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
          />
          <div className="flex gap-3">
            <input 
              type="date" required 
              value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
            />
            <select 
              value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
            >
              <option value="">Select Gender (Optional)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Save Patient</button>
          </div>
        </form>
      )}

      {user.patients?.length === 0 ? (
        <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">No patients found.</div>
      ) : (
        <div className="space-y-3">
          {user.patients?.map((patient: any) => (
            <div key={patient.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">{patient.fullName}</div>
                <div className="text-sm text-slate-500">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} {patient.gender && `• ${patient.gender}`}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDelete(patient.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
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
