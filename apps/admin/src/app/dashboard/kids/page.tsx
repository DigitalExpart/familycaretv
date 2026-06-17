'use client';
import { Baby } from 'lucide-react';

export default function KidsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kids Profiles</h1>
          <p className="text-slate-500 mt-1">Manage platform child profiles and activity.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <Baby className="w-12 h-12 text-teal-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Kids Module Settings</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Global settings for the Kids module will appear here. Individual profiles are managed by users on mobile.
        </p>
      </div>
    </div>
  );
}
