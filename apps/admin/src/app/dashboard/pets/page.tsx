'use client';
import { Dog } from 'lucide-react';

export default function PetsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pets Profiles</h1>
          <p className="text-slate-500 mt-1">Manage platform pet profiles and veterinary tracking.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <Dog className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Pets Module Settings</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Global settings for the Pets module. User pet details are managed locally in the mobile app.
        </p>
      </div>
    </div>
  );
}
