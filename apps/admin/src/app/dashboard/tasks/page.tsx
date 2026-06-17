'use client';
import { useState } from 'react';
import { CheckSquare } from 'lucide-react';

export default function TasksAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tasks Management</h1>
          <p className="text-slate-500 mt-1">Monitor and manage platform tasks.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <CheckSquare className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Task Overview</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Tasks are primarily managed by users and patients on the mobile app. Global task templates will be available here soon.
        </p>
      </div>
    </div>
  );
}
